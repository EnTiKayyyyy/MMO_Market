// src/models/index.js
const User = require('./User');
const Category = require('./Category');
const SellerProfile = require('./SellerProfile');
const Product = require('./Product');
const ProductItem = require('./ProductItem');
const Cart = require('./Cart'); // Sẽ import sau
const CartItem = require('./CartItem'); // Sẽ import sau
const Order = require('./Order'); // Sẽ import sau
const OrderItem = require('./OrderItem'); // Sẽ import sau
const Transaction = require('./Transaction'); // Sẽ import sau

// Định nghĩa Associations
// User - SellerProfile (1-1)
User.hasOne(SellerProfile, { foreignKey: 'user_id', onDelete: 'CASCADE' }); // Nếu user bị xóa, profile seller cũng bị xóa
SellerProfile.belongsTo(User, { foreignKey: 'user_id' });

// SellerProfile - Product (1-N)
SellerProfile.hasMany(Product, { foreignKey: 'seller_id', as: 'products', onDelete: 'RESTRICT' }); // Không xóa seller nếu còn sản phẩm
Product.belongsTo(SellerProfile, { foreignKey: 'seller_id', as: 'seller' }); // Alias 'seller' để dễ include

// Category - Product (1-N)
Category.hasMany(Product, { foreignKey: 'category_id', as: 'products', onDelete: 'RESTRICT' }); // Không xóa category nếu còn sản phẩm
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' }); // Alias 'category' để dễ include

// Product - ProductItem (1-N)
Product.hasMany(ProductItem, { foreignKey: 'product_id', as: 'items', onDelete: 'CASCADE' }); // Xóa template sản phẩm sẽ xóa các ProductItem cụ thể
ProductItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// SellerProfile - ProductItem (1-N) - Redundant FK nhưng hữu ích cho truy vấn
SellerProfile.hasMany(ProductItem, { foreignKey: 'seller_id', as: 'productItems', onDelete: 'RESTRICT' }); // Không xóa seller nếu còn ProductItem
ProductItem.belongsTo(SellerProfile, { foreignKey: 'seller_id', as: 'seller' });

// User - Cart (1-1)
User.hasOne(Cart, { foreignKey: 'user_id', as: 'cart', onDelete: 'CASCADE' }); // Xóa user sẽ xóa giỏ hàng
Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Cart - CartItem (1-N)
Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items', onDelete: 'CASCADE' }); // Xóa giỏ hàng sẽ xóa các mục trong giỏ
CartItem.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });

// CartItem - Product (1-1)
CartItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' }); // Mỗi CartItem liên kết với một Product template
// User - Order (1-N)
User.hasMany(Order, { foreignKey: 'user_id', as: 'orders', onDelete: 'RESTRICT' }); // Không xóa user nếu còn đơn hàng
Order.belongsTo(User, { foreignKey: 'user_id', as: 'buyer' });

// Order - OrderItem (1-N)
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' }); // Xóa order sẽ xóa các mục trong đơn hàng
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// OrderItem - Product (1-1) // Quan hệ OrderItem với template sản phẩm
OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// OrderItem - SellerProfile (1-1) // Quan hệ OrderItem với người bán của sản phẩm đó
OrderItem.belongsTo(SellerProfile, { foreignKey: 'seller_id', as: 'seller' });

// OrderItem - ProductItem (1-1) // Quan hệ OrderItem với đơn vị sản phẩm cụ thể đã bán
OrderItem.belongsTo(ProductItem, { foreignKey: 'product_item_id', as: 'productItem' });
// Ngược lại từ ProductItem cũng cần association (tùy chọn, OrderItem là bảng chính)
ProductItem.hasOne(OrderItem, { foreignKey: 'product_item_id', as: 'orderItem' }); // Đảm bảo 1 ProductItem chỉ gắn với 1 OrderItem


// Order - Transaction (1-1)
Order.hasOne(Transaction, { foreignKey: 'order_id', as: 'transaction', onDelete: 'SET NULL' }); // Xóa Order, transaction_id trong Transactions sẽ set NULL
Transaction.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });


// Định nghĩa các associations khác khi tạo các models tương ứng:
// User <-> Cart (1-1)
// Cart <-> CartItem (1-N)
// CartItem <-> Product (1-1)
// User <-> Order (1-N)
// Order <-> OrderItem (1-N)
// Order <-> Transaction (1-1)
// OrderItem <-> Product (1-1)
// OrderItem <-> ProductItem (1-1) -> ProductItem.belongsTo(OrderItem, { foreignKey: 'order_item_id', as: 'orderItem' }); OrderItem.hasOne(ProductItem, { foreignKey: 'order_item_id', as: 'productItem' });
// ProductItem <-> OrderItem (FK already defined in ProductItem)


module.exports = {
  User,
  Category,
  SellerProfile,
  Product,
  ProductItem,
  Cart, // Export Cart
  CartItem, // Export CartItem
  Order, // Export Order
  OrderItem, // Export OrderItem
  Transaction,
};