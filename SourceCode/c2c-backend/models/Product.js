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
    product_data: { // Nội dung sản phẩm kỹ thuật số
        type: DataTypes.TEXT,
        allowNull: false,
        // Cân nhắc mã hóa dữ liệu này ở tầng ứng dụng trước khi lưu
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

// Định nghĩa quan hệ (Associations)
// Product.belongsTo(models.User, { foreignKey: 'seller_id', as: 'seller' });
// Product.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });

module.exports = Product;