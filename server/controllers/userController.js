// controllers/userController.js
const User = require('../models/User');

const userController = {
  // Create
  async createUser(req, res) {
    try {
      const user = new User(req.body);
      await user.save();
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Read all
  async getAllUsers(req, res) {
    try {
      // Check if the user has a valid token
      if (!req.user && !req.isApiClient) {
        return res.status(401).json({ 
          success: false,
          message: 'Authentication required to access user data' 
        });
      }
      
      const users = await User.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Read one
  async getUser(req, res) {
    try {
      // Check if the user has a valid token
      if (!req.user && !req.isApiClient) {
        return res.status(401).json({ 
          success: false,
          message: 'Authentication required to access user data' 
        });
      }
      
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check permission - users can only access their own data unless they're an admin
      if (!req.isApiClient && req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
        return res.status(403).json({ 
          success: false,
          message: 'You do not have permission to access this user data' 
        });
      }
      
      res.json(user);
    } catch (error) {
      // Handle invalid ID format
      if (error.name === 'CastError') {
        return res.status(404).json({ message: 'User not found - Invalid ID format' });
      }
      res.status(500).json({ message: error.message });
    }
  },

  // Update
  async updateUser(req, res) {
    try {
      // Check if the user has a valid token
      if (!req.user && !req.isApiClient) {
        return res.status(401).json({ 
          success: false,
          message: 'Authentication required to update user data' 
        });
      }
      
      // Check permission - users can only update their own data unless they're an admin
      if (!req.isApiClient && req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
        return res.status(403).json({ 
          success: false,
          message: 'You do not have permission to update this user data' 
        });
      }
      
      const user = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(404).json({ message: 'User not found - Invalid ID format' });
      }
      res.status(400).json({ message: error.message });
    }
  },

  // Delete
  async deleteUser(req, res) {
    try {
      // Check if the user has a valid token
      if (!req.user && !req.isApiClient) {
        return res.status(401).json({ 
          success: false,
          message: 'Authentication required to delete user data' 
        });
      }
      
      // Check permission - only admins can delete users
      if (!req.isApiClient && req.user.role !== 'admin') {
        return res.status(403).json({ 
          success: false,
          message: 'Admin access required to delete users' 
        });
      }
      
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      if (error.name === 'CastError') {
        return res.status(404).json({ message: 'User not found - Invalid ID format' });
      }
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = userController;