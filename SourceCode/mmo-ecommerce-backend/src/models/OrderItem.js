// src/models/OrderItem.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Order = require('./Order'); // Import để định nghĩa association
const Product = require('./Product'); // Import để định nghĩa association
const SellerProfile = require('./SellerProfile'); // Import để định nghĩa association
const ProductItem = require('./ProductItem'); // Import để định nghĩa association

const OrderItem = sequelize.define('OrderItem', {
  order_item_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  order_id: {
    type: DataTypes.INTEGER, // Hoặc VARCHAR(36)
    allowNull: false,
    references: {
      model: 'Orders',
      key: 'order_id',
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
  seller_id: {
    type: DataTypes.INTEGER, // Hoặc VARCHAR(36)
    allowNull: false,
    references: {
      model: 'SellerProfiles',
      key: 'user_id',
    }
  },
   product_item_id: {
    type: DataTypes.INTEGER, // Hoặc VARCHAR(36)
    allowNull: false, // Mỗi OrderItem phải liên kết với 1 ProductItem cụ thể
    unique: true, // Đảm bảo 1 ProductItem chỉ thuộc về 1 OrderItem
    references: {
      model: 'ProductItems',
      key: 'item_id',
    }
  },
  price_at_purchase: { // Giá của đơn vị tại thời điểm đặt hàng
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    }
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending', // 'pending', 'fulfilled', 'cancelled', 'refunded'
     // validate: { isIn: [['pending', 'fulfilled', 'cancelled', 'refunded']] }
  },
  fulfilled_at: { // Thời gian giao data cho khách
    type: DataTypes.DATE,
    allowNull: true,
  },
  fulfillment_data: { // Dữ liệu thực tế đã giao cho khách (account info, proxy list...)
    type: DataTypes.JSON, // Hoặc DataTypes.TEXT
    allowNull: true, // Null cho đến khi fulfill
  },
  // Sequelize tự động thêm created_at và updated_at
}, {
  tableName: 'OrderItems',
  timestamps: true,
  underscored: true,
  indexes: [
      { fields: ['order_id'] },
      { fields: ['seller_id', 'status'] }, // Tìm item của seller theo trạng thái
      { fields: ['product_item_id'], unique: true }, // Index và Unique cho FK
  ]
});

// Định nghĩa associations sau
// OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
// OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
// OrderItem.belongsTo(SellerProfile, { foreignKey: 'seller_id', as: 'seller' });
// OrderItem.belongsTo(ProductItem, { foreignKey: 'product_item_id', as: 'productItem' }); // Mối quan hệ 1-1 với ProductItem đã bán


module.exports = OrderItem;