// src/api/productApi.js
import api from './axiosConfig'; // Import instance axios đã cấu hình

// Hàm lấy danh sách sản phẩm (cho public)
export const getAllProducts = async (params = {}) => {
  try {
    // params có thể chứa: category_id, seller_id, search, status, page, limit, sort
    const response = await api.get('/products', { params });
    return response.data; // Trả về { totalItems, products: [...], currentPage, totalPages }
  } catch (error) {
    console.error('Get All Products API Error:', error.response?.data || error.message);
    throw error;
  }
};

// Hàm lấy chi tiết một sản phẩm theo ID hoặc Slug (cho public)
export const getProductByIdOrSlug = async (identifier) => {
  try {
    const response = await api.get(`/products/${identifier}`);
    return response.data; // Trả về object sản phẩm chi tiết
  } catch (error) {
    console.error(`Get Product ${identifier} API Error:`, error.response?.data || error.message);
    throw error;
  }
};

// --- Các hàm API cho Seller/Admin sẽ được thêm ở đây sau ---
// export const createProduct = async (...) => { ... };
// ...