// src/App.js (Cập nhật lần 3)
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import components và pages
import Layout from './components/layout/Layout'; // Import Layout component
import PrivateRoute from './components/auth/PrivateRoute'; // Import PrivateRoute component

// Import các component trang (đảm bảo đã import hết)
import HomePage from './pages/HomePage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ProfilePage from './pages/ProfilePage';
import OrderHistoryPage from './pages/OrderHistoryPage';
import LoginPage from './pages/LoginPage';
import SellerDashboardPage from './pages/SellerDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
// import NotFoundPage from './pages/NotFoundPage'; // Nếu có trang 404


function App() {
  return (
    <Routes>
      {/* Route cho các trang KHÔNG sử dụng layout chính (ví dụ: Trang Đăng nhập) */}
      {/* Trang login thường không có header/footer cố định */}
      <Route path="/login" element={<LoginPage />} />
      {/* Thêm các Route không dùng layout khác ở đây nếu có (ví dụ: /register) */}

      {/* Route cha sử dụng Layout làm element */}
      {/* Tất cả các Route con bên trong sẽ được render vào <Outlet /> trong Layout */}
      <Route element={<Layout />}>

        {/* --- Các Route Công Khai (sử dụng Layout) --- */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />

        {/* --- Các Route Được Bảo Vệ (sử dụng Layout VÀ PrivateRoute) --- */}
        {/* Sử dụng PrivateRoute làm element cho Route cha để bảo vệ nhóm các route con */}

        {/* Nhóm Route chỉ cần Đăng nhập */}
         <Route element={<PrivateRoute />}> {/* PrivateRoute không truyền allowedRoles = chỉ cần xác thực */}
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />
         </Route>

         {/* Nhóm Route yêu cầu quyền 'seller' hoặc 'admin' */}
         <Route element={<PrivateRoute allowedRoles={['seller', 'admin']} />}>
            <Route path="/seller" element={<SellerDashboardPage />} />
         </Route>

         {/* Nhóm Route yêu cầu quyền 'admin' */}
         <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
         </Route>

      </Route> {/* Kết thúc Route Layout */}


      {/* Tùy chọn: Route 404 Not Found (có thể sử dụng layout hoặc không) */}
      {/* Nếu muốn dùng layout cho trang 404, đặt nó trong Route Layout */}
      {/* <Route path="*" element={<NotFoundPage />} /> */}
      {/* Nếu không muốn dùng layout, đặt ngoài: */}
      {/* <Route path="*" element={<div>Trang không tồn tại!</div>} /> */}

    </Routes>
  );
}

export default App;