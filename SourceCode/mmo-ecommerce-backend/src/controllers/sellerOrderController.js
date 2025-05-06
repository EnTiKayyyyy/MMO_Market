// src/controllers/sellerOrderController.js
const asyncHandler = require('../middleware/asyncHandler');
const {
    getSellerOrders,
    getSellerOrderDetail,
    fulfillOrderItem,
} = require('../services/orderService');


// @desc    Lấy danh sách đơn hàng có sản phẩm của người bán hiện tại
// @route   GET /api/sellers/me/orders
// @access  Private (Seller/Admin)
const getSellerOrdersList = asyncHandler(async (req, res) => {
  const sellerId = req.user.user_id; // Lấy ID seller từ user đã xác thực
  const params = req.query; // status, page, limit, sort

  const result = await getSellerOrders(sellerId, params);

  res.status(200).json(result);
});

// @desc    Lấy chi tiết một đơn hàng của người bán (đơn hàng chứa item của họ)
// @route   GET /api/sellers/me/orders/:orderId
// @access  Private (Seller/Admin)
const getSellerOrderDetailItem = asyncHandler(async (req, res) => {
  const sellerId = req.user.user_id;
  const orderId = req.params.orderId;

  const order = await getSellerOrderDetail(sellerId, orderId); // Service xử lý lỗi 404/403

  res.status(200).json(order);
});


// @desc    Người bán/Admin fulfill một mục trong đơn hàng
// @route   PUT /api/sellers/me/orders/:orderId/items/:orderItemId/fulfill
// @access  Private (Seller/Admin)
const fulfillOrderItemSeller = asyncHandler(async (req, res) => {
    const { orderId, orderItemId } = req.params; // Lấy orderId và orderItemId từ URL
    const sellerId = req.user.user_id;
    const { fulfillment_data } = req.body; // Dữ liệu sản phẩm để giao cho khách (JSON)
    const isAdmin = req.user.role === 'admin';

    if (!fulfillment_data) {
         res.status(400);
         throw new Error('Dữ liệu sản phẩm để fulfill là bắt buộc.');
         // TODO: Thêm validation cho cấu trúc của fulfillment_data tùy loại sản phẩm
    }

    // Gọi service để xử lý fulfill item
    const updatedItem = await fulfillOrderItem(orderItemId, sellerId, fulfillment_data, isAdmin);

    res.status(200).json(updatedItem); // Trả về OrderItem đã fulfill
});


module.exports = {
    getSellerOrdersList,
    getSellerOrderDetailItem,
    fulfillOrderItemSeller,
};