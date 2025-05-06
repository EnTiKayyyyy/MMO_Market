// src/services/productService.js
const Product = require('../models/Product');
const SellerProfile = require('../models/SellerProfile');
const Category = require('../models/Category');
const { Op } = require('sequelize');

// Lấy tất cả sản phẩm (public)
const getAllProducts = async ({ categoryId, sellerId, search, status = 'active', page = 1, limit = 10, sort = 'created_at,desc' }) => {
    const offset = (page - 1) * limit;
    const order = [];
    if (sort) {
        const [field, direction] = sort.split(',');
         // Chỉ cho phép sắp xếp theo các trường an toàn
        if (['name', 'base_price', 'created_at', 'updated_at'].includes(field)) {
             order.push([field, direction.toUpperCase()]);
        }
    }
     // Thêm sắp xếp mặc định nếu không có sort hợp lệ
     if (order.length === 0) {
         order.push(['created_at', 'DESC']);
     }


    const where = { status: status }; // Mặc định chỉ lấy sản phẩm active cho public
    if (categoryId) where.category_id = categoryId;
    if (sellerId) where.seller_id = sellerId;
    if (search) {
        where.name = { [Op.like]: `%${search}%` }; // Tìm kiếm theo tên (case-insensitive tùy CSDL collation)
    }


    const { count, rows } = await Product.findAndCountAll({
        where: where,
        include: [
            { model: SellerProfile, as: 'seller', attributes: ['user_id', 'store_name'] }, // Lấy thông tin seller
            { model: Category, as: 'category', attributes: ['category_id', 'name', 'slug'] } // Lấy thông tin category
        ],
        limit: limit,
        offset: offset,
        order: order,
    });

    return {
        totalItems: count,
        products: rows,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
    };
};

// Lấy chi tiết sản phẩm theo ID hoặc Slug (public)
const getProductByIdOrSlug = async (identifier) => {
    const where = { status: 'active' }; // Chỉ lấy sản phẩm active

    if (isNaN(identifier)) { // Nếu không phải số, tìm theo slug
        where.slug = identifier;
    } else { // Nếu là số, tìm theo ID
        where.product_id = identifier;
    }

    const product = await Product.findOne({
        where: where,
        include: [
            { model: SellerProfile, as: 'seller', attributes: ['user_id', 'store_name', 'description'] },
            { model: Category, as: 'category', attributes: ['category_id', 'name', 'slug'] }
        ],
    });

    if (!product) {
        const error = new Error('Sản phẩm không tồn tại hoặc chưa được duyệt.');
        error.statusCode = 404;
        throw error;
    }

    return product;
};

// (Seller/Admin) Lấy sản phẩm của một seller (có thể bao gồm cả trạng thái draft, pending...)
const getSellerProducts = async ({ sellerId, status, search, page = 1, limit = 10, sort = 'created_at,desc' }) => {
    const offset = (page - 1) * limit;
    const order = [];
     if (sort) {
        const [field, direction] = sort.split(',');
         if (['name', 'base_price', 'created_at', 'updated_at', 'status'].includes(field)) {
             order.push([field, direction.toUpperCase()]);
        }
    }
     if (order.length === 0) {
         order.push(['created_at', 'DESC']);
     }

    const where = { seller_id: sellerId };
    if (status) where.status = status; // Cho phép lọc theo trạng thái
    if (search) {
        where.name = { [Op.like]: `%${search}%` };
    }

    const { count, rows } = await Product.findAndCountAll({
        where: where,
         include: [
            { model: Category, as: 'category', attributes: ['category_id', 'name', 'slug'] }
         ],
        limit: limit,
        offset: offset,
        order: order,
    });

    return {
        totalItems: count,
        products: rows,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
    };
};


// (Seller/Admin) Tạo sản phẩm mới
const createProduct = async ({ sellerId, name, slug, description, categoryId, basePrice, imageUrl }) => {
     // Slug sẽ được tạo/chuẩn hóa tự động qua hook
    const product = await Product.create({
        seller_id: sellerId,
        name,
        slug, // Nếu slug rỗng, hook sẽ tạo từ name
        description,
        category_id: categoryId,
        base_price: basePrice,
        image_url: imageUrl,
        status: 'pending_approval', // Mặc định cần admin duyệt (tùy quy trình)
    });
    return product;
};

// (Seller/Admin) Cập nhật sản phẩm
const updateProduct = async (productId, sellerId, updateData, isAdmin = false) => {
    const product = await Product.findByPk(productId);

    if (!product) {
        const error = new Error('Sản phẩm không tồn tại.');
        error.statusCode = 404;
        throw error;
    }

    // Kiểm tra quyền sở hữu nếu không phải Admin
    if (!isAdmin && product.seller_id !== sellerId) {
         const error = new Error('Bạn không có quyền cập nhật sản phẩm này.');
         error.statusCode = 403; // Forbidden
         throw error;
    }

     // Chỉ cho phép cập nhật các trường nhất định (whitelist)
     const allowedUpdates = ['name', 'slug', 'description', 'category_id', 'base_price', 'image_url'];
     const adminAllowedUpdates = [...allowedUpdates, 'status']; // Admin có thể cập nhật trạng thái

     const finalUpdateData = {};
     Object.keys(updateData).forEach(key => {
         if ((isAdmin && adminAllowedUpdates.includes(key)) || (!isAdmin && allowedUpdates.includes(key))) {
             finalUpdateData[key] = updateData[key];
         }
     });

    // Nếu seller cập nhật, status có thể reset về pending_approval nếu có thay đổi lớn (tùy quy trình)
    // Hiện tại, chỉ admin mới có thể đổi status

    await product.update(finalUpdateData);

    return product;
};

// (Seller/Admin) Xóa sản phẩm
const deleteProduct = async (productId, sellerId, isAdmin = false) => {
    const product = await Product.findByPk(productId);

    if (!product) {
        const error = new Error('Sản phẩm không tồn tại.');
        error.statusCode = 404;
        throw error;
    }

    // Kiểm tra quyền sở hữu nếu không phải Admin
    if (!isAdmin && product.seller_id !== sellerId) {
        const error = new Error('Bạn không có quyền xóa sản phẩm này.');
        error.statusCode = 403;
        throw error;
    }

    // TODO: Trước khi xóa, cần kiểm tra xem có ProductItem nào thuộc sản phẩm này đã được bán không
    // Ràng buộc ON DELETE RESTRICT trong DB trên bảng ProductItems sẽ giúp ngăn xóa nếu còn item
    // Bạn có thể bắt lỗi từ DB hoặc kiểm tra trước ở đây.

    await product.destroy();

    return { message: 'Sản phẩm đã được xóa.' };
};

// (Admin) Cập nhật trạng thái sản phẩm
const updateProductStatus = async (productId, status, reason = null) => {
    const product = await Product.findByPk(productId);

    if (!product) {
        const error = new Error('Sản phẩm không tồn tại.');
        error.statusCode = 404;
        throw error;
    }

    // TODO: Thêm validation cho giá trị status

    product.status = status;
    // Tùy chọn: Lưu lý do nếu status là 'rejected'
    // if (status === 'rejected' && reason) { product.rejection_reason = reason; }

    await product.save();

    return product;
};


module.exports = {
  getAllProducts,
  getProductByIdOrSlug,
  getSellerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus,
};