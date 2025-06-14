// activeUsers.js
const express = require('express');
const router = express.Router();
const activeUserController = require('../controllers/activeUserController');
const { combinedAuth,requireAuth } = require('../middleware/auth');

// Public route - creates user sessions
router.post('/', activeUserController.createActiveSession);

// Protected routes - viewing and managing sessions requires auth
router.get('/', requireAuth, activeUserController.getActiveUsers);
router.put('/:id', combinedAuth, activeUserController.updateSession);
router.delete('/:id', combinedAuth, activeUserController.endSession);
router.get('/statistics', combinedAuth, activeUserController.getActiveUserStats);

module.exports = router;