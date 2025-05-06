// src/routes/adminCategoryRoutes.js
const express = require('express');
const { createCategoryAdmin, updateCategoryAdmin, deleteCategoryAdmin } = require('../controllers/adminCategoryController'); // Import controllers
const protect = require('../middleware/authMiddleware'); // Import auth middleware
const authorizeRoles = require('../middleware/roleMiddleware'); // Import role middleware

const router = express.Router();

// Áp dụng middleware protect và authorizeRoles('admin') cho tất cả các route trong router này
router.use(protect);
router.use(authorizeRoles('admin'));

router.route('/')
  .post(createCategoryAdmin); // POST /api/admin/categories

router.route('/:categoryId')
  .put(updateCategoryAdmin) // PUT /api/admin/categories/:categoryId
  .delete(deleteCategoryAdmin); // DELETE /api/admin/categories/:categoryId

module.exports = router;