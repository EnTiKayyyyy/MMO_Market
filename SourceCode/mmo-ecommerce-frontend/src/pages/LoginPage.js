// src/pages/LoginPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import Link và useNavigate
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook
import { login as loginApi } from '../api/authApi'; // Import hàm login từ authApi, đổi tên thành loginApi

function LoginPage() {
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Có thể là email hoặc username
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { isAuthenticated, login: authLogin, loading: authLoading } = useAuth(); // Lấy trạng thái và hàm login từ AuthContext
  const navigate = useNavigate(); // Hook để điều hướng

  // Nếu user đã đăng nhập, chuyển hướng về trang chủ hoặc trang profile
  useEffect(() => {
    if (isAuthenticated && !authLoading) { // Chỉ chuyển hướng sau khi AuthContext đã kiểm tra xong loading ban đầu
      navigate('/'); // Hoặc '/profile', hoặc state từ location
    }
  }, [isAuthenticated, authLoading, navigate]); // Chạy khi isAuthenticated hoặc authLoading thay đổi

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset lỗi
    setLoading(true); // Bắt đầu loading

    try {
      // Gọi hàm API đăng nhập
      const result = await loginApi({ login: loginIdentifier, password });

      // Nếu thành công:
      authLogin(result.user, result.token); // Cập nhật AuthContext (lưu token, user info)
      // AuthContext useEffect sẽ tự chuyển hướng nếu cần, hoặc chuyển hướng thủ công ở đây
      // navigate('/'); // Chuyển hướng về trang chủ sau khi login

    } catch (err) {
      // Nếu lỗi:
      console.error('Login failed:', err);
      // Hiển thị thông báo lỗi từ API response nếu có
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };

  // Nếu AuthContext đang kiểm tra trạng thái ban đầu, hiển thị loading
  if (authLoading) {
      return <div>Đang kiểm tra trạng thái đăng nhập...</div>;
  }

   // Nếu đã đăng nhập, component useEffect sẽ tự chuyển hướng
   if (isAuthenticated) {
       return null; // Hoặc hiển thị thông báo đang chuyển hướng
   }


  return (
    <div>
      <h2>Đăng Nhập</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="loginIdentifier">Email hoặc Username:</label>
          <input
            type="text"
            id="loginIdentifier"
            value={loginIdentifier}
            onChange={(e) => setLoginIdentifier(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Mật khẩu:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
        </button>
        {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
      </form>
      <p style={{ marginTop: '15px' }}>
        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
      </p>
    </div>
  );
}

export default LoginPage;