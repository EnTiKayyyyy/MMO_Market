// src/routes/categoryRoutes.js
const express = require('express');
const { getCategories, getCategory } = require('../controllers/categoryController'); // Import controllers

const router = express.Router();

router.route('/')
  .get(getCategories); // GET /api/categories

router.route('/:identifier')
  .get(getCategory); // GET /api/categories/:identifier (ID hoặc slug)

module.exports = router;