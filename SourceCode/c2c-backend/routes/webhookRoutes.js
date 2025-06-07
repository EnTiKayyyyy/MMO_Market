const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// @route   POST /api/webhooks/vietqr-confirm
// @desc    Webhook để xác nhận giao dịch nạp tiền từ VietQR (Admin hoặc dịch vụ trung gian gọi)
// @access  Public (hoặc bảo vệ bằng API Key bí mật)
router.post('/vietqr-confirm', webhookController.confirmVietQRDeposit);

module.exports = router;