// src/controllers/userController.js
const asyncHandler = require('../middleware/asyncHandler'); // Helper bắt lỗi async
const { getUserById, updateUser, getAllUsers, deleteUser } = require('../services/userService'); // Import service

// @desc    Lấy thông tin user theo ID (Admin hoặc user tự lấy thông tin public của user khác)
// @route   GET /api/users/:userId
// @access  Private (Auth) - Cần token. Admin có thể lấy user bất kỳ. User thường chỉ lấy thông tin public.
// Note: Endpoint này có thể cần logic phân quyền chi tiết hơn tùy thiết kế public profile.
// Hiện tại, giả định chỉ Admin dùng hoặc user tự lấy info public (chưa public info)
const getUser = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  // TODO: Thêm logic kiểm tra quyền. Nếu user không phải Admin, chỉ cho phép lấy thông tin public
  // hoặc chỉ cho phép lấy thông tin của chính mình (userId == req.user.user_id)

  const user = await getUserById(userId); // Service sẽ throw error nếu không tìm thấy

  res.status(200).json(user);
});

// @desc    Cập nhật thông tin người dùng (Admin)
// @route   PUT /api/users/:userId
// @access  Private (Admin)
const updateUserData = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const updateData = req.body;

    // TODO: Thêm validation cho updateData
    // Admin có thể cập nhật role, nhưng cần cẩn thận

    const updatedUser = await updateUser(userId, updateData, { allowRoleChange: true }); // Cho phép Admin đổi role

    res.status(200).json(updatedUser);
});

// @desc    Lấy tất cả người dùng (Admin)
// @route   GET /api/users
// @access  Private (Admin)
const getAllUsersData = asyncHandler(async (req, res) => {
    // Lấy query params cho phân trang, sắp xếp nếu có
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const result = await getAllUsers({ page, limit });

    res.status(200).json(result);
});


// @desc    Xóa người dùng (Admin)
// @route   DELETE /api/users/:userId
// @access  Private (Admin)
const deleteUserData = asyncHandler(async (req, res) => {
    const userId = req.params.userId;

    const result = await deleteUser(userId);

    res.status(200).json(result); // Trả về thông báo xóa thành công

});


// @desc    Cập nhật profile của người dùng hiện tại
// @route   PUT /api/users/profile
// @access  Private (Auth)
const updateUserProfile = asyncHandler(async (req, res) => {
    const userId = req.user.user_id; // Lấy ID từ token đã xác thực
    const updateData = req.body;

    // TODO: Thêm validation cho updateData (người dùng không được đổi role, is_active...)
     // Chỉ cho phép cập nhật các trường như username, email, password

    const updatedUser = await updateUser(userId, updateData, { allowRoleChange: false }); // Không cho phép đổi role

    res.status(200).json(updatedUser);
});


module.exports = {
    getUser,
    updateUserData,
    getAllUsersData,
    deleteUserData,
    updateUserProfile, // Export endpoint riêng cho user profile
};