// src/services/cartService.js
const { sequelize } = require('../config/database'); // Import sequelize instance nếu cần transaction
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product'); // Cần Product để kiểm tra sản phẩm và include info
const SellerProfile = require('../models/SellerProfile'); // Cần SellerProfile để include info trong product

// Lấy hoặc tạo giỏ hàng cho user
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ where: { user_id: userId } });

  if (!cart) {
    cart = await Cart.create({ user_id: userId });
  }

  return cart;
};

// Lấy giỏ hàng chi tiết của user (bao gồm các mục và thông tin sản phẩm)
const getUserCart = async (userId) => {
  const cart = await Cart.findOne({
    where: { user_id: userId },
    include: {
      model: CartItem,
      as: 'items', // Alias đã định nghĩa trong associations
      include: {
        model: Product,
        as: 'product', // Alias đã định nghĩa trong associations
        attributes: ['product_id', 'name', 'slug', 'base_price', 'image_url'], // Chỉ lấy các trường cần hiển thị
         include: { // Include thông tin seller trong product item
            model: SellerProfile,
            as: 'seller',
            attributes: ['user_id', 'store_name']
         }
      },
    },
  });

  // Nếu không tìm thấy giỏ hàng, trả về null hoặc giỏ hàng rỗng
  return cart; // Hoặc { cart_id: null, user_id: userId, items: [] } nếu muốn đảm bảo luôn có object cart
};

// Thêm sản phẩm vào giỏ hàng
const addItemToCart = async (userId, productId, quantity) => {
  if (quantity <= 0) {
     const error = new Error('Số lượng sản phẩm phải lớn hơn 0.');
     error.statusCode = 400;
     throw error;
  }

  // 1. Tìm hoặc tạo giỏ hàng cho user
  const cart = await getOrCreateCart(userId);

  // 2. Kiểm tra sản phẩm có tồn tại không
  const product = await Product.findByPk(productId, {
       attributes: ['product_id', 'status'] // Chỉ cần kiểm tra tồn tại và status
  });
  if (!product || product.status !== 'active') {
      const error = new Error('Sản phẩm không tồn tại hoặc không có sẵn.');
      error.statusCode = 404; // Not Found
      throw error;
  }

  // TODO: Thêm logic kiểm tra số lượng ProductItem 'available' nếu bạn muốn giới hạn số lượng thêm vào giỏ ngay từ đây.
  // Hiện tại, chúng ta sẽ kiểm tra kỹ tại bước checkout.

  // 3. Kiểm tra xem sản phẩm đã có trong giỏ chưa
  let cartItem = await CartItem.findOne({
    where: {
      cart_id: cart.cart_id,
      product_id: productId,
    },
  });

  if (cartItem) {
    // 4. Nếu đã có, cập nhật số lượng
    cartItem.quantity += quantity;
    await cartItem.save();
  } else {
    // 5. Nếu chưa có, tạo CartItem mới
    cartItem = await CartItem.create({
      cart_id: cart.cart_id,
      product_id: productId,
      quantity: quantity,
    });
  }

  // Trả về giỏ hàng đã cập nhật (hoặc chỉ item đã cập nhật)
   // Lấy lại giỏ hàng đầy đủ thông tin để gửi về cho client
   const updatedCart = await getUserCart(userId);
   return updatedCart;
};

// Cập nhật số lượng của một mục trong giỏ hàng
const updateCartItemQuantity = async (userId, cartItemId, quantity) => {
     if (quantity <= 0) {
         // Nếu số lượng <= 0, coi như xóa mục đó
         return await removeCartItem(userId, cartItemId);
     }

    // 1. Tìm mục trong giỏ hàng theo ID và đảm bảo thuộc về giỏ hàng của user
    const cartItem = await CartItem.findOne({
        where: {
            cart_item_id: cartItemId,
        },
        include: { // Include Cart để kiểm tra user_id
            model: Cart,
            as: 'cart',
            where: { user_id: userId }
        }
    });


    if (!cartItem) {
         const error = new Error('Mục giỏ hàng không tồn tại hoặc không thuộc về bạn.');
         error.statusCode = 404;
         throw error;
    }

    // TODO: Thêm logic kiểm tra số lượng ProductItem 'available' nếu bạn muốn giới hạn số lượng ngay từ đây.

    // 2. Cập nhật số lượng
    cartItem.quantity = quantity;
    await cartItem.save();

    // Trả về giỏ hàng đã cập nhật
    const updatedCart = await getUserCart(userId);
    return updatedCart;
};

// Xóa một mục khỏi giỏ hàng
const removeCartItem = async (userId, cartItemId) => {
    // 1. Tìm mục trong giỏ hàng theo ID và đảm bảo thuộc về giỏ hàng của user
    const cartItem = await CartItem.findOne({
        where: {
            cart_item_id: cartItemId,
        },
         include: { // Include Cart để kiểm tra user_id
            model: Cart,
            as: 'cart',
            where: { user_id: userId }
        }
    });

    if (!cartItem) {
        const error = new Error('Mục giỏ hàng không tồn tại hoặc không thuộc về bạn.');
        error.statusCode = 404;
        throw error;
    }

    // 2. Xóa mục khỏi giỏ hàng
    await cartItem.destroy();

     // Trả về giỏ hàng đã cập nhật (hoặc thông báo thành công)
    const updatedCart = await getUserCart(userId);
    return updatedCart;
};

// Xóa toàn bộ giỏ hàng
const clearCart = async (userId) => {
    // 1. Tìm giỏ hàng của user
    const cart = await Cart.findOne({ where: { user_id: userId } });

    if (!cart) {
        // Không có giỏ hàng để xóa
        return { message: 'Giỏ hàng của bạn đã rỗng.' };
    }

    // 2. Xóa tất cả CartItems thuộc giỏ hàng này
    // Nhờ ràng buộc ON DELETE CASCADE ở association, chỉ cần xóa CartItems là đủ
    // Nếu muốn xóa luôn Cart: await cart.destroy(); (Nhưng giữ Cart lại cho user có thể tiện hơn)
    await CartItem.destroy({ where: { cart_id: cart.cart_id } });


    // Trả về giỏ hàng rỗng hoặc thông báo thành công
     const updatedCart = await getUserCart(userId); // Lấy lại giỏ hàng rỗng
     return updatedCart; // Hoặc { message: 'Giỏ hàng đã được làm rỗng.' }
};


module.exports = {
  getOrCreateCart, // Có thể không cần export nếu chỉ dùng nội bộ
  getUserCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
};