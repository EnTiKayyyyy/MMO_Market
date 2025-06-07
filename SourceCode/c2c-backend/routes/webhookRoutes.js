const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// @route   POST /api/webhooks/vietqr-confirm
// @desc    Webhook để xác nhận giao dịch nạp tiền từ VietQR (Admin hoặc dịch vụ trung gian gọi)
// @access  Public (hoặc bảo vệ bằng API Key bí mật)
router.post('/vietqr-confirm', webhookController.confirmVietQRDeposit);

// @route   GET /api/webhooks/vnpay-ipn
// @desc    Webhook để VNPay gửi kết quả giao dịch (IPN)
// @access  Public
router.get('/vnpay-ipn', webhookController.vnpayIpnHandler);

// @route   GET /api/webhooks/vnpay-return
// @desc    URL để VNPay chuyển hướng người dùng về sau khi thanh toán
// @access  Public
router.get('/vnpay-return', webhookController.vnpayReturnHandler);

module.exports = router;