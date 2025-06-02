const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SellerWallet = sequelize.define('SellerWallet', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    seller_id: { // Liên kết với bảng users, chỉ những user có role 'seller'
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true, // Đảm bảo mỗi seller chỉ có một ví
        references: {
            model: 'users', // Tên bảng 'users'
            key: 'id'
        }
    },
    balance: {
        type: DataTypes.DECIMAL(12, 2), // Ví dụ: 1,000,000,000.00
        allowNull: false,
        defaultValue: 0.00,
        validate: {
            isDecimal: true,
            min: 0 // Số dư không thể âm trực tiếp trong ví này (các điều chỉnh âm/dương qua transactions)
        }
    },
    // Sequelize sẽ tự động thêm createdAt và updatedAt
}, {
    tableName: 'seller_wallets',
    timestamps: true, // Bật createdAt và updatedAt
});

module.exports = SellerWallet;