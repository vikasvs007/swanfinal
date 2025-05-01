const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Import rate limiter or create one if it doesn't exist
const rateLimit = require('express-rate-limit');
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per 15 minutes
  message: {
    success: false, 
    message: 'Too many login attempts, please try again later'
  }
});

// Cookie settings
const COOKIE_OPTIONS = {
  httpOnly: true, // Cannot be accessed by JavaScript
  secure: process.env.NODE_ENV === 'production', // Only sent over HTTPS in production
  sameSite: 'strict', // CSRF protection
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
  path: '/' // Available on all paths
};

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token via secure cookie
 * @access  Public
 */
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set token in HttpOnly cookie
    res.cookie('auth_token', token, COOKIE_OPTIONS);

    // Return user info (without password)
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    res.json({
      success: true,
      message: 'Login successful',
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user by clearing the auth cookie
 * @access  Public
 */
router.post('/logout', (req, res) => {
  // Clear the auth cookie
  res.clearCookie('auth_token', {
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', auth, async (req, res) => {
  try {
    // User is available from auth middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Return user info (without password)
    const userResponse = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    };

    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
});

module.exports = router; 