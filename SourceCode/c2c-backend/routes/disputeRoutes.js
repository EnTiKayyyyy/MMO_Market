const express = require('express');
const router = express.Router();
const disputeController = require('../controllers/disputeController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validateDisputeCreation, validateDisputeResponse, validateDisputeResolution } = require('../middlewares/validationMiddleware');

// Mở khiếu nại
router.post('/order-item/:itemId', protect, authorize('buyer'), validateDisputeCreation, disputeController.openDispute);

// Lấy các khiếu nại của tôi (buyer/seller)
router.get('/my', protect, disputeController.getMyDisputes);

// Lấy chi tiết khiếu nại
router.get('/:disputeId', protect, disputeController.getDisputeById);

// Phản hồi khiếu nại (buyer/seller)
router.post('/:disputeId/respond', protect, validateDisputeResponse, disputeController.addDisputeResponse);

// === ADMIN ROUTES ===
// Admin lấy tất cả khiếu nại
router.get('/', protect, authorize('admin'), disputeController.getAllDisputesAdmin);

// Admin giải quyết khiếu nại
router.put('/:disputeId/resolve', protect, authorize('admin'), validateDisputeResolution, disputeController.resolveDisputeAdmin);

module.exports = router;