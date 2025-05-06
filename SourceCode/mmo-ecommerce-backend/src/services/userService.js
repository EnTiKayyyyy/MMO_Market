// src/services/userService.js
const User = require('../models/User');
// Không cần import bcrypt/jsonwebtoken ở đây, Auth Service đã xử lý

// Lấy thông tin user theo ID (có thể dùng lại findUserById từ authService)
const getUserById = async (userId) => {
    const user = await User.findByPk(userId, {
        attributes: { exclude: ['password_hash'] } // Không lấy password_hash
    });
    if (!user) {
        throw new Error('Người dùng không tồn tại.');
    }
    return user;
};

// Cập nhật thông tin user
const updateUser = async (userId, updateData, options = {}) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw new Error('Người dùng không tồn tại.');
    }

    // Chỉ cho phép cập nhật các trường nhất định (whitelist)
    const allowedUpdates = ['username', 'email', 'password_hash']; // Thêm các trường khác nếu cần
    Object.keys(updateData).forEach(key => {
        if (allowedUpdates.includes(key)) {
            // Gán giá trị mới, nếu là password_hash thì hook beforeUpdate sẽ xử lý hash
            if (key === 'password_hash') {
                 user.password_hash = updateData[key];
             } else {
                 user[key] = updateData[key];
             }
        }
    });

    // Nếu user cập nhật thông tin của chính mình, không cho phép đổi role
    // Nếu là Admin cập nhật user khác, có thể cho phép đổi role (cần thêm logic kiểm tra trong controller)
    if (options.allowRoleChange && updateData.role) {
        user.role = updateData.role;
    }


    await user.save(); // Lưu cập nhật (hooks beforeUpdate sẽ chạy ở đây)

    // Trả về thông tin user đã cập nhật (không password_hash)
     const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ['password_hash'] }
     });

    return updatedUser;
};

// (Admin) Lấy tất cả người dùng
const getAllUsers = async ({ page = 1, limit = 10 }) => {
    const offset = (page - 1) * limit;
    const { count, rows } = await User.findAndCountAll({
        limit: limit,
        offset: offset,
        attributes: { exclude: ['password_hash'] }, // Không lấy password_hash
        order: [['created_at', 'DESC']], // Sắp xếp theo thời gian tạo mới nhất
    });

    return {
        totalItems: count,
        users: rows,
        currentPage: page,
        totalPages: Math.ceil(count / limit),
    };
};

// (Admin) Xóa người dùng
const deleteUser = async (userId) => {
    const user = await User.findByPk(userId);
    if (!user) {
        throw new Error('Người dùng không tồn tại.');
    }
    // TODO: Cần xử lý các ràng buộc khóa ngoại (đơn hàng, sản phẩm...)
    // Tùy chọn: Nên là soft delete (thêm cột is_deleted = TRUE) thay vì xóa cứng
    await user.destroy(); // Xóa cứng
    return { message: 'Người dùng đã được xóa.' };
};


module.exports = {
  getUserById,
  updateUser,
  getAllUsers,
  deleteUser,
};