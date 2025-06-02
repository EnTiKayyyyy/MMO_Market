const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { protect } = require('../middlewares/authMiddleware'); // Chỉ cần protect, không cần authorize cụ thể role
const { validateSendMessage } = require('../middlewares/validationMiddleware'); // Sẽ tạo

// @route   POST /api/messages
// @desc    Gửi tin nhắn mới
// @access  Private (Authenticated users)
router.post('/', protect, validateSendMessage, messageController.sendMessage);

// @route   GET /api/messages/conversations
// @desc    Lấy danh sách các cuộc trò chuyện (partners) và tin nhắn mới nhất
// @access  Private (Authenticated users)
router.get('/conversations', protect, messageController.getConversations);

// @route   GET /api/messages/conversation/:partnerId
// @desc    Lấy lịch sử tin nhắn với một người dùng cụ thể
// @access  Private (Authenticated users)
router.get('/conversation/:partnerId', protect, messageController.getMessagesWithPartner);

// @route   PUT /api/messages/conversation/:partnerId/read
// @desc    Đánh dấu các tin nhắn từ một partner là đã đọc
// @access  Private (Authenticated users)
router.put('/conversation/:partnerId/read', protect, messageController.markConversationAsRead);

module.exports = router;