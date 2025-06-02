const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: { // ID của người nhận thông báo
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    type: { // Loại thông báo để frontend có thể hiển thị icon/style phù hợp
        type: DataTypes.ENUM(
            'new_order_buyer',          // Đơn hàng mới (cho người mua)
            'new_order_seller',         // Đơn hàng mới (cho người bán)
            'order_paid_buyer',         // Đơn hàng đã thanh toán (cho người mua)
            'order_paid_seller',        // Đơn hàng đã thanh toán (cho người bán)
            'item_delivered_buyer',     // Mục hàng đã giao (cho người mua)
            'item_confirmed_seller',    // Mục hàng đã được xác nhận (cho người bán, tiền về ví)
            'order_completed_buyer',    // Đơn hàng hoàn tất (cho người mua)
            'order_cancelled_buyer',    // Đơn hàng bị hủy (cho người mua)
            'order_cancelled_seller',   // Đơn hàng bị hủy (cho người bán)
            'new_message',              // Có tin nhắn mới
            'dispute_opened_seller',    // Khiếu nại mới mở (cho người bán)
            'dispute_opened_admin',     // Khiếu nại mới mở (cho admin)
            'dispute_response_buyer',   // Khiếu nại có phản hồi (cho người mua)
            'dispute_response_seller',  // Khiếu nại có phản hồi (cho người bán)
            'dispute_response_admin',   // Khiếu nại có phản hồi (cho admin)
            'dispute_resolved_buyer',   // Khiếu nại đã giải quyết (cho người mua)
            'dispute_resolved_seller',  // Khiếu nại đã giải quyết (cho người bán)
            'payout_processed',         // Yêu cầu rút tiền đã xử lý (cho người bán)
            'product_approved',         // Sản phẩm được duyệt (cho người bán)
            'product_rejected',         // Sản phẩm bị từ chối (cho người bán)
            'seller_verified',          // Người bán được xác minh (cho người bán)
            'admin_general'             // Thông báo chung từ admin
            // ... thêm các loại khác nếu cần
        ),
        allowNull: false,
    },
    title: { // Tiêu đề ngắn gọn, có thể генерувати tự động dựa trên type
        type: DataTypes.STRING(255),
        allowNull: true, // Có thể không cần nếu type đủ rõ ràng
    },
    message: { // Nội dung chi tiết của thông báo
        type: DataTypes.TEXT,
        allowNull: false,
    },
    link: { // Đường dẫn để điều hướng khi click vào thông báo (vd: /orders/123)
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    read_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    // (Tùy chọn) Các trường để liên kết với entity cụ thể
    related_entity_type: {
        type: DataTypes.ENUM('order', 'order_item', 'product', 'user', 'dispute', 'payout_request', 'message_thread'),
        allowNull: true,
    },
    related_entity_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
    }
    // Sequelize tự động thêm createdAt và updatedAt
}, {
    tableName: 'notifications',
    timestamps: true,
});

module.exports = Notification;