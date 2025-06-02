const { Review, OrderItem, Order, Product, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// @desc    Tạo đánh giá mới
exports.createReview = async (req, res) => {
    const { itemId } = req.params; // itemId là order_item_id
    const { rating, comment } = req.body;
    const reviewer_id = req.user.id;

    try {
        const orderItem = await OrderItem.findByPk(itemId, {
            include: [
                { model: Order, as: 'order', attributes: ['buyer_id'] },
                { model: Product, as: 'product', attributes: ['seller_id', 'id'] } // Lấy seller_id và product_id từ sản phẩm
            ]
        });

        if (!orderItem) {
            return res.status(404).json({ message: 'Mục đơn hàng không tìm thấy.' });
        }
        if (orderItem.order.buyer_id !== reviewer_id) {
            return res.status(403).json({ message: 'Bạn không phải người mua của mục đơn hàng này.' });
        }
        if (orderItem.status !== 'confirmed') {
            return res.status(400).json({ message: 'Bạn chỉ có thể đánh giá các mục đã được xác nhận nhận hàng.' });
        }

        // Kiểm tra xem đã có review cho order_item này chưa (DB đã có unique constraint, nhưng check code vẫn tốt)
        const existingReview = await Review.findOne({ where: { order_item_id: itemId } });
        if (existingReview) {
            return res.status(400).json({ message: 'Bạn đã đánh giá mục đơn hàng này rồi.' });
        }

        const newReview = await Review.create({
            order_item_id: itemId,
            reviewer_id,
            seller_id: orderItem.product.seller_id, // Lấy seller_id từ product liên kết với orderItem
            product_id: orderItem.product_id,
            rating,
            comment
        });

        // Tùy chọn: Cập nhật điểm đánh giá trung bình cho sản phẩm và người bán (denormalization)
        // Đây là một tác vụ có thể nặng, cân nhắc thực hiện bất đồng bộ hoặc tính toán khi query

        res.status(201).json({ message: 'Đánh giá đã được tạo thành công.', review: newReview });
    } catch (error) {
        console.error('Lỗi tạo đánh giá:', error);
        res.status(500).json({ message: 'Lỗi server khi tạo đánh giá.', error: error.message });
    }
};

// @desc    Lấy tất cả đánh giá cho một sản phẩm
exports.getProductReviews = async (req, res) => {
    const { productId } = req.params;
    const { page = 1, limit = 10, rating, sortBy = 'createdAt', order = 'DESC' } = req.query;
    const offset = (page - 1) * limit;
    try {
        let whereClause = { product_id: productId };
        if (rating) whereClause.rating = parseInt(rating);

        const reviews = await Review.findAndCountAll({
            where: whereClause,
            include: [
                { model: User, as: 'reviewer', attributes: ['id', 'username', 'full_name', 'avatar_url'] }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, order.toUpperCase()]]
        });
        res.json({
            totalItems: reviews.count,
            totalPages: Math.ceil(reviews.count / limit),
            currentPage: parseInt(page),
            reviews: reviews.rows
        });
    } catch (error) {
        console.error('Lỗi lấy đánh giá sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// @desc    Lấy tất cả đánh giá cho các sản phẩm của một người bán
exports.getSellerReviews = async (req, res) => {
    const { sellerId } = req.params;
    const { page = 1, limit = 10, rating, sortBy = 'createdAt', order = 'DESC' } = req.query;
    const offset = (page - 1) * limit;
    try {
        let whereClause = { seller_id: sellerId };
        if (rating) whereClause.rating = parseInt(rating);

        const reviews = await Review.findAndCountAll({
            where: whereClause,
            include: [
                { model: User, as: 'reviewer', attributes: ['id', 'username', 'full_name', 'avatar_url'] },
                { model: Product, as: 'product', attributes: ['id', 'name'] }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, order.toUpperCase()]]
        });
        res.json({
            totalItems: reviews.count,
            totalPages: Math.ceil(reviews.count / limit),
            currentPage: parseInt(page),
            reviews: reviews.rows
        });
    } catch (error) {
        console.error('Lỗi lấy đánh giá người bán:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// @desc    Cập nhật đánh giá
exports.updateReview = async (req, res) => {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const reviewer_id = req.user.id;
    try {
        const review = await Review.findByPk(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Đánh giá không tìm thấy.' });
        }
        if (review.reviewer_id !== reviewer_id) {
            return res.status(403).json({ message: 'Bạn không có quyền sửa đánh giá này.' });
        }

        // Cân nhắc giới hạn thời gian cho phép sửa review

        review.rating = rating || review.rating;
        review.comment = comment !== undefined ? comment : review.comment;
        await review.save();

        res.json({ message: 'Đánh giá đã được cập nhật.', review });
    } catch (error) {
        console.error('Lỗi cập nhật đánh giá:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// @desc    Xóa đánh giá
exports.deleteReview = async (req, res) => {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    try {
        const review = await Review.findByPk(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Đánh giá không tìm thấy.' });
        }

        if (review.reviewer_id !== userId && userRole !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền xóa đánh giá này.' });
        }

        await review.destroy();
        res.json({ message: 'Đánh giá đã được xóa.' });
    } catch (error) {
        console.error('Lỗi xóa đánh giá:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// @desc    Admin: Lấy tất cả đánh giá
exports.getAllReviewsAdmin = async (req, res) => {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'DESC' } = req.query;
    const offset = (page - 1) * limit;
    try {
        const reviews = await Review.findAndCountAll({
            include: [
                { model: User, as: 'reviewer', attributes: ['id', 'username'] },
                { model: Product, as: 'product', attributes: ['id', 'name'] }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, order.toUpperCase()]]
        });
        res.json({
            totalItems: reviews.count,
            totalPages: Math.ceil(reviews.count / limit),
            currentPage: parseInt(page),
            reviews: reviews.rows
        });
    } catch (error) {
        console.error('Lỗi lấy tất cả đánh giá (admin):', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};