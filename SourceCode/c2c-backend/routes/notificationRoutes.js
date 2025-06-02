const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middlewares/authMiddleware'); // Chỉ cần đăng nhập

// @route   GET /api/notifications
// @desc    Lấy danh sách thông báo của người dùng hiện tại (phân trang)
// @access  Private
router.get('/', protect, notificationController.getMyNotifications);

// @route   GET /api/notifications/unread-count
// @desc    Lấy số lượng thông báo chưa đọc
// @access  Private
router.get('/unread-count', protect, notificationController.getUnreadCount);

// @route   PUT /api/notifications/:notificationId/read
// @desc    Đánh dấu một thông báo cụ thể là đã đọc
// @access  Private
router.put('/:notificationId/read', protect, notificationController.markNotificationAsRead);

// @route   PUT /api/notifications/mark-all-as-read
// @desc    Đánh dấu tất cả thông báo chưa đọc là đã đọc
// @access  Private
router.put('/mark-all-as-read', protect, notificationController.markAllNotificationsAsRead);

// @route   DELETE /api/notifications/:notificationId
// @desc    (Tùy chọn) Xóa một thông báo
// @access  Private
// router.delete('/:notificationId', protect, notificationController.deleteNotification);

module.exports = router;