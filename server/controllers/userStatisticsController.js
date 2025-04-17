// controllers/userStatisticsController.js
const UserStatistics = require('../models/UserStatistics');
const User = require('../models/User');
const ActiveUser = require('../models/ActiveUser');

const mockUserStatistics = {
  totalUsers: 1250,
  newUsersToday: 48,
  activeUsers: 125,
  userGrowth: 15.7,
  avgSessionDuration: 2400, // 40 minutes in seconds
  lastUpdated: new Date()
};

const userStatisticsController = {
  // Get all user statistics
  async getAllStatistics(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const query = { is_deleted: false };

      const statistics = await UserStatistics.find(query)
        .populate('user_id', 'name email')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ created_at: -1 });

      const total = await UserStatistics.countDocuments(query);

      res.json({
        statistics,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page)
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get statistics for a specific user
  async getUserStatistics(req, res) {
    try {
      const userId = req.params.id;
      const stats = await UserStatistics.findOne({ 
        user_id: userId,
        is_deleted: false 
      });
      
      if (!stats) {
        return res.status(404).json({ message: 'User statistics not found' });
      }
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create or update user statistics
  async createOrUpdateStatistics(req, res) {
    try {
      const { user_id, page_name, time_spent } = req.body;

      let statistics = await UserStatistics.findOne({
        user_id,
        is_deleted: false
      });

      if (statistics) {
        // Update existing statistics
        const pageIndex = statistics.pages_visited.findIndex(p => p.page_name === page_name);
        
        if (pageIndex > -1) {
          statistics.pages_visited[pageIndex].visit_count += 1;
        } else {
          statistics.pages_visited.push({
            page_name,
            visit_count: 1
          });
        }

        if (time_spent) {
          statistics.total_time_spent += time_spent;
        }
      } else {
        // Create new statistics
        statistics = new UserStatistics({
          user_id,
          pages_visited: [{
            page_name,
            visit_count: 1
          }],
          total_time_spent: time_spent || 0,
          is_deleted: false
        });
      }

      const savedStatistics = await statistics.save();
      res.status(201).json(savedStatistics);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete user statistics (soft delete)
  async deleteStatistics(req, res) {
    try {
      const statistics = await UserStatistics.findById(req.params.id);
      
      if (!statistics || statistics.is_deleted) {
        return res.status(404).json({ message: 'Statistics not found' });
      }

      statistics.is_deleted = true;
      await statistics.save();
      res.json({ message: 'Statistics deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get overall statistics
  async getOverallStatistics(req, res) {
    try {
      // Get total users (excluding deleted users)
      const totalUsers = await User.countDocuments({ is_deleted: false });
      
      // Get new users today (from start of current day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newUsersToday = await User.countDocuments({
        created_at: { $gte: today },
        is_deleted: false
      });
      
      // Get active users (users with last_active in the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const activeUsers = await User.countDocuments({
        last_active: { $gte: thirtyDaysAgo },
        is_deleted: false
      });
      
      // Calculate user growth rate (new users in last 30 days)
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const newUsersLastMonth = await User.countDocuments({
        created_at: { $gte: lastMonth },
        is_deleted: false
      });
      const userGrowth = totalUsers > 0 
        ? ((newUsersLastMonth / totalUsers) * 100).toFixed(1)
        : 0;

      res.json({
        totalUsers,
        newUsersToday,
        activeUsers,
        userGrowth,
        lastUpdated: new Date()
      });
    } catch (error) {
      console.error('Error getting overall statistics:', error);
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = userStatisticsController;
