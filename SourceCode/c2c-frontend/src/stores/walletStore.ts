import { create } from 'zustand';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'payment';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

interface WalletStore {
  balance: number;
  pendingBalance: number;
  transactions: Transaction[];
  deposit: (amount: number) => Promise<void>;
  withdraw: (amount: number, bankInfo: any) => Promise<void>;
  pay: (amount: number) => Promise<void>;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  balance: 0,
  pendingBalance: 0,
  transactions: [],

  deposit: async (amount: number) => {
    // Giả lập API call
    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'deposit',
      amount,
      description: 'Nạp tiền vào ví',
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    set(state => ({
      balance: state.balance + amount,
      transactions: [transaction, ...state.transactions]
    }));
  },

  withdraw: async (amount: number, bankInfo: any) => {
    if (amount > get().balance) {
      throw new Error('Số dư không đủ');
    }

    // Giả lập API call
    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'withdraw',
      amount,
      description: 'Rút tiền về tài khoản ngân hàng',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    set(state => ({
      pendingBalance: state.pendingBalance + amount,
      transactions: [transaction, ...state.transactions]
    }));
  },

  pay: async (amount: number) => {
    if (amount > get().balance) {
      throw new Error('Số dư không đủ');
    }

    // Giả lập API call
    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'payment',
      amount,
      description: 'Thanh toán đơn hàng',
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    set(state => ({
      balance: state.balance - amount,
      transactions: [transaction, ...state.transactions]
    }));
  }
}));