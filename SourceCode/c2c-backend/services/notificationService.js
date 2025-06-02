const { Notification } = require('../models');
// const { io } = require('../server'); // Giả sử bạn export 'io' từ server.js để dùng real-time

async function createNotification({
    recipientId,
    type,
    message,
    title = null,
    link = null,
    relatedEntityType = null,
    relatedEntityId = null,
    // senderId = null, // Nếu có trường sender_id
    // ioInstance = null // Truyền io instance nếu không muốn import trực tiếp
}) {
    try {
        if (!recipientId || !type || !message) {
            console.error('Thiếu thông tin bắt buộc để tạo thông báo:', { recipientId, type, message });
            return null;
        }

        const notificationData = {
            user_id: recipientId,
            type,
            message,
            title,
            link,
            related_entity_type: relatedEntityType,
            related_entity_id: relatedEntityId,
            // sender_id: senderId,
        };

        const newNotification = await Notification.create(notificationData);

        // Gửi thông báo real-time qua Socket.IO
        // Cần có cách lấy io instance một cách an toàn. Ví dụ, truyền vào từ app context
        // Hoặc nếu server.js export io:
        const io = require('../server').io; // Cẩn thận với circular dependencies nếu server.js import service này
                                           // Cách tốt hơn là app.set('socketio', io) và req.app.get('socketio') trong controller
                                           // Hoặc service này không trực tiếp dùng io, mà trả về event để controller/task khác emit

        if (io) {
             // Lấy thông tin chi tiết hơn cho payload của socket nếu cần
            const socketPayload = {
                id: newNotification.id,
                type: newNotification.type,
                title: newNotification.title,
                message: newNotification.message,
                link: newNotification.link,
                is_read: newNotification.is_read,
                createdAt: newNotification.createdAt,
                // Thêm thông tin người gửi, entity liên quan nếu cần cho UI
            };
            io.to(`user_${recipientId}`).emit('new_notification', socketPayload);
            io.to(`user_${recipientId}`).emit('unread_notifications_count_update'); // Trigger update count
        } else {
            console.warn("Socket.IO instance is not available in notificationService.");
        }


        return newNotification;
    } catch (error) {
        console.error('Lỗi khi tạo thông báo:', error);
        return null;
    }
}

module.exports = { createNotification };