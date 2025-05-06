// src/api/categoryApi.js
import api from './axiosConfig'; // Import instance axios đã cấu hình

// Lấy danh sách tất cả danh mục
export const getAllCategories = async (params = {}) => {
  try {
    const response = await api.get('/categories', { params });
    return response.data; // Trả về mảng danh mục
  } catch (error) {
    console.error('Get All Categories API Error:', error.response?.data || error.message);
    throw error;
  }
};

// Tùy chọn: Lấy chi tiết danh mục (nếu cần)
export const getCategoryById = async (id) => {
   try {
       const response = await api.get(`/categories/${id}`);
       return response.data;
   } catch (error) {
       console.error(`Get Category ${id} API Error:`, error.response?.data || error.message);
       throw error;
   }
};