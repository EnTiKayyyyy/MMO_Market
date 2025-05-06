// src/models/CartItem.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Cart = require('./Cart'); // Import để định nghĩa association
const Product = require('./Product'); // Import để định nghĩa association

const CartItem = sequelize.define('CartItem', {
  cart_item_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  cart_id: {
    type: DataTypes.INTEGER, // Hoặc VARCHAR(36)
    allowNull: false,
    references: {
      model: 'Cart',
      key: 'cart_id',
    }
  },
  product_id: {
    type: DataTypes.INTEGER, // Hoặc VARCHAR(36)
    allowNull: false,
    references: {
      model: 'Products',
      key: 'product_id',
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1, // Số lượng tối thiểu là 1
    }
  },
  // Sequelize tự động thêm created_at và updated_at
}, {
  tableName: 'CartItems',
  timestamps: true,
  underscored: true,
  indexes: [
      { // Đảm bảo mỗi sản phẩm chỉ xuất hiện một lần trong cùng một giỏ hàng
          unique: true,
          fields: ['cart_id', 'product_id']
      },
       { fields: ['cart_id'] }, // Index cho cart_id để truy vấn item theo giỏ hàng
  ]
});

// Định nghĩa associations sau khi các models liên quan được định nghĩa
// CartItem.belongsTo(Cart, { foreignKey: 'cart_id' });
// CartItem.belongsTo(Product, { foreignKey: 'product_id' });


module.exports = CartItem;