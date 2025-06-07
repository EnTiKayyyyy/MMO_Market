import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface ProtectedRouteProps {
  role?: 'buyer' | 'seller' | 'admin';
}

const ProtectedRoute = ({ role }: ProtectedRouteProps) => {
  // Lấy các trạng thái cần thiết từ auth store
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  // 1. Xử lý trạng thái đang tải (kiểm tra token lúc khởi động)
  if (isLoading) {
    // Hiển thị màn hình tải để chờ quá trình xác thực hoàn tất
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600"></div>
      </div>
    );
  }

  // 2. Xử lý khi chưa đăng nhập
  if (!isAuthenticated) {
    // Chuyển hướng về trang đăng nhập và lưu lại trang người dùng muốn đến
    return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
  }

  // 3. Xử lý phân quyền (role-based access control)
  const userHasRequiredRole = () => {
    // Nếu trang không yêu cầu vai trò cụ thể, cho phép truy cập
    if (!role) {
      return true;
    }
    
    // Nếu không có thông tin user, từ chối
    if (!user) {
      return false;
    }

    // Admin có thể truy cập mọi trang
    if (user.role === 'admin') {
      return true;
    }

    // Seller có thể truy cập trang của 'seller' và 'buyer'
    if (user.role === 'seller' && (role === 'seller' || role === 'buyer')) {
      return true;
    }
    
    // Buyer chỉ có thể truy cập trang của 'buyer'
    if (user.role === 'buyer' && role === 'buyer') {
      return true;
    }

    // Mặc định từ chối các trường hợp còn lại
    return false;
  };

  // Nếu người dùng không có quyền truy cập, chuyển hướng về trang chủ
  if (!userHasRequiredRole()) {
    console.warn(`Access Denied: User with role '${user?.role}' tried to access a route for role '${role}'. Redirecting to home.`);
    return <Navigate to="/" replace />;
  }

  // 4. Nếu tất cả điều kiện đều thỏa mãn, cho phép truy cập
  return <Outlet />;
};

export default ProtectedRoute;
