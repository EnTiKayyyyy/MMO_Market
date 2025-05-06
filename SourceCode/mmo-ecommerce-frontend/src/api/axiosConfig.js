// src/api/axiosConfig.js
import axios from 'axios';

// Lấy URL từ biến môi trường đã tạo
// Sử dụng fallback URL nếu biến môi trường không tồn tại
const API_URL = process.env.REACT_APP_BACKEND_API_URL || 'http://localhost:5000/api';

// Tạo một instance Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    // Có thể thêm các header mặc định khác ở đây
  },
  // timeout: 10000, // Tùy chọn: thời gian chờ tối đa cho request (ms)
});

// *** Tùy chọn: Thêm Request Interceptor để đính kèm Token xác thực ***
// Interceptor này sẽ chạy trước mỗi request đi ra.
// Chúng ta sẽ lấy token từ localStorage (hoặc nơi bạn lưu trữ) và thêm vào header Authorization.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Lấy token từ storage
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Thêm token vào header
    }
    return config; // Trả về config đã cập nhật
  },
  (error) => {
    // Xử lý lỗi request
    return Promise.reject(error);
  }
);

 // *** Tùy chọn: Thêm Response Interceptor để xử lý lỗi global ***
 // Ví dụ: xử lý lỗi 401 Unauthorized (hết hạn token, không có quyền)
 api.interceptors.response.use(
   (response) => response, // Nếu response thành công, trả về response
   (error) => {
     // Xử lý lỗi response
     if (error.response) {
       console.error('API Error:', error.response.status, error.response.data);
       // Ví dụ xử lý lỗi 401: Xóa token và chuyển hướng về trang đăng nhập
       if (error.response.status === 401) {
         console.warn('Unauthorized access. Redirecting to login.');
         localStorage.removeItem('token'); // Xóa token cũ
         // Cách đơn giản nhất để chuyển hướng (có thể gây reload toàn trang)
         // window.location.href = '/login';
         // Tốt hơn: Sử dụng navigate object từ react-router-dom (cần cách để inject vào đây)
         // Hoặc xử lý 401 ở nơi gọi API cụ thể
       }
        // Ví dụ xử lý lỗi 403 Forbidden: Chuyển hướng về trang chủ
        if (error.response.status === 403) {
           console.warn('Forbidden access. Redirecting to home.');
           // window.location.href = '/';
        }
     } else if (error.request) {
       // Request được gửi đi nhưng không nhận được response (server không phản hồi)
       console.error('No response received:', error.request);
     } else {
       // Lỗi trong quá trình thiết lập request
       console.error('Error setting up request:', error.message);
     }
     return Promise.reject(error); // Quan trọng: Luôn throw error để component gọi API có thể bắt và xử lý
   }
 );


export default api; // Export instance đã cấu hình