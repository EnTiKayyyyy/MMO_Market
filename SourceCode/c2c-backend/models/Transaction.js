const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED, // Dùng BIGINT nếu số lượng giao dịch lớn
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: { // User liên quan đến giao dịch (có thể là buyer, seller, hoặc admin/platform)
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    order_item_id: { // Liên kết với một mục đơn hàng cụ thể (nếu có)
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true, // Có thể null cho các giao dịch không liên quan trực tiếp đến order item (vd: nạp tiền, điều chỉnh thủ công)
        references: {
            model: 'order_items',
            key: 'id'
        }
    },
    payout_request_id: { // Liên kết với một yêu cầu rút tiền cụ thể (nếu có)
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
            model: 'payout_requests',
            key: 'id'
        }
    },
    type: { // Loại giao dịch
        type: DataTypes.ENUM(
            'payment',              // Thanh toán đơn hàng từ người mua
            'sale_credit',          // Ghi có cho người bán sau khi bán hàng (sau trừ phí)
            'commission',           // Phí sàn thu được
            'payout_request_debit', // Trừ tiền từ ví seller khi tạo yêu cầu rút tiền
            'payout_completed',     // Admin xác nhận đã chi tiền payout (tiền thực sự rời hệ thống)
            'payout_rejection_credit',// Hoàn tiền vào ví seller nếu yêu cầu rút tiền bị từ chối/thất bại
            'refund_debit_seller',  // Trừ tiền từ ví seller để hoàn cho buyer (do dispute)
            'refund_credit_buyer',  // Ghi có hoàn tiền cho buyer (vào ví buyer nếu có, hoặc ghi nhận)
            'deposit',              // Người dùng nạp tiền vào ví (nếu có chức năng ví cho buyer)
            'manual_adjustment'     // Điều chỉnh số dư thủ công bởi admin (cần ghi rõ lý do trong notes)
        ),
        allowNull: false,
    },
    amount: { // Số tiền giao dịch
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        // Giá trị dương: tiền vào tài khoản/ví của user_id này
        // Giá trị âm: tiền ra khỏi tài khoản/ví của user_id này
    },
    status: {
        type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
    },
    notes: { // Ghi chú chi tiết về giao dịch
        type: DataTypes.TEXT,
        allowNull: true,
    },
    // Sequelize sẽ tự động thêm createdAt và updatedAt
}, {
    tableName: 'transactions',
    timestamps: true,
    updatedAt: false, // Giao dịch thường là bất biến sau khi tạo, chỉ có `createdAt` là quan trọng
});

module.exports = Transaction;