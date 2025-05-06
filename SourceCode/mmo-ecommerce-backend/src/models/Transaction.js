// src/models/Transaction.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
// const Order = require('./Order'); // Import để định nghĩa association

const Transaction = sequelize.define('Transaction', {
  transaction_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.INTEGER, // Hoặc VARCHAR(36)
    allowNull: false,
    unique: true, // Mỗi order 1 transaction chính
    references: {
      model: 'Orders',
      key: 'order_id',
    }
  },
  payment_gateway: {
    type: DataTypes.STRING,
    allowNull: false, // Ví dụ: 'vnpay', 'momo', 'stripe'
  },
  gateway_transaction_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // ID giao dịch từ cổng thanh toán là duy nhất
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    }
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false, // Ví dụ: 'VND', 'USD'
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false, // 'pending', 'successful', 'failed', 'refunded'
    defaultValue: 'pending',
     // validate: { isIn: [['pending', 'successful', 'failed', 'refunded']] }
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true, // Thời gian giao dịch hoàn tất
  },
  raw_gateway_response: { // Lưu response thô từ cổng thanh toán để debug
    type: DataTypes.JSON, // Hoặc DataTypes.TEXT
    allowNull: true,
  },
  // Sequelize tự động thêm created_at và updated_at
}, {
  tableName: 'Transactions',
  timestamps: true,
  underscored: true,
  indexes: [
      { fields: ['order_id'], unique: true }, // Index và Unique cho FK
      { fields: ['gateway_transaction_id'], unique: true }, // Index và Unique
      { fields: ['status'] },
  ]
});

// Định nghĩa associations sau
// Transaction.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

module.exports = Transaction;