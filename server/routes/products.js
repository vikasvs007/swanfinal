// routes/products.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { combinedAuth, adminAuth, apiKeyAuth } = require('../middleware/auth');
const { validateRequest, productValidationRules, sensitiveOperationsLimit } = require('../middleware/securityMiddleware');

// Get all products - public endpoint
router.get('/', productController.getProducts);

// Get product by ID - public endpoint
router.get('/:id', productController.getProductById);

// Create a new product - requires admin authentication and input validation
router.post('/', 
  apiKeyAuth, 
  sensitiveOperationsLimit, 
  validateRequest(productValidationRules),
  productController.createProduct
);

// Update a product - requires admin authentication and input validation
router.put('/:id', 
  apiKeyAuth, 
  sensitiveOperationsLimit,
  validateRequest(productValidationRules),
  productController.updateProduct
);

// Delete a product - requires admin authentication
router.delete('/:id', apiKeyAuth, productController.deleteProduct);

module.exports = router;