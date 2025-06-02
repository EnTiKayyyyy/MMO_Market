const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  // SỬ DỤNG password_hash THAY VÌ password dạng chữ
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  full_name: {
    type: DataTypes.STRING(100),
  },
  avatar_url: {
    type: DataTypes.STRING(255),
  },
  phone_number: {
    type: DataTypes.STRING(20),
  },
  role: {
    type: DataTypes.ENUM('buyer', 'seller', 'admin'),
    allowNull: false,
    defaultValue: 'buyer',
  },
  status: {
    type: DataTypes.ENUM('pending_verification', 'active', 'suspended'),
    allowNull: false,
    defaultValue: 'active',
  }
}, {
  tableName: 'users',
  timestamps: true, // Sử dụng created_at và updated_at mặc định của Sequelize
  hooks: {
    beforeCreate: async (user) => {
      if (user.password_hash) { // Đổi password thành password_hash nếu cần
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
      }
    },
    beforeUpdate: async (user) => {
       if (user.changed('password_hash') && user.password_hash) {
        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(user.password_hash, salt);
      }
    }
  }
});

User.prototype.isValidPassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

module.exports = User;