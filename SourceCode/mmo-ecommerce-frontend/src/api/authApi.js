// src/api/authApi.js
import api from './axiosConfig'; // Import instance axios đã cấu hình

// Gọi API đăng ký
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data; // Trả về { user, token }
  } catch (error) {
    console.error('Registration API Error:', error.response?.data || error.message);
    throw error; // Re-throw lỗi để component xử lý
  }
};

// Gọi API đăng nhập
export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data; // Trả về { user, token }
  } catch (error) {
    console.error('Login API Error:', error.response?.data || error.message);
    throw error;
  }
};

// Gọi API lấy thông tin user hiện tại
export const getMe = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data.user; // Trả về user object từ { user: {...} }
  } catch (error) {
    // Lỗi 401 (Unauthorized) sẽ được xử lý bởi interceptor nếu có
    console.error('GetMe API Error:', error.response?.data || error.message);
    throw error;
  }
};

// Tùy chọn: Gọi API đăng xuất (nếu có blacklist token)
export const logout = async () => {
   try {
       // api instance sẽ tự gửi token
       const response = await api.post('/auth/logout');
       return response.data;
   } catch (error) {
       console.error('Logout API Error:', error.response?.data || error.message);
       throw error;
   }
};