const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    seller_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    category_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
    // THÊM MỚI: Cột để lưu đường dẫn ảnh đại diện
    thumbnail_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    product_data: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Nội dung sản phẩm, cần được mã hóa',
    },
    status: {
        type: DataTypes.ENUM('pending_approval', 'available', 'sold', 'delisted'),
        allowNull: false,
        defaultValue: 'pending_approval',
    }
}, {
    tableName: 'products',
    timestamps: true,
});

module.exports = Product;
