// src/components/layout/Footer.js
import React from 'react';
import './Layout.css'; // Sử dụng cùng file CSS

function Footer() {
  return (
    <footer className="app-footer">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} MMO Ecommerce. All rights reserved.</p>
        {/* Thêm các link khác như Điều khoản, Chính sách bảo mật... */}
      </div>
    </footer>
  );
}

export default Footer;