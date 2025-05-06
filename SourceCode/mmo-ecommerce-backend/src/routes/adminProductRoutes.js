// src/routes/adminProductRoutes.js
const express = require('express');
const { updateProductStatusAdmin, getAllProductItemsAdmin, getAllProductsAdmin } = require('../controllers/adminProductController'); // Import admin controllers
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

// Áp dụng middleware bảo vệ cho tất cả các route trong router này
router.use(protect);
router.use(authorizeRoles('admin'));

// --- Admin quản lý Product Templates ---
router.route('/products')
    .get(getAllProductsAdmin); // GET /api/admin/products (Admin lấy tất cả sản phẩm)

router.route('/products/:productId/status')
    .put(updateProductStatusAdmin); // PUT /api/admin/products/:productId/status (Admin duyệt/từ chối)

// --- Admin quản lý Product Items ---
router.route('/items')
    .get(getAllProductItemsAdmin); // GET /api/admin/items (Admin lấy tất cả các ProductItems)

// Admin có thể cần endpoint để xem/sửa/xóa từng ProductItem bất kỳ,
// nhưng có thể dùng lại service và chỉ cần thêm controller/route nếu cần thiết.
// Ví dụ: router.route('/items/:itemId').get(...).put(...).delete(...)

module.exports = router;