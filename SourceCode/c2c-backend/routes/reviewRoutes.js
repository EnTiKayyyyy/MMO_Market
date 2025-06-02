const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validateReview } = require('../middlewares/validationMiddleware'); // Sẽ tạo

// @route   POST /api/reviews/order-item/:itemId
// @desc    Tạo đánh giá mới cho một mục đơn hàng đã mua và xác nhận
// @access  Private (Buyer)
router.post('/order-item/:itemId', protect, authorize('buyer'), validateReview, reviewController.createReview);

// @route   GET /api/reviews/product/:productId
// @desc    Lấy tất cả đánh giá cho một sản phẩm
// @access  Public
router.get('/product/:productId', reviewController.getProductReviews);

// @route   GET /api/reviews/seller/:sellerId
// @desc    Lấy tất cả đánh giá cho các sản phẩm của một người bán
// @access  Public
router.get('/seller/:sellerId', reviewController.getSellerReviews);

// @route   PUT /api/reviews/:reviewId
// @desc    Cập nhật đánh giá của chính mình
// @access  Private (Buyer - owner)
router.put('/:reviewId', protect, authorize('buyer'), validateReview, reviewController.updateReview);

// @route   DELETE /api/reviews/:reviewId
// @desc    Xóa đánh giá (chủ sở hữu hoặc Admin)
// @access  Private (Buyer - owner, or Admin)
router.delete('/:reviewId', protect, reviewController.deleteReview); // authorize logic in controller

// ==== ADMIN ROUTES ====
// @route   GET /api/reviews
// @desc    Admin lấy tất cả đánh giá (để kiểm duyệt)
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), reviewController.getAllReviewsAdmin);

module.exports = router;