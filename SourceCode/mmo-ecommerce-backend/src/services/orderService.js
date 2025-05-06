// src/services/orderService.js
const { sequelize } = require('../config/database'); // Cần instance sequelize để quản lý transaction
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Transaction = require('../models/Transaction');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const ProductItem = require('../models/ProductItem');
const SellerProfile = require('../models/SellerProfile');
const User = require('../models/User'); // Cần User để include buyer info

const { Op } = require('sequelize'); // Import Op

// Helper để lấy giỏ hàng đầy đủ thông tin (có thể dùng lại từ cartService hoặc định nghĩa ở đây)
const getUserCartWithDetails = async (userId, transaction = null) => {
    const cart = await Cart.findOne({
        where: { user_id: userId },
        include: {
            model: CartItem,
            as: 'items',
            include: {
                model: Product,
                as: 'product',
                attributes: ['product_id', 'name', 'slug', 'base_price', 'status', 'seller_id'], // Cần seller_id của product
                include: {
                    model: SellerProfile,
                    as: 'seller',
                    attributes: ['user_id', 'store_name']
                }
            },
        },
        transaction: transaction // Sử dụng cùng transaction nếu được cung cấp
    });
    return cart;
};


// --- Logic Tạo Đơn hàng từ Giỏ hàng ---
const createOrderFromCart = async (userId, { payment_method, notes }) => {
    // Bắt đầu một transaction
    const t = await sequelize.transaction();

    try {
        // 1. Lấy giỏ hàng và các mục trong giỏ của user (trong transaction)
        const cart = await getUserCartWithDetails(userId, t);

        if (!cart || !cart.items || cart.items.length === 0) {
            // Ném lỗi nếu giỏ hàng trống
            const error = new Error('Giỏ hàng của bạn đang trống.');
            error.statusCode = 400;
            throw error;
        }

        let totalAmount = 0;
        const orderItemsToCreate = [];
        const productItemsToUpdate = []; // Danh sách ProductItem cần cập nhật trạng thái
        const productItemIdsToLock = []; // ID các ProductItem được chọn để khóa

        // 2. Duyệt qua các mục trong giỏ hàng, kiểm tra và chọn ProductItem cụ thể
        for (const cartItem of cart.items) {
            const product = cartItem.product; // Product template
            const quantity = cartItem.quantity; // Số lượng yêu cầu

            // Kiểm tra trạng thái Product template
            if (!product || product.status !== 'active') {
                 const error = new Error(`Sản phẩm "${product?.name || cartItem.product_id}" không còn có sẵn.`);
                 error.statusCode = 400;
                 throw error;
            }

            // Tìm kiếm các ProductItem 'available' cho sản phẩm này (trong transaction)
            // Sử dụng FOR UPDATE để khóa các hàng này lại, tránh người khác mua cùng lúc
            const availableItems = await ProductItem.findAll({
                where: {
                    product_id: product.product_id,
                    status: 'available',
                },
                limit: quantity, // Chỉ lấy đúng số lượng cần thiết
                order: [['created_at', 'ASC']], // Lấy các item cũ nhất trước (ví dụ)
                transaction: t, // Quan trọng: sử dụng cùng transaction
                 lock: t.LOCK.UPDATE // Khóa các hàng được chọn
            });

            // Kiểm tra số lượng tồn kho thực tế
            if (availableItems.length < quantity) {
                const error = new Error(`Sản phẩm "${product.name}" hiện không đủ số lượng (${quantity}) trong kho. Chỉ còn ${availableItems.length} đơn vị.`);
                error.statusCode = 400;
                throw error;
            }

            // Tính tổng tiền cho mục này
            const itemSubtotal = product.base_price * quantity;
            totalAmount += itemSubtotal;

            // Chuẩn bị dữ liệu OrderItem và ProductItem cần cập nhật
            for (const item of availableItems) {
                 // Mỗi OrderItem ứng với 1 ProductItem cụ thể
                 orderItemsToCreate.push({
                     product_id: product.product_id,
                     seller_id: product.seller_id,
                     product_item_id: item.item_id,
                     price_at_purchase: product.base_price, // Lưu giá tại thời điểm mua
                     quantity: 1, // Quantity luôn là 1 cho mỗi OrderItem liên kết với ProductItem
                     status: 'pending', // Trạng thái chờ fulfill
                     // order_id sẽ được gán sau khi Order được tạo
                 });

                 // Đánh dấu ProductItem này cần cập nhật
                 productItemsToUpdate.push({
                     item_id: item.item_id,
                     status: 'pending', // Trạng thái tạm thời 'pending' (hoặc 'sold' nếu ko có bước pending fulfill)
                     // order_item_id sẽ được gán sau khi OrderItem được tạo
                 });

                 productItemIdsToLock.push(item.item_id); // Lưu ID để kiểm tra thêm nếu cần
            }
        }

        // 3. Tạo đơn hàng (Order)
        const order = await Order.create({
            user_id: userId,
            total_amount: totalAmount,
            status: 'pending_payment', // Chờ thanh toán
            payment_status: 'pending',
            payment_method: payment_method || null, // Lưu phương thức nếu đã chọn
            notes: notes || null,
            // transaction_id ban đầu là NULL
        }, { transaction: t });

        // 4. Gắn order_id vào các OrderItem và ProductItem cần tạo/cập nhật
        orderItemsToCreate.forEach(item => { item.order_id = order.order_id; });

        // 5. Tạo các mục trong đơn hàng (OrderItems)
        const createdOrderItems = await OrderItem.bulkCreate(orderItemsToCreate, { transaction: t });

        // 6. Cập nhật trạng thái và gán order_item_id cho các ProductItem đã chọn
        // Cần gán order_item_id tương ứng. createdOrderItems trả về mảng các object đã tạo.
        // Dựa vào product_item_id ban đầu để tìm OrderItem_id tương ứng
        const productItemUpdates = productItemsToUpdate.map(itemUpdate => {
             const createdOrderItem = createdOrderItems.find(oi => oi.product_item_id === itemUpdate.item_id);
             if (!createdOrderItem) {
                  // Lỗi logic nghiêm trọng nếu không tìm thấy OrderItem tương ứng
                  throw new Error(`Lỗi nội bộ khi tạo OrderItem cho ProductItem ID ${itemUpdate.item_id}`);
             }
             return {
                 item_id: itemUpdate.item_id,
                 status: 'pending', // Hoặc 'sold'
                 order_item_id: createdOrderItem.order_item_id,
             };
        });

        // Thực hiện cập nhật bulk cho ProductItems
        // Sử dụng update với where clause thay vì save từng item để đảm bảo atomicity trong transaction
        await ProductItem.bulkCreate(productItemUpdates, {
            updateOnDuplicate: ['status', 'order_item_id', 'updated_at'], // Chỉ cập nhật các trường này nếu item_id đã tồn tại
            transaction: t
        });


        // 7. (Tùy chọn) Tạo một Transaction ban đầu với trạng thái pending
        // Transaction thực tế sẽ được tạo khi user tiến hành thanh toán qua cổng
        // Để đơn giản, có thể bỏ qua bước này và tạo Transaction khi initiate payment API được gọi
        // Nếu tạo ở đây, status là pending và amount = total_amount của Order

        // 8. Xóa các mục khỏi giỏ hàng (sau khi đã tạo đơn hàng thành công)
        await CartItem.destroy({ where: { cart_id: cart.cart_id }, transaction: t });

        // 9. Commit transaction
        await t.commit();

        // Trả về thông tin đơn hàng vừa tạo
        const createdOrderWithItems = await getUserOrderDetail(userId, order.order_id); // Lấy order đầy đủ thông tin
        return createdOrderWithItems;


    } catch (error) {
        // Nếu có bất kỳ lỗi nào xảy ra, rollback transaction
        await t.rollback();
        console.error('Error creating order:', error);
        // Ném lỗi lại để controller xử lý
        throw error;
    }
};

// --- Logic Xem Đơn hàng (Người mua) ---
const getUserOrders = async (userId, { status, page = 1, limit = 10, sort = 'created_at,desc' }) => {
    const offset = (page - 1) * limit;
     const order = [];
    if (sort) {
        const [field, direction] = sort.split(',');
         if (['status', 'total_amount', 'created_at', 'updated_at'].includes(field)) {
             order.push([field, direction.toUpperCase()]);
        }
    }
     if (order.length === 0) {
         order.push(['created_at', 'DESC']);
     }

    const where = { user_id: userId }; // Chỉ lấy đơn hàng của user này
    if (status) where.status = status;

    const { count, rows } = await Order.findAndCountAll({
        where: where,
        limit: limit,
        offset: offset,
        order: order,
        include: { // Tùy chọn: include OrderItems hoặc chỉ include count
            model: OrderItem,
            as: 'items',
            attributes: ['order_item_id', 'product_id', 'status'], // Lấy các trường cơ bản
             include: {
                 model: Product,
                 as: 'product',
                 attributes: ['name', 'image_url'] // Lấy tên và ảnh sản phẩm
             }
        },
    });

    return {
        totalItems: count,
        orders: rows,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
    };
};

// Lấy chi tiết một đơn hàng của người mua
const getUserOrderDetail = async (userId, orderId) => {
    const order = await Order.findOne({
        where: { order_id: orderId, user_id: userId }, // Đảm bảo order thuộc về user này
        include: [
            {
                model: OrderItem,
                as: 'items',
                 include: [
                    { model: Product, as: 'product', attributes: ['product_id', 'name', 'slug', 'base_price', 'image_url'] },
                    { model: SellerProfile, as: 'seller', attributes: ['user_id', 'store_name'] },
                     // KHÔNG INCLUDE ProductItem.data ở đây vì đó là dữ liệu nhạy cảm, chỉ lấy qua API getPurchasedItemData sau khi fulfill
                    // { model: ProductItem, as: 'productItem', attributes: ['item_id', 'status'] } // Include ProductItem base info
                 ]
            },
            {
                 model: Transaction,
                 as: 'transaction',
                 attributes: ['transaction_id', 'payment_gateway', 'gateway_transaction_id', 'amount', 'currency', 'status', 'completed_at']
            }
        ],
    });

    if (!order) {
        const error = new Error('Đơn hàng không tồn tại.');
        error.statusCode = 404;
        throw error;
    }

    return order;
};

// Người mua hủy đơn hàng
const cancelOrder = async (userId, orderId) => {
     // Tìm đơn hàng và đảm bảo thuộc về user
    const order = await Order.findOne({
        where: { order_id: orderId, user_id: userId },
        include: { model: OrderItem, as: 'items' } // Cần OrderItems để update ProductItems
    });

    if (!order) {
        const error = new Error('Đơn hàng không tồn tại.');
        error.statusCode = 404;
        throw error;
    }

    // Chỉ cho phép hủy nếu trạng thái là 'pending_payment'
    if (order.status !== 'pending_payment') {
        const error = new Error('Không thể hủy đơn hàng ở trạng thái hiện tại.');
        error.statusCode = 400;
        throw error;
    }

    // Bắt đầu transaction
    const t = await sequelize.transaction();
    try {
        // Cập nhật trạng thái đơn hàng
        order.status = 'cancelled';
        order.payment_status = 'cancelled'; // Thanh toán cũng coi như cancelled
        await order.save({ transaction: t });

        // Cập nhật trạng thái các ProductItem đã được gán về 'available'
        const itemIdsToRelease = order.items.map(item => item.product_item_id);
        if (itemIdsToRelease.length > 0) {
            await ProductItem.update(
                { status: 'available', order_item_id: null, sold_at: null }, // Gỡ bỏ liên kết
                { where: { item_id: itemIdsToRelease }, transaction: t }
            );
        }

        // Cập nhật trạng thái các OrderItem
        await OrderItem.update(
             { status: 'cancelled' },
             { where: { order_id: orderId }, transaction: t }
        );


        // Commit transaction
        await t.commit();

        return { message: 'Đơn hàng đã được hủy.' };

    } catch (error) {
        await t.rollback();
        console.error('Error cancelling order:', error);
        throw error;
    }
};

// Người mua lấy dữ liệu sản phẩm đã mua sau khi fulfill
const getPurchasedItemData = async (userId, orderId, orderItemId) => {
    // Tìm OrderItem và đảm bảo nó thuộc về user thông qua Order
    const orderItem = await OrderItem.findOne({
        where: { order_item_id: orderItemId },
        include: {
            model: Order,
            as: 'order',
            where: { order_id: orderId, user_id: userId } // Đảm bảo order và user khớp
        }
    });

    if (!orderItem) {
        const error = new Error('Mục đơn hàng không tồn tại hoặc không thuộc về bạn.');
        error.statusCode = 404;
        throw error;
    }

    // Kiểm tra trạng thái của OrderItem (chỉ lấy data khi đã 'fulfilled')
    if (orderItem.status !== 'fulfilled') {
        const error = new Error('Sản phẩm này chưa được xử lý hoàn tất.');
        error.statusCode = 400; // Bad Request hoặc 402 Payment Required nếu payment pending
        throw error;
    }

     // TODO: Thêm logic kiểm tra trạng thái thanh toán của Order nếu cần
     // if (orderItem.order.payment_status !== 'paid') { ... }


    // Trả về dữ liệu fulfillment
    return {
        product_name: orderItem.product?.name || 'Sản phẩm', // Tên sản phẩm (nếu include product)
        fulfillment_data: orderItem.fulfillment_data,
        fulfilled_at: orderItem.fulfilled_at,
        order_id: orderItem.order_id,
        order_item_id: orderItem.order_item_id,
    };
};


// --- Logic Xem Đơn hàng (Người bán) ---
const getSellerOrders = async (sellerId, { status, page = 1, limit = 10, sort = 'created_at,desc' }) => {
    const offset = (page - 1) * limit;
     const order = [];
    if (sort) {
        const [field, direction] = sort.split(',');
         if (['status', 'total_amount', 'created_at', 'updated_at'].includes(field)) {
             order.push([field, direction.toUpperCase()]);
        }
    }
     if (order.length === 0) {
         order.push(['created_at', 'DESC']);
     }

    // Tìm các đơn hàng có chứa ít nhất một OrderItem thuộc về seller này
    // Cách 1: Query Order và include OrderItems, sau đó filter OrderItems
    // Cách 2: Query OrderItems và include Order, rồi gom nhóm theo Order
    // Cách 2 thường hiệu quả hơn nếu seller có ít item trong nhiều order
    // Chúng ta sẽ dùng Cách 1 để trả về cấu trúc giống user order list

    const where = {}; // Có thể thêm điều kiện lọc cho Order status nếu cần

    const { count, rows } = await Order.findAndCountAll({
        where: where,
        limit: limit,
        offset: offset,
        order: order,
        include: [
           { // Chỉ include OrderItems thuộc về seller này
              model: OrderItem,
              as: 'items',
              where: { seller_id: sellerId },
               required: true, // Chỉ lấy Order nếu nó có ít nhất 1 item của seller này
              include: [
                  { model: Product, as: 'product', attributes: ['product_id', 'name', 'image_url'] },
                  { model: User, as: 'seller', attributes: ['user_id', 'username'] } // Thông tin seller (chính seller)
              ]
           },
           { // Bao gồm thông tin người mua (buyer)
              model: User,
              as: 'buyer',
              attributes: ['user_id', 'username']
           },
           { // Bao gồm thông tin transaction nếu có
              model: Transaction,
              as: 'transaction',
              attributes: ['transaction_id', 'payment_gateway', 'status']
           }
        ],
         distinct: true, // Đảm bảo đếm đúng số Order khi dùng 'required: true' trong include
    });


    // TODO: Thêm lọc theo status của OrderItem nếu cần (ví dụ: chỉ xem item chờ fulfill)
    // Sẽ phức tạp hơn vì where clause cần áp dụng lên OrderItem level

    return {
        totalItems: count,
        orders: rows, // Các Order có item của seller này
        currentPage: page,
        totalPages: Math.ceil(count / limit),
    };
};

// Lấy chi tiết một đơn hàng của seller
const getSellerOrderDetail = async (sellerId, orderId) => {
     // Tìm đơn hàng và đảm bảo nó có chứa ít nhất một OrderItem thuộc về seller
    const order = await Order.findOne({
        where: { order_id: orderId },
        include: [
            { // Chỉ include OrderItems thuộc về seller này
              model: OrderItem,
              as: 'items',
              where: { seller_id: sellerId },
              required: true, // Đảm bảo đơn hàng có liên quan đến seller này
               include: [
                   { model: Product, as: 'product', attributes: ['product_id', 'name', 'slug', 'base_price', 'image_url'] },
                    // Include ProductItem info base (không data)
                    { model: ProductItem, as: 'productItem', attributes: ['item_id', 'status', 'sold_at'] }
               ]
            },
            { model: User, as: 'buyer', attributes: ['user_id', 'username', 'email'] }, // Thông tin người mua
            { model: Transaction, as: 'transaction', attributes: ['transaction_id', 'payment_gateway', 'amount', 'currency', 'status', 'completed_at'] }
        ],
    });

    if (!order) {
        const error = new Error('Đơn hàng không tồn tại hoặc không chứa sản phẩm của bạn.');
        error.statusCode = 404;
        throw error;
    }

    // Lọc lại các items chỉ thuộc về seller này (dù query đã required, đảm bảo)
    // order.items = order.items.filter(item => item.seller_id === sellerId); // Thực ra không cần nếu required: true hoạt động đúng

    return order;
};

// Người bán/Admin fulfill một mục trong đơn hàng
const fulfillOrderItem = async (orderItemId, sellerId, fulfillmentData, isAdmin = false) => {
    // Tìm OrderItem và đảm bảo nó thuộc về seller hoặc user là admin
    const orderItem = await OrderItem.findOne({
        where: { order_item_id: orderItemId },
        include: [
            { model: Order, as: 'order', attributes: ['order_id', 'status', 'payment_status'] }, // Cần kiểm tra trạng thái Order
            { model: ProductItem, as: 'productItem' } // Cần ProductItem để cập nhật trạng thái
        ]
    });

    if (!orderItem) {
        const error = new Error('Mục đơn hàng không tồn tại.');
        error.statusCode = 404;
        throw error;
    }

     // Kiểm tra quyền sở hữu nếu không phải Admin
    if (!isAdmin && orderItem.seller_id !== sellerId) {
        const error = new Error('Bạn không có quyền fulfill mục đơn hàng này.');
        error.statusCode = 403;
        throw error;
    }

    // Kiểm tra trạng thái đơn hàng tổng thể (phải là 'processing' hoặc 'completed', và payment_status là 'paid')
    // Chỉ cho phép fulfill khi đã thanh toán thành công
    if (orderItem.order.payment_status !== 'paid' || (orderItem.order.status !== 'processing' && orderItem.order.status !== 'completed')) {
         const error = new Error('Đơn hàng chưa được thanh toán hoặc chưa sẵn sàng để fulfill.');
         error.statusCode = 400;
         throw error;
    }

    // Kiểm tra trạng thái của OrderItem (chỉ fulfill khi đang 'pending')
    if (orderItem.status !== 'pending') {
        const error = new Error('Mục đơn hàng này không ở trạng thái chờ fulfill.');
        error.statusCode = 400;
        throw error;
    }

    // Bắt đầu transaction
    const t = await sequelize.transaction();
    try {
        // Cập nhật trạng thái OrderItem
        orderItem.status = 'fulfilled';
        orderItem.fulfilled_at = new Date();
        orderItem.fulfillment_data = fulfillmentData; // Lưu dữ liệu fulfillment
        await orderItem.save({ transaction: t });

        // Cập nhật trạng thái ProductItem liên quan thành 'sold'
        if (orderItem.productItem) {
             orderItem.productItem.status = 'sold';
             orderItem.productItem.sold_at = new Date();
             // orderItem.productItem.order_item_id đã được gán khi tạo Order
             await orderItem.productItem.save({ transaction: t });
        } else {
             // Lỗi nghiêm trọng: OrderItem không link đến ProductItem
             console.error(`Error: OrderItem ${orderItemId} missing ProductItem link.`);
             // Có thể ném lỗi hoặc log và tiếp tục tùy quy trình
        }

        // TODO: Kiểm tra nếu TẤT CẢ OrderItems của order này đều fulfilled,
        // thì cập nhật trạng thái Order tổng thể thành 'completed'.
        // Cần query tất cả OrderItems của order và kiểm tra status của chúng.

        // Commit transaction
        await t.commit();

        // Lấy lại OrderItem đã cập nhật
        const fulfilledOrderItem = await OrderItem.findByPk(orderItemId, {
            include: { model: Product, as: 'product', attributes: ['product_id', 'name'] }
        });
        return fulfilledOrderItem;

    } catch (error) {
        await t.rollback();
        console.error('Error fulfilling order item:', error);
        throw error;
    }
};


// --- Logic Xem Đơn hàng (Admin) ---
const getAdminOrders = async ({ status, userId, sellerId, page = 1, limit = 10, sort = 'created_at,desc' }) => {
    const offset = (page - 1) * limit;
     const order = [];
    if (sort) {
        const [field, direction] = sort.split(',');
         if (['status', 'payment_status', 'total_amount', 'created_at', 'updated_at'].includes(field)) {
             order.push([field, direction.toUpperCase()]);
        }
    }
     if (order.length === 0) {
         order.push(['created_at', 'DESC']);
     }

    const where = {}; // Không có điều kiện lọc theo user/seller mặc định
    if (status) where.status = status;
    if (userId) where.user_id = userId; // Admin có thể lọc theo Buyer
    // Lọc theo Seller phức tạp hơn, cần join/include OrderItems và áp dụng where trên đó
    // if (sellerId) { ... }

    const { count, rows } = await Order.findAndCountAll({
        where: where,
        limit: limit,
        offset: offset,
        order: order,
         include: [
            {
                model: OrderItem,
                as: 'items',
                // Không có where mặc định, lấy tất cả items
                 where: sellerId ? { seller_id: sellerId } : {}, // Nếu có sellerId thì lọc items theo seller
                 required: sellerId ? true : false, // Nếu lọc theo seller, chỉ lấy order có item của seller đó
                include: [
                     { model: Product, as: 'product', attributes: ['product_id', 'name'] },
                     { model: SellerProfile, as: 'seller', attributes: ['user_id', 'store_name'] },
                ]
            },
             { model: User, as: 'buyer', attributes: ['user_id', 'username'] }, // Thông tin người mua
              { model: Transaction, as: 'transaction', attributes: ['transaction_id', 'payment_gateway', 'status'] }
        ],
         distinct: true, // Đảm bảo đếm đúng số Order khi dùng required trong include
    });

    return {
        totalItems: count,
        orders: rows,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
    };
};

// Lấy chi tiết một đơn hàng bất kỳ (Admin)
const getAdminOrderDetail = async (orderId) => {
    const order = await Order.findByPk(orderId, {
        include: [
             {
                model: OrderItem,
                as: 'items',
                 include: [
                    { model: Product, as: 'product', attributes: ['product_id', 'name', 'slug', 'base_price', 'image_url'] },
                    { model: SellerProfile, as: 'seller', attributes: ['user_id', 'store_name'] },
                    { model: ProductItem, as: 'productItem', attributes: ['item_id', 'status', 'sold_at', 'data'] } // Admin có thể xem data
                 ]
             },
            { model: User, as: 'buyer', attributes: ['user_id', 'username', 'email'] },
            {
                 model: Transaction,
                 as: 'transaction',
                 attributes: ['transaction_id', 'payment_gateway', 'gateway_transaction_id', 'amount', 'currency', 'status', 'completed_at', 'raw_gateway_response'] // Admin có thể xem raw response
            }
        ],
    });

    if (!order) {
        const error = new Error('Đơn hàng không tồn tại.');
        error.statusCode = 404;
        throw error;
    }

    return order;
};

// Admin cập nhật trạng thái đơn hàng tổng thể
const updateOrderStatus = async (orderId, status) => {
     const order = await Order.findByPk(orderId);

    if (!order) {
        const error = new Error('Đơn hàng không tồn tại.');
        error.statusCode = 404;
        throw error;
    }

     // TODO: Thêm validation cho giá trị status
     // TODO: Logic phức tạp nếu chuyển về trạng thái 'cancelled' hoặc 'failed' -> cần hoàn lại ProductItems

    order.status = status;
    // Cập nhật payment_status nếu cần thiết (ví dụ: completed -> paid)
    // if (status === 'completed' && order.payment_status === 'pending') { order.payment_status = 'paid'; } // Không, logic này ở Payment Callback
    await order.save();

    return order;
};


module.exports = {
  createOrderFromCart,
  getUserOrders,
  getUserOrderDetail,
  cancelOrder,
  getPurchasedItemData,

  getSellerOrders,
  getSellerOrderDetail,
  fulfillOrderItem,

  getAdminOrders,
  getAdminOrderDetail,
  updateOrderStatus,
};