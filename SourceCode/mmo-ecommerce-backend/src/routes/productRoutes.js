// src/routes/productRoutes.js
const express = require('express');
const { getProducts, getProduct } = require('../controllers/productController'); // Import public controller

const router = express.Router();

router.route('/')
  .get(getProducts); // GET /api/products (Public list)

router.route('/:identifier')
  .get(getProduct); // GET /api/products/:identifier (Public detail by ID or slug)

module.exports = router;