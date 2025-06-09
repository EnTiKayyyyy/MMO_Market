import { create } from 'zustand';
import { getMyWallet, getMyTransactions, createDepositRequest } from '../services/walletService'; 
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
  transactions: [],
  isLoading: true,
  error: null,

  /**
   * Action để tải dữ liệu ví từ API và cập nhật state.
   */
  fetchWalletData: async () => {
    set({ isLoading: true, error: null });
    try {
      // Gọi cả hai API cùng lúc để tăng tốc độ
      const [walletData, transactionsData] = await Promise.all([
          getMyWallet(),
          getMyTransactions() // Gọi hàm mới để lấy lịch sử giao dịch
      ]);

      set({
        balance: parseFloat(walletData.balance), // Chuyển đổi string từ API thành number
        transactions: transactionsData, // Cập nhật state với dữ liệu giao dịch
        isLoading: false,
      });

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || "Không thể tải dữ liệu ví.";
      set({ error: errorMessage, isLoading: false });
    }
  },

  /**
   * Action để tạo yêu cầu nạp tiền.
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
