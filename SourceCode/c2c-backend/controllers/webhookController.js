const { Wallet, Transaction, sequelize } = require('../models');

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