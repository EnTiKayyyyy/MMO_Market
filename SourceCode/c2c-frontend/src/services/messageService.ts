import api from '../api';

// Định nghĩa kiểu dữ liệu cho một cuộc trò chuyện
export interface Conversation {
  partner_id: string;
  partner_username: string;
  partner_full_name: string;
  partner_avatar_url: string | null;
  last_message_content: string;
  last_message_sender_id: number;
  last_message_created_at: string;
  unread_count: number;
}

// Định nghĩa kiểu dữ liệu cho một tin nhắn
export interface Message {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    avatar_url: string | null;
    full_name: string;
  };
}

/**
 * Lấy danh sách các cuộc trò chuyện của người dùng hiện tại.
 */
export const getConversations = async (page = 1, limit = 20): Promise<{ conversations: Conversation[], totalPages: number }> => {
  const response = await api.get('/messages/conversations', {
    params: { page, limit },
  });
  return response.data;
};

/**
 * Lấy lịch sử tin nhắn với một người dùng khác.
 */
export const getMessagesWithPartner = async (partnerId: number, page = 1, limit = 30): Promise<{ messages: Message[], totalPages: number }> => {
  const response = await api.get(`/messages/conversation/${partnerId}`, {
    params: { page, limit },
  });
  return response.data;
};

/**
 * Gửi một tin nhắn mới.
 * Lưu ý: Việc gửi real-time được xử lý qua Socket.IO, hàm này chỉ để lưu vào DB.
 */
export const sendMessage = async (receiverId: number, content: string): Promise<any> => {
  const response = await api.post('/messages', {
    receiver_id: receiverId,
    content,
  });
  return response.data;
};

/**
 * Đánh dấu tất cả tin nhắn từ một người dùng là đã đọc.
 */
export const markConversationAsRead = async (partnerId: number): Promise<any> => {
  const response = await api.put(`/messages/conversation/${partnerId}/read`);
  return response.data;
};
