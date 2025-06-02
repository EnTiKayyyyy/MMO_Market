const { Product, User, Category } = require('../models');
const { Op } = require('sequelize');

// @desc    Admin lấy danh sách tất cả sản phẩm
exports.getAllProductsAdmin = async (req, res) => {
    const { page = 1, limit = 10, status, sellerId, categoryId, search } = req.query;
    const offset = (page - 1) * limit;
    try {
        let whereClause = {};
        if (status) whereClause.status = status;
        if (sellerId) whereClause.seller_id = parseInt(sellerId);
        if (categoryId) whereClause.category_id = parseInt(categoryId);
        if (search) {
            whereClause.name = { [Op.like]: `%${search}%` };
        }

        const products = await Product.findAndCountAll({
            where: whereClause,
            include: [
                { model: User, as: 'seller', attributes: ['id', 'username', 'full_name'] },
                { model: Category, as: 'category', attributes: ['id', 'name'] }
            ],
            // Admin có thể cần xem product_data ở danh sách không? Thường là không.
            // attributes: { exclude: ['product_data'] },
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['status', 'ASC'],['updatedAt', 'DESC']] // Ưu tiên pending_approval
        });

        res.json({
            totalItems: products.count,
            totalPages: Math.ceil(products.count / limit),
            currentPage: parseInt(page),
            products: products.rows
        });
    } catch (error) {
        console.error('Lỗi lấy danh sách sản phẩm (admin):', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// @desc    Admin lấy chi tiết một sản phẩm (bao gồm product_data để duyệt)
exports.getProductByIdAdmin = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.productId, {
            include: [
                { model: User, as: 'seller', attributes: ['id', 'username', 'email', 'full_name'] },
                { model: Category, as: 'category' }
            ]
            // Không exclude product_data vì admin cần xem để duyệt
        });
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tìm thấy.' });
        }
        res.json(product);
    } catch (error) {
        console.error('Lỗi lấy chi tiết sản phẩm (admin):', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// @desc    Admin cập nhật trạng thái sản phẩm
exports.updateProductStatusAdmin = async (req, res) => {
    const { status, admin_notes } = req.body;
    const productToUpdate = req.targetProduct; // Từ validation middleware

    try {
        productToUpdate.status = status;
        // Nếu bạn thêm cột `admin_rejection_notes` hoặc tương tự vào Product model:
        // if (status === 'rejected' && admin_notes) {
        //     productToUpdate.admin_rejection_notes = admin_notes;
        // } else if (status === 'available') {
        //     productToUpdate.admin_rejection_notes = null; // Xóa ghi chú từ chối cũ nếu duyệt lại
        // }
        await productToUpdate.save();

        // TODO: Gửi thông báo cho người bán (productToUpdate.seller_id) về việc sản phẩm đã được duyệt/từ chối.
        // Kèm theo admin_notes nếu bị từ chối.

        res.json({ message: `Trạng thái sản phẩm đã được cập nhật thành ${status}.`, product: productToUpdate });
    } catch (error) {
        console.error('Lỗi cập nhật trạng thái sản phẩm (admin):', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};