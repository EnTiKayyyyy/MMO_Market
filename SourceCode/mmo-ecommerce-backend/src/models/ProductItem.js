// src/models/ProductItem.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Product = require('./Product'); // Import để định nghĩa association
const SellerProfile = require('./SellerProfile'); // Import để định nghĩa association
// const OrderItem = require('./OrderItem'); // Import để định nghĩa association khi tạo OrderItem model

const ProductItem = sequelize.define('ProductItem', {
  item_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  product_id: {
    type: DataTypes.INTEGER, // Hoặc VARCHAR(36)
    allowNull: false,
    references: {
      model: 'Products',
      key: 'product_id',
    }
  },
  seller_id: { // Lưu lại seller_id ở đây để join nhanh hơn
    type: DataTypes.INTEGER, // Hoặc VARCHAR(36)
    allowNull: false,
    references: {
      model: 'SellerProfiles',
      key: 'user_id',
    }
  },
  data: {
    type: DataTypes.JSON, // Hoặc DataTypes.TEXT
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'available', // 'available', 'pending', 'sold', 'disabled'
    // validate: { isIn: [['available', 'pending', 'sold', 'disabled']] }
  },
  sold_at: {
    type: DataTypes.DATE, // Hoặc DataTypes.TIMESTAMP
    allowNull: true,
  },
  order_item_id: {
    type: DataTypes.INTEGER, // Hoặc VARCHAR(36)
    allowNull: true,
    unique: true, // Đảm bảo 1 item chỉ thuộc 1 OrderItem
    // references: {
    //   model: 'OrderItems', // Tên bảng OrderItems
    //   key: 'order_item_id',
    // }
  },
  // Sequelize tự động thêm created_at và updated_at
}, {
  tableName: 'ProductItems',
  timestamps: true,
  underscored: true,
  indexes: [
      { fields: ['product_id', 'status'] }, // Tìm item theo loại và trạng thái
      { fields: ['seller_id', 'status'] }, // Tìm item của seller theo trạng thái
      { fields: ['order_item_id'] }, // Tìm item theo OrderItem (index cho FK)
  ]
});

// Định nghĩa associations sau khi các models liên quan được định nghĩa
// ProductItem.belongsTo(Product, { foreignKey: 'product_id' });
// ProductItem.belongsTo(SellerProfile, { foreignKey: 'seller_id' });
// ProductItem.belongsTo(OrderItem, { foreignKey: 'order_item_id' }); // Khi OrderItem model tồn tại


module.exports = ProductItem;