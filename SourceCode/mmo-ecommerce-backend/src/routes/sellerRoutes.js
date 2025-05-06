// src/routes/sellerProductRoutes.js
const express = require('express');
const { getMyProducts, createMyProduct, updateMyProduct, deleteMyProduct } = require('../controllers/sellerProductController'); // Import seller product controllers
const { getMyProductItems, addMyProductItems, updateMyProductItemStatus, deleteMyProductItem } = require('../controllers/sellerProductItemController'); // Import seller product item controllers
const { getSellerOrdersList, getSellerOrderDetailItem, fulfillOrderItemSeller } = require('../controllers/sellerOrderController');
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const router = express.Router();

// Áp dụng middleware bảo vệ cho tất cả các route trong router này
router.use(protect);
// Các route dưới '/me' yêu cầu role 'seller' hoặc 'admin'
router.use(authorizeRoles('seller', 'admin'));

// --- Routes cho Product Templates (/api/sellers/me/products) ---
router.route('/products')
    .get(getMyProducts) // GET /api/sellers/me/products (Lấy sản phẩm của seller)
    .post(createMyProduct); // POST /api/sellers/me/products (Tạo sản phẩm mới)

router.route('/products/:productId')
    .put(updateMyProduct) // PUT /api/sellers/me/products/:productId (Cập nhật sản phẩm)
    .delete(deleteMyProduct); // DELETE /api/sellers/me/products/:productId (Xóa sản phẩm)

// --- Routes cho Product Items (/api/sellers/me/products/:productId/items và /api/sellers/me/items/:itemId) ---

// Lấy các đơn vị sản phẩm cho một loại sản phẩm cụ thể
router.route('/products/:productId/items')
    .get(getMyProductItems) // GET /api/sellers/me/products/:productId/items
    .post(addMyProductItems); // POST /api/sellers/me/products/:productId/items (Thêm item)

// Cập nhật/Xóa một đơn vị sản phẩm cụ thể
router.route('/items/:itemId/status') // Dùng /items/:itemId để rõ ràng hơn
    .put(updateMyProductItemStatus); // PUT /api/sellers/me/items/:itemId/status (Cập nhật trạng thái item)

router.route('/items/:itemId') // Endpoint riêng cho delete item
     .delete(deleteMyProductItem); // DELETE /api/sellers/me/items/:itemId

// --- Routes cho Orders (/api/sellers/me/orders) ---
router.route('/orders')
    .get(getSellerOrdersList);

router.route('/orders/:orderId')
    .get(getSellerOrderDetailItem);

// --- Routes cho Order Items Fulfill ---
router.route('/orders/:orderId/items/:orderItemId/fulfill')
     .put(fulfillOrderItemSeller);

// --- Routes cho Statistics (/api/sellers/me/stats) (MỚI) ---
router.route('/stats/sales')
    .get(getMySalesStats); // GET /api/sellers/me/stats/sales

router.route('/stats/stock')
    .get(getMyStockStats); // GET /api/sellers/me/stats/stock
    
module.exports = router;