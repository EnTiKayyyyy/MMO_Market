const sequelize = require('../config/database');
const User = require('./User');
const Product = require('./Product');
const Category = require('./Category');
const Store = require('./Store');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Review = require('./Review');
const Dispute = require('./Dispute');
const Message = require('./Message');
const SellerWallet = require('./SellerWallet');
const PayoutRequest = require('./PayoutRequest');
const Transaction = require('./Transaction');
const Notification = require('./Notification');

const db = {};

db.Sequelize = sequelize.Sequelize;
db.sequelize = sequelize;

// Gán các model vào đối tượng db
db.User = User;
db.Product = Product;
db.Category = Category;
db.Store = Store;
db.Order = Order;
db.OrderItem = OrderItem;
db.Review = Review;
db.Dispute = Dispute;
db.Message = Message;
db.SellerWallet = SellerWallet;
db.PayoutRequest = PayoutRequest;
db.Transaction = Transaction;
db.Notification = Notification;

// --- Định nghĩa các mối quan hệ một cách có tổ chức ---

// User associations
User.hasOne(db.Store, { foreignKey: 'user_id', as: 'store', onDelete: 'CASCADE' });
User.hasMany(db.Product, { foreignKey: 'seller_id', as: 'products', onDelete: 'CASCADE' }); // User (seller) can have many products
User.hasMany(db.Order, { foreignKey: 'buyer_id', as: 'orders', onDelete: 'SET NULL' }); // User (buyer) can have many orders
User.hasMany(db.Review, { foreignKey: 'reviewer_id', as: 'reviewsGiven', onDelete: 'CASCADE' });
User.hasMany(db.Review, { foreignKey: 'seller_id', as: 'productReviewsReceived', onDelete: 'CASCADE' }); // Reviews for products sold by this user
User.hasMany(db.Dispute, { foreignKey: 'complainant_id', as: 'disputesOpened', onDelete: 'CASCADE' });
User.hasMany(db.Dispute, { foreignKey: 'defendant_id', as: 'disputesAgainst', onDelete: 'CASCADE' });
User.hasMany(db.Dispute, { foreignKey: 'admin_id', as: 'disputesResolved', onDelete: 'SET NULL' });
User.hasMany(db.Message, { foreignKey: 'sender_id', as: 'sentMessages', onDelete: 'CASCADE' });
User.hasMany(db.Message, { foreignKey: 'receiver_id', as: 'receivedMessages', onDelete: 'CASCADE' });
User.hasOne(db.SellerWallet, { foreignKey: 'seller_id', as: 'wallet', onDelete: 'CASCADE' });
User.hasMany(db.PayoutRequest, { foreignKey: 'seller_id', as: 'payoutRequests', onDelete: 'CASCADE' }); // << Chỉ một định nghĩa này cho payoutRequests của User (seller)
User.hasMany(db.Transaction, { foreignKey: 'user_id', as: 'transactions', onDelete: 'SET NULL' });
User.hasMany(db.Notification, { foreignKey: 'user_id', as: 'notifications', onDelete: 'CASCADE' });
User.hasMany(db.OrderItem, { foreignKey: 'seller_id', as: 'soldOrderItems' }); // User (seller) can have many sold order items

// Store associations
Store.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });

// Product associations
Product.belongsTo(db.User, { foreignKey: 'seller_id', as: 'seller' });
Product.belongsTo(db.Category, { foreignKey: 'category_id', as: 'category' });
Product.hasMany(db.OrderItem, { foreignKey: 'product_id', as: 'orderItems', onDelete: 'RESTRICT' });
Product.hasMany(db.Review, { foreignKey: 'product_id', as: 'reviews', onDelete: 'CASCADE' });

// Category associations
Category.hasMany(db.Product, { foreignKey: 'category_id', as: 'products', onDelete: 'SET NULL' });
Category.hasMany(db.Category, { as: 'subCategories', foreignKey: 'parent_id', onDelete: 'SET NULL' });
Category.belongsTo(db.Category, { as: 'parentCategory', foreignKey: 'parent_id' });

// Order associations
Order.belongsTo(db.User, { foreignKey: 'buyer_id', as: 'buyer' });
Order.hasMany(db.OrderItem, { foreignKey: 'order_id', as: 'items', onDelete: 'CASCADE' });

// OrderItem associations
OrderItem.belongsTo(db.Order, { foreignKey: 'order_id', as: 'order' });
OrderItem.belongsTo(db.Product, { foreignKey: 'product_id', as: 'product' });
OrderItem.belongsTo(db.User, { foreignKey: 'seller_id', as: 'seller' }); // Liên kết OrderItem với người bán sản phẩm đó
OrderItem.hasOne(db.Review, { foreignKey: 'order_item_id', as: 'review', onDelete: 'CASCADE' });
OrderItem.hasMany(db.Dispute, { foreignKey: 'order_item_id', as: 'disputes', onDelete: 'CASCADE' });
OrderItem.hasMany(db.Transaction, { foreignKey: 'order_item_id', as: 'transactions', onDelete: 'SET NULL' });


// Review associations
Review.belongsTo(db.OrderItem, { foreignKey: 'order_item_id', as: 'orderItem' });
Review.belongsTo(db.User, { foreignKey: 'reviewer_id', as: 'reviewer' });
Review.belongsTo(db.User, { foreignKey: 'seller_id', as: 'sellerOfProduct' }); // Seller của sản phẩm được review
Review.belongsTo(db.Product, { foreignKey: 'product_id', as: 'product' });

// Dispute associations
Dispute.belongsTo(db.OrderItem, { foreignKey: 'order_item_id', as: 'orderItem' });
Dispute.belongsTo(db.User, { foreignKey: 'complainant_id', as: 'complainant' });
Dispute.belongsTo(db.User, { foreignKey: 'defendant_id', as: 'defendant' });
Dispute.belongsTo(db.User, { foreignKey: 'admin_id', as: 'resolvedByAdmin' });

// Message associations
Message.belongsTo(db.User, { foreignKey: 'sender_id', as: 'sender' });
Message.belongsTo(db.User, { foreignKey: 'receiver_id', as: 'receiver' });

// SellerWallet associations
SellerWallet.belongsTo(db.User, { foreignKey: 'seller_id', as: 'seller' });

// PayoutRequest associations
PayoutRequest.belongsTo(db.User, { foreignKey: 'seller_id', as: 'seller' });
PayoutRequest.hasMany(db.Transaction, { foreignKey: 'payout_request_id', as: 'payoutTransactions', onDelete: 'SET NULL'}); // Một yêu cầu rút tiền có thể có nhiều giao dịch liên quan (ví dụ: ghi nợ ví, xác nhận hoàn thành)

// Transaction associations
Transaction.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
Transaction.belongsTo(db.OrderItem, { foreignKey: 'order_item_id', as: 'orderItem' });
Transaction.belongsTo(db.PayoutRequest, { foreignKey: 'payout_request_id', as: 'payoutRequest' });

// Notification associations
Notification.belongsTo(db.User, { foreignKey: 'user_id', as: 'recipient' });
// Nếu bạn có sender_id trong Notification:
// Notification.belongsTo(db.User, { foreignKey: 'sender_id', as: 'sender' });


module.exports = db;