// src/middleware/roleMiddleware.js

// Middleware factory: Trả về một middleware dựa trên các roles được phép
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
      // req.user được gán từ authMiddleware
      if (!req.user || !req.user.role) {
        return res.status(500).json({ message: 'Lỗi hệ thống: Thông tin người dùng không có sẵn.' });
      }
  
      // Kiểm tra xem role của user có nằm trong danh sách allowedRoles không
      const hasPermission = allowedRoles.includes(req.user.role);
  
      if (!hasPermission) {
        // Nếu không có quyền, trả về lỗi 403 Forbidden
        return res.status(403).json({ message: 'Bạn không có quyền truy cập tài nguyên này.' });
      }
  
      // Nếu có quyền, chuyển quyền cho middleware/controller tiếp theo
      next();
    };
  };
  
  module.exports = authorizeRoles;