// src/controllers/categoryController.js
const asyncHandler = require('../middleware/asyncHandler'); // Helper bắt lỗi async
const { getAllCategories, getCategoryByIdOrSlug } = require('../services/categoryService'); // Import service

// @desc    Lấy tất cả danh mục
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  // Có thể lấy query params để lọc, ví dụ: parent_id
  const parentId = req.query.parent_id || null; // Lấy danh mục gốc nếu không có parent_id

  const categories = await getAllCategories({
      where: { parent_category_id: parentId },
      // include: [{ model: Category, as: 'children' }] // Nếu muốn lấy danh mục con lồng nhau
  });

  res.status(200).json(categories);
});

// @desc    Lấy chi tiết danh mục theo ID hoặc Slug
// @route   GET /api/categories/:identifier
// @access  Public
const getCategory = asyncHandler(async (req, res) => {
  const identifier = req.params.identifier; // Có thể là ID hoặc slug

  const category = await getCategoryByIdOrSlug(identifier); // Service sẽ ném lỗi 404 nếu không tìm thấy

  res.status(200).json(category);
});

// Export các hàm để sử dụng trong routes
module.exports = {
  getCategories,
  getCategory,
};