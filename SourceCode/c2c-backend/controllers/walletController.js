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