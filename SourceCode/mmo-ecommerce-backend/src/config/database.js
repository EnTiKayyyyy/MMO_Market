// src/config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config(); // Đọc biến môi trường từ .env

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql', // Chỉ định loại CSDL
    logging: process.env.NODE_ENV === 'development' ? console.log : false, // Log SQL queries trong dev mode
    define: {
      timestamps: true, // Sequelize tự động thêm createdAt và updatedAt
      underscored: true, // Sử dụng snake_case cho tên cột trong DB (created_at thay vì createdAt)
    },
  }
);

// Hàm kiểm tra kết nối
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    // Tùy chọn: Đồng bộ hóa model với database (tạo bảng nếu chưa có)
    // await sequelize.sync({ alter: true }); // Sử dụng { alter: true } cẩn thận trên production!
    // console.log('Database synced.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Thoát nếu kết nối thất bại
  }
};

module.exports = {
  sequelize,
  connectDB,
};