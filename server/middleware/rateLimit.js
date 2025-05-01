/**
 * Rate Limiting Middleware
 * 
 * This middleware implements rate limiting for the API proxy to prevent abuse
 */
const rateLimit = require('express-rate-limit');

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
  // Skip rate limiting in development
  skip: (req) => process.env.NODE_ENV === 'development'
});

// Stricter rate limiter for proxy endpoints
const proxyRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
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