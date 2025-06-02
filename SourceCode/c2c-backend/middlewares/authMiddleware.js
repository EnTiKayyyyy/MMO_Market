const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User'); // Đảm bảo đường dẫn đúng

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Không có quyền truy cập, token không tìm thấy.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id, { attributes: { exclude: ['password_hash'] }}); // Lấy thông tin user, loại bỏ password_hash
    if(!req.user) {
         return res.status(401).json({ message: 'Người dùng không tồn tại.' });
    }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ.' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Vai trò ${req.user ? req.user.role : 'guest'} không có quyền truy cập tài nguyên này.` });
    }
    next();
  };
};