// routes/products.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { combinedAuth, adminAuth, apiKeyAuth, auth } = require('../middleware/auth');
const { validateRequest, productValidationRules, sensitiveOperationsLimit } = require('../middleware/securityMiddleware');

// Create a new product - requires admin authentication and input validation
router.post('/', 
  apiKeyAuth, 
  sensitiveOperationsLimit, 
  validateRequest(productValidationRules),
  productController.createProduct
);

// Get all products - public endpoint but with basic rate limiting
router.get('/', productController.getProducts);

// Search products - public endpoint
router.get('/search', productController.searchProducts);

// Get a single product - public endpoint
router.get('/:id', productController.getProduct);

// Update a product - requires admin authentication and input validation
router.put('/:id', 
  apiKeyAuth, 
  sensitiveOperationsLimit,
  validateRequest(productValidationRules),
  productController.updateProduct
);

// Delete a product - requires admin authentication and rate limiting
router.delete('/:id', 
  apiKeyAuth, 
  sensitiveOperationsLimit,
  productController.deleteProduct
);

module.exports = router;