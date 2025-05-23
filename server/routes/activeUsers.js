// activeUsers.js
const express = require('express');
const router = express.Router();
const activeUserController = require('../controllers/activeUserController');
const { combinedAuth, adminAuth } = require('../middleware/auth');

// Public route - creates user sessions
router.post('/track', activeUserController.createActiveSession);

// Protected routes - viewing and managing sessions requires admin authentication
router.get('/sessions/list', adminAuth, activeUserController.getActiveUsers);
router.put('/sessions/update/:id', adminAuth, activeUserController.updateSession);
router.delete('/sessions/end/:id', adminAuth, activeUserController.endSession);
router.get('/sessions/stats', adminAuth, activeUserController.getActiveUserStats);

module.exports = router;