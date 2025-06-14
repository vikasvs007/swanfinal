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

// Load environment variables
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  // Try to load production env first
  try {
    dotenv.config({ path: '.env.production' });
    console.log('Loaded production environment variables');
  } catch (err) {
    console.warn('Could not load .env.production:', err);
    // Fallback to regular .env
    dotenv.config();
    console.log('Loaded default environment variables');
  }
} else {
  dotenv.config();
  console.log('Loaded development environment variables');
}

// Validate environment variables
validateEnvironment();

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
    'https://admin.swansorter.com' : 'https://swanfinal-1.onrender.com',
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
      auth: '/api/swan-authentication',
      users: '/api/swan-user-management',
      products: '/api/swan-product-catalog',
      orders: '/api/swan-order-management',
      enquiries: '/api/swan-enquiry-handling',
      notifications: '/api/swan-notification-center',
      activeUsers: '/api/swan-active-users',
      visitors: '/api/swan-visitor-tracking',
      userStatistics: '/api/swan-user-analytics',
      blogs: '/api/swan-blog-content',
      cards: '/api/swan-card-system'
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

// API routes
const apiRoutes = {
  users: '/api/user-management',
  products: '/api/product-catalog',
  orders: '/api/order-management',
  enquiries: '/api/enquiry-handling',
  notifications: '/api/notification-center',
  activeUsers: '/api/active-users',
  visitors: '/api/visitor-tracking',
  userAnalytics: '/api/user-analytics',
  blogContent: '/api/blog-content',
  cardSystem: '/api/card-system'
};

// Apply routes
app.use('/api/user-management', checkDatabaseConnection, userRoutes);
app.use('/api/product-catalog', checkDatabaseConnection, productRoutes);
app.use('/api/order-management', checkDatabaseConnection, orderRoutes);
app.use('/api/enquiry-handling', checkDatabaseConnection, enquiryRoutes);
app.use('/api/notification-center', checkDatabaseConnection, notificationRoutes);
app.use('/api/active-users', checkDatabaseConnection, activeUserRoutes);
app.use('/api/visitor-tracking', checkDatabaseConnection, visitorRoutes);
app.use('/api/user-analytics', checkDatabaseConnection, userStatisticsRoutes);
app.use('/api/blog-content', checkDatabaseConnection, blogRoutes);
app.use('/api/card-system', checkDatabaseConnection, cardRoutes);

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