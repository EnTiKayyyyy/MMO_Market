import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

// Cấu hình URL cơ sở của backend
const API_URL = 'http://localhost:3000/api'; // Đảm bảo backend đang chạy ở port 3000

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động đính kèm token vào mỗi yêu cầu nếu đã đăng nhập
api.interceptors.request.use(
  (config) => {
    // Lấy token từ Zustand store
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;