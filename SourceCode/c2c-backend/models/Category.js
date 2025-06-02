const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    slug: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    parent_id: { // ID của danh mục cha
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: {
            model: 'categories', // Tên bảng
            key: 'id'
        }
    }
}, {
    tableName: 'categories',
    timestamps: true,
});

module.exports = Category;