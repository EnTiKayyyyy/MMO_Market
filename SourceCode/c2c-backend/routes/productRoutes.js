const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validateProduct, validateProductUpdate } = require('../middlewares/validationMiddleware');
const { uploadProductImage } = require('../middlewares/uploadMiddleware'); // Đảm bảo middleware này đã được tạo và cấu hình đúng

// @route   POST /api/products
// @desc    Tạo sản phẩm mới (có upload ảnh)
router.post(
    '/',
    protect,
    authorize('seller', 'admin'),
    uploadProductImage.single('productImage'), // Sử dụng middleware upload
    validateProduct,
    productController.createProduct
);

// @route   GET /api/products/recommendations
// @desc    Lấy sản phẩm gợi ý cho người dùng đã đăng nhập
// @access  Private
router.get('/recommendations', protect, productController.getRecommendedProducts);

// @route   GET /api/products
// @desc    Lấy tất cả sản phẩm (có phân trang, lọc, sắp xếp)
// @access  Public
router.get('/', productController.getAllProducts);

// @route   GET /api/products/:id
// @desc    Lấy chi tiết một sản phẩm
// @access  Public
router.get('/:id', productController.getProductById);

// @route   PUT /api/products/:id
// @desc    Cập nhật sản phẩm
// @access  Private (Owner or Admin)
// Nếu cập nhật có cả ảnh, bạn cũng cần thêm upload.single('productImage') ở đây
router.put(
    '/:id',
    protect,
    authorize('seller', 'admin'),
    uploadProductImage.single('productImage'),
    validateProductUpdate,
    productController.updateProduct
);

router.delete('/:id', protect, authorize('seller', 'admin'), productController.deleteProduct);
    
module.exports = router;