// src/routes/adminStatsRoutes.js
const express = require('express');
const {
    getOverviewStats,
    getSalesStats,
    getUserStats,
    getProductStats,
} = require('../controllers/adminStatsController'); // Import admin stats controllers
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

// Áp dụng middleware bảo vệ cho tất cả các route trong router này
router.use(protect);
router.use(authorizeRoles('admin'));

// --- Admin Statistics Routes (/api/admin/stats) ---
router.route('/stats/overview')
    .get(getOverviewStats); // GET /api/admin/stats/overview

router.route('/stats/sales')
    .get(getSalesStats); // GET /api/admin/stats/sales

router.route('/stats/users')
    .get(getUserStats); // GET /api/admin/stats/users

router.route('/stats/products')
    .get(getProductStats); // GET /api/admin/stats/products


module.exports = router;