const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validateUserUpdateAdmin } = require('../middlewares/validationMiddleware'); // Sẽ tạo

// Tất cả các route dưới đây đều yêu cầu quyền admin
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/admin/users
// @desc    Admin lấy danh sách tất cả người dùng (có phân trang, lọc)
// @access  Private (Admin)
router.get('/', adminUserController.getAllUsersAdmin);

// @route   GET /api/admin/users/:userId
// @desc    Admin lấy chi tiết một người dùng
// @access  Private (Admin)
router.get('/:userId', adminUserController.getUserByIdAdmin);

// @route   PUT /api/admin/users/:userId
// @desc    Admin cập nhật thông tin người dùng (role, status, etc.)
// @access  Private (Admin)
router.put('/:userId', validateUserUpdateAdmin, adminUserController.updateUserAdmin);

// @route   DELETE /api/admin/users/:userId
// @desc    Admin xóa người dùng (cân nhắc soft delete/suspend)
// @access  Private (Admin)
router.delete('/:userId', adminUserController.deleteUserAdmin);

module.exports = router;