// src/controllers/adminProductController.js
const asyncHandler = require('../middleware/asyncHandler');
const { updateProductStatus, getAllProducts } = require('../services/productService'); // Import từ productService
const { getAllProductItems } = require('../services/productItemService'); // Import từ productItemService
// authorizeRoles và protect middleware sẽ được áp dụng ở Route

// @desc    Admin cập nhật trạng thái sản phẩm (template)
// @route   PUT /api/admin/products/:productId/status
// @access  Private (Admin)
const updateProductStatusAdmin = asyncHandler(async (req, res) => {
  const productId = req.params.productId;
  const { status, reason } = req.body;

  if (!status) {
       res.status(400);
       throw new Error('Trạng thái sản phẩm là bắt buộc.');
  }
   // TODO: Thêm validation cho giá trị status

  const updatedProduct = await updateProductStatus(productId, status, reason);

  res.status(200).json(updatedProduct);
});

// @desc    Admin lấy tất cả đơn vị sản phẩm (ProductItems) trong hệ thống
// @route   GET /api/admin/items
// @access  Private (Admin)
const getAllProductItemsAdmin = asyncHandler(async (req, res) => {
    const params = req.query; // status, seller_id, product_id, page, limit, sort

    const result = await getAllProductItems(params);

    res.status(200).json(result);
});


// @desc    Admin lấy tất cả Product Templates (có thể bao gồm cả trạng thái draft, pending...)
// @route   GET /api/admin/products
// @access  Private (Admin)
const getAllProductsAdmin = asyncHandler(async (req, res) => {
     const params = req.query; // status, category_id, seller_id, search, page, limit, sort
     // Admin có thể xem tất cả trạng thái, không chỉ 'active'
    const result = await getAllProducts({...params, status: params.status || undefined }); // Bỏ qua filter status mặc định nếu admin cung cấp

    res.status(200).json(result);
});


module.exports = {
  updateProductStatusAdmin,
  getAllProductItemsAdmin,
  getAllProductsAdmin, // Export hàm lấy danh sách sản phẩm cho admin
};