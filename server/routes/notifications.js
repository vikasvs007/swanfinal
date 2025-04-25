const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { combinedAuth } = require('../middleware/auth');

// All notification routes require authentication
router.get('/', combinedAuth, notificationController.getNotifications);
router.post('/', combinedAuth, notificationController.createNotification);
router.put('/:id/read', combinedAuth, notificationController.markAsRead);
router.delete('/:id', combinedAuth, notificationController.deleteNotification);

module.exports = router;