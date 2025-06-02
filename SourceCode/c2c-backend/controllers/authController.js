const User = require('../models/User'); // Đảm bảo đường dẫn đúng
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.register = async (req, res) => {
  try {
    const { username, email, password, full_name, role } = req.body; // Lấy password thay vì password_hash
    // Kiểm tra xem user đã tồn tại chưa
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã được sử dụng.' });
    }
    const newUser = await User.create({
      username,
      email,
      password_hash: password, // Sequelize hook sẽ hash mật khẩu này
      full_name,
      role: role || 'buyer' // Mặc định là buyer nếu không cung cấp
    });
    res.status(201).json({ message: 'Đăng ký thành công!', userId: newUser.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi đăng ký.', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    const isMatch = await user.isValidPassword(password); // Hàm này đã được định nghĩa trong User model
    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Thời gian token hết hạn
    );

    res.json({
      message: 'Đăng nhập thành công!',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi đăng nhập.', error: error.message });
  }
};