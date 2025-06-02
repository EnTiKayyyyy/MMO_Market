const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validateStore } = require('../middlewares/validationMiddleware'); // Sẽ tạo/cập nhật
const upload = require('../middlewares/uploadMiddleware'); // Middleware xử lý upload file

// @route   POST /api/stores
// @desc    Tạo gian hàng mới (chỉ seller)
// @access  Private (Seller)
router.post(
    '/',
    protect,
    authorize('seller'),
    upload.single('storeBanner'), // 'storeBanner' là tên field cho file ảnh bìa
    validateStore,
    storeController.createStore
);

// @route   GET /api/stores/my
// @desc    Lấy thông tin gian hàng của seller hiện tại
// @access  Private (Seller)
router.get('/my', protect, authorize('seller'), storeController.getMyStore);

// @route   PUT /api/stores/my
// @desc    Cập nhật gian hàng của seller hiện tại
// @access  Private (Seller)
router.put(
    '/my',
    protect,
    authorize('seller'),
    upload.single('storeBanner'),
    validateStore, // Có thể cần validation riêng cho update
    storeController.updateMyStore
);

// @route   GET /api/stores/slug/:slug
// @desc    Lấy thông tin gian hàng theo slug
// @access  Public
router.get('/slug/:slug', storeController.getStoreBySlug);

// @route   GET /api/stores/seller/:sellerId
// @desc    Lấy thông tin gian hàng theo ID của người bán
// @access  Public
router.get('/seller/:sellerId', storeController.getStoreBySellerId);

module.exports = router;