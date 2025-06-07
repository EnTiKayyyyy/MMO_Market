const express = require('express');
const router = express.Router();
const errorController = require('../controllers/errorController');
const { protect, authorize } = require('../middlewares/authMiddleware');

/**
 * @route   POST /api/errors/report/order-item/:itemId
 * @desc    Người mua báo lỗi một mục trong đơn hàng
 * @access  Private (Chỉ dành cho người mua)
 */
router.post(
    '/report/order-item/:itemId', 
    protect, 
    authorize('buyer'), 
    errorController.reportError
);

/**
 * @route   GET /api/errors
 * @desc    Admin xem danh sách các báo lỗi
 * @access  Private (Chỉ dành cho Admin)
 */
router.get(
    '/', 
    protect, 
    authorize('admin'), 
    errorController.getErrors
);

// Thêm các route khác để admin xử lý (ví dụ: cập nhật trạng thái báo lỗi)
// router.put('/:errorId/status', protect, authorize('admin'), errorController.updateErrorStatus);

module.exports = router;
