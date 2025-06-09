const { Product, User, Order, OrderItem, Wallet, PayoutRequest, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Lấy dữ liệu thống kê cho Admin Dashboard.
 */
exports.getAdminDashboardStats = async (req, res) => {
    try {
        const [
            totalProducts,
            totalUsers,
            totalOrders,
            pendingProducts,
            pendingOrders,
            pendingPayouts,
            totalRevenueResult
        ] = await Promise.all([
            Product.count(),
            User.count(),
            Order.count(),
            Product.count({ where: { status: 'pending_approval' } }),
            Order.count({ where: { status: 'paid' } }),
            PayoutRequest.count({ where: { status: 'pending' } }),
            OrderItem.findOne({
                attributes: [
                    [sequelize.fn('SUM', sequelize.col('price')), 'totalRevenue']
                ],
                // Doanh thu của toàn hệ thống là tổng các mục đã giao hoặc đã xác nhận
                where: { status: { [Op.in]: ['delivered', 'confirmed'] } }, 
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
            pendingOrders,
            pendingPayouts,
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
        const [
            totalProducts,
            pendingProducts,
            totalOrders,
            totalRevenueResult, // Biến này sẽ được tính toán lại
            wallet,
            recentOrders
        ] = await Promise.all([
             Product.count({ where: { seller_id: sellerId } }),
             Product.count({ where: { seller_id: sellerId, status: 'pending_approval' } }),
             Order.count({
                distinct: true,
                include: [{
                    model: OrderItem,
                    as: 'items',
                    where: { seller_id: sellerId },
                    required: true,
                    attributes: []
                }]
            }),
            // SỬA ĐỔI: Tính tổng doanh thu cho các mục đã giao (delivered) hoặc đã xác nhận (confirmed)
             OrderItem.findOne({
                attributes: [
                    [sequelize.fn('SUM', sequelize.col('price')), 'totalRevenue']
                ],
                where: { 
                    seller_id: sellerId, 
                    status: { [Op.in]: ['delivered', 'confirmed']} 
                },
                raw: true
            }),
             Wallet.findOne({ where: { user_id: sellerId } }),
             Order.findAll({
                limit: 5,
                order: [['createdAt', 'DESC']],
                include: [{
                    model: OrderItem,
                    as: 'items',
                    where: { seller_id: sellerId },
                    required: true,
                    attributes: ['id', 'status']
                }],
            })
        ]);
        
        const totalRevenue = totalRevenueResult.totalRevenue || 0;

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
