const express = require('express');
const router = express.Router();
const adminProductController = require('../controllers/adminProductController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validateProductStatusUpdate } = require('../middlewares/validationMiddleware'); // Sẽ tạo

router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/products
// @desc    Admin lấy danh sách tất cả sản phẩm (có phân trang, lọc theo status)
// @access  Private (Admin)
router.get('/', adminProductController.getAllProductsAdmin);

// @route   GET /api/admin/products/:productId
// @desc    Admin lấy chi tiết một sản phẩm (bao gồm product_data để duyệt)
// @access  Private (Admin)
router.get('/:productId', adminProductController.getProductByIdAdmin);

// @route   PUT /api/admin/products/:productId/status
// @desc    Admin cập nhật trạng thái sản phẩm (approve, reject, delist)
// @access  Private (Admin)
router.put('/:productId/status', validateProductStatusUpdate, adminProductController.updateProductStatusAdmin);

module.exports = router;