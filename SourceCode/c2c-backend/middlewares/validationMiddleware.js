const { body, param, validationResult } = require('express-validator');
const { Op } = require('sequelize');

const {
    Category,
    Store,
    OrderItem,
    Order,
    Dispute,
    User,
    Wallet,
    Product
} = require('../models');

// ... các hàm validation khác ...

exports.validatePayoutRequest = [
    body('amount').isFloat({ gt: 0 }).withMessage('Số tiền phải là một số lớn hơn 0.')
        .custom(async (value, { req }) => {
            const wallet = await Wallet.findOne({ where: { user_id: req.user.id } });
            if (!wallet || parseFloat(wallet.balance) < parseFloat(value)) {
                throw new Error('Số dư ví không đủ để thực hiện yêu cầu rút tiền.');
            }
            const MIN_WITHDRAWAL = process.env.MIN_WITHDRAWAL_AMOUNT || 50000;
            if (parseFloat(value) < MIN_WITHDRAWAL) {
                throw new Error(`Số tiền rút tối thiểu là ${parseFloat(MIN_WITHDRAWAL).toLocaleString('vi-VN')}đ.`);
            }
            return true;
        }),
    body('payout_info').isObject().withMessage('Thông tin thanh toán phải là một object.'),
    body('payout_info.bankName').trim().notEmpty().withMessage('Tên ngân hàng là bắt buộc.'),
    body('payout_info.accountNumber').trim().notEmpty().withMessage('Số tài khoản là bắt buộc.'),
    body('payout_info.accountName').trim().notEmpty().withMessage('Tên chủ tài khoản là bắt buộc.'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// **FIX**: Thay 'completed' bằng 'approved' trong danh sách các trạng thái hợp lệ
exports.validatePayoutProcess = [
    param('requestId').isInt({ gt: 0 }).withMessage('ID yêu cầu không hợp lệ.'),
    body('new_status').isIn(['approved', 'rejected']).withMessage('Trạng thái xử lý không hợp lệ.'),
    body('admin_notes').optional({ checkFalsy: true }).isString().trim()
        .isLength({ max: 1000 }).withMessage('Ghi chú của admin không quá 1000 ký tự.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        if (req.body.new_status === 'rejected' && (!req.body.admin_notes || req.body.admin_notes.trim() === '')) {
            return res.status(400).json({ errors: [{ path: 'admin_notes', msg: 'Ghi chú của admin là bắt buộc khi từ chối yêu cầu.'}] });
        }
        next();
    }
];

// ... các hàm validation còn lại ...
exports.validateProduct = [
    body('name').notEmpty().withMessage('Tên sản phẩm không được để trống')
        .isLength({ min: 5 }).withMessage('Tên sản phẩm phải có ít nhất 5 ký tự'),
    body('price').isNumeric().withMessage('Giá sản phẩm phải là số')
        .custom(value => parseFloat(value) > 0).withMessage('Giá sản phẩm phải lớn hơn 0'),
    body('category_id').isInt({ gt: 0 }).withMessage('ID danh mục không hợp lệ'),
    body('product_data').notEmpty().withMessage('Nội dung sản phẩm không được để trống'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

exports.validateOrderCreation = [
    body('items').isArray({ min: 1 }).withMessage('Đơn hàng phải có ít nhất 1 sản phẩm.'),
    body('items.*.product_id').isInt({ gt: 0 }).withMessage('ID sản phẩm không hợp lệ.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

exports.validateCategory = [
    body('name').trim().notEmpty().withMessage('Tên danh mục không được để trống.')
        .isLength({ min: 2, max: 100 }).withMessage('Tên danh mục phải từ 2 đến 100 ký tự.'),
    body('slug').optional({ checkFalsy: true }).trim().isSlug().withMessage('Slug không hợp lệ.')
        .isLength({ min: 2, max: 100 }).withMessage('Slug phải từ 2 đến 100 ký tự.'),
    body('parent_id').optional({ checkFalsy: true }).isInt({ gt: 0 }).withMessage('ID danh mục cha không hợp lệ.')
        .custom(async (value) => {
            if (value) {
                const parentCategory = await Category.findByPk(value);
                if (!parentCategory) {
                    throw new Error('Danh mục cha không tồn tại.');
                }
            }
            return true;
        }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

exports.validateStore = [
    body('store_name').trim().notEmpty().withMessage('Tên gian hàng không được để trống.')
        .isLength({ min: 3, max: 150 }).withMessage('Tên gian hàng phải từ 3 đến 150 ký tự.'),
    body('slug').optional({ checkFalsy: true }).trim().isSlug()
        .withMessage('Slug không hợp lệ (chỉ chứa chữ thường, số, dấu gạch ngang).')
        .isLength({ min: 3, max: 150 }).withMessage('Slug phải từ 3 đến 150 ký tự.'),
    body('description').optional({ checkFalsy: true }).trim()
        .isLength({ max: 5000 }).withMessage('Mô tả gian hàng không quá 5000 ký tự.'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

exports.validateReview = [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Điểm đánh giá phải từ 1 đến 5.'),
    body('comment').optional({ checkFalsy: true }).isString().trim()
        .isLength({ max: 1000 }).withMessage('Bình luận không quá 1000 ký tự.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

exports.validateDisputeCreation = [
    param('itemId').isInt({ gt: 0 }).withMessage('ID mục đơn hàng không hợp lệ.'),
    body('reason').trim().notEmpty().withMessage('Lý do khiếu nại không được để trống.')
        .isLength({ min: 20, max: 2000 }).withMessage('Lý do phải từ 20 đến 2000 ký tự.'),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const orderItem = await OrderItem.findByPk(req.params.itemId, { include: [{ model: Order, as: 'order' }] });
            if (!orderItem) return res.status(404).json({ message: 'Mục đơn hàng không tồn tại.' });
            if (orderItem.order.buyer_id !== req.user.id) return res.status(403).json({ message: 'Bạn không phải người mua của mục này.' });
            if (!['delivered', 'confirmed'].includes(orderItem.status)) {
                 return res.status(400).json({ message: `Chỉ có thể khiếu nại mục đã giao hoặc đã xác nhận. Trạng thái hiện tại: ${orderItem.status}`});
            }
            const existingDispute = await Dispute.findOne({ where: { order_item_id: req.params.itemId, status: {[Op.notIn]: ['closed', 'resolved_favor_seller', 'resolved_refund_buyer']}}});
            if(existingDispute) return res.status(400).json({ message: 'Đã có một khiếu nại đang mở cho mục đơn hàng này.'});
        } catch(e) {
            console.error("Validation error in validateDisputeCreation:", e);
            return res.status(500).json({message: "Lỗi kiểm tra dữ liệu khiếu nại."});
        }
        next();
    }
];

exports.validateDisputeResponse = [
    param('disputeId').isInt({ gt: 0 }).withMessage('ID khiếu nại không hợp lệ.'),
    body('response_message').trim().notEmpty().withMessage('Nội dung phản hồi không được để trống.')
        .isLength({ min: 10, max: 2000 }).withMessage('Phản hồi phải từ 10 đến 2000 ký tự.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

exports.validateDisputeResolution = [
    param('disputeId').isInt({ gt: 0 }).withMessage('ID khiếu nại không hợp lệ.'),
    body('new_status').isIn(['resolved_refund_buyer', 'resolved_favor_seller', 'closed']).withMessage('Trạng thái giải quyết không hợp lệ.'),
    body('resolution_notes').trim().notEmpty().withMessage('Ghi chú giải quyết không được để trống.')
        .isLength({min: 10, max: 2000}).withMessage('Ghi chú giải quyết phải từ 10 đến 2000 ký tự.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

exports.validateSendMessage = [
    body('receiver_id').isInt({ gt: 0 }).withMessage('ID người nhận không hợp lệ.')
        .custom(async (value, { req }) => {
            if (value === req.user.id) {
                throw new Error('Bạn không thể gửi tin nhắn cho chính mình.');
            }
            const receiver = await User.findByPk(value);
            if (!receiver) {
                throw new Error('Người nhận không tồn tại.');
            }
            return true;
        }),
    body('content').trim().notEmpty().withMessage('Nội dung tin nhắn không được để trống.')
        .isLength({ min: 1, max: 5000 }).withMessage('Nội dung tin nhắn phải từ 1 đến 5000 ký tự.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

exports.validateUserUpdateAdmin = [
    param('userId').isInt({ gt: 0 }).withMessage('User ID không hợp lệ.'),
    body('role').optional().isIn(['buyer', 'seller', 'admin']).withMessage('Vai trò không hợp lệ.'),
    body('status').optional().isIn(['pending_verification', 'active', 'suspended']).withMessage('Trạng thái không hợp lệ.'),
    body('full_name').optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage('Họ tên không hợp lệ.'),
    body('phone_number').optional({checkFalsy: true}).isString().trim().isMobilePhone('vi-VN').withMessage('Số điện thoại không hợp lệ.'),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const user = await User.findByPk(req.params.userId);
            if (!user) {
                return res.status(404).json({message: "Người dùng không tồn tại."});
            }
            req.targetUser = user;
        } catch(e) {
            console.error("Validation error in validateUserUpdateAdmin:", e);
             return res.status(500).json({message: "Lỗi khi kiểm tra người dùng."});
        }
        next();
    }
];

exports.validateProductStatusUpdate = [
    param('productId').isInt({ gt: 0 }).withMessage('Product ID không hợp lệ.'),
    body('status').isIn(['available', 'rejected', 'delisted', 'pending_approval']).withMessage('Trạng thái sản phẩm không hợp lệ.'),
    body('admin_notes').optional({checkFalsy: true}).isString().trim().isLength({max: 1000}).withMessage('Ghi chú của admin không quá 1000 ký tự.'),
    async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        if (req.body.status === 'rejected' && (!req.body.admin_notes || req.body.admin_notes.trim() === '')) {
            return res.status(400).json({ errors: [{ path: 'admin_notes', msg: 'Ghi chú của admin là bắt buộc khi từ chối sản phẩm.'}] });
        }
        try {
            const product = await Product.findByPk(req.params.productId);
            if (!product) {
                return res.status(404).json({message: "Sản phẩm không tồn tại."});
            }
            req.targetProduct = product;
        } catch(e) {
            console.error("Validation error in validateProductStatusUpdate:", e);
             return res.status(500).json({message: "Lỗi khi kiểm tra sản phẩm."});
        }
        next();
    }
];

exports.validateProductUpdate = [
    body('name').optional().notEmpty().withMessage('Tên sản phẩm không được để trống')
        .isLength({ min: 5 }).withMessage('Tên sản phẩm phải có ít nhất 5 ký tự'),
    body('price').optional().isNumeric().withMessage('Giá sản phẩm phải là số')
        .custom(value => parseFloat(value) > 0).withMessage('Giá sản phẩm phải lớn hơn 0'),
    body('category_id').optional().isInt({ gt: 0 }).withMessage('ID danh mục không hợp lệ'),
    body('product_data').optional().notEmpty().withMessage('Nội dung sản phẩm không được để trống nếu được cung cấp'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
