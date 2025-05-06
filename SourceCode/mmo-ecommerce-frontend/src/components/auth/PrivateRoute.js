// src/components/auth/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Điều chỉnh đường dẫn nếu cần

/**
 * Component PrivateRoute để bảo vệ Route.
 * Kiểm tra xác thực và quyền hạn trước khi render component trang.
 * Sử dụng làm giá trị cho prop 'element' trong Route.
 *
 * Ví dụ: <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} allowedRoles={['user', 'seller', 'admin']} />} />
 */
function PrivateRoute({ element: PageComponent, allowedRoles }) {
  const { isAuthenticated, hasRole } = useAuth();

  // 1. Kiểm tra xác thực
  if (!isAuthenticated) {
    // Nếu chưa đăng nhập, chuyển hướng đến trang login
    return <Navigate to="/login" replace />; // 'replace' giúp thay thế entry hiện tại trong history stack
  }

  // 2. Kiểm tra quyền hạn (nếu có yêu cầu roles cụ thể)
  if (allowedRoles && allowedRoles.length > 0) {
      // Nếu yêu cầu role, kiểm tra xem user có 1 trong các role đó không
      if (!hasRole(allowedRoles)) {
           // Nếu không có quyền, chuyển hướng (ví dụ về trang chủ hoặc trang 403 Forbidden nếu có)
           console.warn("User does not have required roles:", allowedRoles);
           return <Navigate to="/" replace />; // Hoặc <Navigate to="/unauthorized" replace />
      }
  }

  // Nếu đã xác thực và có quyền, hiển thị component trang yêu cầu
  return PageComponent;
}

export default PrivateRoute;