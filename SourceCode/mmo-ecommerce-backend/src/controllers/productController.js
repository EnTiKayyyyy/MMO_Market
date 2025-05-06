// src/controllers/productController.js
const asyncHandler = require('../middleware/asyncHandler');
const { getAllProducts, getProductByIdOrSlug } = require('../services/productService'); // Import từ productService

// @desc    Lấy tất cả sản phẩm
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  // Lấy query params cho filtering, pagination, sorting
  const params = req.query; // category_id, seller_id, search, status, page, limit, sort

  const result = await getAllProducts(params);

  res.status(200).json(result);
});

// @desc    Lấy chi tiết sản phẩm theo ID hoặc Slug
// @route   GET /api/products/:identifier
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const identifier = req.params.identifier;

  const product = await getProductByIdOrSlug(identifier);

  res.status(200).json(product);
});

module.exports = {
  getProducts,
  getProduct,
};