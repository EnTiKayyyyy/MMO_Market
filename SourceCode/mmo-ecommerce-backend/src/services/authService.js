// src/services/authService.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); // Mặc dù đã hash ở model hook, nhưng cần import để compare
require('dotenv').config();

// Hàm tạo JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN, // Thời gian hết hạn từ .env
  });
};

// Đăng ký người dùng mới
const registerUser = async ({ username, email, password }) => {
  // Kiểm tra xem user đã tồn tại chưa
  const userExists = await User.findOne({ where: { email } });
  if (userExists) {
    throw new Error('Người dùng với email này đã tồn tại.'); // Ném lỗi để controller bắt
  }

  // Tạo user mới (password sẽ tự động băm qua hook beforeCreate)
  const user = await User.create({
    username,
    email,
    password_hash: password, // Gán vào password_hash để hook xử lý
    role: 'user', // Mặc định là user
  });

  if (user) {
    // Trả về thông tin user (không password_hash) và token
    return {
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
      },
      token: generateToken(user.user_id),
    };
  } else {
    throw new Error('Tạo người dùng thất bại.');
  }
};

// Đăng nhập người dùng
const loginUser = async ({ login, password }) => { // 'login' có thể là email hoặc username
  // Tìm user theo email hoặc username
  const user = await User.findOne({
      where: {
          // Sử dụng Sequelize.Op.or để tìm theo 1 trong 2 trường
          [require('sequelize').Op.or]: [
              { email: login },
              { username: login }
          ]
      }
  });

  // Kiểm tra user tồn tại và mật khẩu có khớp không
  if (user && (await user.comparePassword(password))) {
    // Cập nhật thời gian login cuối
    user.last_login_at = new Date();
    await user.save(); // Lưu cập nhật

    // Trả về thông tin user và token
    return {
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
      },
      token: generateToken(user.user_id),
    };
  } else {
    // Ném lỗi nếu email/username hoặc mật khẩu không đúng
    throw new Error('Email/Username hoặc mật khẩu không đúng.');
  }
};

// Lấy thông tin user theo ID (dùng trong Auth Middleware hoặc User Controller)
const findUserById = async (id) => {
    const user = await User.findByPk(id, {
        attributes: { exclude: ['password_hash'] } // Không lấy password_hash
    });
    return user;
};


module.exports = {
  registerUser,
  loginUser,
  findUserById, // Export để User Service hoặc Controller dùng lại
  generateToken, // Export nếu cần tạo token ở nơi khác
};