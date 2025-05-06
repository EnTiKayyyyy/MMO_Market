// src/components/layout/Layout.js
import React from 'react';
import { Outlet } from 'react-router-dom'; // Import Outlet
import Header from './Header'; // Import Header
import Footer from './Footer'; // Import Footer
import './Layout.css'; // Sử dụng file CSS chung cho layout

function Layout() {
  return (
    <div className="app-container">
      <Header /> {/* Header luôn hiển thị */}
      <main className="main-content">
        {/* Outlet sẽ render nội dung của Route con khớp */}
        <Outlet />
      </main>
      <Footer /> {/* Footer luôn hiển thị */}
    </div>
  );
}

export default Layout;