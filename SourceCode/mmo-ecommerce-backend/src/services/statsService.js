// src/services/statsService.js
const { sequelize } = require('../config/database'); // Cần sequelize instance cho các raw query hoặc aggregation phức tạp
const { Op } = require('sequelize'); // Toán tử Sequelize
const User = require('../models/User');
const SellerProfile = require('../models/SellerProfile');
const Product = require('../models/Product');
const ProductItem = require('../models/ProductItem');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Transaction = require('../models/Transaction'); // Để kiểm tra trạng thái thanh toán


// Helper xử lý khoảng thời gian từ query params
const getDateRange = (startDate, endDate) => {
    let where = {};
    if (startDate && endDate) {
        where = {
            [Op.between]: [new Date(startDate), new Date(endDate)]
        };
    } else if (startDate) {
        where = { [Op.gte]: new Date(startDate) };
    } else if (endDate) {
        where = { [Op.lte]: new Date(endDate) };
    }
    return where;
};


// --- Logic Thống kê cho Người bán (Seller/Admin) ---

// Lấy thống kê doanh số bán hàng cho seller
const getSellerSalesStats = async (sellerId, { startDate, endDate }) => {
    const createdAtIndex = getDateRange(startDate, endDate);

    // Tính tổng doanh thu và số đơn hàng đã thanh toán có item của seller
    const salesStats = await OrderItem.findAll({
        attributes: [
            // Tính tổng tiền từ các OrderItem đã fulfill và có đơn hàng đã paid
            [sequelize.fn('SUM', sequelize.literal('OrderItem.price_at_purchase')), 'totalRevenue'],
            // Đếm số đơn hàng duy nhất chứa item của seller và đã paid
            [sequelize.fn('COUNT', sequelize.distinct('OrderItem.order_id')), 'totalOrders'],
             // Đếm tổng số item đã bán (fulfilled)
            [sequelize.fn('COUNT', sequelize.literal('OrderItem.order_item_id')), 'totalItemsSold'],
        ],
        where: {
            seller_id: sellerId,
            status: 'fulfilled', // Chỉ tính item đã fulfill (đã giao)
            created_at: createdAtIndex, // Lọc theo thời gian tạo OrderItem (gần thời điểm đặt hàng)
        },
        include: {
            model: Order,
            as: 'order',
             attributes: [], // Không cần lấy cột Order, chỉ cần dùng để lọc
            where: {
                payment_status: 'paid', // Chỉ tính các đơn hàng đã thanh toán
                // created_at: createdAtIndex // Hoặc lọc theo thời gian tạo Order
            },
             required: true // Đảm bảo chỉ join với Order tồn tại
        },
         group: [] // Không group theo trường nào để lấy tổng toàn bộ
    });

     // Kết quả trả về là một mảng, lấy phần tử đầu tiên
     const stats = salesStats[0] || { totalRevenue: 0, totalOrders: 0, totalItemsSold: 0 };

    // Lấy top sản phẩm bán chạy của seller
    const topSellingProducts = await OrderItem.findAll({
         attributes: [
             'product_id',
             [sequelize.fn('COUNT', sequelize.literal('OrderItem.order_item_id')), 'itemsSold'],
             [sequelize.fn('SUM', sequelize.literal('OrderItem.price_at_purchase')), 'revenue'],
         ],
         where: {
             seller_id: sellerId,
             status: 'fulfilled',
              created_at: createdAtIndex,
         },
         include: {
             model: Order, as: 'order', attributes: [], where: { payment_status: 'paid' }, required: true
         },
         group: ['OrderItem.product_id'],
         order: [[sequelize.literal('itemsSold'), 'DESC']], // Sắp xếp theo số lượng bán giảm dần
         limit: 5 // Lấy top 5
    });

    // Include thông tin Product template cho top selling items
    const topSellingProductDetails = await Promise.all(topSellingProducts.map(async (item) => {
        const product = await Product.findByPk(item.product_id, { attributes: ['name', 'slug', 'image_url'] });
        return {
            ...item.get({ plain: true }), // Lấy dữ liệu dạng plain object
            product_name: product ? product.name : 'Sản phẩm không tồn tại',
            product_slug: product ? product.slug : null,
            product_image_url: product ? product.image_url : null,
        };
    }));


    return {
        ...stats.get({ plain: true }), // Trả về dạng plain object
        topSellingProducts: topSellingProductDetails,
    };
};

// Lấy thống kê tồn kho cho seller
const getSellerStockStats = async (sellerId) => {
     const stockStats = await ProductItem.findAll({
        attributes: [
            'status',
            [sequelize.fn('COUNT', sequelize.col('item_id')), 'count'],
        ],
        where: {
            seller_id: sellerId,
        },
        group: ['status'], // Gom nhóm theo trạng thái
    });

     // Chuyển kết quả dạng mảng [{ status: 'available', count: 10 }]
     // sang dạng object { available: 10, sold: 5 }
     const formattedStockStats = stockStats.reduce((acc, item) => {
        acc[item.status] = item.get('count'); // Lấy giá trị count
        return acc;
     }, { available: 0, pending: 0, sold: 0, disabled: 0 }); // Đảm bảo có đủ các trạng thái

    return formattedStockStats;
};


// --- Logic Thống kê cho Quản trị viên (Admin) ---

// Lấy thống kê tổng quan hệ thống
const getAdminOverviewStats = async () => {
    // Sử dụng Promise.all để chạy nhiều query cùng lúc
    const [
        totalUsers,
        totalSellers,
        totalProducts,
        totalProductItems,
        totalOrders,
        totalRevenueResult, // Kết quả tính tổng doanh thu
    ] = await Promise.all([
        User.count(), // Tổng số user
        SellerProfile.count(), // Tổng số seller
        Product.count(), // Tổng số loại sản phẩm
        ProductItem.count(), // Tổng số đơn vị sản phẩm
        Order.count(), // Tổng số đơn hàng
        // Tính tổng doanh thu từ OrderItems đã fulfill và Order đã paid
        OrderItem.findAll({
            attributes: [
                 [sequelize.fn('SUM', sequelize.literal('OrderItem.price_at_purchase')), 'totalRevenue'],
            ],
            where: {
                status: 'fulfilled',
            },
            include: {
                model: Order, as: 'order', attributes: [], where: { payment_status: 'paid' }, required: true
            },
             group: []
        }),
    ]);

    // Lấy giá trị tổng doanh thu từ kết quả query aggregate
    const totalRevenue = totalRevenueResult[0] ? totalRevenueResult[0].get('totalRevenue') : 0;


    return {
        totalUsers,
        totalSellers,
        totalProducts,
        totalProductItems,
        totalOrders,
        totalRevenue,
        // Có thể thêm các số liệu khác như tổng số item đã bán (dùng ProductItem where status='sold')
    };
};

// Lấy thống kê doanh số theo thời gian (cho Admin)
const getAdminSalesStats = async ({ period = 'month', startDate, endDate }) => {
     const createdAtIndex = getDateRange(startDate, endDate);
     let groupByFormat; // Định dạng để gom nhóm theo thời gian

    switch (period) {
        case 'day':
             // Sử dụng hàm CSDL để trích xuất ngày (ví dụ cho MySQL)
            groupByFormat = sequelize.fn('DATE', sequelize.col('Order.created_at'));
            break;
        case 'month':
             groupByFormat = sequelize.fn('DATE_FORMAT', sequelize.col('Order.created_at'), '%Y-%m'); // Ví dụ '2023-10'
            break;
        case 'year':
             groupByFormat = sequelize.fn('YEAR', sequelize.col('Order.created_at'));
            break;
        default: // Default là month
             groupByFormat = sequelize.fn('DATE_FORMAT', sequelize.col('Order.created_at'), '%Y-%m');
            break;
    }


     const salesData = await Order.findAll({
        attributes: [
            groupByFormat, // Cột để gom nhóm theo thời gian
             [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalAmount'], // Tổng giá trị order (trước paid)
            [sequelize.fn('COUNT', sequelize.col('order_id')), 'totalOrders'], // Tổng số order
            // Tính tổng tiền đã paid từ Transaction hoặc Order.final_amount_paid
             [sequelize.fn('SUM', sequelize.col('final_amount_paid')), 'totalRevenue'],
        ],
        where: {
             payment_status: 'paid', // Chỉ tính đơn hàng đã paid
             created_at: createdAtIndex, // Lọc theo thời gian tạo Order
        },
        group: [groupByFormat], // Gom nhóm theo định dạng thời gian
        order: [[groupByFormat, 'ASC']], // Sắp xếp theo thời gian tăng dần
     });

    // Format lại kết quả cho dễ dùng ở frontend
    const formattedSalesData = salesData.map(item => ({
        period: item.get(groupByFormat), // Giá trị thời gian (ví dụ: "2023-10")
        totalOrders: parseInt(item.get('totalOrders'), 10),
        totalAmount: parseFloat(item.get('totalAmount')),
        totalRevenue: parseFloat(item.get('totalRevenue')),
    }));


    return formattedSalesData;
};

// Lấy thống kê người dùng (cho Admin)
const getAdminUserStats = async ({ startDate, endDate }) => {
     const createdAtIndex = getDateRange(startDate, endDate);

     // Đếm tổng user và user theo role
    const totalUsersByRole = await User.findAll({
        attributes: [
            'role',
             [sequelize.fn('COUNT', sequelize.col('user_id')), 'count'],
        ],
        group: ['role'],
    });

    const formattedUserCount = totalUsersByRole.reduce((acc, item) => {
         acc[item.role] = item.get('count');
         return acc;
    }, { user: 0, seller: 0, admin: 0 }); // Đảm bảo có đủ các role

    // Đếm user mới trong khoảng thời gian
    const newUsersCount = await User.count({
        where: {
            created_at: createdAtIndex,
        }
    });


    return {
        totalUsers: formattedUserCount.user + formattedUserCount.seller + formattedUserCount.admin,
        ...formattedUserCount, // user, seller, admin count
        newUsersCount: newUsersCount,
    };
};

// Lấy thống kê sản phẩm (cho Admin)
const getAdminProductStats = async ({ startDate, endDate }) => {
     const createdAtIndex = getDateRange(startDate, endDate);

     // Đếm Product template theo trạng thái
    const productCountByStatus = await Product.findAll({
        attributes: [
            'status',
             [sequelize.fn('COUNT', sequelize.col('product_id')), 'count'],
        ],
         where: { created_at: createdAtIndex }, // Lọc theo thời gian tạo template
        group: ['status'],
    });

    const formattedProductStatusCount = productCountByStatus.reduce((acc, item) => {
        acc[item.status] = item.get('count');
         return acc;
    }, { draft: 0, pending_approval: 0, active: 0, rejected: 0, archived: 0 });


    // Đếm Product Item theo trạng thái (toàn hệ thống)
     const productItemCountByStatus = await ProductItem.findAll({
        attributes: [
            'status',
             [sequelize.fn('COUNT', sequelize.col('item_id')), 'count'],
        ],
         where: { created_at: createdAtIndex }, // Lọc theo thời gian tạo item
        group: ['status'],
    });

    const formattedProductItemStatusCount = productItemCountByStatus.reduce((acc, item) => {
         acc[item.status] = item.get('count');
         return acc;
    }, { available: 0, pending: 0, sold: 0, disabled: 0 });


    // Lấy top sản phẩm bán chạy (dựa trên số lượng OrderItem đã fulfill)
     const topSellingProducts = await OrderItem.findAll({
         attributes: [
             'product_id',
             [sequelize.fn('COUNT', sequelize.literal('OrderItem.order_item_id')), 'itemsSold'],
             [sequelize.fn('SUM', sequelize.literal('OrderItem.price_at_purchase')), 'revenue'],
         ],
         where: {
             status: 'fulfilled',
              created_at: createdAtIndex,
         },
         include: {
             model: Order, as: 'order', attributes: [], where: { payment_status: 'paid' }, required: true
         },
         group: ['OrderItem.product_id'],
         order: [[sequelize.literal('itemsSold'), 'DESC']],
         limit: 10 // Lấy top 10
    });

     // Include thông tin Product template cho top selling items
    const topSellingProductDetails = await Promise.all(topSellingProducts.map(async (item) => {
        const product = await Product.findByPk(item.product_id, { attributes: ['name', 'slug', 'image_url'] });
         // Cần thêm seller info? Product belongsTo SellerProfile
         // const productWithSeller = await Product.findByPk(item.product_id, { include: { model: SellerProfile, as: 'seller', attributes: ['store_name']} });

        return {
            ...item.get({ plain: true }),
            product_name: product ? product.name : 'Sản phẩm không tồn tại',
            product_slug: product ? product.slug : null,
            product_image_url: product ? product.image_url : null,
             // seller_store_name: productWithSeller?.seller?.store_name || 'N/A'
        };
    }));


    return {
        productCountByStatus: formattedProductStatusCount,
        productItemCountByStatus: formattedProductItemStatusCount,
        topSellingProducts: topSellingProductDetails,
    };
};


module.exports = {
  getSellerSalesStats,
  getSellerStockStats,
  getAdminOverviewStats,
  getAdminSalesStats,
  getAdminUserStats,
  getAdminProductStats,
};