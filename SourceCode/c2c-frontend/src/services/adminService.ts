import api from '../api';

// Định nghĩa các kiểu dữ liệu trả về từ API của admin
// Lưu ý: Các kiểu dữ liệu này nên được định nghĩa chi tiết hơn để phù hợp với dữ liệu thực tế từ backend
export interface AdminProduct {
    id: string;
    name: string;
    price: string;
    category: { name: string };
    status: 'pending_approval' | 'available' | 'sold' | 'delisted';
    seller: { username: string; email: string };
    createdAt: string;
}

export interface AdminOrder {
    id: number;
    createdAt: string;
    customer: { name: string; email: string };
    total_amount: string;
    status: string;
    paymentStatus: string;
}

export interface AdminWithdrawal {
    id: string;
    createdAt: string;
    status: 'pending' | 'processing' | 'completed' | 'rejected' | 'failed';
    amount: number;
    user: { id: string; name: string; email: string };
    payout_info: string; // Đây là JSON string
    seller: { id: string; username: string; email: string };
}

export interface AdminComplaint {
    id: string;
    createdAt: string;
    status: 'open' | 'seller_responded' | 'buyer_rebutted' | 'under_admin_review' | 'resolved_refund_buyer' | 'resolved_favor_seller' | 'closed_without_action';
    subject: string;
    user: { name: string; email: string };
    orderItem: { product: { name: string }};
    complainant: { username: string };
    defendant: { username: string };
    priority: 'low' | 'medium' | 'high';
}

export interface AdminUser {
    id: number;
    username: string;
    email: string;
    full_name: string;
    role: 'buyer' | 'seller' | 'admin';
    status: 'pending_verification' | 'active' | 'suspended';
    createdAt: string;
}

// ---- API Functions ----

// Quản lý sản phẩm
export const adminGetProducts = (params: any) => api.get('/admin/products', { params });
export const adminUpdateProductStatus = (productId: string, status: string, admin_notes?: string) => 
    api.put(`/admin/products/${productId}/status`, { status, admin_notes });

// Quản lý đơn hàng
export const adminGetOrders = (params: any) => api.get('/orders', { params });

// Quản lý rút tiền
export const adminGetPayouts = (params: any) => api.get('/payouts', { params });
export const adminProcessPayout = (requestId: string, new_status: string, admin_notes?: string) => 
    api.put(`/payouts/${requestId}/process`, { new_status, admin_notes });

// Quản lý khiếu nại
export const adminGetDisputes = (params: any) => api.get('/disputes', { params });
export const adminResolveDispute = (disputeId: string, new_status: string, resolution_notes: string) =>
    api.put(`/disputes/${disputeId}/resolve`, { new_status, resolution_notes });

// Quản lý người dùng
export const adminGetUsers = (params: any) => api.get('/admin/users', { params });

export const getAdminDashboardStats = () => api.get('/dashboard/admin');

export const adminGetProductById = (productId: string) => {
    return api.get(`/admin/products/${productId}`);
};

/**
 * Cập nhật thông tin sản phẩm.
 * @param productId ID của sản phẩm
 * @param data Dữ liệu sản phẩm (dưới dạng FormData nếu có upload ảnh)
 */
export const adminUpdateProduct = (productId: string, data: FormData) => {
    return api.put(`/products/${productId}`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const adminDeleteProduct = (productId: string) => {
    return api.delete(`/products/${productId}`);
};

/**
 * Admin lấy chi tiết một đơn hàng.
 * Sử dụng lại API chung, vì backend đã phân quyền cho admin.
 * @param orderId ID của đơn hàng
 */
export const adminGetOrderById = (orderId: string) => {
    return api.get(`/orders/${orderId}`);
};

/**
 * Admin cập nhật trạng thái của một đơn hàng.
 * @param orderId ID của đơn hàng
 * @param status Trạng thái mới
 */
export const adminUpdateOrderStatus = (orderId: string, status: string) => {
    return api.put(`/orders/${orderId}/status`, { status });
};

/**
 * Admin hoàn tiền cho một mục trong đơn hàng.
 * @param itemId ID của mục đơn hàng
 * @param notes Lý do hoàn tiền
 */
export const adminRefundOrderItem = (itemId: string, notes: string) => {
    return api.post(`/orders/items/${itemId}/refund`, { notes });
};