const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { combinedAuth, adminAuth } = require('../middleware/auth');

// All notification routes require authentication
router.get('/list', combinedAuth, notificationController.getNotifications);

// Create, mark as read, and delete notifications - require admin authentication
router.post('/create', adminAuth, notificationController.createNotification);
router.put('/mark-read/:id', adminAuth, notificationController.markAsRead);
router.delete('/remove/:id', adminAuth, notificationController.deleteNotification);

module.exports = router;