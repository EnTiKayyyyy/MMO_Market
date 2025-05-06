// src/models/User.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt'); // Import bcrypt để hash password trước khi lưu

const User = sequelize.define('User', {
  user_id: { // Sequelize tự động đặt tên cột là user_id nếu dùng underscored: true
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true, // Sequelize validation
    },
  },
  password_hash: { // Sequelize sẽ map này tới cột password_hash do underscored: true
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user',
    // Có thể thêm validation để giới hạn giá trị, ví dụ:
    // validate: {
    //   isIn: [['user', 'seller', 'admin']],
    // }
  },
  is_active: { // Mapped to is_active
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  last_login_at: { // Mapped to last_login_at
    type: DataTypes.DATE, // Use DataTypes.DATE for TIMESTAMP
    allowNull: true,
  },
  // Sequelize tự động thêm createdAt (created_at) và updatedAt (updated_at)
}, {
  tableName: 'Users', // Tên bảng trong database
  timestamps: true, // Bật tự động quản lý created_at, updated_at
  underscored: true, // Sử dụng snake_case cho tên cột tự động
});

// Hook để băm mật khẩu trước khi lưu vào DB
User.beforeCreate(async (user) => {
  if (user.password_hash) { // Đảm bảo chỉ băm khi có password_hash được set
      const salt = await bcrypt.genSalt(10); // Tạo salt
      user.password_hash = await bcrypt.hash(user.password_hash, salt); // Băm mật khẩu
  }
});

// Hook để băm mật khẩu trước khi cập nhật (nếu password_hash bị thay đổi)
User.beforeUpdate(async (user) => {
  if (user.changed('password_hash') && user.password_hash) { // Chỉ băm nếu password_hash thay đổi
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(user.password_hash, salt);
  }
});


// Phương thức instance để so sánh mật khẩu
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password_hash);
};

module.exports = User;