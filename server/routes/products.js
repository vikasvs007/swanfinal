// routes/products.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Create a new product
router.post('/', productController.createProduct);

// Get all products
router.get('/', productController.getProducts);

// Search products
router.get('/search', productController.searchProducts);

// Get a single product
router.get('/:id', productController.getProduct);

// Update a product
router.put('/:id', productController.updateProduct);

// Delete a product
router.delete('/:id', productController.deleteProduct);

module.exports = router;