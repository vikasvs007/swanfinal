// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    const token = req.cookies.auth_token || (req.header('Authorization') && req.header('Authorization').replace('Bearer ', ''));
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check token expiration
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      // Clear the invalid cookie
      res.clearCookie('auth_token', {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }

    // Find user and check if still exists/active
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      // Clear the cookie if user no longer exists
      res.clearCookie('auth_token', {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
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
      // Clear the invalid cookie
      res.clearCookie('auth_token', {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
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
    // Call the auth middleware first
    await auth(req, res, () => {
      // If noAuth flag is set or user is not set, authentication failed
      if (req.noAuth || !req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required for admin operations'
        });
      }

      // Check if the user is an admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      // User is authenticated and is an admin
      next();
    });
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during admin authentication',
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

// Combined auth middleware that checks for either cookie auth or API key
const combinedAuth = async (req, res, next) => {
  // In development, allow requests without auth for testing
  if (process.env.NODE_ENV !== 'production') {
    console.log('Development mode: Auth check skipped');
    return next();
  }

  // Check for API key first if it's programmatic access
  const authHeader = req.header('Authorization');
  
  // If there's an Authorization header that starts with ApiKey or matches the API token
  if (authHeader && (authHeader.startsWith('ApiKey ') || 
     (authHeader.startsWith('Bearer ') && authHeader.replace('Bearer ', '') === process.env.API_SECRET_TOKEN))) {
    return apiKeyAuth(req, res, next);
  }
  
  // Fall back to cookie authentication
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