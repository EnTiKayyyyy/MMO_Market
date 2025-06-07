const { Wallet, Transaction, sequelize } = require('../models');
const querystring = require('qs');
const crypto = require("crypto");
/**
 * @desc    Xử lý xác nhận giao dịch nạp tiền từ VietQR
 * @route   POST /api/webhooks/vietqr-confirm
 * @access  Public (nên có một secret key để bảo mật)
 */
exports.confirmVietQRDeposit = async (req, res) => {
    // transactionId được gửi lên từ trang admin hoặc dịch vụ trung gian
    const { transactionId, secretKey } = req.body;

    // TODO: Bảo mật Webhook
    // Trong thực tế, bạn cần so sánh secretKey với một khóa bí mật lưu trong .env
    // if (secretKey !== process.env.WEBHOOK_SECRET_KEY) {
    //     return res.status(401).json({ message: 'Unauthorized: Invalid secret key.' });
    // }

    if (!transactionId) {
        return res.status(400).json({ message: 'Thiếu mã giao dịch.' });
    }
    
    const dbTransaction = await sequelize.transaction();

    try {
        // 1. Tìm giao dịch nạp tiền đang chờ
        const depositTx = await Transaction.findOne({
            where: {
                id: transactionId,
                type: 'deposit',
                status: 'pending'
            },
            lock: dbTransaction.LOCK.UPDATE, // Khóa dòng này lại để tránh xử lý 2 lần
            transaction: dbTransaction
        });

        // Nếu không tìm thấy giao dịch hoặc nó đã được xử lý, trả về lỗi
        if (!depositTx) {
            await dbTransaction.rollback();
            return res.status(404).json({ message: 'Không tìm thấy giao dịch đang chờ xử lý tương ứng.' });
        }

        // 2. Cập nhật trạng thái giao dịch nạp tiền
        depositTx.status = 'completed';
        depositTx.notes = 'Nạp tiền thành công qua VietQR.';
        await depositTx.save({ transaction: dbTransaction });

        // 3. Cộng tiền vào ví của người dùng
        const userWallet = await Wallet.findOne({
            where: { user_id: depositTx.user_id },
            lock: dbTransaction.LOCK.UPDATE,
            transaction: dbTransaction
        });

        if (userWallet) {
            await userWallet.increment('balance', { by: depositTx.amount, transaction: dbTransaction });
        } else {
            // Nếu người dùng chưa có ví, tạo mới và cộng tiền
            await Wallet.create({
                user_id: depositTx.user_id,
                balance: depositTx.amount
            }, { transaction: dbTransaction });
        }
        
        // Commit tất cả thay đổi nếu mọi thứ thành công
        await dbTransaction.commit();

        console.log(`Giao dịch nạp tiền #${transactionId} đã được xác nhận và cộng tiền thành công.`);
        res.status(200).json({ message: 'Xác nhận và cộng tiền thành công.' });

    } catch (error) {
        await dbTransaction.rollback();
        console.error(`Lỗi khi xác nhận giao dịch #${transactionId}:`, error);
        res.status(500).json({ message: 'Lỗi hệ thống khi xử lý xác nhận.' });
    }
};

/**
 * @desc    Xử lý VNPay IPN (Instant Payment Notification)
 * @route   GET /api/webhooks/vnpay-ipn
 * @access  Public
 */
exports.vnpayIpnHandler = async (req, res) => {
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];

    let secretKey = process.env.VNP_HASHSECRET;

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = Object.keys(vnp_Params).sort().reduce(
      (obj, key) => { 
        obj[key] = vnp_Params[key]; 
        return obj;
      }, 
      {}
    );

    let signData = querystring.stringify(vnp_Params, { encode: true });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (secureHash === signed) {
        // ... logic xử lý IPN giữ nguyên ...
        const transactionId = vnp_Params['vnp_TxnRef'];
        const responseCode = vnp_Params['vnp_ResponseCode'];
        const amount = parseInt(vnp_Params['vnp_Amount']) / 100;

        const dbTransaction = await sequelize.transaction();
        try {
            const depositTx = await Transaction.findOne({
                where: { id: transactionId, type: 'deposit' },
                lock: dbTransaction.LOCK.UPDATE,
                transaction: dbTransaction
            });

            if (depositTx) {
                if (depositTx.status === 'pending') {
                    if (responseCode === '00') {
                        depositTx.status = 'completed';
                        depositTx.notes = `Giao dịch VNPay thành công. Mã giao dịch VNP: ${vnp_Params['vnp_TransactionNo']}`;
                        await depositTx.save({ transaction: dbTransaction });
                        const userWallet = await Wallet.findOne({
                            where: { user_id: depositTx.user_id },
                            lock: dbTransaction.LOCK.UPDATE,
                            transaction: dbTransaction
                        });
                        if (userWallet) {
                            await userWallet.increment('balance', { by: amount, transaction: dbTransaction });
                        } else {
                            await Wallet.create({ user_id: depositTx.user_id, balance: amount }, { transaction: dbTransaction });
                        }
                        await dbTransaction.commit();
                        res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
                    } else {
                        depositTx.status = 'failed';
                        depositTx.notes = `Giao dịch VNPay thất bại. Mã lỗi: ${responseCode}`;
                        await depositTx.save({ transaction: dbTransaction });
                        await dbTransaction.commit();
                        res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
                    }
                } else {
                    await dbTransaction.rollback();
                    res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
                }
            } else {
                await dbTransaction.rollback();
                res.status(200).json({ RspCode: '01', Message: 'Order not found' });
            }
        } catch (error) {
            await dbTransaction.rollback();
            console.error("Lỗi xử lý IPN:", error);
            res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
        }
    } else {
        res.status(200).json({ RspCode: '97', Message: 'Invalid Checksum' });
    }
};

/**
 * @desc    Xử lý khi VNPay redirect người dùng về
 * @route   GET /api/webhooks/vnpay-return
 * @access  Public
 */
exports.vnpayReturnHandler = async (req, res) => {
    let vnp_Params = req.query;
    let secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = Object.keys(vnp_Params).sort().reduce(
      (obj, key) => { 
        obj[key] = vnp_Params[key]; 
        return obj;
      }, 
      {}
    );

    let secretKey = process.env.VNP_HASHSECRET;
    
    let signData = querystring.stringify(vnp_Params, { encode: true });
    let hmac = crypto.createHmac("sha512", secretKey);

    let signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");

    if (secureHash === signed) {
        const transactionId = vnp_Params['vnp_TxnRef'];
        const responseCode = vnp_Params['vnp_ResponseCode'];
        const amount = parseInt(vnp_Params['vnp_Amount']) / 100;

        const dbTransaction = await sequelize.transaction();
        try {
            const depositTx = await Transaction.findOne({
                where: { id: transactionId, type: 'deposit' },
                lock: dbTransaction.LOCK.UPDATE,
                transaction: dbTransaction
            });

            if (depositTx) {
                if (depositTx.status === 'pending') {
                    if (responseCode === '00') {
                        depositTx.status = 'completed';
                        depositTx.notes = `Giao dịch VNPay thành công. Mã giao dịch VNP: ${vnp_Params['vnp_TransactionNo']}`;
                        await depositTx.save({ transaction: dbTransaction });
                        const userWallet = await Wallet.findOne({
                            where: { user_id: depositTx.user_id },
                            lock: dbTransaction.LOCK.UPDATE,
                            transaction: dbTransaction
                        });
                        if (userWallet) {
                            await userWallet.increment('balance', { by: amount, transaction: dbTransaction });
                        } else {
                            await Wallet.create({ user_id: depositTx.user_id, balance: amount }, { transaction: dbTransaction });
                        }
                        await dbTransaction.commit();
                        // res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
                    } else {
                        depositTx.status = 'failed';
                        depositTx.notes = `Giao dịch VNPay thất bại. Mã lỗi: ${responseCode}`;
                        await depositTx.save({ transaction: dbTransaction });
                        await dbTransaction.commit();
                        // res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
                    }
                } else {
                    await dbTransaction.rollback();
                    // res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
                }
            } else {
                await dbTransaction.rollback();
                // res.status(200).json({ RspCode: '01', Message: 'Order not found' });
            }
        } catch (error) {
            await dbTransaction.rollback();
            console.error("Lỗi xử lý IPN:", error);
            // res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
        }
        const redirectParams = new URLSearchParams();
        redirectParams.append('success', vnp_Params['vnp_ResponseCode'] === '00' ? 'true' : 'false');
        redirectParams.append('vnp_TxnRef', vnp_Params['vnp_TxnRef']);
        redirectParams.append('vnp_Amount', vnp_Params['vnp_Amount']);
        
        res.redirect(`http://localhost:5173/vi/payment-status?${redirectParams.toString()}`);
    } else {
        const redirectParams = new URLSearchParams();
        redirectParams.append('success', 'false');
        redirectParams.append('message', 'Invalid signature');
        res.redirect(`http://localhost:5173/vi/payment-status?${redirectParams.toString()}`);
    }
};