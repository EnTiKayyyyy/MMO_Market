const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    sender_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'users', // Tên bảng users
            key: 'id'
        }
    },
    receiver_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
            model: 'users', // Tên bảng users
            key: 'id'
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    is_read: {
        type: DataTypes.BOOLEAN, // TINYINT(1) trong MySQL thường map sang Boolean
        allowNull: false,
        defaultValue: false,
    },
    // Sequelize tự động thêm createdAt
}, {
    tableName: 'messages',
    timestamps: true, // Sẽ tự thêm createdAt và updatedAt
    updatedAt: false, // Thường không cần updatedAt cho tin nhắn
});

module.exports = Message;