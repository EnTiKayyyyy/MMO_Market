// src/models/Cart.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User'); // Import để định nghĩa association

const Cart = sequelize.define('Cart', {
  cart_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER, // Hoặc VARCHAR(36)
    allowNull: false,
    unique: true, // Mỗi user chỉ có một giỏ hàng
    references: {
      model: 'Users',
      key: 'user_id',
    }
  },
  // Sequelize tự động thêm created_at và updated_at
}, {
  tableName: 'Cart',
  timestamps: true,
  underscored: true,
});

// Định nghĩa associations sau khi các models liên quan được định nghĩa
// Cart.belongsTo(User, { foreignKey: 'user_id' });
// Cart.hasMany(CartItem, { as: 'items', foreignKey: 'cart_id', onDelete: 'CASCADE' }); // Xóa giỏ hàng sẽ xóa các mục trong giỏ


module.exports = Cart;