// src/controllers/adminStatsController.js
const asyncHandler = require('../middleware/asyncHandler');
const {
    getAdminOverviewStats,
    getAdminSalesStats,
    getAdminUserStats,
    getAdminProductStats,
} = require('../services/statsService');


// @desc    Admin lấy thống kê tổng quan hệ thống
// @route   GET /api/admin/stats/overview
// @access  Private (Admin)
const getOverviewStats = asyncHandler(async (req, res) => {
  const stats = await getAdminOverviewStats();
  res.status(200).json(stats);
});

// @desc    Admin lấy thống kê doanh số theo thời gian
// @route   GET /api/admin/stats/sales
// @access  Private (Admin)
const getSalesStats = asyncHandler(async (req, res) => {
  const { period, startDate, endDate } = req.query;
  const stats = await getAdminSalesStats({ period, startDate, endDate });
  res.status(200).json(stats);
});

// @desc    Admin lấy thống kê người dùng
// @route   GET /api/admin/stats/users
// @access  Private (Admin)
const getUserStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const stats = await getAdminUserStats({ startDate, endDate });
  res.status(200).json(stats);
});

// @desc    Admin lấy thống kê sản phẩm
// @route   GET /api/admin/stats/products
// @access  Private (Admin)
const getProductStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const stats = await getAdminProductStats({ startDate, endDate });
  res.status(200).json(stats);
});


module.exports = {
    getOverviewStats,
    getSalesStats,
    getUserStats,
    getProductStats,
};