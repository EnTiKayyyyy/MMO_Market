const { Product, User, Order, OrderItem, Wallet, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Lấy dữ liệu thống kê cho Admin Dashboard.
 */
exports.getAdminDashboardStats = async (req, res) => {
    try {
        // Gọi song song tất cả các câu lệnh count để tăng hiệu suất
        const [
            totalProducts,
            totalUsers,
            totalOrders,
            pendingProducts,
            pendingOrders, // Đếm số đơn hàng có trạng thái 'paid' (đã thanh toán, chờ xử lý)
            totalRevenueResult
        ] = await Promise.all([
            Product.count(),
            User.count(),
            Order.count(),
            Product.count({ where: { status: 'pending_approval' } }),
            Order.count({ where: { status: 'paid' } }), // <-- Đếm đơn hàng chờ xử lý
            OrderItem.findOne({
                attributes: [
                    [sequelize.fn('SUM', sequelize.col('price')), 'totalRevenue']
                ],
                where: { status: 'confirmed' }, // Giả sử 'confirmed' là trạng thái đã hoàn thành
                raw: true
            })
        ]);
        
        const totalRevenue = totalRevenueResult.totalRevenue || 0;

        res.json({
            totalProducts,
            totalUsers,
            totalOrders,
            totalRevenue: parseFloat(totalRevenue),
            pendingProducts,
            pendingOrders, // <-- Trả về số liệu cho frontend
        });
    } catch (error) {
        console.error("Lỗi lấy dữ liệu Admin Dashboard:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

/**
 * Lấy dữ liệu thống kê cho Seller Dashboard.
 */
exports.getSellerDashboardStats = async (req, res) => {
    const sellerId = req.user.id;
    try {
        const totalProducts = await Product.count({ where: { seller_id: sellerId } });
        const pendingProducts = await Product.count({ where: { seller_id: sellerId, status: 'pending_approval' } });
        
        // Đếm số đơn hàng có chứa sản phẩm của người bán
        const totalOrders = await Order.count({
            distinct: true,
            include: [{
                model: OrderItem,
                as: 'items',
                where: { seller_id: sellerId },
                required: true, // INNER JOIN
                attributes: []
            }]
        });

        // Tính tổng doanh thu của người bán từ các mục đã được xác nhận
        const totalRevenueResult = await OrderItem.findOne({
            attributes: [
                [sequelize.fn('SUM', sequelize.col('price')), 'totalRevenue']
            ],
            where: { seller_id: sellerId, status: 'confirmed' },
            raw: true
        });
        const totalRevenue = totalRevenueResult.totalRevenue || 0;

        const wallet = await Wallet.findOne({ where: { user_id: sellerId } });

        // Lấy 5 đơn hàng gần nhất của người bán
        const recentOrders = await Order.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [{
                model: OrderItem,
                as: 'items',
                where: { seller_id: sellerId },
                required: true,
                attributes: ['id', 'status']
            }],
        });

        res.json({
            totalProducts,
            totalOrders,
            totalRevenue: parseFloat(totalRevenue),
            walletBalance: wallet ? parseFloat(wallet.balance) : 0,
            pendingProducts,
            recentOrders,
        });
    } catch (error) {
        console.error(`Lỗi lấy dữ liệu Seller Dashboard cho user ${sellerId}:`, error);
        res.status(500).json({ message: "Lỗi server" });
    }
};
