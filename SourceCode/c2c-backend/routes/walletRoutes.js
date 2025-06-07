const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController'); // Tạo controller này
const { protect } = require('../middlewares/authMiddleware');
const { body } = require('express-validator'); // Dùng express-validator nếu cần

// @route   GET /api/wallet
// @desc    Lấy thông tin ví của người dùng hiện tại (buyer hoặc seller)
// @access  Private
router.get('/', protect, walletController.getMyWallet);

// @route   POST /api/wallet/deposit
// @desc    Tạo yêu cầu nạp tiền và lấy URL thanh toán (ví dụ VNPay)
// @access  Private
router.post(
    '/deposit',
    protect,
    [
        body('amount').isNumeric().withMessage('Số tiền phải là số').custom(val => val >= 10000).withMessage('Số tiền nạp tối thiểu là 10,000đ')
    ],
    walletController.createDepositPaymentUrl
);


module.exports = router;