const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validateOrderCreation } = require('../middlewares/validationMiddleware'); // Sẽ cập nhật

// @route   POST /api/orders
// @desc    Tạo đơn hàng mới (Checkout)
// @access  Private (Buyer)
router.post('/', protect, authorize('buyer'), validateOrderCreation, orderController.createOrder);

// @route   GET /api/orders/my
// @desc    Lấy danh sách đơn hàng của người mua hiện tại
// @access  Private (Buyer)
router.get('/my', protect, authorize('buyer'), orderController.getMyOrders);

// @route   GET /api/orders/seller
// @desc    Lấy danh sách đơn hàng liên quan đến sản phẩm của người bán hiện tại
// @access  Private (Seller)
router.get('/seller', protect, authorize('seller'), orderController.getSellerOrders);

// @route   GET /api/orders/:orderId
// @desc    Lấy chi tiết một đơn hàng
// @access  Private (Buyer (owner), Seller (related), Admin)
router.get('/:orderId', protect, orderController.getOrderById);

// @route   PUT /api/orders/:orderId/pay
// @desc    (Mô phỏng) Đánh dấu đơn hàng đã thanh toán - Thực tế sẽ là webhook từ cổng thanh toán
// @access  Private (Buyer or Admin for testing)
router.put('/:orderId/pay', protect, orderController.markOrderAsPaid); // Cần cân nhắc quyền kỹ hơn

// @route   PUT /api/orders/items/:itemId/deliver
// @desc    Người bán đánh dấu một item trong đơn hàng là đã giao (cung cấp product_data)
// @access  Private (Seller (owner of product in item))
router.put('/items/:itemId/deliver', protect, authorize('seller'), orderController.markItemAsDelivered);

// @route   PUT /api/orders/items/:itemId/confirm
// @desc    Người mua xác nhận đã nhận hàng và hài lòng (kích hoạt escrow release)
// @access  Private (Buyer (owner of order))
router.put('/items/:itemId/confirm', protect, authorize('buyer'), orderController.confirmItemReceipt);

// @route   PUT /api/orders/:orderId/cancel
// @desc    Hủy đơn hàng
// @access  Private (Buyer (owner, if applicable), Admin)
router.put('/:orderId/cancel', protect, orderController.cancelOrder);

// ==== ADMIN ROUTES ====
// @route   GET /api/orders
// @desc    Admin lấy tất cả đơn hàng
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), orderController.getAllOrdersAdmin);

// @route   PUT /api/orders/:orderId/status
// @desc    Admin cập nhật trạng thái đơn hàng
// @access  Private (Admin)
router.put('/:orderId/status', protect, authorize('admin'), orderController.updateOrderStatusAdmin);

router.put('/:id/status', protect, authorize('admin'), orderController.updateOrderStatusAdmin);

router.get(
    '/items/:itemId/product-data', 
    protect, 
    authorize('buyer', 'admin'), // Cho phép cả admin xem để hỗ trợ
    orderController.getOrderItemProductDataForBuyer
);
module.exports = router;