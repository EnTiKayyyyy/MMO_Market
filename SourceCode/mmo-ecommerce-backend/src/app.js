// src/app.js (hoặc server.js nếu bạn dùng 1 file chính)
const express = require('express');
const cors = require('cors'); // Import cors
const dotenv = require('dotenv'); // Import dotenv
const { connectDB, sequelize } = require('./config/database'); // Import connectDB
const authRoutes = require('./routes/authRoutes'); // Import auth routes
const userRoutes = require('./routes/userRoutes'); // Import user routes
const errorHandler = require('./middleware/errorHandler'); // Import global error handler (sẽ tạo)
const models = require('./models');
const productRoutes = require('./routes/productRoutes'); // Public Product routes
const sellerProductRoutes = require('./routes/sellerRoutes'); // Seller/Admin Product Template & Item routes
const adminProductRoutes = require('./routes/adminProductRoutes'); // Admin Product Template status & Item list routes
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes'); // Buyer Order routes
const adminOrderRoutes = require('./routes/adminOrderRoutes');
const adminStatsRoutes = require('./routes/adminStatsRoutes');

// Load env vars
dotenv.config();

// Kết nối CSDL
const initializeDatabase = async () => {
  await connectDB();
  if (process.env.NODE_ENV !== 'production') {
      // Chỉ đồng bộ hóa trong môi trường phát triển
      // Sử dụng { alter: true } để thêm/sửa cột, không xóa dữ liệu nếu an toàn
      // Sử dụng { force: true } sẽ DROP bảng và tạo lại (mất hết dữ liệu)
      // await sequelize.sync({ alter: true });
       console.log("Sequelize models synced (alter: true commented out). Run your SQL script manually or uncomment sync if needed for setup.");
  }
};
initializeDatabase();


const app = express();

// Middleware CORS
app.use(cors()); // Cho phép tất cả các nguồn (origin)

// Middleware để đọc JSON body
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // Để đọc form data nếu cần


// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes); // Public Category routes
app.use('/api/admin/categories', adminCategoryRoutes); // Admin Category routes (middleware bảo vệ đã ở trong adminCategoryRoutes.js)

app.use('/api/products', productRoutes); // Public Products (Templates)
app.use('/api/sellers/me', sellerRoutes); // Seller/Admin Products (Templates & Items) under /me
app.use('/api/admin', adminProductRoutes); // Admin Products (Templates status & Items list)
app.use('/api/cart', cartRoutes); 
app.use('/api/orders', orderRoutes); // Buyer Order routes dưới /api/orders
app.use('/api/admin', adminOrderRoutes); // Admin Order routes dưới /api/admin (có thể gộp adminProductRoutes và adminOrderRoutes thành 1 adminRoutes.js)
app.use('/api/admin', adminStatsRoutes);

// Các route khác sẽ thêm sau...


// Middleware xử lý lỗi global (đặt sau các routes)
// src/middleware/errorHandler.js (tạo file này)

const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Log lỗi stack trace trên console server

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Nếu status vẫn là 200, đặt là 500
  res.status(statusCode);

  res.json({
    message: err.message,
    // Chỉ trả về stack trace trong môi trường development
    stack: process.env.NODE_ENV === 'development' ? err.stack : null,
  });
};

app.use(errorHandler);


module.exports = app; // Export app instance