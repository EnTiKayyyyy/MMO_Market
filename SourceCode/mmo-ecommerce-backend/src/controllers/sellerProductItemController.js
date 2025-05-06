// src/controllers/sellerProductItemController.js
const asyncHandler = require('../middleware/asyncHandler');
const { getSellerProductItems, addProductItems, updateProductItemStatus, deleteProductItem } = require('../services/productItemService');
// authorizeRoles và protect middleware sẽ được áp dụng ở Route

// @desc    Lấy các đơn vị sản phẩm của seller cho một loại sản phẩm cụ thể
// @route   GET /api/sellers/me/products/:productId/items
// @access  Private (Seller/Admin)
const getMyProductItems = asyncHandler(async (req, res) => {
    const sellerId = req.user.user_id;
    const productId = req.params.productId; // Lấy ID loại sản phẩm từ URL
    const params = req.query; // status, page, limit, sort

    const result = await getSellerProductItems({ sellerId, productId, ...params });

    res.status(200).json(result);
});


// @desc    Người bán/Admin thêm nhiều đơn vị sản phẩm mới
// @route   POST /api/sellers/me/products/:productId/items
// @access  Private (Seller/Admin)
const addMyProductItems = asyncHandler(async (req, res) => {
    const sellerId = req.user.user_id;
    const productId = req.params.productId; // Loại sản phẩm sẽ thêm item vào
    const itemsData = req.body; // Mảng các object { data: {...} }

    if (!Array.isArray(itemsData) || itemsData.length === 0) {
        res.status(400);
        throw new Error('Dữ liệu thêm mới phải là một mảng không rỗng.');
    }
     // Có thể thêm validation chi tiết hơn cho cấu trúc của từng item.data

    const createdItems = await addProductItems({ sellerId, productId, itemsData });

    res.status(201).json(createdItems);
});

// @desc    Người bán/Admin cập nhật trạng thái của một đơn vị sản phẩm cụ thể
// @route   PUT /api/sellers/me/items/:itemId/status
// @access  Private (Seller/Admin)
const updateMyProductItemStatus = asyncHandler(async (req, res) => {
    const itemId = req.params.itemId;
    const sellerId = req.user.user_id;
    const { status } = req.body; // Trạng thái mới
     const isAdmin = req.user.role === 'admin';

     if (!status) {
         res.status(400);
         throw new Error('Trạng thái mới là bắt buộc.');
     }

    const updatedItem = await updateProductItemStatus(itemId, sellerId, status, isAdmin);

    res.status(200).json(updatedItem);
});

// @desc    Người bán/Admin xóa một đơn vị sản phẩm cụ thể
// @route   DELETE /api/sellers/me/items/:itemId
// @access  Private (Seller/Admin)
const deleteMyProductItem = asyncHandler(async (req, res) => {
    const itemId = req.params.itemId;
    const sellerId = req.user.user_id;
    const isAdmin = req.user.role === 'admin';

    const result = await deleteProductItem(itemId, sellerId, isAdmin);

    res.status(200).json(result);
});

module.exports = {
    getMyProductItems,
    addMyProductItems,
    updateMyProductItemStatus,
    deleteMyProductItem,
};