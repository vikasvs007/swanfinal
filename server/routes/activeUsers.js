// activeUsers.js
const express = require('express');
const router = express.Router();
const activeUserController = require('../controllers/activeUserController');
const { combinedAuth } = require('../middleware/auth');

// Protected routes
router.get('/', combinedAuth, activeUserController.getActiveUsers);
router.get('/sessions', combinedAuth, activeUserController.getActiveUserStats);

module.exports = router;