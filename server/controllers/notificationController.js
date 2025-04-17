// controllers/notificationController.js
const Notification = require('../models/Notification');

const notificationController = {
  // Get all notifications
  async getNotifications(req, res) {
    try {
      const notifications = await Notification.find({ is_deleted: false })
        .populate('user_id', 'name email')
        .sort({ created_at: -1 });

      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create a new notification
  async createNotification(req, res) {
    try {
      const notification = new Notification({
        user_id: req.body.user_id,
        message: req.body.message,
        is_read: false,
        is_deleted: false
      });

      const savedNotification = await notification.save();
      res.status(201).json(savedNotification);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Mark notification as read
  async markAsRead(req, res) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        req.params.id,
        { is_read: true },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Delete a notification (soft delete)
  async deleteNotification(req, res) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        req.params.id,
        { is_deleted: true },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = notificationController;
