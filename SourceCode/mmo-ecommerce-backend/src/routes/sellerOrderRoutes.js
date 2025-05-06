// src/routes/sellerRoutes.js (File này bao gồm cả logic Product và Order cho seller)
const express = require('express');
// Import Product controllers cho seller
const { getMyProducts, createMyProduct, updateMyProduct, deleteMyProduct } = require('../controllers/sellerProductController');
// Import Product Item controllers cho seller
const { getMyProductItems, addMyProductItems, updateMyProductItemStatus, deleteMyProductItem } = require('../controllers/sellerProductItemController');
// Import Order controllers cho seller (MỚI)
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
    .get(getMyProducts)
    .post(createMyProduct);

router.route('/products/:productId')
    .put(updateMyProduct)
    .delete(deleteMyProduct);

// --- Routes cho Product Items (/api/sellers/me/products/:productId/items và /api/sellers/me/items/:itemId) ---
router.route('/products/:productId/items')
    .get(getMyProductItems)
    .post(addMyProductItems);

router.route('/items/:itemId/status')
    .put(updateMyProductItemStatus);

router.route('/items/:itemId')
     .delete(deleteMyProductItem);

// --- Routes cho Orders (/api/sellers/me/orders) (MỚI) ---
router.route('/orders')
    .get(getSellerOrdersList); // GET /api/sellers/me/orders (Danh sách đơn hàng của seller)

router.route('/orders/:orderId')
    .get(getSellerOrderDetailItem); // GET /api/sellers/me/orders/:orderId (Chi tiết đơn hàng của seller)

// --- Routes cho Order Items Fulfill (/api/sellers/me/orders/:orderId/items/:orderItemId/fulfill) (MỚI) ---
router.route('/orders/:orderId/items/:orderItemId/fulfill')
     .put(fulfillOrderItemSeller); // PUT /api/sellers/me/orders/:orderId/items/:orderItemId/fulfill (Seller fulfill item)


module.exports = router;