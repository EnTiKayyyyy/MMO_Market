// src/middleware/asyncHandler.js

// Bắt lỗi từ các hàm async và chuyển nó đến middleware xử lý lỗi của Express
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
  
  module.exports = asyncHandler;