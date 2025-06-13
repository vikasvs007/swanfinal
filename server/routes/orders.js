// routes/orders.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { combinedAuth, adminAuth } = require('../middleware/auth');

// Get all orders - requires admin authentication
router.get('/', combinedAuth, orderController.getOrders);

// Get order by ID - requires admin authentication
router.get('/:id', combinedAuth, orderController.getOrderById);

// Create a new order - requires admin authentication
router.post('/', combinedAuth, orderController.createOrder);

// Update an order - requires admin authentication
router.put('/:id', combinedAuth, orderController.updateOrder);

// Delete an order - requires admin authentication
router.delete('/:id', combinedAuth, orderController.deleteOrder);

module.exports = router;