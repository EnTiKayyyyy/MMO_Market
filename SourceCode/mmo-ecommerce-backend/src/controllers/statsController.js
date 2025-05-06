// src/controllers/statsController.js
const asyncHandler = require('../middleware/asyncHandler');
const { getSellerSalesStats, getSellerStockStats } = require('../services/statsService');


// @desc    Lấy thống kê doanh số bán hàng cho người bán hiện tại
// @route   GET /api/sellers/me/stats/sales
// @access  Private (Seller/Admin)
const getMySalesStats = asyncHandler(async (req, res) => {
  const sellerId = req.user.user_id;
   const { startDate, endDate } = req.query; // Lấy khoảng thời gian từ query

  const stats = await getSellerSalesStats(sellerId, { startDate, endDate });

  res.status(200).json(stats);
});

// @desc    Lấy thống kê tồn kho cho người bán hiện tại
// @route   GET /api/sellers/me/stats/stock
// @access  Private (Seller/Admin)
const getMyStockStats = asyncHandler(async (req, res) => {
  const sellerId = req.user.user_id;

  const stats = await getSellerStockStats(sellerId);

  res.status(200).json(stats);
});


module.exports = {
  getMySalesStats,
  getMyStockStats,
};