// src/services/productItemService.js
const ProductItem = require('../models/ProductItem');
const Product = require('../models/Product'); // Cần import Product để kiểm tra seller_id
const SellerProfile = require('../models/SellerProfile'); // Import SellerProfile để include

const { Op } = require('sequelize'); // Import Op

// (Seller/Admin) Lấy các đơn vị sản phẩm của seller cho một loại sản phẩm cụ thể
const getSellerProductItems = async ({ sellerId, productId, status, page = 1, limit = 10, sort = 'created_at,desc' }) => {
    const offset = (page - 1) * limit;
    const order = [];
    if (sort) {
        const [field, direction] = sort.split(',');
         if (['status', 'created_at', 'sold_at'].includes(field)) {
             order.push([field, direction.toUpperCase()]);
        }
    }
     if (order.length === 0) {
         order.push(['created_at', 'DESC']);
     }


    const where = {
        seller_id: sellerId,
        product_id: productId,
    };
    if (status) where.status = status; // Cho phép lọc theo trạng thái

    const { count, rows } = await ProductItem.findAndCountAll({
        where: where,
        limit: limit,
        offset: offset,
        order: order,
        // Tùy chọn: include Product hoặc SellerProfile nếu cần
    });

    return {
        totalItems: count,
        productItems: rows,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
    };
};

// (Seller/Admin) Thêm nhiều đơn vị sản phẩm mới
const addProductItems = async ({ sellerId, productId, itemsData }) => {
    // Kiểm tra xem sản phẩm có tồn tại và thuộc về seller này không
    const product = await Product.findOne({ where: { product_id: productId, seller_id: sellerId } });
    if (!product) {
         const error = new Error('Loại sản phẩm không tồn tại hoặc không thuộc về bạn.');
         error.statusCode = 404;
         throw error;
    }

    // Chuẩn bị dữ liệu để bulk insert
    const itemsToCreate = itemsData.map(item => ({
        product_id: productId,
        seller_id: sellerId, // Gắn seller_id từ product
        data: item.data,
        status: 'available', // Mặc định là available khi thêm mới
        // created_at, updated_at, item_id sẽ tự động được tạo
    }));

    // Sử dụng bulkCreate để thêm nhiều record hiệu quả
    const createdItems = await ProductItem.bulkCreate(itemsToCreate);

    return createdItems;
};

// (Seller/Admin) Cập nhật trạng thái của một đơn vị sản phẩm cụ thể
const updateProductItemStatus = async (itemId, sellerId, status, isAdmin = false) => {
    const item = await ProductItem.findByPk(itemId);

    if (!item) {
        const error = new Error('Đơn vị sản phẩm không tồn tại.');
        error.statusCode = 404;
        throw error;
    }

    // Kiểm tra quyền sở hữu nếu không phải Admin
    if (!isAdmin && item.seller_id !== sellerId) {
        const error = new Error('Bạn không có quyền cập nhật đơn vị sản phẩm này.');
        error.statusCode = 403;
        throw error;
    }

    // TODO: Thêm validation cho giá trị status
    // Không cho phép chuyển status thành 'sold' hoặc 'pending' thủ công qua API này (logic bán hàng sẽ xử lý)
    if (status === 'sold' || status === 'pending') {
         const error = new Error(`Không thể cập nhật trạng thái thành '${status}' qua API này.`);
         error.statusCode = 400;
         throw error;
    }


    item.status = status;
    // Nếu chuyển sang 'disabled', có thể cần hủy liên kết với order_item_id nếu đang 'pending' (logic phức tạp hơn)

    await item.save();

    return item;
};

// (Seller/Admin) Xóa một đơn vị sản phẩm cụ thể
const deleteProductItem = async (itemId, sellerId, isAdmin = false) => {
    const item = await ProductItem.findByPk(itemId);

    if (!item) {
        const error = new Error('Đơn vị sản phẩm không tồn tại.');
        error.statusCode = 404;
        throw error;
    }

    // Kiểm tra quyền sở hữu nếu không phải Admin
    if (!isAdmin && item.seller_id !== sellerId) {
        const error = new Error('Bạn không có quyền xóa đơn vị sản phẩm này.');
        error.statusCode = 403;
        throw error;
    }

    // Không cho phép xóa nếu item đã được bán (status = 'sold' hoặc order_item_id IS NOT NULL)
    if (item.status === 'sold' || item.order_item_id !== null) {
         const error = new Error('Không thể xóa đơn vị sản phẩm đã được bán.');
         error.statusCode = 400;
         throw error;
    }


    await item.destroy();

    return { message: 'Đơn vị sản phẩm đã được xóa.' };
};


// (Admin) Lấy tất cả đơn vị sản phẩm trong hệ thống
const getAllProductItems = async ({ status, sellerId, productId, page = 1, limit = 10, sort = 'created_at,desc' }) => {
    const offset = (page - 1) * limit;
     const order = [];
    if (sort) {
        const [field, direction] = sort.split(',');
         if (['status', 'created_at', 'sold_at'].includes(field)) {
             order.push([field, direction.toUpperCase()]);
        }
    }
     if (order.length === 0) {
         order.push(['created_at', 'DESC']);
     }


    const where = {};
    if (status) where.status = status;
    if (sellerId) where.seller_id = sellerId;
    if (productId) where.product_id = productId;

    const { count, rows } = await ProductItem.findAndCountAll({
        where: where,
        include: [
            { model: Product, as: 'product', attributes: ['product_id', 'name', 'slug', 'base_price'] }, // Bao gồm thông tin Product template
             { model: SellerProfile, as: 'seller', attributes: ['user_id', 'store_name'] }, // Bao gồm thông tin SellerProfile
        ],
        limit: limit,
        offset: offset,
        order: order,
    });

    return {
        totalItems: count,
        productItems: rows,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
    };
};


module.exports = {
  getAllProducts, // Tái sử dụng từ productService cho public list
  getProductByIdOrSlug, // Tái sử dụng từ productService cho public detail
  getSellerProductItems,
  addProductItems,
  updateProductItemStatus,
  deleteProductItem,
  getAllProductItems, // Admin endpoint
  // createProduct, updateProduct, deleteProduct, updateProductStatus sẽ ở productService
};