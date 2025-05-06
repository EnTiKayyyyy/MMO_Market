// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerApi } from '../api/authApi'; // Import hàm register từ authApi, đổi tên

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false); // Thêm trạng thái đăng ký thành công

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    // Client-side validation: kiểm tra mật khẩu khớp
    if (password !== passwordConfirm) {
      setError('Mật khẩu xác nhận không khớp.');
      setLoading(false);
      return;
    }

    try {
      // Gọi hàm API đăng ký
      const result = await registerApi({ username, email, password });

      // Nếu thành công:
      console.log('Registration successful:', result);
      setSuccess(true);
      // Chuyển hướng về trang đăng nhập sau 2 giây hoặc ngay lập tức
      setTimeout(() => {
         navigate('/login');
      }, 2000); // Chuyển hướng sau 2 giây

      // Tùy chọn: Nếu backend tự động đăng nhập sau đăng ký và trả về token,
      // bạn có thể gọi authLogin(result.user, result.token) ở đây và chuyển hướng về trang chủ

    } catch (err) {
      // Nếu lỗi:
      console.error('Registration failed:', err);
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Đăng Ký Tài Khoản</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            minLength="6" // Thêm ràng buộc độ dài tối thiểu
          />
        </div>
        <div>
          <label htmlFor="passwordConfirm">Xác nhận mật khẩu:</label>
          <input
            type="password"
            id="passwordConfirm"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            minLength="6"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Đăng Ký'}
        </button>
        {error && <div style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
        {success && <div style={{ color: 'green', marginTop: '10px' }}>Đăng ký thành công! Đang chuyển hướng...</div>}
      </form>
      <p style={{ marginTop: '15px' }}>
        Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
      </p>
    </div>
  );
}

export default RegisterPage;