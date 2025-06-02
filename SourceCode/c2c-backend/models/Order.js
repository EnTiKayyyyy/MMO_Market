const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    buyer_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    total_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'paid', 'processing', 'partially_completed', 'completed', 'cancelled', 'disputed', 'refunded'),
        allowNull: false,
        defaultValue: 'pending', // Chờ thanh toán
    },
    // Thêm các trường khác nếu cần: payment_method, transaction_id_payment_gateway,...
}, {
    tableName: 'orders',
    timestamps: true,
});

module.exports = Order;