const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/authMiddleware');
const { validateProduct } = require('../middlewares/validationMiddleware');
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
    uploadProductImage.single('productImage'), // Thêm nếu PUT cũng cho phép cập nhật ảnh
    validateProduct,
    productController.updateProduct
);

// @route   DELETE /api/products/:id
// @desc    Xóa sản phẩm
// @access  Private (Owner or Admin)
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.put('/:id', protect, authorize('seller', 'admin'), uploadProductImage.single('productImage'), validateProduct, productController.updateProduct);
router.delete('/:id', protect, authorize('seller', 'admin'), productController.deleteProduct);
// BỎ DÒNG NÀY VÌ ĐÃ CÓ Ở TRÊN
// router.post('/', protect, authorize('seller', 'admin'), upload.single('productImage'), validateProduct, productController.createProduct);
    
module.exports = router;