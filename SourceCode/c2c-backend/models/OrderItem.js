const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    order_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    product_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    seller_id: { // THÊM CỘT NÀY
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    price: { // Giá sản phẩm tại thời điểm mua
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
    },
    commission_fee: { // Phí sàn thu trên item này
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0.00,
    },
    status: { // Trạng thái của từng item trong đơn hàng
        type: DataTypes.ENUM('processing', 'delivered', 'confirmed', 'disputed', 'refunded', 'cancelled'),
        allowNull: false,
        defaultValue: 'processing',
    }
    // Không cần timestamps ở đây nếu Order đã có, trừ khi bạn muốn theo dõi riêng
}, {
    tableName: 'order_items',
    timestamps: false, // Hoặc true nếu bạn muốn createdAt/updatedAt cho từng item
});

module.exports = OrderItem;