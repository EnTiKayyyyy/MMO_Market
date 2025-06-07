const { Wallet, Transaction, sequelize } = require('../models');
const { validationResult } = require('express-validator');
require('dotenv').config();
const querystring = require('qs');
const crypto = require("crypto");
// @desc    Lấy thông tin ví của người dùng hiện tại
exports.getMyWallet = async (req, res) => {
    try {
        let wallet = await Wallet.findOne({ where: { user_id: req.user.id } });
        if (!wallet) {
            wallet = await Wallet.create({ user_id: req.user.id, balance: 0.00 });
        }
        res.json(wallet);
    } catch (error) {
        console.error('Lỗi lấy thông tin ví:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

/**
 * @desc    Ghi nhận yêu cầu nạp tiền vào hệ thống (thay thế cho hàm tạo URL thanh toán)
 * @route   POST /api/wallet/deposit
 * @access  Private
 */
exports.createDepositRequest = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { amount } = req.body;
    const userId = req.user.id;
    const dbTransaction = await sequelize.transaction();

    try {
        // Tạo một giao dịch 'deposit' đang ở trạng thái 'pending'
        const depositTransaction = await Transaction.create({
            user_id: userId,
            type: 'deposit',
            amount: parseFloat(amount),
            status: 'pending',
            notes: 'Người dùng khởi tạo yêu cầu nạp tiền. Chờ xác nhận thủ công.',
        }, { transaction: dbTransaction });

        // Nếu tạo bản ghi thành công, commit transaction
        await dbTransaction.commit();

        // Trả về thông báo thành công thay vì URL thanh toán
        res.status(201).json({ 
            message: 'Yêu cầu nạp tiền đã được ghi nhận và đang chờ xử lý.', 
            transaction: depositTransaction 
        });

    } catch (error) {
        // Nếu có bất kỳ lỗi nào trong quá trình xử lý CSDL, rollback transaction
        if (dbTransaction) await dbTransaction.rollback();
        console.error('Lỗi khi tạo yêu cầu nạp tiền:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// Đổi tên hàm cũ để phù hợp với chức năng mới trong các tệp route
exports.createDepositPaymentUrl = exports.createDepositRequest;


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
        const depositTransaction = await Transaction.create({
            user_id: userId,
            type: 'deposit',
            amount: parseFloat(amount),
            status: 'pending',
            notes: 'Khởi tạo yêu cầu nạp tiền qua VietQR.',
        }, { transaction: dbTransaction });

        await dbTransaction.commit();

        const bankId = process.env.BANK_ID;
        const accountNumber = process.env.BANK_ACCOUNT_NUMBER;
        const accountName = process.env.BANK_ACCOUNT_NAME;

        if (!bankId || !accountNumber) {
            console.error("Lỗi cấu hình: Thiếu thông tin tài khoản ngân hàng trong file .env");
            return res.status(500).json({ message: 'Lỗi hệ thống: Không thể tạo mã QR.' });
        }

        const description = `Nap tien giao dich ${depositTransaction.id}`;
        const qrString = `https://img.vietqr.io/image/${bankId}-${accountNumber}-print.png?amount=${amount}&addInfo=${encodeURIComponent(description)}&accountName=${encodeURIComponent(accountName)}`;

        res.json({
            qrImageUrl: qrString,
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
                user_id: userId,
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

/**
 * @desc    Tạo URL thanh toán để nạp tiền vào ví qua VNPay
 * @route   POST /api/wallet/deposit/create-vnpay-url
 * @access  Private
 */
exports.createVnpayPaymentUrl = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { amount } = req.body;
    const userId = req.user.id;
    const dbTransaction = await sequelize.transaction();

    try {
        const depositTransaction = await Transaction.create({
            user_id: userId,
            type: 'deposit',
            amount: parseFloat(amount),
            status: 'pending',
            notes: `Khởi tạo yêu cầu nạp tiền qua VNPay.`,
        }, { transaction: dbTransaction });

        process.env.TZ = 'Asia/Ho_Chi_Minh';
        let date = new Date();
        let createDate = date.getFullYear().toString() +
                         ('0' + (date.getMonth() + 1)).slice(-2) +
                         ('0' + date.getDate()).slice(-2) +
                         ('0' + date.getHours()).slice(-2) +
                         ('0' + date.getMinutes()).slice(-2) +
                         ('0' + date.getSeconds()).slice(-2);

        let tmnCode = process.env.VNP_TMNCODE;
        let secretKey = process.env.VNP_HASHSECRET;
        let vnpUrl = process.env.VNP_URL;
        let returnUrl = process.env.VNP_RETURNURL;

        let vnp_Params = {};
        vnp_Params['vnp_Version'] = '2.1.0';
        vnp_Params['vnp_Command'] = 'pay';
        vnp_Params['vnp_TmnCode'] = tmnCode;
        vnp_Params['vnp_Locale'] = 'vn';
        vnp_Params['vnp_CurrCode'] = 'VND';
        vnp_Params['vnp_TxnRef'] = depositTransaction.id;
        vnp_Params['vnp_OrderInfo'] = 'naptien' + depositTransaction.id;
        vnp_Params['vnp_OrderType'] = 'other';
        vnp_Params['vnp_Amount'] = 100*amount;
        vnp_Params['vnp_ReturnUrl'] = returnUrl;
        vnp_Params['vnp_IpAddr'] = '127.0.0.1';
        vnp_Params['vnp_CreateDate'] = createDate;
        
        vnp_Params = Object.keys(vnp_Params).sort().reduce((obj, key) => {
            obj[key] = vnp_Params[key];
            return obj;
        }, {});

        let signData = querystring.stringify(vnp_Params, { encode: true });
        let hmac = crypto.createHmac("sha512", secretKey);
        let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
        vnp_Params['vnp_SecureHash'] = signed;
        
        vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });
        await dbTransaction.commit();
        
        res.status(200).json({ paymentUrl: vnpUrl });

    } catch (error) {
        await dbTransaction.rollback();
        console.error('Lỗi khi tạo URL thanh toán VNPay:', error);
        res.status(500).json({ message: 'Lỗi server khi tạo yêu cầu nạp tiền.' });
    }
};