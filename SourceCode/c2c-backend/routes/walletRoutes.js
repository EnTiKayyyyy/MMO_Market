const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController'); // Tạo controller này
const { protect } = require('../middlewares/authMiddleware');
const { body } = require('express-validator'); // Dùng express-validator nếu cần

// @route   GET /api/wallet
// @desc    Lấy thông tin ví của người dùng hiện tại (buyer hoặc seller)
// @access  Private
router.get('/', protect, walletController.getMyWallet);

// @route   POST /api/wallet/deposit/create-vnpay-url
// @desc    Tạo URL thanh toán VNPay để nạp tiền
// @access  Private
router.post(
    '/deposit/create-vnpay-url',
    protect,
    [
        body('amount').isNumeric().withMessage('Số tiền phải là số').custom(val => val >= 10000).withMessage('Số tiền nạp tối thiểu là 10,000đ')
    ],
    walletController.createVnpayPaymentUrl
);

module.exports = router;