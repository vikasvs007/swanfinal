// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from cookie instead of Authorization header
    const token = req.cookies.auth_token;
    
    if (!token) {
      // Set a flag that there's no auth token instead of immediately returning
      req.noAuth = true;
      // For routes that absolutely require authentication, the controller will check
      // Allow execution to continue to the route handler
      return next();
    }
    
    // Skip auth for public routes
    if (req.skipAuth) {
      return next();
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

// Enhanced API key/token authentication (for programmatic access)
const apiKeyAuth = (req, res, next) => {
  try {
    // Get token from header and validate format
    const authHeader = req.header('Authorization');
    
    // In development mode, bypass strict authentication
    if (process.env.NODE_ENV !== 'production') {
      console.log('[DEV MODE] Bypassing strict API authentication');
      req.isApiClient = true;
      return next();
    }
    
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
      // Add logging for security monitoring (but don't expose the actual tokens)
      console.warn(`[SECURITY] Invalid API token attempt from IP: ${req.ip}, User-Agent: ${req.get('User-Agent')}`);
      
      return res.status(401).json({
        success: false,
        message: 'Invalid API token'
      });
    }
    
    // Add API client flag to request
    req.isApiClient = true;
    next();
  } catch (error) {
    console.error('[SECURITY] API auth error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during API authentication',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Combined auth middleware that checks for either cookie auth or API key
const combinedAuth = async (req, res, next) => {
  // Rate limiting by IP for authentication attempts
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // Check for API key first if it's programmatic access
  const authHeader = req.header('Authorization');
  
  // For debugging - log the auth state but only in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Auth method:', req.cookies.auth_token ? 'cookie' : (authHeader ? 'header' : 'none'));
  }
  
  // If there's an Authorization header that starts with ApiKey 
  if (authHeader && authHeader.startsWith('ApiKey ')) {
    return apiKeyAuth(req, res, next);
  }
  
  // If there's a Bearer token, first try to verify it as an API token
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '');
    if (token === process.env.API_SECRET_TOKEN) {
      req.isApiClient = true;
      return next();
    }
  }
  
  // Fall back to cookie authentication
  try {
    await auth(req, res, next);
  } catch (error) {
    // If authentication fails and is a route requiring authentication, return a clear error
    console.error('Auth error:', error.message);
    
    // Log failed authentication attempts for security monitoring
    if (process.env.NODE_ENV === 'production') {
      console.warn(`[SECURITY] Failed auth attempt from IP: ${clientIP}, Path: ${req.path}`);
    }
    
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please login.'
    });
  }
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