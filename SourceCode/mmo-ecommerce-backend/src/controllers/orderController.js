// src/controllers/orderController.js
const asyncHandler = require('../middleware/asyncHandler');
const {
    createOrderFromCart,
    getUserOrders,
    getUserOrderDetail,
    cancelOrder,
    getPurchasedItemData,
} = require('../services/orderService');


// @desc    Tạo đơn hàng từ giỏ hàng
// @route   POST /api/orders
// @access  Private (Auth)
const createOrder = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const { payment_method, notes } = req.body;

  // TODO: Thêm validation cho payment_method nếu cần

  const order = await createOrderFromCart(userId, { payment_method, notes });

  res.status(201).json(order); // Trả về đơn hàng vừa tạo (với trạng thái pending_payment)
});

// @desc    Lấy danh sách đơn hàng của người dùng hiện tại
// @route   GET /api/orders
// @access  Private (Auth)
const getMyOrders = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const params = req.query; // status, page, limit, sort

  const result = await getUserOrders(userId, params);

  res.status(200).json(result);
});

// @desc    Lấy chi tiết một đơn hàng của người dùng hiện tại
// @route   GET /api/orders/:orderId
// @access  Private (Auth)
const getMyOrderDetail = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const orderId = req.params.orderId;

  const order = await getUserOrderDetail(userId, orderId); // Service sẽ xử lý lỗi 404/403

  res.status(200).json(order);
});

// @desc    Người dùng hủy đơn hàng
// @route   PUT /api/orders/:orderId/cancel
// @access  Private (Auth)
const cancelMyOrder = asyncHandler(async (req, res) => {
  const userId = req.user.user_id;
  const orderId = req.params.orderId;

  const result = await cancelOrder(userId, orderId); // Service sẽ xử lý logic và lỗi

  res.status(200).json(result); // Trả về thông báo hoặc đơn hàng đã cập nhật
});

// @desc    Người dùng lấy dữ liệu sản phẩm đã mua sau khi fulfill
// @route   GET /api/orders/:orderId/items/:orderItemId/data
// @access  Private (Auth)
const getMyPurchasedItemData = asyncHandler(async (req, res) => {
    const userId = req.user.user_id;
    const { orderId, orderItemId } = req.params;

    const data = await getPurchasedItemData(userId, orderId, orderItemId); // Service xử lý logic và quyền

    res.status(200).json(data);
});


module.exports = {
  createOrder,
  getMyOrders,
  getMyOrderDetail,
  cancelMyOrder,
  getMyPurchasedItemData,
};