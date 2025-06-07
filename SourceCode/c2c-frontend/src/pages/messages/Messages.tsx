import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../../stores/authStore';
import { getConversations, getMessagesWithPartner, markConversationAsRead } from '../../services/messageService';
import type { Conversation, Message } from '../../services/messageService';
import { format, isToday, isYesterday } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Send, UserCircle, Search, ArrowLeft, Paperclip, MessageSquareDashed } from 'lucide-react';
import clsx from 'clsx';

const API_URL = 'http://localhost:3000';

// --- Helper Components ---

// Component hiển thị Avatar với trạng thái online (giả định)
const Avatar = ({ src, name, online = false }: { src: string | null, name: string, online?: boolean }) => (
    <div className="relative shrink-0">
        <img
            src={src ? `${API_URL}${src}` : `https://ui-avatars.com/api/?name=${name}&background=random&color=fff`}
            alt={name}
            className="w-12 h-12 rounded-full object-cover"
        />
        {online && <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-white" />}
    </div>
);

// Component hiển thị một cuộc trò chuyện trong danh sách
const ConversationItem = ({ conv, isSelected, onSelect }: { conv: Conversation, isSelected: boolean, onSelect: () => void }) => {
    const { user } = useAuthStore();
    const isLastMessageFromMe = conv.last_message_sender_id === Number(user?.id);
    const hasUnread = conv.unread_count > 0 && !isLastMessageFromMe;

    const formatDate = (date: string) => {
        const d = new Date(date);
        if (isToday(d)) return format(d, 'HH:mm');
        if (isYesterday(d)) return 'Hôm qua';
        return format(d, 'dd/MM/yy');
    };

    return (
        <div onClick={onSelect} className={clsx("flex items-center p-3 rounded-xl cursor-pointer transition-colors", isSelected ? 'bg-primary-100' : 'hover:bg-gray-100')}>
            <Avatar src={conv.partner_avatar_url} name={conv.partner_full_name} />
            <div className="flex-1 ml-4 overflow-hidden">
                <div className="flex justify-between items-center">
                    <p className="font-semibold text-gray-900 truncate">{conv.partner_full_name}</p>
                    <p className="text-xs text-gray-500 shrink-0 ml-2">{formatDate(conv.last_message_created_at)}</p>
                </div>
                <div className="flex justify-between items-start mt-0.5">
                    <p className={clsx("text-sm truncate", hasUnread ? "text-gray-800 font-bold" : "text-gray-500")}>
                        {isLastMessageFromMe && <span className="text-gray-500">Bạn: </span>}
                        {conv.last_message_content}
                    </p>
                    {hasUnread && (
                        <span className="bg-primary-600 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center shrink-0 ml-2 mt-0.5">
                            {conv.unread_count}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---
const MessagesPage = () => {
    const { user, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    
    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Lấy danh sách cuộc trò chuyện
    const fetchConvos = async () => {
        setIsLoadingConversations(true);
        try {
            const data = await getConversations();
            setConversations(data.conversations);
            return data.conversations; // Trả về để xử lý tiếp
        } catch (error) {
            console.error("Failed to fetch conversations", error);
            return [];
        } finally {
            setIsLoadingConversations(false);
        }
    };
    
    // Xử lý khi chọn một cuộc trò chuyện
    const handleSelectConversation = async (conv: Conversation) => {
        if (activeConversation?.partner_id === conv.partner_id) return;
        
        setIsLoadingMessages(true);
        setActiveConversation(conv);
        try {
            const data = await getMessagesWithPartner(Number(conv.partner_id));
            setMessages(data.messages);
            if (conv.unread_count > 0) {
                await markConversationAsRead(Number(conv.partner_id));
                fetchConvos(); // Tải lại danh sách để cập nhật unread_count
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        } finally {
            setIsLoadingMessages(false);
        }
    };
    
    // Khởi tạo component
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/dang-nhap');
            return;
        }

        const initialize = async () => {
            const convos = await fetchConvos();
            const locationState = location.state as { sellerId?: string, sellerName?: string, sellerUsername?: string, productName?: string };

            if (locationState && locationState.sellerId) {
                const sellerIdNum = Number(locationState.sellerId);
                const existingConv = convos.find(c => c.partner_id === String(sellerIdNum));

                if (existingConv) {
                    handleSelectConversation(existingConv);
                } else {
                    const newConvPlaceholder: Conversation = {
                        partner_id: String(sellerIdNum),
                        partner_username: locationState.sellerUsername || locationState.sellerName || 'Người bán',
                        partner_full_name: locationState.sellerName || 'Người bán',
                        partner_avatar_url: null,
                        last_message_content: `Bắt đầu trò chuyện về sản phẩm: ${locationState.productName || ''}`,
                        last_message_sender_id: 0,
                        last_message_created_at: new Date().toISOString(),
                        unread_count: 0,
                    };
                    setActiveConversation(newConvPlaceholder);
                    setMessages([]);
                }
                navigate(location.pathname, { replace: true, state: {} });
            }
        };

        initialize();

    }, [isAuthenticated, navigate]);

    // Khởi tạo và dọn dẹp Socket.IO
    useEffect(() => {
        if (!user || !activeConversation) return;
        
        socketRef.current = io(API_URL);
        socketRef.current.emit('joinRoom', user.id);

        const handleNewMessage = (incomingMessage: Message) => {
            fetchConvos(); 
            if (incomingMessage.sender_id === activeConversation.partner_id || incomingMessage.receiver_id === activeConversation.partner_id) {
                setMessages(prev => [...prev, incomingMessage]);
            }
        };

        socketRef.current.on('newMessage', handleNewMessage);

        return () => {
            socketRef.current?.off('newMessage', handleNewMessage);
            socketRef.current?.disconnect();
        };
    }, [user, activeConversation]);

    // Cuộn xuống tin nhắn cuối cùng
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Gửi tin nhắn mới
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && activeConversation && user && socketRef.current) {
            socketRef.current.emit('privateMessage', {
                sender_id: Number(user.id),
                receiver_id: activeConversation.partner_id,
                content: newMessage,
            });
            setNewMessage('');
        }
    };
    
    return (
        <div className="h-full flex bg-white rounded-lg shadow-custom overflow-hidden">
            {/* Sidebar */}
            <aside className={clsx("w-full md:w-3/4 lg:w-1/4 border-r border-gray-200 flex flex-col bg-gray-50", activeConversation && 'hidden md:flex')}>
                <div className="p-4 border-b border-gray-200 sticky top-0 bg-gray-50 z-10">
                    <h2 className="text-xl font-bold">Tin nhắn</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {isLoadingConversations ? (
                       <p className="p-4 text-center text-gray-500">Đang tải danh sách...</p>
                    ) : conversations.length > 0 ? (
                        conversations.map(conv => (
                            <ConversationItem key={conv.partner_id} conv={conv} isSelected={activeConversation?.partner_id === conv.partner_id} onSelect={() => handleSelectConversation(conv)} />
                        ))
                    ) : (
                        <div className="text-center p-8 text-gray-500">
                           <MessageSquareDashed className="mx-auto h-12 w-12 text-gray-400"/>
                           <p className="mt-2">Chưa có cuộc trò chuyện nào.</p>
                        </div>
                    )}
                </div>
            </aside>
            
            {/* Main Chat Window */}
            <main className={clsx("flex-1 flex flex-col", !activeConversation && 'hidden md:flex')}>
                {activeConversation ? (
                    <>
                        <header className="flex items-center p-4 border-b border-gray-200 bg-white shadow-sm z-10">
                            <button onClick={() => setActiveConversation(null)} className="md:hidden mr-2 p-2 rounded-full hover:bg-gray-100"><ArrowLeft size={20}/></button>
                            <Avatar src={activeConversation.partner_avatar_url} name={activeConversation.partner_full_name} online />
                            <div className="ml-4">
                                <p className="font-semibold text-gray-900">{activeConversation.partner_full_name}</p>
                                <p className="text-xs text-green-600">Đang hoạt động</p>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-100">
                            {isLoadingMessages ? (
                                <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
                            ) : (
                                messages.map((msg) => (
                                    <div key={msg.id} className={clsx("flex items-end gap-3", msg.sender_id === (user?.id) ? 'justify-end' : 'justify-start')}>
                                        {msg.sender_id !== (user?.id) && <img src={msg.sender.avatar_url ? `${API_URL}${msg.sender.avatar_url}` : `https://ui-avatars.com/api/?name=${msg.sender.full_name}&background=random`} className="w-8 h-8 rounded-full self-start" alt={msg.sender.full_name} />}
                                        <div className={clsx("max-w-xs md:max-w-md lg:max-w-xl px-4 py-2.5 rounded-2xl", msg.sender_id === (user?.id) ? 'bg-primary-600 text-white rounded-br-lg' : 'bg-white text-gray-900 rounded-bl-lg shadow-sm')}>
                                            <p className="text-sm" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                             <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white flex items-center gap-3">
                            <button type="button" className="p-2 text-gray-500 hover:text-primary-600"><Paperclip size={22}/></button>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Nhập tin nhắn..."
                                className="input flex-1 bg-gray-100 focus:bg-white rounded-full px-4"
                                autoComplete="off"
                            />
                            <button type="submit" disabled={!newMessage.trim()} className="btn btn-primary rounded-full p-3 h-12 w-12 flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed">
                                <Send size={22}/>
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 bg-gray-100">
                        <MessageSquareDashed size={64} className="mb-4 text-gray-300" />
                        <h3 className="text-xl font-medium text-gray-700">Chào mừng đến với Trò chuyện</h3>
                        <p className="max-w-xs mt-1">Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MessagesPage;
