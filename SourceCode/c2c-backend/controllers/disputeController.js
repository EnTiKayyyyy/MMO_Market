const { Dispute, OrderItem, Order, Product, User, SellerWallet, Transaction, sequelize } = require('../models');
const { Op } = require('sequelize');
require('dotenv').config();

const COMMISSION_RATE = parseFloat(process.env.COMMISSION_RATE) || 0.05;

// @desc    Người mua tạo khiếu nại
exports.openDispute = async (req, res) => {
    const { itemId } = req.params; // order_item_id
    const { reason } = req.body;
    const complainant_id = req.user.id; // Buyer ID
    let dbTransaction;

    try {
        dbTransaction = await sequelize.transaction();

        const orderItem = await OrderItem.findByPk(itemId, {
            include: [
                { model: Order, as: 'order', attributes: ['buyer_id'] },
                { model: Product, as: 'product', attributes: ['seller_id'] } // Lấy seller_id từ sản phẩm
            ],
            transaction: dbTransaction
        });

        // Các validation logic đã được chuyển phần lớn sang middleware validateDisputeCreation
        // Ở đây chỉ cần lấy defendant_id
        const defendant_id = orderItem.product.seller_id;

        const newDispute = await Dispute.create({
            order_item_id: itemId,
            complainant_id,
            defendant_id,
            reason,
            status: 'open' // Trạng thái ban đầu
        }, { transaction: dbTransaction });

        // Cập nhật trạng thái của OrderItem thành 'disputed'
        orderItem.status = 'disputed';
        await orderItem.save({ transaction: dbTransaction });

        // (Tùy chọn) Cập nhật trạng thái của Order tổng nếu cần
        const order = await Order.findByPk(orderItem.order_id, { transaction: dbTransaction });
        if (order && order.status !== 'disputed' && order.status !== 'completed' && order.status !== 'cancelled') {
            let allItemsDisputed = true;
            const items = await OrderItem.findAll({where: {order_id: order.id}, transaction: dbTransaction});
            for(let item of items) {
                if(item.status !== 'disputed' && item.status !== 'confirmed' && item.status !== 'refunded' && item.status !== 'cancelled') {
                    allItemsDisputed = false;
                    break;
                }
            }
            if(allItemsDisputed && items.every(i => i.status === 'disputed')) order.status = 'disputed';
            else if(order.status !== 'partially_completed') order.status = 'partially_completed'; // Hoặc một trạng thái khác thể hiện có vấn đề
            await order.save({ transaction: dbTransaction });
        }

        await dbTransaction.commit();

        // TODO: Gửi thông báo cho người bán (defendant_id) về khiếu nại mới

        res.status(201).json({ message: 'Khiếu nại đã được tạo thành công.', dispute: newDispute });

    } catch (error) {
        if (dbTransaction) await dbTransaction.rollback();
        console.error('Lỗi mở khiếu nại:', error);
        res.status(500).json({ message: 'Lỗi server khi mở khiếu nại.', error: error.message });
    }
};

// @desc    Lấy các khiếu nại của tôi (người mua hoặc người bán)
exports.getMyDisputes = async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    try {
        let whereClause = {};
        if (userRole === 'buyer') {
            whereClause.complainant_id = userId;
        } else if (userRole === 'seller') {
            whereClause.defendant_id = userId;
        } else {
            return res.status(403).json({ message: 'Vai trò không hợp lệ để xem khiếu nại.' });
        }
        if (status) whereClause.status = status;

        const disputes = await Dispute.findAndCountAll({
            where: whereClause,
            include: [
                { model: OrderItem, as: 'orderItem', include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }] },
                { model: User, as: 'complainant', attributes: ['id', 'username'] },
                { model: User, as: 'defendant', attributes: ['id', 'username'] }
            ],
            order: [['updatedAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json({
            totalItems: disputes.count,
            totalPages: Math.ceil(disputes.count / limit),
            currentPage: parseInt(page),
            disputes: disputes.rows
        });
    } catch (error) {
        console.error('Lỗi lấy khiếu nại của tôi:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// @desc    Lấy chi tiết một khiếu nại
exports.getDisputeById = async (req, res) => {
    const { disputeId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    try {
        const dispute = await Dispute.findByPk(disputeId, {
            include: [
                {
                    model: OrderItem, as: 'orderItem',
                    include: [
                        { model: Product, as: 'product', attributes: ['id', 'name', 'description'] }, // Không lấy product_data
                        { model: Order, as: 'order', attributes: ['id', 'total_amount'] }
                    ]
                },
                { model: User, as: 'complainant', attributes: ['id', 'username', 'full_name'] },
                { model: User, as: 'defendant', attributes: ['id', 'username', 'full_name'] },
                { model: User, as: 'resolvedByAdmin', attributes: ['id', 'username', 'full_name'] }
            ]
        });

        if (!dispute) {
            return res.status(404).json({ message: 'Khiếu nại không tìm thấy.' });
        }

        // Kiểm tra quyền xem
        if (dispute.complainant_id !== userId && dispute.defendant_id !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền xem khiếu nại này.' });
        }

        res.json(dispute);
    } catch (error) {
        console.error('Lỗi lấy chi tiết khiếu nại:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// @desc    Người bán hoặc người mua phản hồi khiếu nại
exports.addDisputeResponse = async (req, res) => {
    const { disputeId } = req.params;
    const { response_message } = req.body;
    const userId = req.user.id;
    let dbTransaction;

    try {
        dbTransaction = await sequelize.transaction();
        const dispute = await Dispute.findByPk(disputeId, { transaction: dbTransaction });

        if (!dispute) {
            await dbTransaction.rollback();
            return res.status(404).json({ message: 'Khiếu nại không tìm thấy.' });
        }

        let newStatus = dispute.status;
        let notificationTargetId = null;

        if (dispute.complainant_id === userId) { // Buyer is responding
            if (dispute.status !== 'seller_responded') {
                await dbTransaction.rollback();
                return res.status(400).json({ message: 'Bạn không thể phản hồi vào lúc này hoặc không phải lượt của bạn.' });
            }
            dispute.buyer_rebuttal = response_message;
            newStatus = 'buyer_rebutted'; // Hoặc 'under_admin_review' nếu muốn admin vào cuộc ngay
            notificationTargetId = dispute.defendant_id; // Thông báo cho seller (và admin)
        } else if (dispute.defendant_id === userId) { // Seller is responding
            if (dispute.status !== 'open') {
                await dbTransaction.rollback();
                return res.status(400).json({ message: 'Bạn không thể phản hồi vào lúc này hoặc không phải lượt của bạn.' });
            }
            dispute.seller_response = response_message;
            newStatus = 'seller_responded';
            notificationTargetId = dispute.complainant_id; // Thông báo cho buyer
        } else {
            await dbTransaction.rollback();
            return res.status(403).json({ message: 'Bạn không liên quan đến khiếu nại này.' });
        }

        dispute.status = newStatus;
        await dispute.save({ transaction: dbTransaction });
        await dbTransaction.commit();

        // TODO: Gửi thông báo cho notificationTargetId (và admin nếu status chuyển sang under_admin_review)

        res.json({ message: 'Phản hồi đã được gửi.', dispute });

    } catch (error) {
        if (dbTransaction) await dbTransaction.rollback();
        console.error('Lỗi gửi phản hồi khiếu nại:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// @desc    Admin lấy tất cả khiếu nại
exports.getAllDisputesAdmin = async (req, res) => {
    const { page = 1, limit = 10, status, sortBy = 'updatedAt', order = 'DESC' } = req.query;
    const offset = (page - 1) * limit;
    try {
        let whereClause = {};
        if (status) whereClause.status = status;

        const disputes = await Dispute.findAndCountAll({
            where: whereClause,
            include: [
                { model: OrderItem, as: 'orderItem', include: [{model: Product, as: 'product', attributes:['name']}] },
                { model: User, as: 'complainant', attributes: ['id', 'username'] },
                { model: User, as: 'defendant', attributes: ['id', 'username'] },
                { model: User, as: 'resolvedByAdmin', attributes: ['id', 'username'] }
            ],
            order: [[sortBy, order.toUpperCase()]],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
        res.json({
            totalItems: disputes.count,
            totalPages: Math.ceil(disputes.count / limit),
            currentPage: parseInt(page),
            disputes: disputes.rows
        });
    } catch (error) {
        console.error('Lỗi lấy tất cả khiếu nại (admin):', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// @desc    Admin giải quyết một khiếu nại
exports.resolveDisputeAdmin = async (req, res) => {
    const { disputeId } = req.params;
    const { new_status, resolution_notes } = req.body;
    const admin_id = req.user.id;
    let dbTransaction;

    try {
        dbTransaction = await sequelize.transaction();
        const dispute = await Dispute.findByPk(disputeId, {
            include: [{ model: OrderItem, as: 'orderItem', include: [{ model: Order, as: 'order' }] }],
            transaction: dbTransaction
        });

        if (!dispute) {
            await dbTransaction.rollback();
            return res.status(404).json({ message: 'Khiếu nại không tìm thấy.' });
        }

        if (['resolved_refund_buyer', 'resolved_favor_seller', 'closed'].includes(dispute.status)) {
            await dbTransaction.rollback();
            return res.status(400).json({ message: `Khiếu nại này đã được giải quyết (trạng thái: ${dispute.status}).` });
        }

        dispute.status = new_status;
        dispute.resolution_notes = resolution_notes;
        dispute.admin_id = admin_id;
        await dispute.save({ transaction: dbTransaction });

        const orderItem = dispute.orderItem;
        const order = orderItem.order;

        if (new_status === 'resolved_refund_buyer') {
            orderItem.status = 'refunded';
            await orderItem.save({ transaction: dbTransaction });

            // Tạo giao dịch hoàn tiền cho người mua
            await Transaction.create({
                user_id: order.buyer_id,
                order_item_id: orderItem.id,
                type: 'refund',
                amount: parseFloat(orderItem.price), // Hoàn lại toàn bộ giá trị item cho người mua
                status: 'completed',
                notes: `Refund for disputed item ${orderItem.id} in order ${order.id}. Dispute ${dispute.id} resolved by admin.`
            }, { transaction: dbTransaction });

            // (Tùy chọn) Xử lý tiền của người bán:
            // Nếu tiền đã được giải ngân cho người bán (item đã từng 'confirmed'), cần trừ lại từ ví người bán.
            // Nếu tiền vẫn đang bị giữ bởi sàn (item chưa 'confirmed'), thì không cần trừ từ ví, chỉ không giải ngân.
            // Phí sàn (commission) cũng có thể được hoàn lại hoặc không, tùy chính sách.
            // Ví dụ: Nếu cần trừ tiền từ ví người bán:
            const sellerWallet = await SellerWallet.findOne({ where: { seller_id: dispute.defendant_id }, transaction: dbTransaction });
            if (sellerWallet && parseFloat(sellerWallet.balance) >= parseFloat(orderItem.price) - parseFloat(orderItem.commission_fee || 0)) {
                // Chỉ trừ nếu ví đủ, và trừ số tiền seller thực nhận
                // sellerWallet.balance = parseFloat(sellerWallet.balance) - (parseFloat(orderItem.price) - parseFloat(orderItem.commission_fee || 0));
                // await sellerWallet.save({ transaction: dbTransaction });
                // Cân nhắc kỹ logic này, có thể seller không có lỗi, sàn chịu. Hoặc seller chịu.
            } else {
                // Xử lý trường hợp ví seller không đủ.
                console.warn(`Seller wallet for ${dispute.defendant_id} has insufficient funds or does not exist for refund debit.`);
            }

        } else if (new_status === 'resolved_favor_seller') {
            // Nếu item đang 'disputed' và tiền chưa giải ngân, thì giải ngân cho seller
            if (orderItem.status === 'disputed') {
                // Logic tương tự như confirmItemReceipt, nhưng không có confirm từ buyer
                orderItem.status = 'confirmed'; // Vì seller thắng kiện
                await orderItem.save({ transaction: dbTransaction });

                const itemPrice = parseFloat(orderItem.price);
                const commission = itemPrice * COMMISSION_RATE;
                const sellerEarnings = itemPrice - commission;
                if(orderItem.commission_fee == 0) orderItem.commission_fee = commission; // Lưu phí
                await orderItem.save({ transaction: dbTransaction });


                const sellerWallet = await SellerWallet.findOne({ where: { seller_id: dispute.defendant_id }, transaction: dbTransaction });
                if (sellerWallet) {
                    sellerWallet.balance = parseFloat(sellerWallet.balance) + sellerEarnings;
                    await sellerWallet.save({ transaction: dbTransaction });
                } else {
                    await SellerWallet.create({ seller_id: dispute.defendant_id, balance: sellerEarnings }, { transaction: dbTransaction });
                }

                await Transaction.create({
                    user_id: dispute.defendant_id, order_item_id: orderItem.id, type: 'payout',
                    amount: sellerEarnings, status: 'completed'
                }, { transaction: dbTransaction });
                await Transaction.create({
                    user_id: 1, order_item_id: orderItem.id, type: 'commission', // Platform admin ID
                    amount: commission, status: 'completed'
                }, { transaction: dbTransaction });
            }
        }

        // Kiểm tra và cập nhật trạng thái Order tổng
        const finalOrder = await Order.findByPk(order.id, {
            include: [{ model: OrderItem, as: 'items' }],
            transaction: dbTransaction
        });
        const allItemsResolved = finalOrder.items.every(item => ['confirmed', 'refunded', 'cancelled'].includes(item.status));
        if (allItemsResolved) {
            // Nếu tất cả items đều refunded/cancelled -> order cancelled/refunded
            // Nếu có confirmed và refunded -> partially_completed hoặc completed tùy logic
            // Đây là một ví dụ đơn giản:
            if(finalOrder.items.every(item => ['refunded', 'cancelled'].includes(item.status))) {
                finalOrder.status = (finalOrder.items.some(item => item.status === 'refunded')) ? 'refunded' : 'cancelled';
            } else {
                 finalOrder.status = 'completed'; // Hoặc 'partially_completed'
            }
            await finalOrder.save({ transaction: dbTransaction });
        }


        await dbTransaction.commit();

        // TODO: Gửi thông báo kết quả cho buyer và seller

        res.json({ message: 'Khiếu nại đã được giải quyết.', dispute });

    } catch (error) {
        if (dbTransaction) await dbTransaction.rollback();
        console.error('Lỗi giải quyết khiếu nại:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};