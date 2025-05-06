// src/components/layout/Header.js (Cập nhật)
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth hook

import './Layout.css'; // Sử dụng file CSS

function Header() {
  const { isAuthenticated, user, logout, loading: authLoading } = useAuth(); // Lấy trạng thái và hàm logout, authLoading từ AuthContext

  // Không hiển thị Header khi AuthContext đang tải lần đầu
  if (authLoading) {
      return null; // Hoặc hiển thị loading spinner global
  }

  return (
    <header className="app-header">
      <div className="container">
        <div className="site-title">
          <Link to="/">MMO Ecommerce</Link> {/* Logo hoặc tên trang */}
        </div>
        <nav className="main-nav">
          <ul>
            <li><NavLink to="/" end>Trang Chủ</NavLink></li>
            <li><NavLink to="/products">Sản Phẩm</NavLink></li>
            <li><NavLink to="/cart">Giỏ Hàng</NavLink></li>
            {/* Thêm các link điều hướng khác */}
          </ul>
        </nav>
        <div className="user-actions">
          {isAuthenticated ? (
            <>
              <span>Chào, {user?.username || user?.email || 'Bạn'}!</span> {/* Hiển thị username hoặc email */}
              {/* Link đến các trang cá nhân/quản lý nếu user có role tương ứng */}
              {/* Sử dụng hasRole để kiểm tra quyền */}
              {user && (user.role === 'admin' || user.role === 'seller') && (
                 <NavLink to="/seller">Kênh người bán</NavLink>
              )}
               {user && user.role === 'admin' && (
                 <NavLink to="/admin">Admin</NavLink>
              )}
               <NavLink to="/profile">Cá Nhân</NavLink>
               <NavLink to="/orders">Đơn Hàng</NavLink> {/* Link xem lịch sử đơn hàng */}
              <button onClick={logout}>Đăng Xuất</button> {/* Nút đăng xuất */}
            </>
          ) : (
            <>
              <NavLink to="/login">Đăng Nhập</NavLink>
              {/* <NavLink to="/register">Đăng Ký</NavLink> // Thêm link đăng ký */}
               {/* Thêm link đăng ký nếu bạn có trang riêng, hiện tại nó ở trang login */}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;