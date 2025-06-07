import api from '../api';
import { useAuthStore } from '../stores/authStore';

// Định nghĩa các kiểu dữ liệu trả về từ API của seller
export interface SellerProduct {
    id: string;
    name: string;
    price: string;
    status: 'pending_approval' | 'available' | 'sold' | 'delisted';
    createdAt: string;
    // Các trường này có thể không có sẵn trong mọi API call, cần có giá trị mặc định
    thumbnail?: string; 
    category?: { name: string };
    soldCount?: number; // Backend chưa có, tạm để
}

export interface SellerOrder {
    id: number;
    createdAt: string;
    status: string;
    total_amount: string;
    buyer: {
        id: number;
        username: string;
        full_name: string;
    };
    items: {
        id: number;
        product: {
            id: number;
            name: string;
            thumbnail_url: string;
        };
        price: string;
        status: string;
    }[];
}

export interface SellerWallet {
    id: number;
    user_id: number;
    balance: string;
}

export interface PayoutRequest {
    id: number;
    amount: string;
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    payout_info: string; // Đây là chuỗi JSON từ backend
    createdAt: string;
    processed_at: string | null;
}

/**
 * Lấy danh sách sản phẩm của người bán hiện tại.
 * Backend route /api/products có hỗ trợ lọc theo sellerId.
 */
export const getMyProducts = async (params: { page?: number; limit?: number; status?: string; search?: string } = {}) => {
    const sellerId = useAuthStore.getState().user?.id;
    if (!sellerId) throw new Error("User not authenticated");
    
    const response = await api.get('/products', { 
        params: { ...params, sellerId } 
    });
    return response.data; // Trả về { products, totalItems, totalPages, currentPage }
};

/**
 * Tạo một sản phẩm mới.
 * Hàm này sử dụng FormData để có thể gửi cả dữ liệu text và file ảnh.
 * @param data - Đối tượng FormData chứa tất cả thông tin sản phẩm.
 */
export const createProduct = async (data: FormData) => {
    const response = await api.post('/products', data, {
        headers: {
            // Quan trọng: Để trình duyệt tự động đặt Content-Type cho multipart/form-data
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Lấy danh sách đơn hàng liên quan đến người bán.
 */
export const getMySellerOrders = async (): Promise<SellerOrder[]> => {
    // Gọi đến endpoint đã định nghĩa ở backend
    const response = await api.get('/orders/seller');
    return response.data;
};

/**
 * Lấy thông tin ví của người bán.
 */
export const getMyWallet = async (): Promise<SellerWallet> => {
    const response = await api.get('/wallet/my');
    return response.data;
};

/**
 * Lấy lịch sử các yêu cầu rút tiền.
 */
export const getMyPayoutRequests = async (): Promise<{ payoutRequests: PayoutRequest[] }> => {
    const response = await api.get('/wallet-payouts/my-requests');
    return response.data;
};

/**
 * Tạo một yêu cầu rút tiền mới.
 */
export const createPayoutRequest = async (amount: number, payoutInfo: object) => {
    // Endpoint này đã chính xác sau khi sửa backend
    const response = await api.post('/wallet-payouts/request', {
        amount,
        payout_info: payoutInfo, // Backend sẽ nhận và xử lý object này
    });
    return response.data;
};

/**
 * Cập nhật một sản phẩm hiện có.
 * @param productId ID của sản phẩm cần cập nhật
 * @param data Dữ liệu FormData chứa thông tin cập nhật
 */
export const updateProduct = async (productId: string, data: FormData) => {
    const response = await api.put(`/products/${productId}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getSellerDashboardStats = () => api.get('/dashboard/seller');

