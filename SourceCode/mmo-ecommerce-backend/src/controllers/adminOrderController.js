// src/controllers/adminOrderController.js
const asyncHandler = require('../middleware/asyncHandler');
const {
    getAdminOrders,
    getAdminOrderDetail,
    updateOrderStatus,
     fulfillOrderItem, // Admin cũng có thể fulfill item
} = require('../services/orderService');


// @desc    Admin lấy tất cả các đơn hàng trong hệ thống
// @route   GET /api/admin/orders
// @access  Private (Admin)
const getAdminOrdersList = asyncHandler(async (req, res) => {
  const params = req.query; // status, user_id, seller_id, page, limit, sort

  const result = await getAdminOrders(params);

  res.status(200).json(result);
});

// @desc    Admin lấy chi tiết một đơn hàng bất kỳ
// @route   GET /api/admin/orders/:orderId
// @access  Private (Admin)
const getAdminOrderDetailItem = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId;

  const order = await getAdminOrderDetail(orderId); // Service xử lý lỗi 404

  res.status(200).json(order);
});

// @desc    Admin cập nhật trạng thái đơn hàng tổng thể
// @route   PUT /api/admin/orders/:orderId/status
// @access  Private (Admin)
const updateOrderStatusAdmin = asyncHandler(async (req, res) => {
  const orderId = req.params.orderId;
  const { status } = req.body;

  if (!status) {
       res.status(400);
       throw new Error('Trạng thái đơn hàng là bắt buộc.');
  }
   // TODO: Thêm validation cho giá trị status

  const updatedOrder = await updateOrderStatus(orderId, status);

  res.status(200).json(updatedOrder);
});

// @desc    Admin fulfill một mục trong đơn hàng (dùng chung logic với seller nhưng không cần sellerId check)
// @route   PUT /api/admin/orders/:orderId/items/:orderItemId/fulfill
// @access  Private (Admin)
const fulfillOrderItemAdmin = asyncHandler(async (req, res) => {
     const { orderId, orderItemId } = req.params; // Lấy orderId và orderItemId
     const { fulfillment_data } = req.body; // Dữ liệu sản phẩm để giao cho khách

     if (!fulfillment_data) {
         res.status(400);
         throw new Error('Dữ liệu sản phẩm để fulfill là bắt buộc.');
     }

    // Gọi service để xử lý fulfill item (truyền null cho sellerId để báo là Admin)
    const updatedItem = await fulfillOrderItem(orderItemId, null, fulfillment_data, true); // isAdmin = true

    res.status(200).json(updatedItem); // Trả về OrderItem đã fulfill
});


module.exports = {
    getAdminOrdersList,
    getAdminOrderDetailItem,
    updateOrderStatusAdmin,
    fulfillOrderItemAdmin,
};