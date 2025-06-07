import api from '../api';

/**
 * Định nghĩa kiểu dữ liệu cho một mục trong đơn hàng từ API
 */
export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: string; // Dữ liệu từ Sequelize là string, cần chuyển đổi
  product: {
    id: number;
    name: string;
    thumbnail_url: string; // Thêm thumbnail_url để hiển thị ảnh
  };
  status: 'processing' | 'delivered' | 'confirmed' | 'disputed' | 'refunded' | 'cancelled'; // Thêm status
  seller?: { // Thêm seller
      id: string;
      name: string;
      username: string;
  };
}

/**
 * Định nghĩa kiểu dữ liệu cho một đơn hàng từ API
 */
export interface Order {
  id: number;
  createdAt: string;
  status: 'pending' | 'paid' | 'processing' | 'partially_completed' | 'completed' | 'cancelled' | 'disputed' | 'refunded';
  total_amount: string; // Dữ liệu từ Sequelize là string
  items: OrderItem[];
  buyer: {
    id: number;
    username: string;
    full_name: string;
  };
  // Thêm các trường khác nếu API trả về
  purchased_product_data?: string;
  seller?: { // Thêm thông tin người bán nếu có
      id: string;
      name: string;
      rating: number;
  };
   paymentMethod?: string;
   paymentStatus?: 'paid' | 'pending' | 'failed';
}


/**
 * Lấy lịch sử đơn hàng của người mua hiện tại.
 * @returns {Promise<Order[]>} Một mảng các đơn hàng.
 */
export const getMyOrders = async (): Promise<Order[]> => {
    const response = await api.get('/orders/my');
    return response.data;
};

/**
 * Lấy chi tiết một đơn hàng theo ID.
 * @param {string} orderId - ID của đơn hàng.
 * @returns {Promise<Order>} Đối tượng đơn hàng chi tiết.
 */
export const getOrderById = async (orderId: string): Promise<Order> => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
};

/**
 * Tạo một đơn hàng mới từ các sản phẩm trong giỏ hàng.
 * @param { { product_id: number; quantity: number }[] } items - Mảng các sản phẩm cần đặt.
 * @returns {Promise<any>} Dữ liệu đơn hàng mới được tạo.
 */
export const createOrder = async (items: { product_id: number; quantity: number }[]): Promise<any> => {
    const response = await api.post('/orders', { items });
    return response.data;
};

/**
 * Người mua xác nhận đã nhận hàng cho một mục trong đơn hàng.
 * @param {string} itemId - ID của mục đơn hàng (order_item_id).
 * @returns {Promise<any>} Kết quả từ API.
 */
export const confirmOrderItemReceipt = async (itemId: number): Promise<any> => {
    const response = await api.put(`/orders/items/${itemId}/confirm`);
    return response.data;
};

export const getOrderItemProductData = async (itemId: number): Promise<{ product_data: string }> => {
    const response = await api.get(`/orders/items/${itemId}/product-data`);
    return response.data;
};