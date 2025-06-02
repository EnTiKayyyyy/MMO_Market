const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    order_item_id: { // Đánh giá này cho mục đơn hàng nào
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        unique: true, // Mỗi order_item chỉ có 1 review
        references: {
            model: 'order_items',
            key: 'id'
        }
    },
    reviewer_id: { // ID của người mua (user)
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    seller_id: { // ID của người bán sản phẩm này (user)
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    product_id: { // ID của sản phẩm được đánh giá
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    rating: { // Điểm đánh giá: 1-5 sao
        type: DataTypes.TINYINT,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true,
    }
}, {
    tableName: 'reviews',
    timestamps: true,
});

module.exports = Review;