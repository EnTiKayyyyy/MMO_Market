const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect, authorize } = require('../middlewares/authMiddleware');

// Route cho Admin Dashboard
// GET /api/dashboard/admin
router.get('/admin', protect, authorize('admin'), dashboardController.getAdminDashboardStats);

// Route cho Seller Dashboard
// GET /api/dashboard/seller
router.get('/seller', protect, authorize('seller'), dashboardController.getSellerDashboardStats);

module.exports = router;
