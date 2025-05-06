// src/api/cartApi.js
import api from './axiosConfig'; // Import instance axios đã cấu hình

// Thêm sản phẩm vào giỏ hàng
export const addItemToCart = async (productId, quantity) => {
  try {
    const response = await api.post('/cart/items', { product_id: productId, quantity });
    return response.data; // Trả về giỏ hàng đã cập nhật
  } catch (error) {
    console.error('Add Item To Cart API Error:', error.response?.data || error.message);
    throw error;
  }
};

// --- Các hàm khác cho giỏ hàng sẽ thêm sau (getCart, updateItem, removeItem, clearCart) ---
// export const getCart = async () => { ... };
// export const updateCartItemQuantity = async (cartItemId, quantity) => { ... };
// export const removeItemFromCart = async (cartItemId) => { ... };
// export const clearCart = async () => { ... };