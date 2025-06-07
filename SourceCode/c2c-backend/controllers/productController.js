const { Product, User, Category } = require('../models'); // Lấy từ models/index.js
const { Op } = require('sequelize'); // Để dùng các toán tử của Sequelize
const fs = require('fs'); // THÊM DÒNG NÀY
const path = require('path'); // THÊM DÒNG NÀY
// @desc    Tạo sản phẩm mới
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, category_id, product_data } = req.body;
        const seller_id = req.user.id;

        // Xử lý đường dẫn file ảnh
        let thumbnail_url = null;
        if (req.file) {
            // Đường dẫn tương đối để frontend có thể truy cập
            thumbnail_url = `/uploads/products/${req.file.filename}`;
        }

        const category = await Category.findByPk(category_id);
        if (!category) {
            return res.status(404).json({ message: 'Danh mục không tồn tại.' });
        }

        const newProduct = await Product.create({
            name,
            description,
            price,
            thumbnail_url, // <-- LƯU ĐƯỜNG DẪN ẢNH
            category_id,
            product_data,
            status: req.user.role === 'admin' ? 'available' : 'pending_approval',
            seller_id
        });

        res.status(201).json({ message: 'Sản phẩm đã được tạo và chờ duyệt.', product: newProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi tạo sản phẩm.', error: error.message });
    }
};

// @desc    Lấy tất cả sản phẩm (có phân trang, lọc, sắp xếp)
exports.getAllProducts = async (req, res) => {
    try {
        // 1. Phân trang
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 12; // Ví dụ: 12 sản phẩm/trang
        if (page < 1) page = 1;
        if (limit < 1) limit = 1;
        if (limit > 100) limit = 100; // Giới hạn tối đa để bảo vệ server
        const offset = (page - 1) * limit;

        // 2. Sắp xếp
        const allowedSortByFields = ['createdAt', 'name', 'price', 'updatedAt']; // Các trường cho phép sắp xếp
        const sortBy = allowedSortByFields.includes(req.query.sortBy) ? req.query.sortBy : 'createdAt';
        const sortOrderQuery = (req.query.sortOrder || 'DESC').toUpperCase();
        const sortOrder = ['ASC', 'DESC'].includes(sortOrderQuery) ? sortOrderQuery : 'DESC';
        const order = [[sortBy, sortOrder]];
        // Nếu sortBy là một trường của model liên kết, ví dụ 'category.name':
        // const order = [[{ model: Category, as: 'category' }, 'name', sortOrder]]; // Ví dụ

        // 3. Lọc
        const whereClause = {};
        const { search, categoryId, categorySlug, sellerId, minPrice, maxPrice, status } = req.query;

        // Mặc định, người dùng chỉ xem sản phẩm 'available'
        whereClause.status = status || 'available';
        // Admin có thể muốn xem tất cả status, khi đó route của admin sẽ không set mặc định này
        // hoặc client của admin sẽ gửi query status='' (cần xử lý server-side)

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } } // Tìm cả trong mô tả
            ];
        }

        if (categoryId) {
            const catIdNum = parseInt(categoryId);
            if (!isNaN(catIdNum) && catIdNum > 0) {
                whereClause.category_id = catIdNum;
            }
        } else if (categorySlug) {
            const categoryObj = await Category.findOne({ where: { slug: categorySlug } });
            if (categoryObj) {
                whereClause.category_id = categoryObj.id;
            } else {
                // Nếu slug không tìm thấy, trả về mảng rỗng để không lỗi
                return res.json({ totalItems: 0, totalPages: 0, currentPage: 1, limit, products: [] });
            }
        }


        if (sellerId) {
            const sellerIdNum = parseInt(sellerId);
            if (!isNaN(sellerIdNum) && sellerIdNum > 0) {
                whereClause.seller_id = sellerIdNum;
            }
        }

        if (minPrice || maxPrice) {
            whereClause.price = {};
            if (minPrice) {
                const minP = parseFloat(minPrice);
                if (!isNaN(minP)) whereClause.price[Op.gte] = minP;
            }
            if (maxPrice) {
                const maxP = parseFloat(maxPrice);
                if (!isNaN(maxP)) whereClause.price[Op.lte] = maxP;
                 if (whereClause.price[Op.gte] && maxP < whereClause.price[Op.gte]) {
                    // Đảm bảo maxPrice không nhỏ hơn minPrice nếu cả hai đều có
                    delete whereClause.price[Op.lte]; // Hoặc báo lỗi
                }
            }
        }

        // 4. Truy vấn CSDL
        const { count, rows } = await Product.findAndCountAll({
            where: whereClause,
            include: [
                { model: User, as: 'seller', attributes: ['id', 'username', 'full_name', 'avatar_url'] },
                { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }
            ],
            attributes: { exclude: ['product_data'] }, // Quan trọng: Không lộ product_data ở danh sách công khai
            limit: limit,
            offset: offset,
            order: order,
            distinct: true, // Cần thiết nếu include tạo ra các bản ghi trùng lặp (ví dụ include nhiều hasMany)
        });

        // 5. Trả về kết quả
        res.json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            limit: limit,
            products: rows
        });

    } catch (error) {
        console.error('Lỗi lấy danh sách sản phẩm:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách sản phẩm.', error: error.message });
    }
};

// @desc    Lấy chi tiết một sản phẩm
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [
                { model: User, as: 'seller', attributes: ['id', 'username', 'full_name'] },
                { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }
            ],
            attributes: { exclude: ['product_data'] } // KHÔNG trả về product_data công khai
        });

        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tìm thấy.' });
        }
        // Nếu sản phẩm không ở trạng thái 'available' và người dùng không phải admin/owner thì có thể không cho xem
        if (product.status !== 'available' && (!req.user || (req.user.id !== product.seller_id && req.user.role !== 'admin'))) {
             return res.status(403).json({ message: 'Bạn không có quyền xem sản phẩm này.' });
        }

        res.json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi lấy chi tiết sản phẩm.', error: error.message });
    }
};

// @desc    Cập nhật sản phẩm (Bởi Seller hoặc Admin)
exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category_id, product_data } = req.body;

    try {
        const product = await Product.findByPk(id);
        if (!product) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: 'Sản phẩm không tìm thấy.' });
        }

        if (product.seller_id !== req.user.id && req.user.role !== 'admin') {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(403).json({ message: 'Bạn không có quyền cập nhật sản phẩm này.' });
        }

        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.category_id = category_id || product.category_id;
        
        if (product_data) {
            product.product_data = product_data;
        }

        if (req.file) {
            const oldThumbnail = product.thumbnail_url;
            product.thumbnail_url = `/uploads/products/${req.file.filename}`;

            if (oldThumbnail) {
                // Sử dụng __dirname để có đường dẫn tuyệt đối đến thư mục hiện tại
                const oldPath = path.join(__dirname, '..', oldThumbnail);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
        }
        
        if (req.user.role === 'seller') {
            product.status = 'pending_approval';
        }

        await product.save();
        
        res.json({ 
            message: 'Sản phẩm đã được cập nhật và đang chờ duyệt lại.', 
            product 
        });

    } catch (error) {
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkErr) {
                console.error("Lỗi khi xóa file upload thất bại:", unlinkErr);
            }
        }
        console.error("Lỗi khi cập nhật sản phẩm:", error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật sản phẩm.', error: error.message });
    }
};


// @desc    Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Sản phẩm không tìm thấy.' });
        }

        // Kiểm tra quyền: chỉ chủ sở hữu hoặc admin mới được xóa
        if (product.seller_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền xóa sản phẩm này.' });
        }

        await product.destroy();
        res.json({ message: 'Sản phẩm đã được xóa.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi xóa sản phẩm.', error: error.message });
    }
};