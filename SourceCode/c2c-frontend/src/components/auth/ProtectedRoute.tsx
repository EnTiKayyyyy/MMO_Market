import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface ProtectedRouteProps {
  role?: 'buyer' | 'seller' | 'admin';
}

const ProtectedRoute = ({ role }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
  }

  // Nếu cần kiểm tra role và người dùng không có quyền
  if (role && user?.role !== role) {
    // Chuyển hướng đến trang chủ nếu không có quyền
    return <Navigate to="/\" replace />;
  }

  // Nếu đã đăng nhập và có quyền (hoặc không cần kiểm tra quyền), cho phép truy cập
  return <Outlet />;
};

export default ProtectedRoute;