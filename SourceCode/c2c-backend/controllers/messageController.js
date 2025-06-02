const { Message, User, sequelize } = require('../models');
const { Op } = require('sequelize');

// @desc    Gửi tin nhắn mới
exports.sendMessage = async (req, res) => {
    const { receiver_id, content } = req.body;
    const sender_id = req.user.id;

    try {
        // Validation receiver_id và không gửi cho chính mình đã được xử lý trong middleware
        const newMessage = await Message.create({
            sender_id,
            receiver_id,
            content
        });

        // TODO (Real-time): Emit message to receiver_id via WebSockets (e.g., Socket.IO)
        // Ví dụ: req.io.to(`user_${receiver_id}`).emit('newMessage', newMessage);

        res.status(201).json({ message: 'Tin nhắn đã được gửi.', sentMessage: newMessage });
    } catch (error) {
        console.error('Lỗi gửi tin nhắn:', error);
        res.status(500).json({ message: 'Lỗi server khi gửi tin nhắn.', error: error.message });
    }
};

// @desc    Lấy danh sách các cuộc trò chuyện (partners) và tin nhắn mới nhất
exports.getConversations = async (req, res) => {
    const userId = req.user.id;
    const { page = 1, limit = 15 } = req.query;
    const offset = (page - 1) * limit;

    try {
        // Lấy tất cả các partner_id mà người dùng hiện tại đã nhắn tin cùng
        // Đây là một truy vấn phức tạp để lấy distinct partners và tin nhắn cuối cùng + số tin chưa đọc
        const query = `
            SELECT
                partner.id as partner_id,
                partner.username as partner_username,
                partner.full_name as partner_full_name,
                partner.avatar_url as partner_avatar_url,
                m.id as last_message_id,
                m.content as last_message_content,
                m.sender_id as last_message_sender_id,
                m.created_at as last_message_created_at,
                m.is_read as last_message_is_read_by_me, /* is_read của tin nhắn cuối cùng mà TÔI là người nhận */
                (SELECT COUNT(*) FROM messages sub_m WHERE sub_m.sender_id = partner.id AND sub_m.receiver_id = :userId AND sub_m.is_read = 0) as unread_count
            FROM (
                SELECT DISTINCT
                    CASE
                        WHEN sender_id = :userId THEN receiver_id
                        ELSE sender_id
                    END as partner_user_id,
                    MAX(created_at) as max_created_at
                FROM messages
                WHERE sender_id = :userId OR receiver_id = :userId
                GROUP BY partner_user_id
            ) AS conversations
            INNER JOIN messages m ON (
                (m.sender_id = :userId AND m.receiver_id = conversations.partner_user_id) OR
                (m.sender_id = conversations.partner_user_id AND m.receiver_id = :userId)
            ) AND m.created_at = conversations.max_created_at
            INNER JOIN users partner ON partner.id = conversations.partner_user_id
            ORDER BY m.created_at DESC
            LIMIT :limit OFFSET :offset;
        `;

        const conversationsList = await sequelize.query(query, {
            replacements: { userId: userId, limit: parseInt(limit), offset: parseInt(offset) },
            type: sequelize.QueryTypes.SELECT
        });

        // Lấy tổng số conversation để phân trang (cần một query khác đơn giản hơn để count)
        const countQuery = `
            SELECT COUNT(DISTINCT CASE WHEN sender_id = :userId THEN receiver_id ELSE sender_id END) as total_conversations
            FROM messages
            WHERE sender_id = :userId OR receiver_id = :userId;
        `;
        const totalResult = await sequelize.query(countQuery, {
            replacements: { userId: userId },
            type: sequelize.QueryTypes.SELECT
        });
        const totalItems = totalResult[0] ? totalResult[0].total_conversations : 0;


        res.json({
            totalItems: parseInt(totalItems),
            totalPages: Math.ceil(totalItems / limit),
            currentPage: parseInt(page),
            conversations: conversationsList
        });

    } catch (error) {
        console.error('Lỗi lấy danh sách cuộc trò chuyện:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// @desc    Lấy lịch sử tin nhắn với một người dùng cụ thể
exports.getMessagesWithPartner = async (req, res) => {
    const userId = req.user.id;
    const partnerId = parseInt(req.params.partnerId);
    const { page = 1, limit = 20 } = req.query; // Số lượng tin nhắn mỗi trang
    const offset = (page - 1) * limit;

    if (isNaN(partnerId) || partnerId <=0) {
        return res.status(400).json({message: "Partner ID không hợp lệ."});
    }

    try {
        const messages = await Message.findAndCountAll({
            where: {
                [Op.or]: [
                    { sender_id: userId, receiver_id: partnerId },
                    { sender_id: partnerId, receiver_id: userId }
                ]
            },
            include: [
                { model: User, as: 'sender', attributes: ['id', 'username', 'avatar_url'] },
                { model: User, as: 'receiver', attributes: ['id', 'username', 'avatar_url'] }
            ],
            order: [['createdAt', 'DESC']], // Lấy tin nhắn mới nhất trước cho phân trang ngược
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        // Đảo ngược lại để hiển thị theo thứ tự thời gian cũ -> mới trên UI
        const orderedMessages = messages.rows.reverse();

        res.json({
            totalItems: messages.count,
            totalPages: Math.ceil(messages.count / limit),
            currentPage: parseInt(page),
            messages: orderedMessages
        });
    } catch (error) {
        console.error('Lỗi lấy lịch sử tin nhắn:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// @desc    Đánh dấu các tin nhắn từ một partner là đã đọc
exports.markConversationAsRead = async (req, res) => {
    const userId = req.user.id; // Người nhận
    const partnerId = parseInt(req.params.partnerId); // Người gửi (partner)

    if (isNaN(partnerId) || partnerId <=0) {
        return res.status(400).json({message: "Partner ID không hợp lệ."});
    }

    try {
        const [affectedCount] = await Message.update(
            { is_read: true },
            {
                where: {
                    receiver_id: userId,
                    sender_id: partnerId,
                    is_read: false
                }
            }
        );
        // TODO (Real-time): Gửi thông báo "đã đọc" cho partnerId qua WebSockets nếu cần

        res.json({ message: `Đã đánh dấu ${affectedCount} tin nhắn là đã đọc.`, count: affectedCount });
    } catch (error) {
        console.error('Lỗi đánh dấu đã đọc:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};