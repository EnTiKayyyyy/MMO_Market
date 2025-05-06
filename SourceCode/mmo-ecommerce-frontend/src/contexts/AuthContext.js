// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../api/authApi'; // Import hàm gọi API getMe

// Tạo Context
const AuthContext = createContext(null);

// Provider cho AuthContext
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Thêm trạng thái loading khi kiểm tra auth lúc khởi động

  // Hàm lưu token và thông tin user, cập nhật state
  const login = (userData, token) => {
    localStorage.setItem('token', token); // Lưu token vào localStorage
    setIsAuthenticated(true);
    setUser(userData);
  };

  // Hàm xóa token và reset state
  const logout = () => {
    localStorage.removeItem('token'); // Xóa token
    setIsAuthenticated(false);
    setUser(null);
    // TODO: Gọi API logout nếu bạn triển khai blacklist token phía server
    // try { await authApi.logout(); } catch (error) { console.error("Logout API failed:", error); }
  };

  // Hàm kiểm tra quyền dựa trên roles (từ user object)
  const hasRole = (requiredRoles) => {
     if (!user || !user.role) return false; // Nếu không có user hoặc user không có role
     if (!requiredRoles || requiredRoles.length === 0) return true; // Nếu không yêu cầu role cụ thể, chỉ cần đăng nhập
     // Kiểm tra xem role của user có nằm trong danh sách requiredRoles không
     return requiredRoles.includes(user.role); // Giả định role là string duy nhất
     // Nếu user có nhiều role dạng mảng ['user', 'seller'], dùng requiredRoles.some(role => user.roles.includes(role));
  };


  // useEffect để kiểm tra trạng thái đăng nhập khi ứng dụng khởi động
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Gọi API getMe để xác thực token và lấy thông tin user
          const userData = await getMe(); // authApi đã cấu hình gửi token tự động qua interceptor
          if (userData) {
            setIsAuthenticated(true);
            setUser(userData);
          } else {
            // Token không hợp lệ hoặc user không tồn tại
            localStorage.removeItem('token'); // Xóa token cũ
            setIsAuthenticated(false);
            setUser(null);
          }
        } catch (error) {
          // Lỗi khi gọi API (ví dụ: server down, token hết hạn/lỗi)
          console.error('Failed to fetch user info on load:', error);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setLoading(false); // Kết thúc quá trình kiểm tra auth
    };

    checkAuthStatus();
  }, []); // Chạy effect 1 lần khi component mount

  // Trả về Context Provider với các giá trị và trạng thái
  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, hasRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
   if (context === undefined) {
       throw new Error('useAuth must be used within an AuthProvider');
   }
   return context;
};