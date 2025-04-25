// routes/products.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { combinedAuth, auth } = require('../middleware/auth');

// Create a new product - requires authentication
router.post('/', combinedAuth, productController.createProduct);

// Get all products - public endpoint
router.get('/', productController.getProducts);

// Search products - public endpoint
router.get('/search', productController.searchProducts);

// Get a single product - public endpoint
router.get('/:id', productController.getProduct);

// Update a product - requires authentication
router.put('/:id', combinedAuth, productController.updateProduct);

// Delete a product - requires authentication
router.delete('/:id', combinedAuth, productController.deleteProduct);

module.exports = router;