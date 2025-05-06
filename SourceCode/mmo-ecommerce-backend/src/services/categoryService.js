// src/services/categoryService.js
const Category = require('../models/Category');
const { Op } = require('sequelize'); // Import Op cho các toán tử tìm kiếm phức tạp

// Lấy tất cả danh mục (có thể bao gồm danh mục con)
const getAllCategories = async (options = {}) => {
  // options có thể chứa include: [{ model: Category, as: 'children' }]
  // hoặc các điều kiện where, order...
  const categories = await Category.findAll({
      where: options.where,
      order: [
          ['parent_category_id', 'ASC'], // Sắp xếp danh mục cha lên trước
          ['name', 'ASC'], // Sắp xếp theo tên
      ],
      include: options.include, // Bao gồm danh mục con nếu được yêu cầu
  });

  // Tùy chọn: Xây dựng cấu trúc cây danh mục nếu cần
  // const buildCategoryTree = (cats, parentId = null) => { ... }
  // return buildCategoryTree(categories);

  return categories; // Trả về danh sách phẳng
};

// Lấy chi tiết danh mục theo ID hoặc slug
const getCategoryByIdOrSlug = async (identifier) => {
  const category = await Category.findOne({
    where: {
      [Op.or]: [ // Tìm theo ID hoặc slug
        { category_id: identifier },
        { slug: identifier }
      ]
    },
    // Tùy chọn: Bao gồm danh mục con trực tiếp nếu cần
    // include: [{ model: Category, as: 'children' }]
  });

  if (!category) {
    // Ném lỗi nếu không tìm thấy
    const error = new Error('Danh mục không tồn tại.');
    error.statusCode = 404; // Gắn mã lỗi để controller xử lý
    throw error;
  }

  return category;
};

// (Admin) Tạo danh mục mới
const createCategory = async ({ name, slug, description, parent_category_id }) => {
  // slug sẽ được tạo tự động trong hook nếu không cung cấp
  const category = await Category.create({
    name,
    slug,
    description,
    parent_category_id,
  });
  return category;
};

// (Admin) Cập nhật danh mục
const updateCategory = async (categoryId, updateData) => {
  const category = await Category.findByPk(categoryId);

  if (!category) {
     const error = new Error('Danh mục không tồn tại.');
     error.statusCode = 404;
     throw error;
  }

  // Cập nhật các trường
  // Lưu ý: slug sẽ được tạo/chuẩn hóa qua hook nếu 'name' hoặc 'slug' thay đổi
  await category.update(updateData);

  return category;
};

// (Admin) Xóa danh mục
const deleteCategory = async (categoryId) => {
  const category = await Category.findByPk(categoryId);

  if (!category) {
      const error = new Error('Danh mục không tồn tại.');
      error.statusCode = 404;
      throw error;
  }

  // Sequelize sẽ dựa vào ràng buộc ON DELETE CASCADE trong DB để xóa danh mục con
  // Ràng buộc ON DELETE RESTRICT trên bảng Products sẽ ngăn xóa nếu còn sản phẩm thuộc danh mục này
  await category.destroy();

  return { message: 'Danh mục đã được xóa.' };
};

module.exports = {
  getAllCategories,
  getCategoryByIdOrSlug,
  createCategory,
  updateCategory,
  deleteCategory,
};