const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Đảm bảo đường dẫn này đúng

const PayoutRequest = sequelize.define('PayoutRequest', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    seller_id: { // ID của người bán (User)
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'users', // Tên bảng users trong CSDL
            key: 'id'
        }
    },
    amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
            isDecimal: true,
            min: 0.01 // Ví dụ: Số tiền rút tối thiểu
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'processing', 'completed', 'rejected', 'failed'),
        allowNull: false,
        defaultValue: 'pending',
    },
    payout_info: { // Thông tin tài khoản nhận tiền (JSON string)
        type: DataTypes.TEXT,
        allowNull: false,
    },
    // CHÚ Ý: Các trường dưới đây đã được chú thích lại để khắc phục lỗi "Unknown column".
    // Bạn nên thêm các cột này vào bảng `payout_requests` trong CSDL của mình để có đầy đủ chức năng.
    /*
    admin_notes: { // Ghi chú của admin khi xử lý
        type: DataTypes.TEXT,
        allowNull: true,
    },
    processed_at: { // Thời điểm admin xử lý
        type: DataTypes.DATE,
        allowNull: true,
    },
    transaction_id_payout: { // ID giao dịch từ cổng thanh toán/ngân hàng (nếu có)
        type: DataTypes.STRING(255),
        allowNull: true,
    }
    */
}, {
    tableName: 'payout_requests', // Tên bảng trong CSDL
    timestamps: true,
});

module.exports = PayoutRequest;
