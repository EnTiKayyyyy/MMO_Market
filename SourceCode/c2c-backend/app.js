// app.js
const express = require('express');
const cors = require('cors');
// Chỉ cần import db từ models, nó đã chứa sequelize instance và các models
const db = require('./models'); // Đảm bảo models/index.js export db đúng cách
require('dotenv').config();
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const storeRoutes = require('./routes/storeRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const disputeRoutes = require('./routes/disputeRoutes');
const messageRoutes = require('./routes/messageRoutes');
const walletPayoutRoutes = require('./routes/walletPayoutRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const adminProductRoutes = require('./routes/adminProductRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const walletRoutes = require('./routes/walletRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Middlewares
app.use(cors()); // Cho phép Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies - RẤT QUAN TRỌNG, PHẢI TRƯỚC ROUTES
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// API Routes
app.get('/', (req, res) => res.send('API đang chạy...'));
app.use('/api/auth', authRoutes); // authRoutes được mount ở đây
app.use('/api/products', productRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/disputes', disputeRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/wallet-payouts', walletPayoutRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/products', adminProductRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Handling Middleware (đơn giản)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Đã có lỗi xảy ra!');
});

// Đồng bộ CSDL và khởi chạy server
const PORT = process.env.PORT || 3000;

// Sử dụng db.sequelize từ models/index.js
db.sequelize.authenticate()
  .then(() => {
    console.log('Kết nối CSDL thành công.');
    // Chỉ sync khi cần thiết trong môi trường dev, và cẩn thận với "force: true"
    // return db.sequelize.sync({ force: false }); // Ví dụ: force: false
    // })
    // .then(() => {
    //   console.log('Đồng bộ CSDL (nếu có sync).');
    app.listen(PORT, () => console.log(`Server đang chạy trên port ${PORT}`));
  })
  .catch(err => {
    console.error('Không thể kết nối hoặc đồng bộ CSDL:', err)
    // process.exit(1); // Thoát nếu không kết nối được CSDL
});

module.exports = app;