const { User, Store, SellerWallet, sequelize } = require('../models');
const { Op } = require('sequelize');

// @desc    Admin lấy danh sách tất cả người dùng
exports.getAllUsersAdmin = async (req, res) => {
    const { page = 1, limit = 10, role, status, search } = req.query;
    const offset = (page - 1) * limit;
    try {
        let whereClause = {};
        if (role) whereClause.role = role;
        if (status) whereClause.status = status;
        if (search) {
            whereClause[Op.or] = [
                { username: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { full_name: { [Op.like]: `%${search}%` } }
            ];
        }

        const users = await User.findAndCountAll({
            where: whereClause,
            attributes: { exclude: ['password_hash'] }, // Luôn loại bỏ password_hash
            include: [ // Lấy thêm thông tin store nếu là seller
                { model: Store, as: 'store', attributes: ['id', 'store_name', 'slug'], required: false }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['createdAt', 'DESC']]
        });

        res.json({
            totalItems: users.count,
            totalPages: Math.ceil(users.count / limit),
            currentPage: parseInt(page),
            users: users.rows
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách người dùng (admin):', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// @desc    Admin lấy chi tiết một người dùng
exports.getUserByIdAdmin = async (req, res) => {
    try {
        // req.targetUser đã được gán từ middleware validateUserUpdateAdmin (nếu dùng chung validation)
        // Hoặc tìm lại user
        const user = req.targetUser || await User.findByPk(req.params.userId, {
            attributes: { exclude: ['password_hash'] },
            include: [
                { model: Store, as: 'store' },
                { model: SellerWallet, as: 'wallet', attributes: ['balance'] }
                // Thêm các include khác nếu cần (ví dụ: orders, products...)
            ]
        });

        if (!user) { // Kiểm tra lại nếu không dùng req.targetUser
            return res.status(404).json({ message: 'Người dùng không tìm thấy.' });
        }
        res.json(user);
    } catch (error) {
        console.error('Lỗi lấy chi tiết người dùng (admin):', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// @desc    Admin cập nhật thông tin người dùng
exports.updateUserAdmin = async (req, res) => {
    const { role, status, full_name, phone_number } = req.body;
    const userToUpdate = req.targetUser; // Lấy từ validation middleware
    let dbTransaction;

    try {
        dbTransaction = await sequelize.transaction();

        const oldRole = userToUpdate.role;
        const newRole = role || oldRole;

        userToUpdate.full_name = full_name !== undefined ? full_name : userToUpdate.full_name;
        userToUpdate.phone_number = phone_number !== undefined ? phone_number : userToUpdate.phone_number;
        userToUpdate.role = newRole;
        userToUpdate.status = status || userToUpdate.status;

        // Xử lý khi thay đổi vai trò thành 'seller'
        if (newRole === 'seller' && oldRole !== 'seller') {
            // Kiểm tra và tạo SellerWallet nếu chưa có
            let wallet = await SellerWallet.findOne({ where: { seller_id: userToUpdate.id }, transaction: dbTransaction });
            if (!wallet) {
                await SellerWallet.create({ seller_id: userToUpdate.id, balance: 0.00 }, { transaction: dbTransaction });
            }
            // User này bây giờ có thể tạo Store
        }
        // Nếu chuyển từ 'seller' sang vai trò khác, có thể cần xử lý store, sản phẩm của họ (ví dụ: deactive store)

        await userToUpdate.save({ transaction: dbTransaction });
        await dbTransaction.commit();

        // Loại bỏ password_hash trước khi trả về
        const userResponse = userToUpdate.toJSON();
        delete userResponse.password_hash;

        res.json({ message: 'Thông tin người dùng đã được cập nhật.', user: userResponse });
    } catch (error) {
        if (dbTransaction) await dbTransaction.rollback();
        console.error('Lỗi cập nhật người dùng (admin):', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// @desc    Admin xóa người dùng
exports.deleteUserAdmin = async (req, res) => {
    const userToDelete = req.targetUser; // Lấy từ validation middleware
    let dbTransaction;
    try {
        dbTransaction = await sequelize.transaction();
        // Cân nhắc kỹ việc xóa cứng hay mềm. Xóa cứng có thể gây lỗi khóa ngoại.
        // Ví dụ xóa mềm:
        // userToDelete.status = 'suspended'; // Hoặc 'deleted' nếu có trạng thái đó
        // userToDelete.email = `${userToDelete.email}_deleted_${Date.now()}`; // Để giải phóng email cho đăng ký mới
        // userToDelete.username = `${userToDelete.username}_deleted_${Date.now()}`; // Để giải phóng username
        // await userToDelete.save({ transaction: dbTransaction });
        // res.json({ message: 'Người dùng đã được vô hiệu hóa (xóa mềm).' });

        // Ví dụ xóa cứng (CẨN THẬN VỚI KHÓA NGOẠI - Cần onDelete: 'CASCADE' hoặc 'SET NULL' ở các model liên quan)
        await userToDelete.destroy({ transaction: dbTransaction });
        await dbTransaction.commit();
        res.json({ message: 'Người dùng đã được xóa vĩnh viễn.' });

    } catch (error) {
        if (dbTransaction) await dbTransaction.rollback();
        console.error('Lỗi xóa người dùng (admin):', error);
        res.status(500).json({ message: 'Lỗi server khi xóa người dùng. Có thể do các ràng buộc dữ liệu.', error: error.message });
    }
};