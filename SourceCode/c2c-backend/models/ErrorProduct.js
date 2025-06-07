const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ErrorProduct = sequelize.define('ErrorProduct', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    order_item_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true, // Mỗi mục đơn hàng chỉ được báo lỗi một lần
        references: { model: 'order_items', key: 'id' }
    },
    buyer_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'users', key: 'id' }
    },
    seller_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'users', key: 'id' }
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'resolved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
    },
    admin_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    tableName: 'error_products',
    timestamps: true,
});

module.exports = ErrorProduct;
