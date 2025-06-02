const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Store = sequelize.define('Store', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: { // ID của người bán (User)
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true, // Đảm bảo mỗi user chỉ có một store
        references: {
            model: 'users', // Tên bảng users
            key: 'id'
        }
    },
    store_name: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    slug: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    banner_url: { // URL ảnh bìa của gian hàng
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    // Thêm các trường khác nếu cần: logo_url, contact_info, policy...
}, {
    tableName: 'stores',
    timestamps: true,
});

module.exports = Store;