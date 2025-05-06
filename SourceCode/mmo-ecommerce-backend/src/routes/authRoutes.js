// src/routes/authRoutes.js
const express = require('express');
const { register, login, getMe, logout } = require('../controllers/authController'); // Import controllers
const protect = require('../middleware/authMiddleware'); // Import auth middleware

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe); // Endpoint cần bảo vệ, sử dụng middleware 'protect'
router.post('/logout', protect, logout); // Logout cũng cần token hợp lệ

module.exports = router;