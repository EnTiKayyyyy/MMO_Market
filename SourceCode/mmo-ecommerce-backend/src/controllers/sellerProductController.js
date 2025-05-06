// src/controllers/sellerProductController.js
const asyncHandler = require('../middleware/asyncHandler');
const { getSellerProducts, createProduct, updateProduct, deleteProduct } = require('../services/productService'); // Import từ productService
// authorizeRoles và protect middleware sẽ được áp dụng ở Route

// @desc    Lấy sản phẩm của người bán hiện tại
// @route   GET /api/sellers/me/products
// @access  Private (Seller/Admin)
const getMyProducts = asyncHandler(async (req, res) => {
    const sellerId = req.user.user_id; // Lấy ID seller từ user đã xác thực
    const params = req.query; // status, search, page, limit, sort

    const result = await getSellerProducts({ sellerId, ...params });

    res.status(200).json(result);
});


// @desc    Người bán/Admin tạo sản phẩm mới
// @route   POST /api/sellers/me/products
// @access  Private (Seller/Admin)
const createMyProduct = asyncHandler(async (req, res) => {
  const sellerId = req.user.user_id; // Lấy ID seller từ user đã xác thực
  const { name, slug, description, category_id, base_price, image_url } = req.body;

  // Basic validation
  if (!name || !category_id || !base_price) {
       res.status(400);
       throw new Error('Tên, danh mục và giá sản phẩm là bắt buộc.');
  }

  const product = await createProduct({
      sellerId,
      name,
      slug, // Có thể null
      description,
      categoryId: category_id,
      basePrice: base_price,
      imageUrl: image_url,
  });

  res.status(201).json(product);
});

// @desc    Người bán/Admin cập nhật sản phẩm
// @route   PUT /api/sellers/me/products/:productId
// @access  Private (Seller/Admin)
const updateMyProduct = asyncHandler(async (req, res) => {
  const productId = req.params.productId;
  const sellerId = req.user.user_id; // Lấy ID seller từ user đã xác thực
  const updateData = req.body;
  const isAdmin = req.user.role === 'admin';

  const updatedProduct = await updateProduct(productId, sellerId, updateData, isAdmin);

  res.status(200).json(updatedProduct);
});

// @desc    Người bán/Admin xóa sản phẩm
// @route   DELETE /api/sellers/me/products/:productId
// @access  Private (Seller/Admin)
const deleteMyProduct = asyncHandler(async (req, res) => {
  const productId = req.params.productId;
  const sellerId = req.user.user_id; // Lấy ID seller từ user đã xác thực
  const isAdmin = req.user.role === 'admin';

  const result = await deleteProduct(productId, sellerId, isAdmin);

  res.status(200).json(result);
});


module.exports = {
  getMyProducts,
  createMyProduct,
  updateMyProduct,
  deleteMyProduct,
};