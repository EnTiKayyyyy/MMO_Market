// generateHash.js
const bcrypt = require('bcryptjs');

async function hashPassword() {
    const password = 'Admin@123';
    const saltRounds = 10; // Số vòng lặp salt, 10-12 là phổ biến
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log('Mật khẩu gốc:', password);
        console.log('Chuỗi hash (lưu vào CSDL):', hashedPassword);
        // Ví dụ output: $2a$10$abcdefghijklmnopqrstuvwxy.ABCDEFGHIJKLMNOPQRSTUVW.
    } catch (error) {
        console.error('Lỗi khi hash mật khẩu:', error);
    }
}

hashPassword();