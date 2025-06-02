const { SellerWallet, PayoutRequest, User, Transaction, sequelize } = require('../models');
const { Op } = require('sequelize');

// @desc    Lấy thông tin ví của người bán hiện tại
exports.getMyWallet = async (req, res) => {
    try {
        let wallet = await SellerWallet.findOne({ where: { seller_id: req.user.id } });
        if (!wallet) {
            // Nếu người bán chưa có ví, tạo một ví mới với số dư 0
            wallet = await SellerWallet.create({ seller_id: req.user.id, balance: 0.00 });
        }
        res.json(wallet);
    } catch (error) {
        console.error('Lỗi lấy thông tin ví:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// @desc    Người bán tạo yêu cầu rút tiền mới
exports.createPayoutRequest = async (req, res) => {
    const { amount, payout_info } = req.body;
    const seller_id = req.user.id;
    let dbTransaction;

    try {
        dbTransaction = await sequelize.transaction();

        const sellerWallet = await SellerWallet.findOne({ where: { seller_id }, transaction: dbTransaction });

        // Validation số dư đã được thực hiện trong middleware, nhưng kiểm tra lại cho chắc chắn
        if (!sellerWallet || parseFloat(sellerWallet.balance) < parseFloat(amount)) {
            await dbTransaction.rollback();
            return res.status(400).json({ message: 'Số dư không đủ.' });
        }

        // Trừ tiền từ ví (tiền này sẽ được "tạm giữ")
        sellerWallet.balance = parseFloat(sellerWallet.balance) - parseFloat(amount);
        await sellerWallet.save({ transaction: dbTransaction });

        const newPayoutRequest = await PayoutRequest.create({
            seller_id,
            amount: parseFloat(amount),
            payout_info, // Đã được validate là JSON string
            status: 'pending'
        }, { transaction: dbTransaction });

        // Ghi nhận giao dịch "tạm giữ tiền chờ rút" (âm từ ví seller)
        await Transaction.create({
            user_id: seller_id,
            type: 'payout_request_debit', // Tiền bị trừ khỏi ví để chờ xử lý
            amount: -parseFloat(amount),
            status: 'completed', // Giao dịch này là hoàn thành việc trừ tiền ví
            notes: `Payout request #${newPayoutRequest.id} created. Funds held.`,
            // payout_request_id: newPayoutRequest.id // Nếu có cột này trong Transaction
        }, { transaction: dbTransaction });


        await dbTransaction.commit();
        res.status(201).json({ message: 'Yêu cầu rút tiền đã được tạo thành công và đang chờ xử lý.', payoutRequest: newPayoutRequest });

    } catch (error) {
        if (dbTransaction) await dbTransaction.rollback();
        console.error('Lỗi tạo yêu cầu rút tiền:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// @desc    Người bán xem lịch sử yêu cầu rút tiền của mình
exports.getMyPayoutRequests = async (req, res) => {
    const seller_id = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    try {
        let whereClause = { seller_id };
        if (status) whereClause.status = status;

        const requests = await PayoutRequest.findAndCountAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
        res.json({
            totalItems: requests.count,
            totalPages: Math.ceil(requests.count / limit),
            currentPage: parseInt(page),
            payoutRequests: requests.rows
        });
    } catch (error) {
        console.error('Lỗi lấy lịch sử yêu cầu rút tiền:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// === ADMIN CONTROLLERS ===

// @desc    Admin xem tất cả yêu cầu rút tiền
exports.getAllPayoutRequestsAdmin = async (req, res) => {
    const { page = 1, limit = 10, status, sellerId } = req.query;
    const offset = (page - 1) * limit;
    try {
        let whereClause = {};
        if (status) whereClause.status = status;
        if (sellerId) whereClause.seller_id = parseInt(sellerId);

        const requests = await PayoutRequest.findAndCountAll({
            where: whereClause,
            include: [{ model: User, as: 'seller', attributes: ['id', 'username', 'email'] }],
            order: [['status', 'ASC'], ['createdAt', 'DESC']], // Ưu tiên pending
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
        res.json({
            totalItems: requests.count,
            totalPages: Math.ceil(requests.count / limit),
            currentPage: parseInt(page),
            payoutRequests: requests.rows
        });
    } catch (error) {
        console.error('Lỗi lấy tất cả yêu cầu rút tiền (admin):', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// @desc    Admin xem chi tiết một yêu cầu rút tiền
exports.getPayoutRequestByIdAdmin = async (req, res) => {
    try {
        const request = await PayoutRequest.findByPk(req.params.requestId, {
            include: [{ model: User, as: 'seller', attributes: ['id', 'username', 'email', 'full_name'] }]
        });
        if (!request) {
            return res.status(404).json({ message: 'Yêu cầu rút tiền không tìm thấy.' });
        }
        res.json(request);
    } catch (error) {
        console.error('Lỗi lấy chi tiết yêu cầu rút tiền (admin):', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// @desc    Admin xử lý một yêu cầu rút tiền (approve/reject)
exports.processPayoutRequestAdmin = async (req, res) => {
    const { requestId } = req.params;
    const { new_status, admin_notes, transaction_id_payout } = req.body; // transaction_id_payout là ID từ cổng thanh toán nếu có
    const processed_by_admin_id = req.user.id; // Admin đang xử lý
    let dbTransaction;

    try {
        dbTransaction = await sequelize.transaction();
        const payoutRequest = await PayoutRequest.findByPk(requestId, { transaction: dbTransaction });

        if (!payoutRequest) {
            await dbTransaction.rollback();
            return res.status(404).json({ message: 'Yêu cầu rút tiền không tìm thấy.' });
        }
        if (payoutRequest.status !== 'pending' && payoutRequest.status !== 'approved' && payoutRequest.status !== 'processing') { // Chỉ xử lý các request đang chờ hoặc đã duyệt nhưng chưa xong
            await dbTransaction.rollback();
            return res.status(400).json({ message: `Không thể xử lý yêu cầu ở trạng thái "${payoutRequest.status}".` });
        }

        const oldStatus = payoutRequest.status;
        payoutRequest.status = new_status;
        payoutRequest.admin_notes = admin_notes || payoutRequest.admin_notes;
        payoutRequest.processed_at = new Date();
        // payoutRequest.processed_by_admin_id = processed_by_admin_id; // Nếu có cột này
        if (transaction_id_payout) payoutRequest.transaction_id_payout = transaction_id_payout;

        await payoutRequest.save({ transaction: dbTransaction });

        if (new_status === 'rejected' || new_status === 'failed') {
            // Hoàn tiền lại vào ví người bán
            const sellerWallet = await SellerWallet.findOne({ where: { seller_id: payoutRequest.seller_id }, transaction: dbTransaction });
            if (sellerWallet) {
                sellerWallet.balance = parseFloat(sellerWallet.balance) + parseFloat(payoutRequest.amount);
                await sellerWallet.save({ transaction: dbTransaction });

                // Ghi nhận giao dịch "hoàn tiền vào ví do từ chối/thất bại rút"
                await Transaction.create({
                    user_id: payoutRequest.seller_id,
                    type: 'payout_rejection_credit',
                    amount: parseFloat(payoutRequest.amount), // Dương cho ví seller
                    status: 'completed',
                    notes: `Payout request #${payoutRequest.id} ${new_status}. Funds returned to wallet. Admin notes: ${admin_notes || ''}`,
                    // payout_request_id: payoutRequest.id // Nếu có
                }, { transaction: dbTransaction });
            } else {
                // Trường hợp hiếm: không tìm thấy ví, cần ghi log lỗi
                console.error(`CRITICAL: Seller wallet not found for seller_id ${payoutRequest.seller_id} during payout rejection.`);
            }
        } else if (new_status === 'completed') {
            // Tiền đã được trừ khỏi ví khi tạo request.
            // Ở bước này, admin xác nhận tiền đã thực sự được chuyển đi bên ngoài hệ thống.
            // Ghi nhận giao dịch "rút tiền thành công" (khác với "tạm giữ tiền chờ rút")
            // Giao dịch này có thể không làm thay đổi balance trong hệ thống nữa nếu đã trừ khi request
            // nhưng nó quan trọng để đối soát.
            await Transaction.create({
                user_id: payoutRequest.seller_id,
                type: 'payout_completed', // Tiền đã thực sự rời khỏi hệ thống (từ tài khoản của platform)
                amount: -parseFloat(payoutRequest.amount), // Âm đối với sổ sách của platform
                status: 'completed',
                notes: `Payout request #${payoutRequest.id} completed. External TX ID: ${transaction_id_payout || 'N/A'}. Admin notes: ${admin_notes || ''}`,
                // payout_request_id: payoutRequest.id // Nếu có
            }, { transaction: dbTransaction });
        }
        // Các trạng thái 'approved', 'processing' chỉ là bước trung gian, không tác động thêm vào ví.

        await dbTransaction.commit();

        // TODO: Gửi thông báo cho người bán về trạng thái yêu cầu rút tiền

        res.json({ message: `Yêu cầu rút tiền đã được xử lý, trạng thái mới: ${new_status}.`, payoutRequest });

    } catch (error) {
        if (dbTransaction) await dbTransaction.rollback();
        console.error('Lỗi xử lý yêu cầu rút tiền:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};