// src/routes/cartRoutes.js
const express = require('express');
const { getCart, addItem, updateItemQuantity, removeItem, clearMyCart } = require('../controllers/cartController'); // Import cart controllers
const protect = require('../middleware/authMiddleware'); // Import auth middleware

const router = express.Router();

// Áp dụng middleware 'protect' cho tất cả các route trong router này
router.use(protect);

// Routes chính cho giỏ hàng
router.route('/')
    .get(getCart) // GET /api/cart (Lấy giỏ hàng của user)
    .delete(clearMyCart); // DELETE /api/cart (Xóa toàn bộ giỏ hàng)

// Routes cho các mục trong giỏ hàng
router.route('/items')
    .post(addItem); // POST /api/cart/items (Thêm sản phẩm vào giỏ)

router.route('/items/:cartItemId')
    .put(updateItemQuantity) // PUT /api/cart/items/:cartItemId (Cập nhật số lượng)
    .delete(removeItem); // DELETE /api/cart/items/:cartItemId (Xóa mục)


module.exports = router;