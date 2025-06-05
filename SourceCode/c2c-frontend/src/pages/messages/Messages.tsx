import { useState } from 'react';
import { Search, Send } from 'lucide-react';

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    lastSeen?: string;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    isRead: boolean;
  };
  unreadCount: number;
}

const Messages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      user: {
        id: '101',
        name: 'Nguyễn Văn A',
        lastSeen: '2 phút trước'
      },
      lastMessage: {
        content: 'Sản phẩm còn hàng không bạn?',
        timestamp: '10:30',
        isRead: false
      },
      unreadCount: 1
    },
    {
      id: '2',
      user: {
        id: '102',
        name: 'Trần Thị B',
        lastSeen: 'Đang hoạt động'
      },
      lastMessage: {
        content: 'Cảm ơn bạn đã mua hàng!',
        timestamp: '09:15',
        isRead: true
      },
      unreadCount: 0
    }
  ]);

  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Giả lập gửi tin nhắn
    const message: Message = {
      id: Date.now().toString(),
      sender: {
        id: 'current-user',
        name: 'Tôi'
      },
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  return (
    <div className="h-[calc(100vh-200px)] bg-white rounded-lg shadow-custom overflow-hidden">
      <div className="grid grid-cols-12 h-full">
        {/* Conversation List */}
        <div className="col-span-4 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm tin nhắn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </div>

          <div className="overflow-y-auto h-[calc(100%-73px)]">
            {conversations.map(conversation => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={`p-4 hover:bg-gray-50 cursor-pointer ${
                  selectedConversation === conversation.id ? 'bg-gray-50' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      {conversation.user.avatar ? (
                        <img
                          src={conversation.user.avatar}
                          alt={conversation.user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-500 text-lg font-medium">
                          {conversation.user.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    {conversation.user.lastSeen === 'Đang hoạt động' && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-success-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">
                        {conversation.user.name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {conversation.lastMessage.timestamp}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage.content}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-primary-600 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="col-span-8 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-500 text-lg font-medium">
                      {conversations.find(c => c.id === selectedConversation)?.user.name.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      {conversations.find(c => c.id === selectedConversation)?.user.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {conversations.find(c => c.id === selectedConversation)?.user.lastSeen}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender.id === 'current-user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        message.sender.id === 'current-user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <span className="text-xs opacity-75 mt-1 block">
                        {message.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="input flex-1"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="btn btn-primary p-2"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Chọn một cuộc trò chuyện để bắt đầu
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;