const express = require('express');
const router = express.Router();
const walletPayoutController = require('../controllers/walletPayoutController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validatePayoutRequest, validatePayoutProcess } = require('../middlewares/validationMiddleware');

// ==== SELLER ROUTES ====
router.post('/request', protect, authorize('seller'), validatePayoutRequest, walletPayoutController.createPayoutRequest);
router.get('/my-requests', protect, authorize('seller'), walletPayoutController.getMyPayoutRequests);

// ==== ADMIN ROUTES (ĐÃ SỬA) ====

// @route   GET /api/wallet-payouts
// @desc    Admin xem tất cả yêu cầu rút tiền
router.get('/', protect, authorize('admin'), walletPayoutController.getAllPayoutRequestsAdmin);

// @route   GET /api/wallet-payouts/:requestId
// @desc    Admin xem chi tiết một yêu cầu rút tiền
router.get('/:requestId', protect, authorize('admin'), walletPayoutController.getPayoutRequestByIdAdmin);

// @route   PUT /api/wallet-payouts/:requestId/process
// @desc    Admin xử lý một yêu cầu rút tiền (approve/reject)
router.put('/:requestId/process', protect, authorize('admin'), validatePayoutProcess, walletPayoutController.processPayoutRequestAdmin);

module.exports = router;
