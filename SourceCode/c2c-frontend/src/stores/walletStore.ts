import { create } from 'zustand';
import { getMyWallet, createDepositRequest } from '../services/walletService';
import type { TransactionData } from '../services/walletService';

interface WalletState {
  balance: number;
  transactions: TransactionData[];
  isLoading: boolean;
  error: string | null;
  fetchWalletData: () => Promise<void>;
  deposit: (amount: number) => Promise<{ paymentUrl: string }>;
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: 0,
  transactions: [], // Sẽ cập nhật khi có API
  isLoading: true,
  error: null,

  /**
   * Action để tải dữ liệu ví từ API và cập nhật state.
   */
  fetchWalletData: async () => {
    set({ isLoading: true, error: null });
    try {
      const walletData = await getMyWallet();
      set({
        balance: parseFloat(walletData.balance), // Chuyển đổi string từ API thành number
        isLoading: false,
      });
      // Khi có API lấy lịch sử giao dịch, bạn sẽ gọi nó ở đây
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Không thể tải dữ liệu ví.";
      set({ error: errorMessage, isLoading: false });
    }
  },

  /**
   * Action để tạo yêu cầu nạp tiền.
   * Nó sẽ trả về URL thanh toán để điều hướng người dùng.
   */
  deposit: async (amount: number) => {
    try {
        const response = await createDepositRequest(amount);
        return response; // Trả về { paymentUrl: '...' }
    } catch (err: any) {
        const errorMessage = err.response?.data?.message || "Không thể tạo yêu cầu nạp tiền.";
        throw new Error(errorMessage);
    }
  },
}));
