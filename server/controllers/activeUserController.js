// controllers/activeUserController.js
const ActiveUser = require('../models/ActiveUser');
const UserStatistics = require('../models/UserStatistics');
const User = require('../models/User');

const activeUserController = {
  // Get all active users
  async getActiveUsers(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const query = { is_deleted: false };

      const activeUsers = await ActiveUser.find(query)
        .populate('user_id', 'name email')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ created_at: -1 });

      const total = await ActiveUser.countDocuments(query);

      res.json({
        activeUsers,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create new active session
  async createActiveSession(req, res) {
    try {
      const activeUser = new ActiveUser({
        user_id: req.body.user_id,
        session_duration: req.body.session_duration || 0,
        Location: req.body.Location,
        is_deleted: false
      });

      const savedSession = await activeUser.save();
      res.status(201).json(savedSession);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Update session
  async updateSession(req, res) {
    try {
      const session = await ActiveUser.findById(req.params.id);
      if (!session || session.is_deleted) {
        return res.status(404).json({ message: 'Session not found' });
      }

      if (req.body.session_duration) {
        session.session_duration = req.body.session_duration;
      }
      if (req.body.Location) {
        session.Location = req.body.Location;
      }

      const updatedSession = await session.save();
      res.json(updatedSession);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // End session (soft delete)
  async endSession(req, res) {
    try {
      const session = await ActiveUser.findById(req.params.id);
      if (!session || session.is_deleted) {
        return res.status(404).json({ message: 'Session not found' });
      }

      session.is_deleted = true;
      await session.save();
      res.json({ message: 'Session ended successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get active user statistics
  async getActiveUserStats(req, res) {
    try {
      // Get active users (users with last_active in the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const totalActive = await User.countDocuments({
        last_active: { $gte: thirtyDaysAgo },
        is_deleted: false
      });

      // Calculate average session duration
      const averageSessionDuration = await UserStatistics.aggregate([
        { $match: { is_deleted: false } },
        { $group: { 
          _id: null, 
          avg_duration: { $avg: '$total_time_spent' }
        }}
      ]);

      // Get current online users (active in last 5 minutes)
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
      const onlineUsers = await User.countDocuments({
        last_active: { $gte: fiveMinutesAgo },
        is_deleted: false
      });

      // Get recent active users (including new users)
      const activeUsers = await User.find({
        $or: [
          { last_active: { $gte: thirtyDaysAgo } },
          { created_at: { $gte: thirtyDaysAgo } }
        ],
        is_deleted: false
      })
      .select('name email last_active created_at')
      .sort({ last_active: -1, created_at: -1 })
      .limit(10);

      res.json({
        totalActive,
        averageSessionDuration: averageSessionDuration[0]?.avg_duration || 0,
        onlineUsers,
        activeUsers
      });
    } catch (error) {
      console.error('Error getting active user stats:', error);
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = activeUserController;
