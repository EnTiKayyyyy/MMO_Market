const { ErrorProduct, Order, OrderItem, Message, User } = require('../models');
const { createNotification } = require('../services/notificationService');

/**
 * @desc    Người mua báo lỗi một mục trong đơn hàng
 * @route   POST /api/errors/report/order-item/:itemId
 * @access  Private (Chỉ dành cho người mua)
 */
exports.reportError = async (req, res) => {
    const { itemId } = req.params;
    const { reason } = req.body;
    const buyerId = req.user.id;

    try {
        const orderItem = await OrderItem.findByPk(itemId, {
            include: [{ model: Order, as: 'order' }]
        });

        if (!orderItem || orderItem.order.buyer_id !== buyerId) {
            return res.status(404).json({ message: 'Mục đơn hàng không hợp lệ.' });
        }

        if (orderItem.order.status !== 'completed') {
            return res.status(400).json({ message: 'Chỉ có thể báo lỗi cho đơn hàng đã hoàn thành.' });
        }

        // Kiểm tra thời hạn 3 ngày
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        if (new Date(orderItem.order.updatedAt) < threeDaysAgo) {
            return res.status(400).json({ message: 'Đã quá thời hạn 3 ngày để báo lỗi cho đơn hàng này.' });
        }
        
        // Cập nhật trạng thái đơn hàng để tạm dừng chuyển tiền
        orderItem.order.status = 'disputed'; // Dùng lại status 'disputed'
        await orderItem.order.save();

        const errorReport = await ErrorProduct.create({
            order_item_id: itemId,
            buyer_id: buyerId,
            seller_id: orderItem.seller_id,
            reason
        });
        
        // Gửi tin nhắn cho người bán
        await Message.create({
            sender_id: buyerId,
            receiver_id: orderItem.seller_id,
            content: `[BÁO LỖI TỰ ĐỘNG] Tôi đã báo lỗi cho sản phẩm (Mục ĐH: #${itemId}) với lý do: "${reason}". Vui lòng kiểm tra.`
        });

        // Gửi thông báo cho Admin (giả sử admin có ID là 1)
        await createNotification({
            recipientId: 1, 
            type: 'dispute_opened_admin',
            title: 'Có báo lỗi sản phẩm mới',
            message: `Người mua #${buyerId} đã báo lỗi cho mục đơn hàng #${itemId}.`,
            link: `/quan-tri/errors` // Cần tạo trang này ở frontend
        });

        res.status(201).json({ message: 'Báo lỗi đã được ghi nhận. Người bán đã được thông báo.', report: errorReport });

    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Bạn đã báo lỗi cho mục này rồi.' });
        }
        console.error("Lỗi khi báo lỗi sản phẩm:", error);
        res.status(500).json({ message: 'Lỗi server.' });
    }
};

/**
 * @desc    Admin xem danh sách các báo lỗi
 * @route   GET /api/errors
 * @access  Private (Chỉ dành cho Admin)
 */
exports.getErrors = async (req, res) => {
    try {
        const errors = await ErrorProduct.findAll({
            include: [
                { model: User, as: 'buyer', attributes: ['id', 'username', 'full_name'] },
                { model: User, as: 'seller', attributes: ['id', 'username', 'full_name'] },
                { 
                    model: OrderItem, 
                    as: 'orderItem',
                    include: [{ model: Product, as: 'product', attributes: ['id', 'name']}]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(errors);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách báo lỗi:", error);
        res.status(500).json({ message: 'Lỗi server.' });
    }
};
