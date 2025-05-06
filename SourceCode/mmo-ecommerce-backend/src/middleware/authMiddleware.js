// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import User model để tìm user
require('dotenv').config();

const protect = async (req, res, next) => {
  let token;

  // 1. Kiểm tra token trong header Authorization (Bearer Token)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1]; // Lấy token từ chuỗi "Bearer TOKEN"

      // 2. Xác thực token
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token với secret key

      // 3. Tìm user dựa trên ID trong token payload
      // Lấy user nhưng không lấy password_hash
      req.user = await User.findByPk(decoded.id, {
          attributes: { exclude: ['password_hash'] }
      });

      if (!req.user) {
          return res.status(401).json({ message: 'Người dùng không tồn tại.' }); // User không tìm thấy
      }

      // 4. Chuyển quyền cho middleware/controller tiếp theo
      next();

    } catch (error) {
      console.error('Auth Middleware Error:', error.message);
      // Lỗi xác thực token (ví dụ: sai secret, hết hạn)
      res.status(401).json({ message: 'Không được ủy quyền, token lỗi hoặc hết hạn.' });
    }
  }

  // Nếu không có token
  if (!token) {
    res.status(401).json({ message: 'Không được ủy quyền, không có token.' });
  }
};

module.exports = protect;