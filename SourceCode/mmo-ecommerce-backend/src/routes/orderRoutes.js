// src/routes/orderRoutes.js
const express = require('express');
const {
    createOrder,
    getMyOrders,
    getMyOrderDetail,
    cancelMyOrder,
    getMyPurchasedItemData,
} = require('../controllers/orderController'); // Import buyer controllers
const protect = require('../middleware/authMiddleware'); // Import auth middleware

const router = express.Router();

// Áp dụng middleware 'protect' cho tất cả các route trong router này
router.use(protect);

// --- Routes Buyer Order ---
router.route('/')
    .post(createOrder) // POST /api/orders (Tạo đơn hàng từ giỏ hàng)
    .get(getMyOrders); // GET /api/orders (Lấy danh sách đơn hàng của user)

router.route('/:orderId')
    .get(getMyOrderDetail); // GET /api/orders/:orderId (Xem chi tiết đơn hàng của user)

router.route('/:orderId/cancel')
    .put(cancelMyOrder); // PUT /api/orders/:orderId/cancel (User hủy đơn hàng)

router.route('/:orderId/items/:orderItemId/data')
    .get(getMyPurchasedItemData); // GET /api/orders/:orderId/items/:orderItemId/data (Lấy dữ liệu sản phẩm đã mua)


module.exports = router;