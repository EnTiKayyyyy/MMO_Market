const { Category, Product, sequelize } = require('../models'); // Lấy từ models/index.js
const { Op } = require('sequelize');
const slugify = require('slugify'); // Cài đặt: npm install slugify

// Hàm tiện ích tạo slug duy nhất
async function generateUniqueSlug(name, currentId = null) {
    let baseSlug = slugify(name, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 1;
    const whereClause = { slug: slug };
    if (currentId) {
        whereClause.id = { [Op.ne]: currentId }; // Loại trừ ID hiện tại khi cập nhật
    }

    while (await Category.findOne({ where: whereClause })) {
        slug = `${baseSlug}-${count}`;
        count++;
        whereClause.slug = slug; // Cập nhật slug trong điều kiện lặp
    }
    return slug;
}

// @desc    Tạo danh mục mới
exports.createCategory = async (req, res) => {
    const { name, slug, parent_id } = req.body;
    try {
        const finalSlug = slug ? slug : await generateUniqueSlug(name);

        // Nếu slug được cung cấp, kiểm tra tính duy nhất
        if (slug) {
            const existingSlug = await Category.findOne({ where: { slug: finalSlug } });
            if (existingSlug) {
                return res.status(400).json({ message: 'Slug đã tồn tại. Vui lòng chọn slug khác.' });
            }
        }

        const newCategory = await Category.create({
            name,
            slug: finalSlug,
            parent_id: parent_id || null
        });
        res.status(201).json({ message: 'Danh mục đã được tạo.', category: newCategory });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi tạo danh mục.', error: error.message });
    }
};

// @desc    Lấy tất cả danh mục (dạng phẳng)
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.findAll({
            order: [['name', 'ASC']],
            include: [ // Tùy chọn: Lấy thông tin danh mục cha
                { model: Category, as: 'parentCategory', attributes: ['id', 'name', 'slug'] }
            ]
        });
        res.json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách danh mục.', error: error.message });
    }
};

// @desc    Lấy tất cả danh mục (dạng cây)
exports.getCategoryTree = async (req, res) => {
    try {
        const allCategories = await Category.findAll({
            order: [['name', 'ASC']],
            // attributes: ['id', 'name', 'slug', 'parent_id'] // Lấy các trường cần thiết
        });

        const buildTree = (categories, parentId = null) => {
            const tree = [];
            categories.forEach(category => {
                if (category.parent_id === parentId) {
                    const children = buildTree(categories, category.id);
                    const categoryNode = category.toJSON(); // Chuyển sang plain object để thêm children
                    if (children.length) {
                        categoryNode.subCategories = children;
                    }
                    tree.push(categoryNode);
                }
            });
            return tree;
        };

        const categoryTree = buildTree(allCategories);
        res.json(categoryTree);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi lấy cây danh mục.', error: error.message });
    }
};

// @desc    Lấy chi tiết một danh mục
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findByPk(req.params.id, {
            include: [
                { model: Category, as: 'parentCategory', attributes: ['id', 'name', 'slug'] },
                { model: Category, as: 'subCategories', attributes: ['id', 'name', 'slug'] },
                { model: Product, as: 'products', attributes: ['id', 'name'], limit: 5 } // Giới hạn số sản phẩm mẫu
            ]
        });
        if (!category) {
            return res.status(404).json({ message: 'Danh mục không tìm thấy.' });
        }
        res.json(category);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi lấy chi tiết danh mục.', error: error.message });
    }
};

// @desc    Cập nhật danh mục
exports.updateCategory = async (req, res) => {
    const { name, slug, parent_id } = req.body;
    const { id } = req.params;

    try {
        const category = await Category.findByPk(id);
        if (!category) {
            return res.status(404).json({ message: 'Danh mục không tìm thấy.' });
        }

        // Kiểm tra parent_id không phải là chính nó hoặc con của nó
        if (parent_id) {
            if (parseInt(parent_id) === parseInt(id)) {
                return res.status(400).json({ message: 'Không thể đặt danh mục cha là chính nó.' });
            }
            // Nâng cao: Kiểm tra parent_id không phải là một trong các subCategories của category hiện tại
            const subCategories = await Category.findAll({
                where: { parent_id: id }
            });
            const subCategoryIds = subCategories.map(sub => sub.id);
            if (subCategoryIds.includes(parseInt(parent_id))) {
                 return res.status(400).json({ message: 'Không thể đặt danh mục cha là một trong các danh mục con của nó.' });
            }
        }


        let finalSlug = category.slug;
        if (slug && slug !== category.slug) { // Nếu slug được cung cấp và khác slug cũ
            finalSlug = await generateUniqueSlug(slug, category.id); // Tạo slug mới duy nhất, loại trừ id hiện tại
        } else if (name && name !== category.name && !slug) { // Nếu name thay đổi và slug không được cung cấp
            finalSlug = await generateUniqueSlug(name, category.id);
        }


        category.name = name || category.name;
        category.slug = finalSlug;
        category.parent_id = parent_id !== undefined ? (parent_id || null) : category.parent_id; // Cho phép set parent_id về null

        await category.save();
        res.json({ message: 'Danh mục đã được cập nhật.', category });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật danh mục.', error: error.message });
    }
};

// @desc    Xóa danh mục
exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    const transaction = await sequelize.transaction();
    try {
        const category = await Category.findByPk(id, { transaction });
        if (!category) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Danh mục không tìm thấy.' });
        }

        // 1. Kiểm tra xem danh mục có sản phẩm nào không
        const productCount = await Product.count({ where: { category_id: id }, transaction });
        if (productCount > 0) {
            await transaction.rollback();
            return res.status(400).json({ message: `Không thể xóa danh mục vì còn ${productCount} sản phẩm thuộc danh mục này. Vui lòng chuyển sản phẩm sang danh mục khác trước.` });
        }

        // 2. Xử lý danh mục con:
        // Lựa chọn: Nâng cấp danh mục con lên (parent_id = null hoặc parent_id của danh mục bị xóa)
        // Hoặc: Cấm xóa nếu có danh mục con (đơn giản hơn)
        const subCategoryCount = await Category.count({ where: { parent_id: id }, transaction });
        if (subCategoryCount > 0) {
            // Option A: Cấm xóa
            // await transaction.rollback();
            // return res.status(400).json({ message: `Không thể xóa danh mục vì còn ${subCategoryCount} danh mục con. Vui lòng xử lý danh mục con trước.` });

            // Option B: Nâng cấp danh mục con (parent_id của chúng sẽ thành parent_id của category bị xóa)
            await Category.update(
                { parent_id: category.parent_id }, // Gán parent_id của category cha cho các category con
                { where: { parent_id: id }, transaction }
            );
        }

        await category.destroy({ transaction });
        await transaction.commit();
        res.json({ message: 'Danh mục đã được xóa.' });
    } catch (error) {
        await transaction.rollback();
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi xóa danh mục.', error: error.message });
    }
};