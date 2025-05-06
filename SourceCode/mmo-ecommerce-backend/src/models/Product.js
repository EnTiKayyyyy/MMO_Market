// src/models/Product.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const slugify = require('slugify'); // Đã cài đặt ở bước trước
const SellerProfile = require('./SellerProfile'); // Import để định nghĩa association
const Category = require('./Category'); // Import để định nghĩa association

const Product = sequelize.define('Product', {
  product_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  seller_id: {
    type: DataTypes.INTEGER, // Hoặc VARCHAR(36)
    allowNull: false,
    references: {
      model: 'SellerProfiles',
      key: 'user_id', // Khóa chính của SellerProfiles là user_id
    }
  },
  category_id: {
    type: DataTypes.INTEGER, // Hoặc VARCHAR(36)
    allowNull: false,
    references: {
      model: 'Categories',
      key: 'category_id',
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    // UNIQUE KEY uk_product_seller_slug (seller_id, slug) sẽ được định nghĩa ở association hoặc index
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  base_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
        min: 0.01 // Giá phải lớn hơn 0
    }
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'draft', // 'draft', 'pending_approval', 'active', 'rejected', 'archived'
    // validate: { isIn: [['draft', 'pending_approval', 'active', 'rejected', 'archived']] }
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  // Sequelize tự động thêm created_at và updated_at
}, {
  tableName: 'Products',
  timestamps: true,
  underscored: true,
  indexes: [
      { // Định nghĩa unique key cho seller_id và slug
          unique: true,
          fields: ['seller_id', 'slug']
      },
      { // Index cho seller_id và status để truy vấn nhanh các sản phẩm của seller theo trạng thái
          fields: ['seller_id', 'status']
      },
       { // Index cho category_id và status để lọc sản phẩm theo danh mục
          fields: ['category_id', 'status']
      }
  ]
});

// Hook để tự động tạo slug từ name nếu không cung cấp hoặc chuẩn hóa slug
Product.beforeValidate((product, options) => {
  if (!product.slug) {
    product.slug = slugify(product.name, { lower: true, strict: true });
  } else {
     product.slug = slugify(product.slug, { lower: true, strict: true });
  }
});

// Định nghĩa associations sau khi các models liên quan được định nghĩa
// Product.belongsTo(SellerProfile, { foreignKey: 'seller_id' });
// Product.belongsTo(Category, { foreignKey: 'category_id' });
// Product.hasMany(ProductItem, { as: 'items', foreignKey: 'product_id' });


module.exports = Product;