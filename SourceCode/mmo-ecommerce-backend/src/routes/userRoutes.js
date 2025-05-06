// src/routes/userRoutes.js
const express = require('express');
const { getUser, updateUserData, getAllUsersData, deleteUserData, updateUserProfile } = require('../controllers/userController');
const protect = require('../middleware/authMiddleware'); // Import auth middleware
const authorizeRoles = require('../middleware/roleMiddleware'); // Import role middleware

const router = express.Router();

// Route cho người dùng cập nhật profile của chính họ (cần đăng nhập)
router.route('/profile').put(protect, updateUserProfile); // PUT /api/users/profile


// Routes cho Admin
// Sử dụng middleware 'protect' và 'authorizeRoles('admin')' để bảo vệ
router.route('/')
    .get(protect, authorizeRoles('admin'), getAllUsersData); // GET /api/users (Admin)

router.route('/:userId')
    .get(protect, authorizeRoles('admin'), getUser) // GET /api/users/:userId (Admin) - Có thể cần xem xét public profile
    .put(protect, authorizeRoles('admin'), updateUserData) // PUT /api/users/:userId (Admin)
    .delete(protect, authorizeRoles('admin'), deleteUserData); // DELETE /api/users/:userId (Admin)


module.exports = router;