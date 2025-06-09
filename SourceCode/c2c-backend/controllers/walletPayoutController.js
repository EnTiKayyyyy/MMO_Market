const { Wallet, PayoutRequest, User, Transaction, sequelize } = require('../models');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

/**
 * @desc    Lấy thông tin ví của người dùng hiện tại (người bán)
 * @route   GET /api/wallet-payouts/wallet/my
 * @access  Private (Seller)
 */
exports.getMyWallet = async (req, res) => {
    try {
        let wallet = await Wallet.findOne({ where: { user_id: req.user.id } });
        if (!wallet) {
            // Nếu người dùng chưa có ví, tạo một ví mới
            wallet = await Wallet.create({ user_id: req.user.id, balance: 0.00 });
        }
        res.json(wallet);
    } catch (error) {
        console.error('Lỗi khi lấy thông tin ví:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

/**
 * @desc    Người bán tạo yêu cầu rút tiền mới
 * @route   POST /api/wallet-payouts/request
 * @access  Private (Seller)
 */
exports.createPayoutRequest = async (req, res) => {
    // Kiểm tra validation từ middleware
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { amount, payout_info } = req.body;
    const seller_id = req.user.id;
    try {
        // Chỉ tạo yêu cầu mới, không trừ tiền từ ví ở bước này
        const newPayoutRequest = await PayoutRequest.create({
            seller_id,
            amount: parseFloat(amount),
            payout_info: JSON.stringify(payout_info),
            status: 'pending'
        });
        res.status(201).json({ message: 'Yêu cầu rút tiền đã được gửi thành công và đang chờ xử lý.', payoutRequest: newPayoutRequest });
    } catch (error) {
        console.error('Lỗi khi tạo yêu cầu rút tiền:', error);
        res.status(500).json({ message: 'Lỗi server khi tạo yêu cầu rút tiền.', error: error.message });
    }
};

/**
 * @desc    Người bán xem lịch sử các yêu cầu rút tiền của mình
 * @route   GET /api/wallet-payouts/my-requests
 * @access  Private (Seller)
 */
exports.getMyPayoutRequests = async (req, res) => {
    const seller_id = req.user.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    try {
        let whereClause = { seller_id };
        if (status) {
            whereClause.status = status;
        }
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
        console.error('Lỗi khi lấy lịch sử yêu cầu rút tiền:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// === ADMIN CONTROLLERS ===

/**
 * @desc    Admin xem tất cả các yêu cầu rút tiền
 * @route   GET /api/wallet-payouts
 * @access  Private (Admin)
 */
exports.getAllPayoutRequestsAdmin = async (req, res) => {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;
    try {
        let whereClause = {};
        let userWhereClause = {};
        if (status) {
            whereClause.status = status;
        }
        if (search) {
            userWhereClause[Op.or] = [
                { username: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
            ];
        }

        const requests = await PayoutRequest.findAndCountAll({
            where: whereClause,
            include: [{
                model: User,
                as: 'seller',
                attributes: ['id', 'username', 'email'],
                where: userWhereClause
            }],
            order: [['status', 'ASC'], ['createdAt', 'DESC']],
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
        console.error('Lỗi khi lấy tất cả yêu cầu rút tiền (admin):', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

/**
 * @desc    Admin xem chi tiết một yêu cầu rút tiền
 * @route   GET /api/wallet-payouts/:requestId
 * @access  Private (Admin)
 */
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
        console.error('Lỗi khi lấy chi tiết yêu cầu rút tiền (admin):', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

/**
 * @desc    Admin xử lý một yêu cầu rút tiền (hoàn thành hoặc từ chối)
 * @route   PUT /api/wallet-payouts/:requestId/process
 * @access  Private (Admin)
 */
exports.processPayoutRequestAdmin = async (req, res) => {
    const { requestId } = req.params;
    const { new_status, admin_notes } = req.body; // new_status sẽ là 'approved' hoặc 'rejected'
    let dbTransaction;

    try {
        dbTransaction = await sequelize.transaction();
        const payoutRequest = await PayoutRequest.findByPk(requestId, { transaction: dbTransaction, lock: true });

        if (!payoutRequest) {
            await dbTransaction.rollback();
            return res.status(404).json({ message: 'Yêu cầu rút tiền không tìm thấy.' });
        }
        if (payoutRequest.status !== 'pending') {
            await dbTransaction.rollback();
            return res.status(400).json({ message: `Chỉ có thể xử lý yêu cầu ở trạng thái "pending".` });
        }

        // Cập nhật trạng thái
        payoutRequest.status = new_status;
        
        // **FIX**: Thay 'completed' bằng 'approved' để khớp với ENUM có thể có trong DB
        if (new_status === 'approved') {
            const sellerWallet = await Wallet.findOne({ where: { user_id: payoutRequest.seller_id }, transaction: dbTransaction, lock: true });
            const amountToWithdraw = parseFloat(payoutRequest.amount);

            if (!sellerWallet || parseFloat(sellerWallet.balance) < amountToWithdraw) {
                await dbTransaction.rollback();
                payoutRequest.status = 'failed';
                // Không cần lưu `admin_notes` vì transaction đã rollback
                await payoutRequest.save(); 
                return res.status(400).json({ message: 'Không thể hoàn thành: Số dư của người bán không đủ.' });
            }

            // Trừ tiền khỏi ví
            sellerWallet.balance = parseFloat(sellerWallet.balance) - amountToWithdraw;
            await sellerWallet.save({ transaction: dbTransaction });
            
            // Tạo giao dịch rút tiền
            await Transaction.create({
                user_id: payoutRequest.seller_id,
                payout_request_id: payoutRequest.id,
                type: 'payout_completed', // Giữ nguyên type để dễ lọc, status của request mới là quan trọng
                amount: -amountToWithdraw,
                status: 'completed',
                notes: `Admin approved payout request #${payoutRequest.id}. Notes: ${admin_notes || ''}`
            }, { transaction: dbTransaction });
        }
        
        await payoutRequest.save({ transaction: dbTransaction });
        await dbTransaction.commit();

        res.json({ message: `Yêu cầu rút tiền đã được xử lý, trạng thái mới: ${new_status}.`, payoutRequest });

    } catch (error) {
        if (dbTransaction) await dbTransaction.rollback();
        console.error('Lỗi xử lý yêu cầu rút tiền:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};
