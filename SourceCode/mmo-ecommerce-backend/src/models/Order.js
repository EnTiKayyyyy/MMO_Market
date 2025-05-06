// src/models/Order.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User'); // Import để định nghĩa association
// const OrderItem = require('./OrderItem'); // Import để định nghĩa association
// const Transaction = require('./Transaction'); // Import để định nghĩa association
// const UserAddress = require('./UserAddress'); // Đã bỏ bảng này

const Order = sequelize.define('Order', {
  order_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER, // Hoặc VARCHAR(36)
    allowNull: false,
    references: {
      model: 'Users',
      key: 'user_id',
    }
  },
  total_amount: { // Tổng giá trị đơn hàng (trước khi áp dụng giảm giá/phí thanh toán nếu có)
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0, // Có thể là 0 nếu có code giảm giá 100%
    }
  },
   final_amount_paid: { // Số tiền thực tế user thanh toán (sau giảm giá, phí)
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true, // Null cho đến khi thanh toán thành công
    validate: {
      min: 0,
    }
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending_payment', // 'pending_payment', 'processing', 'completed', 'cancelled', 'failed'
    // validate: { isIn: [['pending_payment', 'processing', 'completed', 'cancelled', 'failed']] }
  },
  payment_status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending', // 'pending', 'paid', 'failed', 'refunded'
    // validate: { isIn: [['pending', 'paid', 'failed', 'refunded']] }
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: true, // Null cho đến khi user chọn phương thức thanh toán
  },
   transaction_id: {
    type: DataTypes.INTEGER, // Hoặc VARCHAR(36)
    allowNull: true,
    unique: true, // Đảm bảo mỗi order có 1 transaction chính
    // references: {
    //   model: 'Transactions',
    //   key: 'transaction_id',
    // }
  },
  // billing_address_id đã bị xóa
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  // Sequelize tự động thêm created_at và updated_at
}, {
  tableName: 'Orders',
  timestamps: true,
  underscored: true,
  indexes: [
      { fields: ['user_id', 'status'] },
      { fields: ['status'] },
      { fields: ['payment_status'] },
  ]
});

// Định nghĩa associations sau
// Order.belongsTo(User, { foreignKey: 'user_id', as: 'buyer' });
// Order.hasMany(OrderItem, { as: 'items', foreignKey: 'order_id', onDelete: 'CASCADE' });
// Order.hasOne(Transaction, { as: 'transaction', foreignKey: 'order_id', onDelete: 'SET NULL' }); // Xóa order, set null cho transaction_id trong Transactions

module.exports = Order;