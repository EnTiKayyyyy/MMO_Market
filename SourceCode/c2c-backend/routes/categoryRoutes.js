const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validateCategory } = require('../middlewares/validationMiddleware'); // Sẽ cập nhật/tạo

// @route   POST /api/categories
// @desc    Tạo danh mục mới
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), validateCategory, categoryController.createCategory);

// @route   GET /api/categories
// @desc    Lấy tất cả danh mục (dạng phẳng)
// @access  Public
router.get('/', categoryController.getAllCategories);

// @route   GET /api/categories/tree
// @desc    Lấy tất cả danh mục (dạng cây)
// @access  Public
router.get('/tree', categoryController.getCategoryTree);

// @route   GET /api/categories/:id
// @desc    Lấy chi tiết một danh mục
// @access  Public
router.get('/:id', categoryController.getCategoryById);

// @route   PUT /api/categories/:id
// @desc    Cập nhật danh mục
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), validateCategory, categoryController.updateCategory);

// @route   DELETE /api/categories/:id
// @desc    Xóa danh mục
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), categoryController.deleteCategory);

module.exports = router;