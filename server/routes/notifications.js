const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Routes without authentication
router.get('/', notificationController.getNotifications);
router.post('/', notificationController.createNotification);
router.put('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;