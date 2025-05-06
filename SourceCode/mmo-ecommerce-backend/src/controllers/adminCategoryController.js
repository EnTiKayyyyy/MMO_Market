// src/controllers/adminCategoryController.js
const asyncHandler = require('../middleware/asyncHandler');
const { createCategory, updateCategory, deleteCategory } = require('../services/categoryService'); // Import service

// @desc    Tạo danh mục mới
// @route   POST /api/admin/categories
// @access  Private (Admin)
const createCategoryAdmin = asyncHandler(async (req, res) => {
  const { name, slug, description, parent_category_id } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Tên danh mục là bắt buộc.');
  }

  const category = await createCategory({ name, slug, description, parent_category_id });

  res.status(201).json(category);
});

// @desc    Cập nhật danh mục
// @route   PUT /api/admin/categories/:categoryId
// @access  Private (Admin)
const updateCategoryAdmin = asyncHandler(async (req, res) => {
  const categoryId = req.params.categoryId;
  const updateData = req.body;

  // Không cho phép cập nhật category_id hoặc parent_category_id một cách tùy tiện qua đây nếu không có logic đặc biệt
  // Nên chỉ cho phép cập nhật name, slug, description

  const updatedCategory = await updateCategory(categoryId, updateData);

  res.status(200).json(updatedCategory);
});

// @desc    Xóa danh mục
// @route   DELETE /api/admin/categories/:categoryId
// @access  Private (Admin)
const deleteCategoryAdmin = asyncHandler(async (req, res) => {
  const categoryId = req.params.categoryId;

  const result = await deleteCategory(categoryId); // Service sẽ xử lý lỗi 404 và ràng buộc DB

  res.status(200).json(result); // Trả về thông báo xóa thành công
});


// Export các hàm để sử dụng trong routes
module.exports = {
  createCategoryAdmin,
  updateCategoryAdmin,
  deleteCategoryAdmin,
};