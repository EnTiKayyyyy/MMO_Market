const { Store, User, Product } = require('../models');
const { Op } = require('sequelize');
const slugify = require('slugify');
const fs = require('fs'); // Để xử lý file (nếu cần xóa file cũ khi update)
const path = require('path'); // Để xử lý đường dẫn file

// Hàm tiện ích tạo slug duy nhất cho Store
async function generateUniqueStoreSlug(name, currentId = null) {
    let baseSlug = slugify(name, { lower: true, strict: true, replacement: '-' });
    let slug = baseSlug;
    let count = 1;
    const whereClause = { slug: slug };
    if (currentId) {
        whereClause.id = { [Op.ne]: currentId };
    }

    while (await Store.findOne({ where: whereClause })) {
        slug = `${baseSlug}-${count}`;
        count++;
        whereClause.slug = slug;
    }
    return slug;
}

// @desc    Tạo gian hàng mới
exports.createStore = async (req, res) => {
    const { store_name, slug, description } = req.body;
    const user_id = req.user.id;

    try {
        // 1. Kiểm tra user có phải là seller không (đã được authorize middleware xử lý)
        // 2. Kiểm tra user đã có gian hàng chưa
        const existingStore = await Store.findOne({ where: { user_id } });
        if (existingStore) {
            // Nếu đã upload file, cần xóa file đó đi
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Mỗi người bán chỉ được tạo một gian hàng.' });
        }

        // 3. Tạo slug
        let finalSlug = slug;
        if (!slug && store_name) {
            finalSlug = await generateUniqueStoreSlug(store_name);
        } else if (slug) {
            const slugExists = await Store.findOne({ where: { slug } });
            if (slugExists) {
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(400).json({ message: 'Slug này đã được sử dụng. Vui lòng chọn slug khác.' });
            }
        } else if (!store_name) {
             if (req.file) fs.unlinkSync(req.file.path);
            return res.status(400).json({ message: 'Tên gian hàng là bắt buộc để tạo slug.' });
        }


        // 4. Xử lý file ảnh bìa (banner)
        let banner_url = null;
        if (req.file) {
            // Chuẩn hóa đường dẫn để lưu vào CSDL (ví dụ: /uploads/stores/banners/filename.jpg)
            // Đường dẫn này phụ thuộc vào cách bạn cấu hình express.static
            banner_url = `/uploads/stores/banners/${req.file.filename}`;
        }

        const newStore = await Store.create({
            user_id,
            store_name,
            slug: finalSlug,
            description,
            banner_url
        });

        res.status(201).json({ message: 'Gian hàng đã được tạo thành công.', store: newStore });
    } catch (error) {
        if (req.file) { // Nếu có lỗi và đã upload file, xóa file đi
            try { fs.unlinkSync(req.file.path); } catch (e) { console.error("Error deleting uploaded file on failure:", e); }
        }
        console.error('Lỗi tạo gian hàng:', error);
        res.status(500).json({ message: 'Lỗi server khi tạo gian hàng.', error: error.message });
    }
};

// @desc    Lấy thông tin gian hàng của seller hiện tại
exports.getMyStore = async (req, res) => {
    try {
        const store = await Store.findOne({
            where: { user_id: req.user.id },
            include: [
                { model: User, as: 'user', attributes: ['id', 'username', 'email', 'full_name'] },
                // Có thể thêm include Products để hiển thị một vài sản phẩm của store
                // { model: Product, as: 'products', through: {attributes: []} /* nếu Product và Store có quan hệ M-M */ }
                // Nếu Product chỉ liên quan qua User(seller), thì phải query riêng hoặc lồng include
            ]
        });

        if (!store) {
            return res.status(404).json({ message: 'Bạn chưa tạo gian hàng.' });
        }
        res.json(store);
    } catch (error) {
        console.error('Lỗi lấy gian hàng:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy thông tin gian hàng.', error: error.message });
    }
};

// @desc    Cập nhật gian hàng của seller hiện tại
exports.updateMyStore = async (req, res) => {
    const { store_name, slug, description } = req.body;
    const user_id = req.user.id;

    try {
        const store = await Store.findOne({ where: { user_id } });
        if (!store) {
            if (req.file) fs.unlinkSync(req.file.path); // Xóa file mới upload nếu store không tồn tại
            return res.status(404).json({ message: 'Không tìm thấy gian hàng của bạn để cập nhật.' });
        }

        // Xử lý slug nếu có thay đổi
        let finalSlug = store.slug;
        if (slug && slug !== store.slug) {
            finalSlug = await generateUniqueStoreSlug(slug, store.id);
        } else if (store_name && store_name !== store.store_name && !slug) { // Nếu chỉ tên thay đổi, slug cũng nên thay đổi theo
            finalSlug = await generateUniqueStoreSlug(store_name, store.id);
        }


        // Xử lý ảnh bìa mới
        let banner_url = store.banner_url;
        if (req.file) {
            // Xóa ảnh bìa cũ nếu có
            if (store.banner_url) {
                const oldBannerPath = path.join(__dirname, '..', '..', store.banner_url); // Điều chỉnh đường dẫn này
                try {
                    if (fs.existsSync(oldBannerPath)) {
                         fs.unlinkSync(oldBannerPath);
                    }
                } catch(e) { console.error("Error deleting old banner:", e); }
            }
            banner_url = `/uploads/stores/banners/${req.file.filename}`;
        }

        store.store_name = store_name || store.store_name;
        store.slug = finalSlug;
        store.description = description !== undefined ? description : store.description;
        store.banner_url = banner_url;

        await store.save();
        res.json({ message: 'Gian hàng đã được cập nhật.', store });

    } catch (error) {
         if (req.file) { // Nếu có lỗi và đã upload file, xóa file đi
            try { fs.unlinkSync(req.file.path); } catch (e) { console.error("Error deleting uploaded file on failure:", e); }
        }
        console.error('Lỗi cập nhật gian hàng:', error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật gian hàng.', error: error.message });
    }
};

// @desc    Lấy thông tin gian hàng theo slug (Public)
exports.getStoreBySlug = async (req, res) => {
    try {
        const store = await Store.findOne({
            where: { slug: req.params.slug },
            include: [
                { model: User, as: 'user', attributes: ['id', 'username', 'full_name', 'avatar_url'] },
                // Lấy thêm sản phẩm của gian hàng này
                // Cần quan hệ User.hasMany(Product)
            ]
        });

        if (!store) {
            return res.status(404).json({ message: 'Gian hàng không tìm thấy.' });
        }

        // Lấy sản phẩm của người bán này
        const products = await Product.findAll({
            where: { seller_id: store.user_id, status: 'available' },
            limit: 10, // Giới hạn số sản phẩm hiển thị
            order: [['createdAt', 'DESC']],
            attributes: { exclude: ['product_data'] } // Không hiển thị data nhạy cảm
        });

        // Trả về store kèm sản phẩm
        const storeData = store.toJSON();
        storeData.products = products;

        res.json(storeData);
    } catch (error) {
        console.error('Lỗi lấy gian hàng theo slug:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};

// @desc    Lấy thông tin gian hàng theo ID người bán (Public)
exports.getStoreBySellerId = async (req, res) => {
    try {
        const sellerId = req.params.sellerId;
        const store = await Store.findOne({
            where: { user_id: sellerId },
            include: [{ model: User, as: 'user', attributes: ['id', 'username', 'full_name', 'avatar_url'] }]
        });

        if (!store) {
            return res.status(404).json({ message: 'Gian hàng của người bán này không tìm thấy.' });
        }
         // Lấy sản phẩm của người bán này
        const products = await Product.findAll({
            where: { seller_id: sellerId, status: 'available' },
            limit: 10,
            order: [['createdAt', 'DESC']],
            attributes: { exclude: ['product_data'] }
        });

        const storeData = store.toJSON();
        storeData.products = products;

        res.json(storeData);
    } catch (error) {
        console.error('Lỗi lấy gian hàng theo seller ID:', error);
        res.status(500).json({ message: 'Lỗi server.', error: error.message });
    }
};