const express = require('express');
const router = express.Router();
const walletPayoutController = require('../controllers/walletPayoutController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validatePayoutRequest, validatePayoutProcess } = require('../middlewares/validationMiddleware'); // Sẽ tạo

// ==== SELLER ROUTES ====
// @route   GET /api/wallet/my
// @desc    Lấy thông tin ví của người bán hiện tại
// @access  Private (Seller)
router.get('/wallet/my', protect, authorize('seller'), walletPayoutController.getMyWallet);

// @route   POST /api/payouts/request
// @desc    Người bán tạo yêu cầu rút tiền mới
// @access  Private (Seller)
router.post('/payouts/request', protect, authorize('seller'), validatePayoutRequest, walletPayoutController.createPayoutRequest);

// @route   GET /api/payouts/my-requests
// @desc    Người bán xem lịch sử yêu cầu rút tiền của mình
// @access  Private (Seller)
router.get('/payouts/my-requests', protect, authorize('seller'), walletPayoutController.getMyPayoutRequests);

// ==== ADMIN ROUTES ====
// @route   GET /api/payouts
// @desc    Admin xem tất cả yêu cầu rút tiền
// @access  Private (Admin)
router.get('/payouts', protect, authorize('admin'), walletPayoutController.getAllPayoutRequestsAdmin);

// @route   GET /api/payouts/:requestId
// @desc    Admin xem chi tiết một yêu cầu rút tiền
// @access  Private (Admin)
router.get('/payouts/:requestId', protect, authorize('admin'), walletPayoutController.getPayoutRequestByIdAdmin);

// @route   PUT /api/payouts/:requestId/process
// @desc    Admin xử lý một yêu cầu rút tiền (approve/reject)
// @access  Private (Admin)
router.put('/payouts/:requestId/process', protect, authorize('admin'), validatePayoutProcess, walletPayoutController.processPayoutRequestAdmin);

module.exports = router;