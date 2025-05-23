// routes/orders.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { combinedAuth, adminAuth } = require('../middleware/auth');

// Create a new order - requires admin authentication
router.post('/create', adminAuth, orderController.createOrder);

// Get all orders - requires authentication (can remain combinedAuth if non-admins should view their own orders)
router.get('/list', combinedAuth, orderController.getAllOrders);

// Get a single order - requires authentication (can remain combinedAuth if non-admins should view their own order)
router.get('/details/:id', combinedAuth, orderController.getOrder);

// Update an order - requires admin authentication
router.put('/update/:id', adminAuth, orderController.updateOrder);

// Delete an order - requires admin authentication
router.delete('/remove/:id', adminAuth, orderController.deleteOrder);

module.exports = router;