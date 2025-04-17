// activeUsers.js
const express = require('express');
const router = express.Router();
const activeUserController = require('../controllers/activeUserController');

// Routes without authentication
router.get('/', activeUserController.getActiveUsers);
router.post('/', activeUserController.createActiveSession);
router.put('/:id', activeUserController.updateSession);
router.delete('/:id', activeUserController.endSession);
router.get('/statistics', activeUserController.getActiveUserStats);

module.exports = router;