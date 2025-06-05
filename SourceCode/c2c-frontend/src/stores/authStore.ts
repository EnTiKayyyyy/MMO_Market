import { create } from 'zustand';

type UserRole = 'buyer' | 'seller' | 'admin';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  initAuth: () => void;
}

// Danh sách tài khoản test
const TEST_ACCOUNTS = {
  buyer: {
    email: 'buyer@test.com',
    password: 'buyer123',
    name: 'Người Mua Test',
    role: 'buyer' as UserRole,
  },
  seller: {
    email: 'seller@test.com',
    password: 'seller123',
    name: 'Người Bán Test',
    role: 'seller' as UserRole,
  },
  admin: {
    email: 'admin@test.com',
    password: 'admin123',
    name: 'Quản Trị Viên',
    role: 'admin' as UserRole,
  }
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  
  initAuth: () => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        set({ user: userData, isAuthenticated: true });
      } catch (error) {
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false });
      }
    }
  },
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // Giả lập đăng nhập với tài khoản test
      const account = Object.values(TEST_ACCOUNTS).find(
        acc => acc.email === email && acc.password === password
      );

      if (account) {
        const user = {
          id: Math.random().toString(36).substr(2, 9),
          email: account.email,
          name: account.name,
          role: account.role,
        };
        
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        throw new Error('Email hoặc mật khẩu không đúng');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Đăng nhập thất bại',
        isLoading: false 
      });
    }
  },
  
  register: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      // Kiểm tra email đã tồn tại
      if (Object.values(TEST_ACCOUNTS).some(acc => acc.email === email)) {
        throw new Error('Email đã được sử dụng');
      }

      const user = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        role: 'buyer' as UserRole,
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Đăng ký thất bại',
        isLoading: false 
      });
    }
  },
  
  logout: () => {
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  }
}));