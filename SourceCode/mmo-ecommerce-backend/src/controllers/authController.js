// src/controllers/authController.js
const asyncHandler = require('../middleware/asyncHandler'); // Helper bắt lỗi async (sẽ tạo)
const { registerUser, loginUser, findUserById } = require('../services/authService'); // Import service
const { generateToken } = require('../services/authService'); // Import generateToken để dùng trong /me

// @desc    Đăng ký người dùng
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
      res.status(400);
      throw new Error('Vui lòng điền đầy đủ thông tin.');
  }

  // Gọi service để xử lý logic đăng ký
  const result = await registerUser({ username, email, password });

  // Gửi response thành công
  res.status(201).json({
    user: result.user,
    token: result.token,
    message: 'Đăng ký thành công.',
  });
});

// @desc    Đăng nhập người dùng
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { login, password } = req.body; // 'login' có thể là email hoặc username

   if (!login || !password) {
      res.status(400);
      throw new Error('Vui lòng điền Email/Username và mật khẩu.');
  }

  // Gọi service để xử lý logic đăng nhập
  const result = await loginUser({ login, password });

   // Gửi response thành công
  res.status(200).json({
    user: result.user,
    token: result.token,
    message: 'Đăng nhập thành công.',
  });
});

// @desc    Lấy thông tin người dùng hiện tại (sau khi xác thực)
// @route   GET /api/auth/me
// @access  Private (cần token)
const getMe = asyncHandler(async (req, res) => {
  // Thông tin user đã được gắn vào req.user bởi authMiddleware
  // Chỉ cần trả về thông tin này
  if (req.user) {
       // Tùy chọn: Tạo token mới nếu cần refresh token trên mỗi request (stateless)
       // const newToken = generateToken(req.user.user_id);
       res.status(200).json({
         user: req.user,
        //  token: newToken // Trả về token mới nếu dùng refresh
       });
  } else {
      // Trường hợp này hiếm xảy ra nếu authMiddleware hoạt động đúng
      res.status(404).json({ message: 'Không tìm thấy thông tin người dùng.' });
  }

});


// @desc    Đăng xuất người dùng (phía server nếu cần blacklist token)
// @route   POST /api/auth/logout
// @access  Private (cần token)
// Note: Với JWT stateless, logout thường chỉ cần client xóa token.
// Endpoint này có thể dùng nếu bạn triển khai blacklist token phía server.
const logout = asyncHandler(async (req, res) => {
  // Logic blacklist token nếu có
  // Ví dụ: Lưu token vào Redis với thời gian hết hạn ngắn

  res.status(200).json({ message: 'Đăng xuất thành công.' }); // Client sẽ xóa token
});


module.exports = {
  register,
  login,
  getMe,
  logout,
};