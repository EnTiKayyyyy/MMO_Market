import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import * as authService from '../services/authService';

type UserRole = 'buyer' | 'seller' | 'admin';

interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  avatar?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null; 
  isAuthenticated: boolean;
  isLoading: boolean; // Sẽ đại diện cho cả trạng thái tải ban đầu
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'buyer' | 'seller') => Promise<void>;
  logout: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true, // BẮT ĐẦU VỚI TRẠNG THÁI ĐANG TẢI
  error: null,
  
  initAuth: () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded: { id: string, role: UserRole, username: string, email: string } = jwtDecode(token);
        const user: User = { id: decoded.id, role: decoded.role, name: decoded.username, email: decoded.email };
        set({ user, token, isAuthenticated: true });
      }
    } catch (error) {
      console.error("Token không hợp lệ, đang xóa...", error);
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false });
    } finally {
      // ĐÁNH DẤU LÀ ĐÃ KIỂM TRA XONG, DÙ THÀNH CÔNG HAY THẤT BẠI
      set({ isLoading: false }); 
    }
  },
  
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user: userData } = await authService.login(email, password);
      localStorage.setItem('token', token);
      set({ user: userData, token, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Email hoặc mật khẩu không đúng.';
      set({ error: errorMessage, isLoading: false });
      throw err;
    }
  },
  
  register: async (name, email, password, role) => {
    set({ isLoading: true, error: null });
    try {
      await authService.register(name, name, email, password, role);
      await get().login(email, password);
    } catch (err: any)      {
      const errorMessage = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      set({ error: errorMessage, isLoading: false });
      throw err;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  }
}));
