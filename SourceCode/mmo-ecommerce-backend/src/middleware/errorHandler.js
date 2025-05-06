// src/middleware/errorHandler.js

const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log lỗi trên server console
  
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Nếu status vẫn là 200, đặt là 500
    res.status(statusCode);
  
    // Trả về lỗi JSON
    res.json({
      message: err.message,
      // Chỉ trả về stack trace trong môi trường development
      stack: process.env.NODE_ENV === 'development' ? err.stack : null,
    });
  };
  
  module.exports = errorHandler;