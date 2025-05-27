/**
 * Rate Limiting Middleware
 * 
 * This middleware implements rate limiting for the API proxy to prevent abuse
 */
const rateLimit = require('express-rate-limit');
const path = require('path');

// Optional: If ipBlocklist.js doesn't exist yet, it will be used when available
let ipBlocklist;
try {
  ipBlocklist = require('./ipBlocklist');
  console.log('IP Blocklist system loaded successfully');
} catch (error) {
  console.warn('IP Blocklist not available yet, running without IP blocking');
  // Create dummy functions if module not available
  ipBlocklist = {
    registerViolation: () => {},
    isBlocked: () => false
  };
}

// Handler for when rate limit is exceeded
const onLimitReached = (req, res, options) => {
  const ip = req.ip || req.connection.remoteAddress;
  console.warn(`[SECURITY] Rate limit exceeded for IP: ${ip}, Path: ${req.path}`);
  
  // Register this violation with the IP blocklist system
  if (ipBlocklist) {
    ipBlocklist.registerViolation(ip);
  }
};

// General API rate limiter - more permissive
const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  // Skip rate limiting in development except for API tools
  skip: (req) => {
    if (process.env.NODE_ENV !== 'production') {
      const userAgent = req.get('User-Agent') || '';
      const isApiTool = userAgent.includes('Postman') || 
                       userAgent.includes('insomnia') ||
                       userAgent.includes('curl');
      // Don't skip for API tools, even in development
      return !isApiTool;
    }
    return false;
  },
  // Handler when limit is reached
  onLimitReached: onLimitReached
});

// Stricter rate limiter for proxy endpoints
const proxyRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  onLimitReached: onLimitReached,
  message: {
    success: false,
    message: 'Too many proxy requests, please try again later.'
  },
  // Skip rate limiting in development
  skip: (req) => process.env.NODE_ENV === 'development'
});

// Authentication endpoints rate limiter (login/signup)
const authRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 login attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  // Use the onLimitReached handler to register violations
  onLimitReached: (req, res, options) => {
    const ip = req.ip || req.connection.remoteAddress;
    console.warn(`[SECURITY] Login rate limit exceeded for IP: ${ip}`);
    
    // Register with higher weight for auth violations (counts as 2 violations)
    if (ipBlocklist) {
      ipBlocklist.registerViolation(ip);
      ipBlocklist.registerViolation(ip); // Register twice for auth violations
    }
  },
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.'
  }
});

module.exports = {
  apiRateLimit,
  proxyRateLimit,
  authRateLimit
}; 