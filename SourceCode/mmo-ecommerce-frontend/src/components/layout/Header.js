// src/components/layout/Header.js
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Import AuthContext để kiểm tra trạng thái đăng nhập

import './Layout.css'; // Chúng ta sẽ tạo file CSS này sau để định kiểu

function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="container">
        <div className="site-title">
          <Link to="/">MMO Ecommerce</Link> {/* Logo hoặc tên trang */}
        </div>
        <nav className="main-nav">
          <ul>
            <li><NavLink to="/" end>Trang Chủ</NavLink></li> {/* 'end' giúp khớp chính xác Route "/" */}
            <li><NavLink to="/products">Sản Phẩm</NavLink></li>
            {/* Bạn có thể thêm dropdown cho danh mục sản phẩm ở đây sau */}
            <li><NavLink to="/cart">Giỏ Hàng</NavLink></li>
            {/* Thêm các link điều hướng khác */}
          </ul>
        </nav>
        <div className="user-actions">
          {isAuthenticated ? (
            <>
              <span>Chào, {user?.name || 'Bạn'}!</span> {/* Hiển thị tên user nếu có */}
              {/* Link đến các trang cá nhân/quản lý nếu đã đăng nhập */}
              {user?.roles?.includes('admin') && (
                 <NavLink to="/admin">Admin</NavLink>
              )}
               {user?.roles?.includes('seller') && (
                 <NavLink to="/seller">Bán Hàng</NavLink>
              )}
               <NavLink to="/profile">Cá Nhân</NavLink>
               <NavLink to="/orders">Đơn Hàng</NavLink> {/* Link xem lịch sử đơn hàng */}
              <button onClick={logout}>Đăng Xuất</button> {/* Nút đăng xuất */}
            </>
          ) : (
            <>
              <NavLink to="/login">Đăng Nhập</NavLink>
              {/* <NavLink to="/register">Đăng Ký</NavLink> // Thêm link đăng ký sau */}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;