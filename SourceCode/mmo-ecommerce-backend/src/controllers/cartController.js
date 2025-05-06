// src/controllers/cartController.js
const asyncHandler = require('../middleware/asyncHandler');
const { getUserCart, addItemToCart, updateCartItemQuantity, removeCartItem, clearCart } = require('../services/cartService');

// @desc    Lấy giỏ hàng của người dùng hiện tại
// @route   GET /api/cart
// @access  Private (Auth)
const getCart = asyncHandler(async (req, res) => {
  const userId = req.user.user_id; // Lấy user ID từ token đã xác thực

  const cart = await getUserCart(userId);

  // Nếu chưa có giỏ hàng, service getUserCart sẽ trả về null.
  // Có thể tạo mới ở đây nếu muốn frontend luôn nhận được object cart
  if (!cart) {
       // Tùy chọn: tạo giỏ hàng mới nếu chưa có
       // const newCart = await getOrCreateCart(userId); // getOrCreateCart đã được implement trong service
       // res.status(200).json(newCart);
       // Hoặc trả về giỏ hàng rỗng:
       res.status(200).json({ cart_id: null, user_id: userId, items: [] });
  } else {
       res.status(200).json(cart);
  }

});

// @desc    Thêm sản phẩm vào giỏ hàng
// @route   POST /api/cart/items
// @access  Private (Auth)
const addItem = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { product_id, quantity } = req.body;

  // Basic validation
  if (!product_id || !quantity) {
    res.status(400);
    throw new Error('product_id và quantity là bắt buộc.');
  }

   // Quantity phải là số nguyên dương
  const parsedQuantity = parseInt(quantity, 10);
  if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
       res.status(400);
       throw new Error('quantity phải là số nguyên dương.');
  }


  // Gọi service để thêm/cập nhật item
  const updatedCart = await addItemToCart(userId, product_id, parsedQuantity);

  res.status(200).json(updatedCart); // Trả về giỏ hàng đã cập nhật
});

// @desc    Cập nhật số lượng của một mục trong giỏ hàng
// @route   PUT /api/cart/items/:cartItemId
// @access  Private (Auth)
const updateItemQuantity = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const cartItemId = req.params.cartItemId;
  const { quantity } = req.body;

   // Basic validation
   if (!quantity) {
       res.status(400);
       throw new Error('quantity là bắt buộc.');
   }

    // Quantity phải là số nguyên >= 0
   const parsedQuantity = parseInt(quantity, 10);
   if (isNaN(parsedQuantity) || parsedQuantity < 0) {
        res.status(400);
        throw new Error('quantity phải là số nguyên không âm.');
   }


  // Gọi service để cập nhật số lượng hoặc xóa item nếu quantity = 0
  const updatedCart = await updateCartItemQuantity(userId, cartItemId, parsedQuantity);

  res.status(200).json(updatedCart); // Trả về giỏ hàng đã cập nhật
});

// @desc    Xóa một mục khỏi giỏ hàng
// @route   DELETE /api/cart/items/:cartItemId
// @access  Private (Auth)
const removeItem = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const cartItemId = req.params.cartItemId;

  // Gọi service để xóa item
  const updatedCart = await removeCartItem(userId, cartItemId);

  res.status(200).json(updatedCart); // Trả về giỏ hàng đã cập nhật (đã xóa item)
});

// @desc    Xóa toàn bộ giỏ hàng
// @route   DELETE /api/cart
// @access  Private (Auth)
const clearMyCart = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;

  // Gọi service để xóa toàn bộ giỏ hàng
  const result = await clearCart(userId);

  res.status(200).json(result); // Trả về thông báo hoặc giỏ hàng rỗng
});


module.exports = {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearMyCart,
};