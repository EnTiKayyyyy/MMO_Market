// src/contexts/AuthContext.js
import React, { createContext, useContext, useState } from 'react';

// Tạo Context
const AuthContext = createContext(null);

// Provider cho AuthContext
export const AuthProvider = ({ children }) => {
  // Sử dụng useState để mô phỏng trạng thái đăng nhập và thông tin user
  // Sau này sẽ thay bằng logic lấy từ API và lưu vào localStorage/cookies
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Mặc định chưa đăng nhập
  const [user, setUser] = useState(null); // Thông tin user (bao gồm cả role)

  // Hàm mô phỏng đăng nhập
  const login = (userData, token) => {
    setIsAuthenticated(true);
    setUser(userData); // userData nên chứa { ..., roles: ['user', 'seller', 'admin'] }
    // TODO: Lưu token vào localStorage hoặc cookies
    console.log('User logged in:', userData);
  };

  // Hàm mô phỏng đăng xuất
  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    // TODO: Xóa token khỏi localStorage hoặc cookies
    console.log('User logged out');
  };

  // Hàm kiểm tra quyền dựa trên roles
  const hasRole = (requiredRoles) => {
     if (!user || !user.roles) return false; // Nếu không có user hoặc user không có roles
     if (!requiredRoles || requiredRoles.length === 0) return true; // Nếu không yêu cầu role cụ thể, chỉ cần đăng nhập
     // Kiểm tra xem user có ít nhất một trong các role yêu cầu không
     return requiredRoles.some(role => user.roles.includes(role));
  };


  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook để sử dụng AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};