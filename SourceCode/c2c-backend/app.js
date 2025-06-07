// app.js
const express = require('express');
const http = require('http'); // Import module http
const { Server } = require("socket.io"); // Import Server từ socket.io
const cors = require('cors');
// Chỉ cần import db từ models, nó đã chứa sequelize instance và các models
const db = require('./models'); // Đảm bảo models/index.js export db đúng cách
require('dotenv').config();
const path = require('path');
const jwt = require('jsonwebtoken');

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
const webhookRoutes = require('./routes/webhookRoutes');
const errorRoutes = require('./routes/errorRoutes');


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // URL của frontend
        methods: ["GET", "POST"]
    }
});

// Gán io vào mỗi request để các controller có thể sử dụng
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Middlewares
app.use(cors()); // Cho phép Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies - RẤT QUAN TRỌNG, PHẢI TRƯỚC ROUTES
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.get('/', (req, res) => res.send('API đang chạy...'));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
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
app.use('/api/webhooks', webhookRoutes);
app.use('/api/errors', errorRoutes);

// Error Handling Middleware (đơn giản)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Đã có lỗi xảy ra!');
});

io.on('connection', (socket) => {
    console.log(`Một người dùng đã kết nối: ${socket.id}`);

    // Tham gia một "phòng" riêng tư dựa trên ID người dùng
    socket.on('joinRoom', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`User ${userId} đã tham gia phòng user_${userId}`);
    });

    // CẢI TIẾN: Lắng nghe sự kiện gửi tin nhắn riêng tư từ client
    socket.on('privateMessage', async (data) => {
        const { sender_id, receiver_id, content } = data;
        
        try {
            // 1. Lưu tin nhắn vào cơ sở dữ liệu
            const newMessage = await db.Message.create({
                sender_id,
                receiver_id,
                content
            });

            // 2. Lấy thông tin chi tiết của tin nhắn vừa tạo để gửi đi
            const messageDetail = await db.Message.findByPk(newMessage.id, {
                include: [
                    { model: db.User, as: 'sender', attributes: ['id', 'username', 'avatar_url', 'full_name'] },
                ]
            });

            // 3. Gửi tin nhắn real-time đến cả người gửi và người nhận
            io.to(`user_${receiver_id}`).to(`user_${sender_id}`).emit('newMessage', messageDetail);

        } catch (error) {
            console.error("Lỗi khi xử lý tin nhắn private:", error);
            // Gửi một event lỗi về cho người gửi
            socket.emit('messageError', { message: "Không thể gửi tin nhắn." });
        }
    });

    socket.on('disconnect', () => {
        console.log(`Người dùng đã ngắt kết nối: ${socket.id}`);
    });
});

// Đồng bộ CSDL và khởi chạy server
const PORT = process.env.PORT || 3000;

// Sử dụng server.listen thay vì app.listen để Socket.IO hoạt động
db.sequelize.authenticate()
  .then(() => {
    console.log('Kết nối CSDL thành công.');
    server.listen(PORT, () => console.log(`Server đang chạy trên port ${PORT}`));
  })
  .catch(err => {
    console.error('Không thể kết nối hoặc đồng bộ CSDL:', err);
});

module.exports = { app, server };
