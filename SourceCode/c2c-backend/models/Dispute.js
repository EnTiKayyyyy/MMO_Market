const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Dispute = sequelize.define('Dispute', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    order_item_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'order_items', key: 'id' }
    },
    complainant_id: { // Buyer ID
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'users', key: 'id' }
    },
    defendant_id: { // Seller ID - Cột này là nguyên nhân gây lỗi
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: 'users', key: 'id' }
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    seller_response: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    buyer_rebuttal: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('open', 'seller_responded', 'buyer_rebutted', 'under_admin_review', 'resolved_refund_buyer', 'resolved_favor_seller', 'closed_without_action'),
        allowNull: false,
        defaultValue: 'open',
    },
    resolution_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    admin_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: 'users', key: 'id' }
    }
}, {
    tableName: 'disputes',
    timestamps: true, // Sequelize sẽ tự quản lý createdAt và updatedAt
});

module.exports = Dispute;
