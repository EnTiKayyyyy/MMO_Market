const { Wallet, Transaction, sequelize } = require('../models');
// const { generateVnpayUrl, moment } = require('../utils/vnpayHelpers'); // Import helper của VNPay
const { validationResult } = require('express-validator');
require('dotenv').config();

// @desc    Lấy thông tin ví của người dùng hiện tại
exports.getMyWallet = async (req, res) => {
    try {
        let wallet = await Wallet.findOne({ where: { user_id: req.user.id } });
        if (!wallet) {
            // Nếu người dùng chưa có ví, tạo một ví mới với số dư 0
            wallet = await Wallet.create({ user_id: req.user.id, balance: 0.00 });
        }
        res.json(wallet);
    } catch (error) {
        console.error('Lỗi lấy thông tin ví:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// @desc    Tạo URL thanh toán VNPay để nạp tiền
exports.createDepositPaymentUrl = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { amount, bankCode } = req.body;
    const userId = req.user.id;
    let dbTransaction;

    try {
        dbTransaction = await sequelize.transaction();

        // Tạo một giao dịch 'deposit' đang chờ xử lý
        const depositTransaction = await Transaction.create({
            user_id: userId,
            type: 'deposit',
            amount: parseFloat(amount),
            status: 'pending',
            notes: 'User initiated deposit request.',
        }, { transaction: dbTransaction });

        await dbTransaction.commit();

        // Bắt đầu tạo URL VNPay
        const createDate = moment(new Date()).format('YYYYMMDDHHmmss');
        const ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || (req.connection.socket ? req.connection.socket.remoteAddress : null);
        const tmnCode = process.env.VNPAY_TMN_CODE;
        const secretKey = process.env.VNPAY_HASH_SECRET;
        const vnpUrl = process.env.VNPAY_URL;
        const returnUrl = process.env.VNPAY_RETURN_URL; // Dùng chung return URL, hoặc tạo riêng cho nạp tiền

        // Dùng ID của transaction làm mã tham chiếu duy nhất
        const txnRef = `DEPOSIT_${depositTransaction.id}_${Date.now()}`;
        const orderInfo = `Nap tien vao vi - Giao dich #${depositTransaction.id}`;

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = txnRef;
        vnp_Params['vnp_OrderInfo'] = orderInfo;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = parseFloat(amount) * 100;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = ipAddr.includes("::") ? "127.0.0.1" : ipAddr;
        vnp_Params['vnp_CreateDate'] = createDate;
        if (bankCode) {
            vnp_Params['vnp_BankCode'] = bankCode;
        }

        const paymentUrl = generateVnpayUrl(vnp_Params, vnpUrl, secretKey);
        res.json({ paymentUrl });

    } catch (error) {
        if (dbTransaction) await dbTransaction.rollback();
        console.error('Lỗi tạo URL nạp tiền:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

/**
 * @desc    Tạo mã QR code (dưới dạng data URL) để nạp tiền vào ví
 * @route   POST /api/wallet/generate-deposit-qr
 * @access  Private
 */
exports.generateDepositQrCode = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { amount } = req.body;
    const userId = req.user.id;
    const dbTransaction = await sequelize.transaction();

    try {
        // 1. Tạo một giao dịch 'deposit' đang ở trạng thái 'pending'
        const depositTransaction = await Transaction.create({
            user_id: userId,
            type: 'deposit',
            amount: parseFloat(amount),
            status: 'pending',
            notes: 'Khởi tạo yêu cầu nạp tiền qua VietQR.',
        }, { transaction: dbTransaction });

        await dbTransaction.commit();

        // 2. Lấy thông tin tài khoản ngân hàng từ .env
        const bankId = process.env.BANK_ID;
        const accountNumber = process.env.BANK_ACCOUNT_NUMBER;
        const accountName = process.env.BANK_ACCOUNT_NAME;

        if (!bankId || !accountNumber) {
            console.error("Lỗi cấu hình: Thiếu thông tin tài khoản ngân hàng trong file .env");
            return res.status(500).json({ message: 'Lỗi hệ thống: Không thể tạo mã QR.' });
        }

        // 3. Tạo chuỗi QR theo chuẩn VietQR
        // Nội dung chuyển khoản sẽ là mã giao dịch để admin đối soát
        const description = `Nap tien giao dich ${depositTransaction.id}`;
        const qrString = `https://img.vietqr.io/image/${bankId}-${accountNumber}-print.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(accountName)}`;

        // 4. Trả về thông tin cho frontend
        res.json({
            qrImageUrl: qrString, // Trả về URL ảnh QR được generate bởi VietQR
            transactionId: depositTransaction.id,
            amount: parseFloat(amount),
            description,
        });

    } catch (error) {
        if (dbTransaction) await dbTransaction.rollback();
        console.error('Lỗi khi tạo mã QR nạp tiền:', error);
        res.status(500).json({ message: 'Lỗi hệ thống khi tạo yêu cầu nạp tiền.' });
    }
};

/**
 * @desc    Kiểm tra trạng thái của một giao dịch nạp tiền cụ thể
 * @route   GET /api/wallet/deposit-status/:transactionId
 * @access  Private
 */
exports.getDepositStatus = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const userId = req.user.id;

        const depositTx = await Transaction.findOne({
            where: {
                id: transactionId,
                user_id: userId, // Chỉ cho phép user kiểm tra giao dịch của chính mình
                type: 'deposit'
            }
        });

        if (!depositTx) {
            return res.status(404).json({ message: 'Không tìm thấy giao dịch.' });
        }

        res.json({ status: depositTx.status });

    } catch (error) {
        res.status(500).json({ message: 'Lỗi hệ thống.' });
    }
};