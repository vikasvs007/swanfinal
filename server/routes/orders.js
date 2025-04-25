// routes/orders.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { combinedAuth } = require('../middleware/auth');

// Create a new order - requires authentication
router.post('/', combinedAuth, orderController.createOrder);

// Get all orders - requires authentication
router.get('/', combinedAuth, orderController.getAllOrders);

// Get a single order - requires authentication
router.get('/:id', combinedAuth, orderController.getOrder);

// Update an order - requires authentication
router.put('/:id', combinedAuth, orderController.updateOrder);

// Delete an order - requires authentication
router.delete('/:id', combinedAuth, orderController.deleteOrder);

module.exports = router;