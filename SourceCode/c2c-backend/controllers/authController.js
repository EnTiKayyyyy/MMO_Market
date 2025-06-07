const { User, Wallet, sequelize } = require('../models'); // Import thêm Wallet và sequelize
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.register = async (req, res) => {
  const { username, email, password, full_name, role } = req.body;
  
  // Bắt đầu một transaction
  const t = await sequelize.transaction();

  try {
    // Kiểm tra xem email hoặc username đã tồn tại chưa (trong transaction)
    const existingUser = await User.findOne({ 
        where: { 
            [require('sequelize').Op.or]: [{ email }, { username }]
        },
        transaction: t
    });

    if (existingUser) {
      // Nếu đã tồn tại, hủy transaction và báo lỗi
      await t.rollback();
      if (existingUser.email === email) {
          return res.status(400).json({ message: 'Email này đã được sử dụng.' });
      }
      return res.status(400).json({ message: 'Tên đăng nhập này đã được sử dụng.' });
    }
    
    // Tạo người dùng mới trong transaction
    const newUser = await User.create({
      username,
      email,
      password_hash: password, // Sequelize hook sẽ băm mật khẩu
      full_name,
      role: role || 'buyer'
    }, { transaction: t });

    // SỬA ĐỔI: Tạo ví cho người dùng mới với số dư 100đ trong cùng transaction
    await Wallet.create({
        user_id: newUser.id,
        balance: 100.00,
    }, { transaction: t });

    // Nếu tất cả các thao tác thành công, commit transaction
    await t.commit();

    res.status(201).json({ message: 'Đăng ký thành công! Ví của bạn đã được tạo với 100đ.', userId: newUser.id });
  } catch (error) {
    // Nếu có bất kỳ lỗi nào, rollback tất cả các thay đổi
    await t.rollback();
    
    if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(err => err.message);
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ', errors: messages });
    }
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi đăng ký.', error: error.message });
  }
};

// Hàm login giữ nguyên
exports.login = async (req, res) => {
    // ... code login không thay đổi
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        if (!user) {
          return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
        }
    
        const isMatch = await user.isValidPassword(password);
        if (!isMatch) {
          return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
        }
    
        const token = jwt.sign(
          { id: user.id, role: user.role, username: user.username, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );
    
        res.json({
          message: 'Đăng nhập thành công!',
          token,
          user: { id: user.id, username: user.username, email: user.email, role: user.role, name: user.full_name, avatar: user.avatar_url }
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi đăng nhập.', error: error.message });
      }
};
