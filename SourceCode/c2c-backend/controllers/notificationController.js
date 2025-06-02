const { Notification } = require('../models');
const { Op } = require('sequelize');

// @desc    Lấy danh sách thông báo của người dùng hiện tại
exports.getMyNotifications = async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 10, is_read } = req.query; // Lọc theo is_read nếu có
    const offset = (page - 1) * limit;

    try {
        let whereClause = { user_id: userId };
        if (is_read !== undefined) { // Lọc theo trạng thái đọc/chưa đọc
            whereClause.is_read = (is_read === 'true' || is_read === '1');
        }

        const notifications = await Notification.findAndCountAll({
            where: whereClause,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json({
            totalItems: notifications.count,
            totalPages: Math.ceil(notifications.count / limit),
            currentPage: parseInt(page),
            limit: parseInt(limit),
            notifications: notifications.rows
        });
    } catch (error) {
        console.error('Lỗi lấy thông báo:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// @desc    Lấy số lượng thông báo chưa đọc
exports.getUnreadCount = async (req, res) => {
    const userId = req.user.id;
    try {
        const count = await Notification.count({
            where: {
                user_id: userId,
                is_read: false
            }
        });
        res.json({ unreadCount: count });
    } catch (error) {
        console.error('Lỗi đếm thông báo chưa đọc:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// @desc    Đánh dấu một thông báo cụ thể là đã đọc
exports.markNotificationAsRead = async (req, res) => {
    const userId = req.user.id;
    const { notificationId } = req.params;

    try {
        const notification = await Notification.findOne({
            where: { id: notificationId, user_id: userId }
        });

        if (!notification) {
            return res.status(404).json({ message: 'Thông báo không tìm thấy hoặc bạn không có quyền.' });
        }

        if (!notification.is_read) {
            notification.is_read = true;
            notification.read_at = new Date();
            await notification.save();
        }
        // TODO: Emit socket event để cập nhật unread_notifications_count_update cho client
        const io = req.app.get('socketio');
        if (io) io.to(`user_${userId}`).emit('unread_notifications_count_update');

        res.json({ message: 'Thông báo đã được đánh dấu là đã đọc.', notification });
    } catch (error) {
        console.error('Lỗi đánh dấu đã đọc:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// @desc    Đánh dấu tất cả thông báo chưa đọc là đã đọc
exports.markAllNotificationsAsRead = async (req, res) => {
    const userId = req.user.id;
    try {
        const [affectedCount] = await Notification.update(
            { is_read: true, read_at: new Date() },
            {
                where: {
                    user_id: userId,
                    is_read: false
                }
            }
        );
        // TODO: Emit socket event để cập nhật unread_notifications_count_update cho client
        const io = req.app.get('socketio');
        if (io) io.to(`user_${userId}`).emit('unread_notifications_count_update');

        res.json({ message: `Đã đánh dấu ${affectedCount} thông báo là đã đọc.`, count: affectedCount });
    } catch (error) {
        console.error('Lỗi đánh dấu tất cả đã đọc:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

/* // @desc (Tùy chọn) Xóa một thông báo
exports.deleteNotification = async (req, res) => {
    const userId = req.user.id;
    const { notificationId } = req.params;
    try {
        const notification = await Notification.findOne({
            where: { id: notificationId, user_id: userId }
        });
        if (!notification) {
            return res.status(404).json({ message: 'Thông báo không tìm thấy hoặc bạn không có quyền.' });
        }
        await notification.destroy();
        // TODO: Emit socket event để cập nhật unread_notifications_count_update cho client
        const io = req.app.get('socketio');
        if(io) io.to(`user_${userId}`).emit('unread_notifications_count_update');

        res.json({ message: 'Thông báo đã được xóa.' });
    } catch (error) {
        console.error('Lỗi xóa thông báo:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};
*/