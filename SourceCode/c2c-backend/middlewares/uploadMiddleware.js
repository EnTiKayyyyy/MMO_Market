const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createFolderIfNotExists = (folderPath) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
};

const storeStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '..', 'uploads', 'stores', 'banners');
        createFolderIfNotExists(uploadPath); // Tạo thư mục nếu chưa có
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, `store-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif') {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file ảnh (jpeg, png, gif)!'), false);
    }
};

const uploadStoreBanner = multer({
    storage: storeStorage,
    limits: {
        fileSize: 1024 * 1024 * 2 // Giới hạn 2MB cho banner
    },
    fileFilter: fileFilter
});

module.exports = uploadStoreBanner; // Xuất upload middleware cụ thể cho store banner