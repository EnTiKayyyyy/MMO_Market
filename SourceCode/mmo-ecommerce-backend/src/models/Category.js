// src/models/Category.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const slugify = require('slugify'); // Cài đặt thư viện slugify: npm install slugify / yarn add slugify

const Category = sequelize.define('Category', {
  category_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  parent_category_id: {
    type: DataTypes.INTEGER, // Hoặc VARCHAR(36) nếu dùng UUID
    allowNull: true,
    references: { // Định nghĩa khóa ngoại
      model: 'Categories', // Tên bảng được tham chiếu
      key: 'category_id',
    }
  },
  // Sequelize tự động thêm created_at và updated_at
}, {
  tableName: 'Categories',
  timestamps: true,
  underscored: true,
});

// Định nghĩa mối quan hệ tự tham chiếu (cha-con)
Category.hasMany(Category, {
  as: 'children', // Alias cho các danh mục con
  foreignKey: 'parent_category_id',
});

Category.belongsTo(Category, {
  as: 'parent', // Alias cho danh mục cha
  foreignKey: 'parent_category_id',
});


// Hook để tự động tạo slug từ tên trước khi tạo hoặc cập nhật
Category.beforeValidate((category, options) => {
  // Nếu slug không được cung cấp hoặc rỗng, tạo slug từ name
  if (!category.slug) {
    category.slug = slugify(category.name, { lower: true, strict: true });
  } else {
     // Nếu slug được cung cấp, chuẩn hóa nó
     category.slug = slugify(category.slug, { lower: true, strict: true });
  }
});


module.exports = Category;