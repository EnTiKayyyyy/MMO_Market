import api from '../api';

// Định nghĩa kiểu dữ liệu cho Wallet trả về từ backend
export interface WalletData {
    id: number;
    user_id: number;
    balance: string; // Sequelize trả về kiểu decimal dưới dạng string
    createdAt: string;
    updatedAt: string;
}

// Định nghĩa kiểu dữ liệu cho giao dịch
export interface TransactionData {
    id: string;
    type: 'deposit' | 'withdraw' | 'payment' | 'sale_credit' | 'refund_credit_buyer';
    amount: number;
    description: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: string;
}

export interface NowPaymentsResponse {
  payment_id: string;
  pay_address: string;
  pay_amount: number;
  pay_currency: string;
  expiration_estimate_date: string;
  // Thêm các trường khác nếu bạn cần hiển thị
}
/**
 * Lấy thông tin ví của người dùng đang đăng nhập.
 */
export const getMyWallet = async (): Promise<WalletData> => {
    // API endpoint này cần được tạo ở backend
    const response = await api.get('/wallet');
    return response.data;
};

/**
 * Tạo yêu cầu nạp tiền và nhận về URL thanh toán.
 * @param amount - Số tiền cần nạp.
 */
export const createDepositRequest = async (amount: number): Promise<{ paymentUrl: string }> => {
    // API endpoint này cần được tạo ở backend
    const response = await api.post('/wallet/deposit', { amount });
    return response.data;
};

/**
 * Tạo yêu cầu nạp tiền và nhận về URL thanh toán VNPay.
 * @param amount - Số tiền cần nạp.
 */
export const createVnpayDepositUrl = async (amount: number): Promise<{ paymentUrl: string }> => {
    const response = await api.post('/wallet/deposit/create-vnpay-url', { amount });
    return response.data;
};

/**
 * Creates a NowPayments deposit request.
 * @param amount - The amount to deposit (in base currency, e.g., USD).
 * @param currency - The cryptocurrency to pay with (e.g., 'btc', 'eth').
 */
export const createNowPaymentsDepositUrl = async (amount: number, currency: string): Promise<NowPaymentsResponse> => {
    const response = await api.post('/wallet/deposit/create-nowpayments', { amount, currency });
    return response.data;
};


/**
 * Lấy lịch sử giao dịch của người dùng đang đăng nhập.
 */
export const getMyTransactions = async (): Promise<TransactionData[]> => {
    // API endpoint này cần được tạo ở backend
    const response = await api.get('/wallet/transactions');
    return response.data;
};

// Lưu ý: Bạn có thể thêm các hàm khác như getMyTransactions() ở đây khi backend sẵn sàng.
