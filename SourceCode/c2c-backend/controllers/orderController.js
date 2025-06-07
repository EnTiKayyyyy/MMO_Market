const { Order, OrderItem, Product, User, Wallet, Transaction, sequelize } = require('../models'); // Lấy từ models/index.js
const { Op } = require('sequelize');
const { createNotification } = require('../services/notificationService');
const qrcode = require('qrcode');
require('dotenv').config();

const COMMISSION_RATE = parseFloat(process.env.COMMISSION_RATE) || 0.05; // 5% phí sàn
const PAYOUT_HOLD_DAYS = 3;


/**
 * @desc    Người mua lấy product_data của một mục đơn hàng đã hoàn thành
 * @route   GET /api/orders/items/:itemId/product-data
 * @access  Private/Buyer
 */
exports.getOrderItemProductDataForBuyer = async (req, res) => {
    try {
        const { itemId } = req.params;
        const buyerId = req.user.id;

        const orderItem = await OrderItem.findByPk(itemId, {
            include: [
                { model: Order, as: 'order', attributes: ['status', 'buyer_id'] },
                { model: Product, as: 'product', attributes: ['product_data'] }
            ]
        });

        if (!orderItem) {
            return res.status(404).json({ message: 'Không tìm thấy mục đơn hàng.' });
        }

        // Kiểm tra bảo mật:
        // 1. Người yêu cầu có phải là người mua của đơn hàng này không?
        if (orderItem.order.buyer_id !== buyerId) {
            return res.status(403).json({ message: 'Bạn không có quyền xem thông tin này.' });
        }

        // 2. Đơn hàng đã hoàn thành chưa?
        if (orderItem.order.status !== 'completed') {
            return res.status(403).json({ message: 'Chỉ có thể xem thông tin khi đơn hàng đã hoàn thành.' });
        }

        res.json({ product_data: orderItem.product.product_data });

    } catch (error) {
        console.error('Lỗi khi lấy product_data cho người mua:', error);
        res.status(500).json({ message: 'Lỗi server.' });
    }
};

/**
 * @desc    Admin cập nhật trạng thái đơn hàng
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
exports.updateOrderStatusAdmin = async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;

    // Validate status
    const validStatuses = ['pending', 'paid', 'processing', 'partially_completed', 'completed', 'cancelled', 'disputed', 'refunded'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
    }

    try {
        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
        }

        order.status = status;
        
        // Nếu đơn hàng hoàn thành, cập nhật trạng thái của các mục con
        if (status === 'completed') {
            await OrderItem.update({ status: 'confirmed' }, { where: { order_id: id } });
        }
        
        await order.save();

        // TODO: Gửi thông báo cho người mua/người bán về việc cập nhật đơn hàng

        res.json({ message: 'Cập nhật trạng thái đơn hàng thành công.', order });
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi server.' });
    }
};

// @desc    Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
    const { items } = req.body; // items: [{ product_id, quantity (mặc định là 1 cho digital) }]
    const buyer_id = req.user.id;
    let transaction; // Biến cho DB transaction

    try {
        transaction = await sequelize.transaction();
        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of items) {
            const product = await Product.findByPk(item.product_id, { transaction });
            if (!product) {
                await transaction.rollback();
                return res.status(404).json({ message: `Sản phẩm với ID ${item.product_id} không tìm thấy.` });
            }
            if (product.status !== 'available') {
                await transaction.rollback();
                return res.status(400).json({ message: `Sản phẩm "${product.name}" không còn hoặc đang chờ duyệt.` });
            }
            if (product.seller_id === buyer_id) {
                await transaction.rollback();
                return res.status(400).json({ message: `Bạn không thể tự mua sản phẩm của chính mình.` });
            }

            totalAmount += parseFloat(product.price); // Giả sử quantity = 1
            orderItemsData.push({
                product_id: product.id,
                seller_id: product.seller_id,
                price: product.price,
                // commission_fee sẽ tính sau khi thanh toán
            });

            // Đánh dấu sản phẩm là đã bán (hoặc "reserved" nếu có cơ chế đó)
            product.status = 'sold'; // Hoặc một trạng thái tạm thời khác
            await product.save({ transaction });
        }

        if (orderItemsData.length === 0) {
            await transaction.rollback();
            return res.status(400).json({ message: "Đơn hàng không có sản phẩm nào." });
        }

        const newOrder = await Order.create({
            buyer_id,
            total_amount: totalAmount,
            status: 'pending' // Chờ thanh toán
        }, { transaction });

        for (const itemData of orderItemsData) {
            await OrderItem.create({
                ...itemData,
                order_id: newOrder.id,
            }, { transaction });
        }

        await transaction.commit();
        res.status(201).json({ message: 'Đơn hàng đã được tạo, vui lòng tiến hành thanh toán.', order: newOrder });

        await createNotification({
            recipientId: newOrder.buyer_id, // Gửi cho người mua
            type: 'new_order_buyer',
            title: 'Đơn hàng mới đã được tạo',
            message: `Đơn hàng #${newOrder.id} của bạn đã được tạo thành công và đang chờ thanh toán.`,
            link: `/orders/${newOrder.id}`,
            relatedEntityType: 'order',
            relatedEntityId: newOrder.id
        });
        for (const itemData of orderItemsData) { // orderItemsData từ logic tạo đơn
        await createNotification({
            recipientId: itemData.seller_id,
            type: 'new_order_seller',
            title: 'Bạn có đơn hàng mới!',
            message: `Khách hàng vừa đặt sản phẩm (ID: ${itemData.product_id}) trong đơn hàng #${newOrder.id}.`,
            link: `/seller/orders/${newOrder.id}`, // Hoặc link chi tiết item cho seller
            relatedEntityType: 'order',
            relatedEntityId: newOrder.id
        });
}

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Lỗi tạo đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi server khi tạo đơn hàng.', error: error.message });
    }
};

// @desc    (Mô phỏng) Đánh dấu đơn hàng đã thanh toán
exports.markOrderAsPaid = async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user.id; // Người mua hoặc admin (nếu logic cho phép)
    let transaction;

    try {
        transaction = await sequelize.transaction();
        const order = await Order.findByPk(orderId, {
            include: [{ model: OrderItem, as: 'items' }],
            transaction
        });

        if (!order) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Đơn hàng không tìm thấy.' });
        }

        // Chỉ người mua hoặc admin mới có quyền này (cần check kỹ hơn)
        if (order.buyer_id !== userId && req.user.role !== 'admin') {
            await transaction.rollback();
            return res.status(403).json({ message: 'Không có quyền thực hiện hành động này.' });
        }

        if (order.status !== 'pending') {
            await transaction.rollback();
            return res.status(400).json({ message: `Đơn hàng không ở trạng thái chờ thanh toán (hiện tại: ${order.status}).` });
        }

        order.status = 'paid'; // Hoặc 'processing' nếu thanh toán xong là bắt đầu xử lý
        await order.save({ transaction });

        // Tạo giao dịch thanh toán cho người mua
        await Transaction.create({
            user_id: order.buyer_id,
            order_item_id: null, // Giao dịch cho toàn bộ đơn hàng
            type: 'payment',
            amount: -parseFloat(order.total_amount), // Số tiền người mua trả (âm)
            status: 'completed'
        }, { transaction });

        // (Tùy chọn) Thông báo cho các người bán có sản phẩm trong đơn hàng này
        // ... logic gửi thông báo ...

        await transaction.commit();
        res.json({ message: 'Đơn hàng đã được đánh dấu là đã thanh toán.', order });

    } catch (error) {
        if (transaction) await transaction.rollback();
        console.error('Lỗi đánh dấu thanh toán:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};


// @desc    Người bán đánh dấu item đã giao
exports.markItemAsDelivered = async (req, res) => {
    const { itemId } = req.params;
    const sellerId = req.user.id;

    try {
        const orderItem = await OrderItem.findByPk(itemId, {
            include: [{ model: Order, as: 'order' }]
        });

        if (!orderItem) {
            return res.status(404).json({ message: 'Mục đơn hàng không tìm thấy.' });
        }
        if (orderItem.seller_id !== sellerId) {
            return res.status(403).json({ message: 'Bạn không phải người bán của mục này.' });
        }
        if (orderItem.order.status !== 'paid' && orderItem.order.status !== 'processing') {
             return res.status(400).json({ message: `Không thể giao hàng cho đơn chưa thanh toán/xử lý (trạng thái đơn: ${orderItem.order.status}).` });
        }
        if (orderItem.status === 'delivered' || orderItem.status === 'confirmed') {
            return res.status(400).json({ message: 'Mục này đã được giao hoặc xác nhận.' });
        }


        orderItem.status = 'delivered';
        await orderItem.save();

        // (Tùy chọn) Cập nhật trạng thái Order tổng nếu cần (ví dụ: 'processing')
        const order = await Order.findByPk(orderItem.order_id);
        if (order.status === 'paid') {
            order.status = 'processing'; // Hoặc logic phức tạp hơn nếu có nhiều items
            await order.save();
        }

        res.json({ message: 'Mục đơn hàng đã được đánh dấu là đã giao.', orderItem });
    } catch (error) {
        console.error('Lỗi đánh dấu đã giao:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// // @desc    Người mua xác nhận đã nhận hàng -> Kích hoạt Escrow Release
// exports.confirmItemReceipt = async (req, res) => {
//     const { itemId } = req.params;
//     const buyerId = req.user.id;
//     let dbTransaction;

//     try {
//         dbTransaction = await sequelize.transaction();
//         const orderItem = await OrderItem.findByPk(itemId, {
//             include: [
//                 { model: Order, as: 'order', where: { buyer_id: buyerId } }, // Đảm bảo người mua đúng
//                 { model: Product, as: 'product' } // Để lấy product_data
//             ],
//             transaction: dbTransaction
//         });

//         if (!orderItem) {
//             await dbTransaction.rollback();
//             return res.status(404).json({ message: 'Mục đơn hàng không tìm thấy hoặc bạn không phải người mua.' });
//         }
//         if (orderItem.status !== 'delivered') {
//             await dbTransaction.rollback();
//             return res.status(400).json({ message: `Không thể xác nhận mục chưa được giao (trạng thái: ${orderItem.status}).` });
//         }

//         orderItem.status = 'confirmed';
//         await orderItem.save({ transaction: dbTransaction });

//         // Tính toán tiền cho người bán và phí sàn
//         const itemPrice = parseFloat(orderItem.price);
//         const commission = itemPrice * COMMISSION_RATE;
//         const sellerEarnings = itemPrice - commission;
//         orderItem.commission_fee = commission; // Lưu lại phí đã thu
//         await orderItem.save({ transaction: dbTransaction });


//         // Cộng tiền vào ví người bán
//         const sellerWallet = await SellerWallet.findOne({ where: { seller_id: orderItem.seller_id }, transaction: dbTransaction });
//         if (sellerWallet) {
//             sellerWallet.balance = parseFloat(sellerWallet.balance) + sellerEarnings;
//             await sellerWallet.save({ transaction: dbTransaction });
//         } else {
//             // Trường hợp hiếm: seller chưa có ví -> tạo mới hoặc báo lỗi
//             await SellerWallet.create({ seller_id: orderItem.seller_id, balance: sellerEarnings }, { transaction: dbTransaction });
//         }

//         // Ghi nhận giao dịch cho người bán
//         await Transaction.create({
//             user_id: orderItem.seller_id,
//             order_item_id: orderItem.id,
//             type: 'payout', // Hoặc 'sale_credit' tùy theo cách bạn định nghĩa
//             amount: sellerEarnings,
//             status: 'completed'
//         }, { transaction: dbTransaction });

//         // Ghi nhận giao dịch phí sàn (cho admin/platform)
//         await Transaction.create({
//             user_id: 1, // ID của Admin hoặc một tài khoản đại diện cho platform
//             order_item_id: orderItem.id,
//             type: 'commission',
//             amount: commission,
//             status: 'completed'
//         }, { transaction: dbTransaction });


//         // Kiểm tra xem tất cả items trong Order đã confirmed chưa để cập nhật Order status
//         const order = await Order.findByPk(orderItem.order_id, {
//             include: [{ model: OrderItem, as: 'items' }],
//             transaction: dbTransaction
//         });

//         const allItemsConfirmed = order.items.every(item => item.status === 'confirmed');
//         if (allItemsConfirmed) {
//             order.status = 'completed';
//             await order.save({ transaction: dbTransaction });
//         } else if (order.status !== 'partially_completed' && order.items.some(item => item.status === 'confirmed')) {
//             order.status = 'partially_completed';
//             await order.save({ transaction: dbTransaction });
//         }


//         await dbTransaction.commit();
//         res.json({
//             message: 'Xác nhận nhận hàng thành công. Tiền đã được chuyển cho người bán.',
//             orderItem,
//             // product_data sẽ được trả về qua getOrderById nếu đã confirmed
//         });

//         await createNotification({
//             recipientId: orderItem.seller_id,
//             type: 'item_confirmed_seller',
//             title: 'Mặt hàng đã được xác nhận',
//             message: `Người mua đã xác nhận nhận hàng cho mục #${orderItem.id} (sản phẩm: ${orderItem.product.name}). Tiền đã được cộng vào ví của bạn.`,
//             link: `/seller/orders/${orderItem.order_id}`, // Link đến đơn hàng
//             relatedEntityType: 'order_item',
//             relatedEntityId: orderItem.id
//         });

//     } catch (error) {
//         if (dbTransaction) await dbTransaction.rollback();
//         console.error('Lỗi xác nhận nhận hàng:', error);
//         res.status(500).json({ message: 'Lỗi server.', error: error.message });
//     }
// };

// @desc    Lấy đơn hàng của tôi (Người mua)
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { buyer_id: req.user.id },
            include: [
                {
                    model: OrderItem,
                    as: 'items',
                    include: [
                        { model: Product, as: 'product', attributes: ['id', 'name'] }, // Không lấy product_data
                        { model: User, as: 'seller', attributes: ['id', 'username']}
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        console.error('Lỗi lấy đơn hàng của tôi:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// @desc    Lấy chi tiết đơn hàng (Buyer, Related Seller, Admin)
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.orderId, {
            include: [
                { model: User, as: 'buyer', attributes: ['id', 'username', 'full_name'] },
                {
                    model: OrderItem,
                    as: 'items',
                    include: [
                        { model: Product, as: 'product', attributes: ['id', 'name', 'thumbnail_url', 'description', /* KHÔNG LẤY product_data ở đây */] },
                        { model: User, as: 'seller', attributes: ['id', 'username']}
                    ]
                }
            ]
        });

        if (!order) {
            return res.status(404).json({ message: 'Đơn hàng không tìm thấy.' });
        }

        // Kiểm tra quyền truy cập
        const isBuyer = order.buyer_id === req.user.id;
        const isRelatedSeller = order.items.some(item => item.seller_id === req.user.id);
        const isAdmin = req.user.role === 'admin';

        if (!isBuyer && !isRelatedSeller && !isAdmin) {
            return res.status(403).json({ message: 'Bạn không có quyền xem đơn hàng này.' });
        }

        // **QUAN TRỌNG: Xử lý việc trả về `product_data` cho người mua đã xác nhận**
        // Nếu người dùng là người mua, duyệt qua các item, nếu item đã 'confirmed' (hoặc 'delivered')
        // thì mới lấy `product_data` của sản phẩm tương ứng và gắn vào item đó.
        if (isBuyer) {
            for (let i = 0; i < order.items.length; i++) {
                const item = order.items[i];
                if (item.status === 'confirmed' || item.status === 'delivered') { // Hoặc chỉ 'confirmed'
                    const productWithData = await Product.findByPk(item.product_id, { attributes: ['product_data'] });
                    if (productWithData) {
                        // Gán vào một thuộc tính mới để không ghi đè product object đã có
                        order.items[i].setDataValue('purchased_product_data', productWithData.product_data);
                    }
                }
            }
        }


        res.json(order);
    } catch (error) {
        console.error('Lỗi lấy chi tiết đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// @desc    Hủy đơn hàng
exports.cancelOrder = async (req, res) => {
    const { orderId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    let dbTransaction;

    try {
        dbTransaction = await sequelize.transaction();
        const order = await Order.findByPk(orderId, {
            include: [{ model: OrderItem, as: 'items', include: [{model: Product, as: 'product'}]}],
            transaction: dbTransaction
        });

        if (!order) {
            await dbTransaction.rollback();
            return res.status(404).json({ message: 'Đơn hàng không tìm thấy.' });
        }

        // Kiểm tra quyền hủy
        const isBuyer = order.buyer_id === userId;
        if (!isBuyer && userRole !== 'admin') {
            await dbTransaction.rollback();
            return res.status(403).json({ message: 'Bạn không có quyền hủy đơn hàng này.' });
        }

        // Logic kiểm tra xem đơn hàng có thể hủy không (ví dụ: chỉ hủy khi 'pending' hoặc 'paid')
        if (!['pending', 'paid'].includes(order.status) && userRole !== 'admin') { // Admin có thể có quyền hủy rộng hơn
            await dbTransaction.rollback();
            return res.status(400).json({ message: `Không thể hủy đơn hàng ở trạng thái "${order.status}".` });
        }

        const oldStatus = order.status;
        order.status = 'cancelled';
        await order.save({ transaction: dbTransaction });

        // Hoàn lại trạng thái sản phẩm
        for (const item of order.items) {
            if (item.product && item.product.status === 'sold') { // Chỉ hoàn lại nếu trạng thái là 'sold' do đơn này
                 const productToUpdate = await Product.findByPk(item.product_id, {transaction: dbTransaction});
                 if(productToUpdate) {
                    productToUpdate.status = 'available';
                    await productToUpdate.save({ transaction: dbTransaction });
                 }
            }
            item.status = 'cancelled'; // Cập nhật trạng thái item
            await item.save({ transaction: dbTransaction });
        }

        // Logic hoàn tiền nếu đơn hàng đã 'paid'
        if (oldStatus === 'paid') {
            // Ghi nhận giao dịch hoàn tiền cho người mua
            await Transaction.create({
                user_id: order.buyer_id,
                // order_item_id: null, // Giao dịch cho toàn bộ đơn hàng
                type: 'refund',
                amount: parseFloat(order.total_amount), // Số tiền hoàn lại (dương)
                status: 'completed',
                notes: `Refund for cancelled order ${order.id}`
            }, { transaction: dbTransaction });
        }


        await dbTransaction.commit();
        res.json({ message: 'Đơn hàng đã được hủy.', order });

    } catch (error) {
        if (dbTransaction) await dbTransaction.rollback();
        console.error('Lỗi hủy đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};


// ==== ADMIN FUNCTIONS ====
// @desc    Admin: Lấy tất cả đơn hàng
exports.getAllOrdersAdmin = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, sortBy = 'createdAt', order = 'DESC' } = req.query;
        const offset = (page - 1) * limit;
        let whereClause = {};
        if (status) whereClause.status = status;

        const orders = await Order.findAndCountAll({
            where: whereClause,
            include: [
                { model: User, as: 'buyer', attributes: ['id', 'username'] },
                { model: OrderItem, as: 'items', attributes: ['id', 'product_id', 'price', 'status'] }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, order.toUpperCase()]]
        });
        res.json({
            totalItems: orders.count,
            totalPages: Math.ceil(orders.count / limit),
            currentPage: parseInt(page),
            orders: orders.rows
        });
    } catch (error) {
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

/**
 * @desc    Tạo mã QR code để thanh toán cho một đơn hàng cụ thể
 * @route   GET /api/orders/:orderId/generate-payment-qr
 * @access  Private/Buyer
 */
exports.generateOrderPaymentQrCode = async (req, res) => {
    try {
        const { orderId } = req.params;
        const buyerId = req.user.id;

        const order = await Order.findByPk(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
        }
        if (order.buyer_id !== buyerId) {
            return res.status(403).json({ message: 'Bạn không có quyền truy cập đơn hàng này.' });
        }
        if (order.status !== 'pending') {
            return res.status(400).json({ message: `Đơn hàng này đã được xử lý (trạng thái: ${order.status}).` });
        }

        const bankId = process.env.BANK_ID;
        const accountNumber = process.env.BANK_ACCOUNT_NUMBER;
        const accountName = process.env.BANK_ACCOUNT_NAME;

        if (!bankId || !accountNumber) {
            return res.status(500).json({ message: 'Lỗi hệ thống: Thông tin thanh toán chưa được cấu hình.' });
        }
        
        const amount = order.total_amount;
        const description = `Thanh toan don hang ${order.id}`;
        const qrString = `https://img.vietqr.io/image/${bankId}-${accountNumber}-print.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(accountName)}`;
        
        res.json({
            qrImageUrl: qrString,
            orderId: order.id,
            amount: parseFloat(amount),
            description
        });

    } catch (error) {
        console.error('Lỗi khi tạo mã QR cho đơn hàng:', error);
        res.status(500).json({ message: 'Lỗi hệ thống khi tạo mã QR.' });
    }
};

exports.getSellerOrders = async (req, res) => {
    try {
        // Lấy ID của người bán đang đăng nhập
        const sellerId = req.user.id;

        // Tìm tất cả các đơn hàng có chứa ít nhất một sản phẩm của người bán này
        const orders = await Order.findAll({
            include: [{
                model: OrderItem,
                as: 'items',
                where: { seller_id: sellerId }, // Điều kiện quan trọng: chỉ lấy item của seller
                required: true, // INNER JOIN để đảm bảo chỉ trả về các Order có item của seller
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'thumbnail_url']
                }]
            }, {
                model: User,
                as: 'buyer', // Lấy thông tin người mua
                attributes: ['id', 'username', 'full_name']
            }],
            order: [['createdAt', 'DESC']] // Sắp xếp theo đơn hàng mới nhất
        });
        
        res.json(orders);
    } catch (error) {
        console.error('Lỗi lấy đơn hàng của người bán:', error);
        res.status(500).json({ message: 'Lỗi máy chủ khi truy vấn đơn hàng.', error: error.message });
    }
};

async function handleSuccessfulPayment(orderId) {
    const transaction = await sequelize.transaction();
    try {
        const order = await Order.findByPk(orderId, {
            include: [{ model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }],
            transaction
        });

        if (!order || order.status !== 'pending') {
            await transaction.rollback();
            console.log(`Đơn hàng ${orderId} không hợp lệ hoặc đã được xử lý.`);
            return;
        }

        // 1. Cập nhật trạng thái đơn hàng thành 'completed'
        order.status = 'completed';
        
        // 2. Đặt lịch chuyển tiền cho người bán sau 3 ngày
        const payoutDate = new Date();
        payoutDate.setDate(payoutDate.getDate() + PAYOUT_HOLD_DAYS);
        order.payout_eligible_at = payoutDate;
        
        await order.save({ transaction });

        // Cập nhật trạng thái các mục con
        for (const item of order.items) {
            item.status = 'delivered'; // Hoặc một trạng thái tương đương "đã giao/hoàn thành"
            await item.save({ transaction });

            // Thông báo cho người bán
            await createNotification({
                recipientId: item.seller_id,
                type: 'order_paid_seller',
                title: 'Sản phẩm của bạn đã được bán!',
                message: `Sản phẩm "${item.product.name}" trong đơn hàng #${order.id} đã được thanh toán. Tiền sẽ được chuyển vào ví của bạn sau ${PAYOUT_HOLD_DAYS} ngày.`,
                link: `/nguoi-ban/don-hang/${order.id}`
            });
        }
        
        // Thông báo cho người mua
        await createNotification({
            recipientId: order.buyer_id,
            type: 'order_completed_buyer',
            title: 'Đơn hàng của bạn đã hoàn tất',
            message: `Đơn hàng #${order.id} đã được thanh toán thành công và hoàn tất.`,
            link: `/don-hang/${order.id}`
        });

        await transaction.commit();
        console.log(`Đơn hàng #${order.id} đã hoàn tất và tiền sẽ được giữ trong ${PAYOUT_HOLD_DAYS} ngày.`);

    } catch (error) {
        await transaction.rollback();
        console.error(`Lỗi xử lý thanh toán cho đơn hàng #${orderId}:`, error);
    }
};

// @desc    (MỚI) Admin kích hoạt xử lý chuyển tiền cho các đơn hàng đủ điều kiện
// @route   POST /api/orders/process-payouts
// @access  Private (Admin)
exports.processScheduledPayouts = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const eligibleOrders = await Order.findAll({
            where: {
                status: 'completed', // Chỉ các đơn đã hoàn thành
                payout_eligible_at: { [Op.lte]: new Date() } // Đã đến ngày chuyển tiền
            },
            include: [{ model: OrderItem, as: 'items', where: { status: { [Op.ne]: 'refunded' } } }], // Bỏ qua item đã hoàn tiền
            transaction
        });

        if (eligibleOrders.length === 0) {
            await transaction.rollback();
            return res.status(200).json({ message: 'Không có đơn hàng nào đủ điều kiện để chuyển tiền.' });
        }

        let processedCount = 0;
        for (const order of eligibleOrders) {
            for (const item of order.items) {
                const itemPrice = parseFloat(item.price);
                const commission = itemPrice * COMMISSION_RATE;
                const sellerEarnings = itemPrice - commission;

                const sellerWallet = await Wallet.findOne({ where: { user_id: item.seller_id }, transaction });
                if (sellerWallet) {
                    await sellerWallet.increment('balance', { by: sellerEarnings, transaction });
                } else {
                    await Wallet.create({ user_id: item.seller_id, balance: sellerEarnings }, { transaction });
                }

                // Ghi nhận giao dịch
                await Transaction.create({
                    user_id: item.seller_id,
                    order_item_id: item.id,
                    type: 'sale_credit',
                    amount: sellerEarnings,
                    status: 'completed',
                    notes: `Payout from order #${order.id}`
                }, { transaction });
            }

            // Đánh dấu đã xử lý để không chạy lại
            order.payout_eligible_at = null; // Hoặc chuyển status sang 'archived'
            order.status = 'archived'; // Ví dụ
            await order.save({ transaction });
            processedCount++;
        }

        await transaction.commit();
        res.status(200).json({ message: `Đã xử lý chuyển tiền thành công cho ${processedCount} đơn hàng.` });

    } catch (error) {
        await transaction.rollback();
        console.error('Lỗi khi xử lý chuyển tiền hàng loạt:', error);
        res.status(500).json({ message: 'Lỗi server khi xử lý chuyển tiền.' });
    }
};

/**
 * @desc    Admin hoàn tiền cho một mục trong đơn hàng
 * @route   POST /api/orders/items/:itemId/refund
 * @access  Private (Admin)
 */
exports.refundOrderItemAdmin = async (req, res) => {
    const { itemId } = req.params;
    const { notes } = req.body; // Ghi chú của admin về lý do hoàn tiền
    const transaction = await sequelize.transaction();

    try {
        const orderItem = await OrderItem.findByPk(itemId, {
            include: [{ model: Order, as: 'order' }],
            transaction
        });

        if (!orderItem) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Mục đơn hàng không tìm thấy.' });
        }

        if (orderItem.status === 'refunded' || orderItem.status === 'cancelled') {
            await transaction.rollback();
            return res.status(400).json({ message: 'Mục này đã được hoàn tiền hoặc đã hủy.' });
        }

        const buyerId = orderItem.order.buyer_id;
        const sellerId = orderItem.seller_id;
        const amountToRefund = parseFloat(orderItem.price);

        // 1. Cập nhật trạng thái mục đơn hàng
        orderItem.status = 'refunded';
        await orderItem.save({ transaction });

        // 2. Hoàn tiền vào ví người mua
        const buyerWallet = await Wallet.findOne({ where: { user_id: buyerId }, transaction });
        if (buyerWallet) {
            await buyerWallet.increment('balance', { by: amountToRefund, transaction });
        } else {
            // Trường hợp người mua chưa có ví (hiếm gặp), tạo mới
            await Wallet.create({ user_id: buyerId, balance: amountToRefund }, { transaction });
        }

        // 3. Ghi nhận giao dịch hoàn tiền cho người mua
        await Transaction.create({
            user_id: buyerId,
            order_item_id: itemId,
            type: 'refund_credit_buyer',
            amount: amountToRefund,
            status: 'completed',
            notes: `Admin refund for order #${orderItem.order_id}. Reason: ${notes || 'N/A'}`
        }, { transaction });

        // 4. Ghi nhận giao dịch ghi nợ cho người bán (để đối soát, không trừ tiền trực tiếp nếu chưa payout)
        await Transaction.create({
            user_id: sellerId,
            order_item_id: itemId,
            type: 'refund_debit_seller',
            amount: -amountToRefund,
            status: 'completed',
            notes: `Sale reversal for item #${itemId} in order #${orderItem.order_id} due to admin refund.`
        }, { transaction });

        // 5. Kiểm tra và cập nhật trạng thái đơn hàng tổng
        const finalOrder = await Order.findByPk(orderItem.order_id, {
            include: [{ model: OrderItem, as: 'items' }],
            transaction
        });

        const allItemsResolved = finalOrder.items.every(item => ['confirmed', 'refunded', 'cancelled'].includes(item.status));
        if (allItemsResolved) {
            const hasConfirmedItems = finalOrder.items.some(item => item.status === 'confirmed');
            if (!hasConfirmedItems) {
                finalOrder.status = 'refunded'; // Nếu tất cả đều refund/cancel
            } else {
                finalOrder.status = 'completed'; // Vẫn có mục đã thành công
            }
            await finalOrder.save({ transaction });
        }


        await transaction.commit();

        // TODO: Gửi thông báo cho người mua và người bán

        res.status(200).json({ message: 'Hoàn tiền cho mục đơn hàng thành công.', orderItem });

    } catch (error) {
        await transaction.rollback();
        console.error('Lỗi khi admin hoàn tiền:', error);
        res.status(500).json({ message: 'Lỗi server khi xử lý hoàn tiền.', error: error.message });
    }
};