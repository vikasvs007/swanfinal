// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header and validate format
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header missing or invalid format'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Skip auth for public routes
    if (req.skipAuth) {
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check token expiration
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }

    // Find user and check if still exists/active
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists'
      });
    }

    // Add user info to request
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Admin only middleware
const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      next();
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Simple API key/token authentication (for programmatic access)
const apiKeyAuth = (req, res, next) => {
  try {
    // Get token from header and validate format
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header missing'
      });
    }

    let token;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '');
    } else if (authHeader.startsWith('ApiKey ')) {
      token = authHeader.replace('ApiKey ', '');
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format'
      });
    }

    // Check if token matches the API key in environment variables
    if (token !== process.env.API_SECRET_TOKEN) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API token'
      });
    }

    // Add API client flag to request
    req.isApiClient = true;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during API authentication',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Combined auth middleware that checks for either JWT auth or API key
const combinedAuth = async (req, res, next) => {
  // Check for API key first
  const authHeader = req.header('Authorization');
  
  if (authHeader && (authHeader.startsWith('ApiKey ') || 
     (authHeader.startsWith('Bearer ') && authHeader.replace('Bearer ', '') === process.env.API_SECRET_TOKEN))) {
    return apiKeyAuth(req, res, next);
  }
  
  // Fall back to JWT authentication
  return auth(req, res, next);
};

// Rate limiting middleware
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts, please try again later'
  }
});

module.exports = { auth, adminAuth, apiKeyAuth, combinedAuth, authLimiter };