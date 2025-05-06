// src/routes/adminOrderRoutes.js
const express = require('express');
const { getAdminOrdersList, getAdminOrderDetailItem, updateOrderStatusAdmin, fulfillOrderItemAdmin } = require('../controllers/adminOrderController'); // Import admin order controllers
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

// Áp dụng middleware bảo vệ cho tất cả các route trong router này
router.use(protect);
router.use(authorizeRoles('admin'));

// --- Admin quản lý Orders ---
router.route('/orders')
    .get(getAdminOrdersList); // GET /api/admin/orders (Admin lấy tất cả đơn hàng)

router.route('/orders/:orderId')
    .get(getAdminOrderDetailItem); // GET /api/admin/orders/:orderId (Admin lấy chi tiết đơn hàng bất kỳ)

router.route('/orders/:orderId/status')
    .put(updateOrderStatusAdmin); // PUT /api/admin/orders/:orderId/status (Admin cập nhật trạng thái đơn hàng)

// --- Admin fulfill Order Item (có thể dùng endpoint riêng hoặc chung với seller) ---
// Dùng chung endpoint với seller nhưng check quyền Admin trong controller/service
// Hoặc tạo endpoint riêng cho admin nếu logic khác biệt
// VD: endpoint riêng cho admin fulfill
router.route('/orders/:orderId/items/:orderItemId/fulfill')
     .put(fulfillOrderItemAdmin); // PUT /api/admin/orders/:orderId/items/:orderItemId/fulfill (Admin fulfill item)


module.exports = router;