const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const helmet = require('helmet');
const trackActivity = require('./middleware/trackActivity');
const apiProxy = require('./middleware/apiProxy');
const { proxyRateLimit } = require('./middleware/rateLimit');
const { cacheMiddleware } = require('./middleware/apiCache');
const { combinedAuth } = require('./middleware/auth');
const consoleProtection = require('./middleware/consoleProtection');

// Import IP blocklist middleware
let ipBlocklist;
try {
  ipBlocklist = require('./middleware/ipBlocklist');
  console.log('IP Blocklist middleware loaded');
} catch (error) {
  console.warn('IP Blocklist middleware not available, running without IP blocking');
  // Create dummy middleware if module not available
  ipBlocklist = {
    blocklistMiddleware: (req, res, next) => next()
  };
}

const { 
  globalRateLimit,
  securityHeaders,
  validateOrigin
} = require('./middleware/securityMiddleware');
const path = require('path');
const fs = require('fs');
const { connectToDatabase } = require('./utils/dbConnection');
const validateEnvironment = require('./utils/validateEnv');

// Configure environment variables with explicit path
dotenv.config({ path: path.join(__dirname, '.env') });

// Log environment state for debugging
console.log('Environment mode:', process.env.NODE_ENV || 'development');

// Force-set required environment variables if they're missing
if (!process.env.API_SECRET_TOKEN) {
  console.log('Setting API_SECRET_TOKEN directly in code as fallback');
  process.env.API_SECRET_TOKEN = 'swanapi_sec_token_6363163519';
}

if (!process.env.EXTERNAL_API_BASE_URL) {
  console.log('Setting EXTERNAL_API_BASE_URL directly in code as fallback');
  process.env.EXTERNAL_API_BASE_URL = 'http://localhost:5000/api';
}

// Debug environment variables without exposing secrets
console.log('API_SECRET_TOKEN available:', !!process.env.API_SECRET_TOKEN);
console.log('EXTERNAL_API_BASE_URL available:', !!process.env.EXTERNAL_API_BASE_URL);

// Validate environment variables
validateEnvironment();

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('Created uploads directory:', uploadsDir);
}

// Create specific upload directories
const uploadDirs = ['blogs', 'products', 'cards'];
for (const dir of uploadDirs) {
  const dirPath = path.join(uploadsDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created ${dir} uploads directory:`, dirPath);
  }
}

// Create Express app
const app = express();

// Import routes
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const enquiryRoutes = require('./routes/enquiries');
const notificationRoutes = require('./routes/notifications');
const activeUserRoutes = require('./routes/activeUsers');
const visitorRoutes = require('./routes/visitors');
const userStatisticsRoutes = require('./routes/userStatistics');
const blogRoutes = require('./routes/blogs');
const cardRoutes = require('./routes/cards');
const authRoutes = require('./routes/auth');

// Middleware
// Add Helmet for comprehensive security headers
app.use(helmet());

// IP blocklist should be checked first, before any other middleware
// This immediately blocks known malicious IPs without wasting resources
app.use(ipBlocklist.blocklistMiddleware);

// Apply global rate limiting to all requests
app.use(globalRateLimit);

// Apply enhanced security headers
app.use(securityHeaders);

// Apply console protection to prevent unauthorized browser console access
// Only apply in production to avoid potential recursive console calls
if (process.env.NODE_ENV === 'production') {
  // Initialize a flag to avoid infinite recursion with console methods
  global._consoleMethodsOverridden = true;
}
app.use(consoleProtection);

// Set up CORS properly for both HTTP and HTTPS
// Apply CORS with explicit headers to ensure they're always set
app.use((req, res, next) => {
  const allowedOrigins = [
    'https://admin.swansorter.com',
    'https://www.admin.swansorter.com',
    'https://swanlogin.firebaseapp.com',
    'https://www.swanlogin.firebaseapp.com',
    'https://swanfinal.onrender.com',
    'https://swansorter.com',
    'https://swanfinal-1.onrender.com',
    'https://www.swanfinal-1.onrender.com',
    'https://www.swansorter.com'
  ];
  
  const origin = req.headers.origin;
  
  // Always set CORS headers for OPTIONS requests (preflight)
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-API-Key');
    res.header('Access-Control-Max-Age', '86400'); // 24 hours
  }
  
  // Allow requests with no origin (like mobile apps, curl requests)
  if (!origin) {
    return next();
  }
  
  // Allow localhost in development
  if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    return next();
  }
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  } else {
    console.log('CORS blocked origin:', origin);
    // In production, we should block unauthorized origins
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'CORS not allowed from this origin' });
    }
    // Allow in development mode
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
  }
});

// Still keep the cors middleware for backward compatibility
app.use(cors({
  origin: function(origin, callback) {
    callback(null, true); // Let our custom middleware above handle it
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key'],
  credentials: true, // Important for cookies
  maxAge: 86400 // CORS preflight cache time (24 hours)
}));

// Validate request origin for additional security
app.use(validateOrigin);

// Add security headers for HTTPS
app.use((req, res, next) => {
  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production' && !req.secure && req.headers['x-forwarded-proto'] !== 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  next();
});

// Handle OPTIONS requests for CORS preflight
app.options('*', (req, res) => {
  res.status(200).end();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser()); // Add cookie parser
app.use(trackActivity);

// Serve uploads directory as static with proper headers
app.use('/uploads', (req, res, next) => {
  // Add CORS headers for static files
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for an hour
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Database connection
connectToDatabase()
  .then(connected => {
    if (!connected) {
      console.error('Failed to establish database connection. Server will continue but database operations may fail.');
    }
  })
  .catch(err => {
    console.error('Error during database connection setup:', err);
  });

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the CRUD API',
 
  });
});

// Add a database check middleware for API routes
const checkDatabaseConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database connection is not established. Please try again later.'
    });
  }
  next();
};

// API routes with database connection check
app.use('/api/v1/auth', checkDatabaseConnection, authRoutes);
app.use('/api/v1/data/users', checkDatabaseConnection, combinedAuth, userRoutes);
app.use('/api/v1/data/items', checkDatabaseConnection, combinedAuth, productRoutes);
app.use('/api/v1/data/orders', checkDatabaseConnection, combinedAuth, orderRoutes);
app.use('/api/v1/data/inquiries', checkDatabaseConnection, combinedAuth, enquiryRoutes);
app.use('/api/v1/data/notifications', checkDatabaseConnection, combinedAuth, notificationRoutes);
app.use('/api/v1/data/active-users', checkDatabaseConnection, combinedAuth, activeUserRoutes);
app.use('/api/v1/data/visitors', checkDatabaseConnection, combinedAuth, visitorRoutes);
app.use('/api/v1/data/user-statistics', checkDatabaseConnection, combinedAuth, userStatisticsRoutes);
app.use('/api/v1/data/blogs', checkDatabaseConnection, combinedAuth, blogRoutes);
app.use('/api/v1/data/cards', checkDatabaseConnection, combinedAuth, cardRoutes);

// Legacy routes for backward compatibility - will log deprecation warnings
// These can be removed once frontend is fully updated
app.use('/api/users', (req, res, next) => {
  console.warn('[DEPRECATED] /api/users endpoint accessed, use /api/v1/data/users instead');
  next();
}, checkDatabaseConnection, combinedAuth, userRoutes);

app.use('/api/orders', (req, res, next) => {
  console.warn('[DEPRECATED] /api/orders endpoint accessed, use /api/v1/data/orders instead');
  next();
}, checkDatabaseConnection, combinedAuth, orderRoutes);

app.use('/api/auth', (req, res, next) => {
  console.warn('[DEPRECATED] /api/auth endpoint accessed, use /api/v1/auth instead');
  next();
}, checkDatabaseConnection, authRoutes);

app.use('/api/notifications', (req, res, next) => {
  console.warn('[DEPRECATED] /api/notifications endpoint accessed, use /api/v1/data/notifications instead');
  next();
}, checkDatabaseConnection, combinedAuth, notificationRoutes);

app.use('/api/active-users', (req, res, next) => {
  console.warn('[DEPRECATED] /api/active-users endpoint accessed, use /api/v1/data/active-users instead');
  next();
}, checkDatabaseConnection, combinedAuth, activeUserRoutes);

app.use('/api/user-statistics', (req, res, next) => {
  console.warn('[DEPRECATED] /api/user-statistics endpoint accessed, use /api/v1/data/user-statistics instead');
  next();
}, checkDatabaseConnection, combinedAuth, userStatisticsRoutes);

app.use('/api/blogs', (req, res, next) => {
  console.warn('[DEPRECATED] /api/blogs endpoint accessed, use /api/v1/data/blogs instead');
  next();
}, checkDatabaseConnection, combinedAuth, blogRoutes);

app.use('/api/cards', (req, res, next) => {
  console.warn('[DEPRECATED] /api/cards endpoint accessed, use /api/v1/data/cards instead');
  next();
}, checkDatabaseConnection, combinedAuth, cardRoutes);

// External API proxy route - this keeps API tokens server-side
// Apply rate limiting and caching to improve performance and prevent abuse
app.use('/proxy/api/:path(*)', proxyRateLimit, cacheMiddleware, apiProxy);

// Error handling
app.use((err, req, res, next) => {
  // In production, use a safer logging approach to avoid recursion
  if (process.env.NODE_ENV === 'production') {
    // Use a direct logging method instead of console
    process.stderr.write(`[ERROR] ${new Date().toISOString()} - ${err.stack || err.message}\n`);
  } else {
    console.error(err.stack);
  }
  
  // Handle database connection errors
  if (err.name === 'MongooseError' || err.name === 'MongoError') {
    return res.status(503).json({
      success: false,
      message: 'Database connection issue. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Database error'
    });
  }
  
  // Handle timeout errors
  if (err.name === 'TimeoutError') {
    return res.status(504).json({
      success: false,
      message: 'Request timed out. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Timeout error'
    });
  }
  
  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Invalid data provided'
    });
  }
  
  // General error
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  if (process.env.NODE_ENV === 'production') {
    process.stderr.write(`[FATAL] Unhandled Promise Rejection: ${reason}\n`);
  } else {
    console.error('Unhandled Promise Rejection:', reason);
  }
  // In production, we don't want to crash the server
  // But in development, it might be good to see the error
  if (process.env.NODE_ENV !== 'production') {
    // Optional: process.exit(1);
  }
});

// Start server
const PORT = process.env.PORT || 5000;

// For production environments where SSL is handled by proxy (like Hostinger)
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`API available at: http://localhost:${PORT}/api`);
});