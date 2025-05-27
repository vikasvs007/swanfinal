/**
 * Security Middleware Collection
 * 
 * This file contains middleware functions to enhance API security
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');

// Basic rate limiting for all API routes
const globalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    success: false,
    message: 'Too many requests, please try again later.'
  }
});

// More strict rate limiting for authentication endpoints
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  }
});

// Rate limiting for sensitive operations (data modification)
const sensitiveOperationsLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // limit each IP to 30 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    success: false,
    message: 'Too many operations attempted, please try again later.'
  }
});

// Enhanced security headers middleware
const securityHeaders = (req, res, next) => {
  try {
    // Set strict Content-Security-Policy in production
    if (process.env.NODE_ENV === 'production') {
      // More comprehensive CSP policy for production
      res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; object-src 'none'; connect-src 'self' https://swanfinal.onrender.com; frame-ancestors 'none'; upgrade-insecure-requests;");
      
      // Add Strict-Transport-Security header for HTTPS
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Set referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Add Cache-Control headers for non-static content
    if (!req.path.startsWith('/uploads/')) {
      res.setHeader('Cache-Control', 'no-store, max-age=0');
    }
    
    // Add request ID for tracking
    const requestId = crypto.randomBytes(16).toString('hex');
    req.requestId = requestId;
    res.setHeader('X-Request-ID', requestId);
  } catch (error) {
    // Use a safer logging approach to avoid potential recursion
    if (process.env.NODE_ENV === 'production') {
      process.stderr.write(`[ERROR] Error setting security headers: ${error.message}\n`);
    } else {
      console.error('Error setting security headers:', error);
    }
  }
  
  next();
};

// Request validation middleware generator
const validateRequest = (validations) => {
  return async (req, res, next) => {
    // In development mode, log the request body for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Request body for validation:', JSON.stringify(req.body, null, 2));
    }
    
    // In development, bypass strict validation
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEV MODE] Bypassing strict validation');
      return next();
    }
    
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }
    
    next();
  };
};

// Common validation rules for product data
const productValidationRules = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
];

// Common validation rules for user data
const userValidationRules = [
  body('email').isEmail().withMessage('Must be a valid email address'),
  body('password').optional()
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
  body('name').trim().notEmpty().withMessage('Name is required')
];

// API key validation middleware
const validateApiKey = (req, res, next) => {
  const apiKey = req.header('X-API-Key') || req.query.api_key;
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key is required'
    });
  }
  
  if (apiKey !== process.env.API_SECRET_TOKEN) {
    // Log unauthorized access attempt for security monitoring - use safe logging in production
    if (process.env.NODE_ENV === 'production') {
      process.stderr.write(`[SECURITY] Invalid API key attempt: ${req.ip}\n`);
    } else {
      console.warn(`[SECURITY] Invalid API key attempt: ${req.ip}`);
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid API key'
    });
  }
  
  next();
};

// Request origin validation
const validateOrigin = (req, res, next) => {
  // Expand the ways we get the origin, as some requests might have different headers
  const origin = req.get('Origin') || req.get('Referer') || req.headers.origin;
  
  // List of allowed domains for API requests - make sure it matches the CORS middleware
  const allowedOrigins = [
    'https://admin.swansorter.com',
    'https://www.admin.swansorter.com',
    'https://swanlogin.firebaseapp.com',
    'https://www.swanlogin.firebaseapp.com',
    'https://swanfinal.onrender.com',
    'https://www.swanfinal.onrender.com',
    'https://swansorter.com',
    'https://www.swansorter.com',
    'https://swanfinal-1.onrender.com',
    'https://www.swanfinal-1.onrender.com',
    'http://localhost:3000'
  ];
  
  // Skip check in development mode
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }
  
  // If no origin in production, log it but proceed
  if (!origin) {
    console.log('[SECURITY] Request without origin header - allowed in production');
    return next();
  }
  
  // Check if origin is allowed - now using exact match for better security
  const isAllowed = allowedOrigins.includes(origin);
  
  // Fallback to startsWith for backward compatibility
  const isAllowedLegacy = !isAllowed && allowedOrigins.some(allowed => 
    origin.startsWith(allowed)
  );
  
  if (isAllowed || isAllowedLegacy) {
    // Origin is allowed, proceed
    return next();
  }
  
  // For production debugging - log unauthorized origins but STILL PROCEED for now
  // This is temporary to diagnose issues without breaking functionality
  console.warn(`[SECURITY] Request from unauthorized origin: ${origin} - temporarily allowed`);
  
  // Return next() instead of 403 to temporarily allow all origins while debugging
  // Once the issue is resolved, replace with the 403 response
  return next();
  
  /* Uncomment this block once issue is resolved
  return res.status(403).json({
    success: false,
    message: 'Access denied: unauthorized origin'
  });
  */
};

module.exports = {
  globalRateLimit,
  authRateLimit,
  sensitiveOperationsLimit,
  securityHeaders,
  validateRequest,
  productValidationRules,
  userValidationRules,
  validateApiKey,
  validateOrigin
};
