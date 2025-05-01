const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const trackActivity = require('./middleware/trackActivity');
const apiProxy = require('./middleware/apiProxy');
const { proxyRateLimit } = require('./middleware/rateLimit');
const { cacheMiddleware } = require('./middleware/apiCache');
const path = require('path');
const fs = require('fs');
const { connectToDatabase } = require('./utils/dbConnection');
const validateEnvironment = require('./utils/validateEnv');

// Configure environment variables
dotenv.config();

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
// Set up CORS properly for both HTTP and HTTPS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 
    process.env.CLIENT_URL : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Important for cookies
}));

// Add security headers for HTTPS
app.use((req, res, next) => {
  // Force HTTPS in production
  if (process.env.NODE_ENV === 'production' && !req.secure && req.headers['x-forwarded-proto'] !== 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
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
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      products: '/api/products',
      orders: '/api/orders',
      enquiries: '/api/enquiries',
      notifications: '/api/notifications',
      activeUsers: '/api/active-users',
      visitors: '/api/visitors',
      userStatistics: '/api/user-statistics',
      blogs: '/api/blogs',
      cards: '/api/cards'
    }
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
app.use('/api/auth', checkDatabaseConnection, authRoutes);
app.use('/api/users', checkDatabaseConnection, userRoutes);
app.use('/api/products', checkDatabaseConnection, productRoutes);
app.use('/api/orders', checkDatabaseConnection, orderRoutes);
app.use('/api/enquiries', checkDatabaseConnection, enquiryRoutes);
app.use('/api/notifications', checkDatabaseConnection, notificationRoutes);
app.use('/api/active-users', checkDatabaseConnection, activeUserRoutes);
app.use('/api/visitors', checkDatabaseConnection, visitorRoutes);
app.use('/api/user-statistics', checkDatabaseConnection, userStatisticsRoutes);
app.use('/api/blogs', checkDatabaseConnection, blogRoutes);
app.use('/api/cards', checkDatabaseConnection, cardRoutes);

// External API proxy route - this keeps API tokens server-side
// Apply rate limiting and caching to improve performance and prevent abuse
app.use('/proxy/api/:path(*)', proxyRateLimit, cacheMiddleware, apiProxy);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle database connection errors
  if (err.name === 'MongooseError' || err.name === 'MongoError') {
    return res.status(503).json({
      message: 'Database connection issue. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Database error'
    });
  }
  
  // Handle timeout errors
  if (err.name === 'TimeoutError') {
    return res.status(504).json({
      message: 'Request timed out. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Timeout error'
    });
  }
  
  // General error
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;

// For production environments where SSL is handled by proxy (like Hostinger)
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`API available at: http://localhost:${PORT}/api`);
});