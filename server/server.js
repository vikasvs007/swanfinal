const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const trackActivity = require('./middleware/trackActivity');
const apiProxy = require('./middleware/apiProxy');
const { proxyRateLimit } = require('./middleware/rateLimit');
const { cacheMiddleware } = require('./middleware/apiCache');
const { connectToDatabase } = require('./utils/dbConnection');
const validateEnvironment = require('./utils/validateEnv');

// Load environment variables
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction) {
  try {
    dotenv.config({ path: '.env.production' });
    console.log('Loaded production environment variables');
  } catch (err) {
    console.warn('Could not load .env.production:', err);
    dotenv.config();
    console.log('Loaded default environment variables');
  }
} else {
  dotenv.config();
  console.log('Loaded development environment variables');
}
validateEnvironment();

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
['blogs', 'products', 'cards'].forEach((dir) => {
  const dirPath = path.join(uploadsDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

const app = express();

// Enhanced Web Console Detection Middleware (blocks console requests even from allowed origins)
app.use((req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  const referer = req.headers['referer'] || '';
  const origin = req.headers['origin'] || '';
  const acceptHeader = req.headers['accept'] || '';
  const contentType = req.headers['content-type'] || '';
  
  // Skip GET requests - usually safe
  if (req.method === 'GET') {
    return next();
  }

  // Web console detection patterns (regardless of origin)
  const webConsoleIndicators = {
    // Explicit web console header (your custom header)
    explicitConsole: req.headers['x-web-console'] === 'vikasvs6363',
    
    // DevTools specific user agents
    devToolsUserAgent: /chrome-devtools|firefox-devtools|safari-web-inspector|edge-devtools/i.test(userAgent),
    
    // Console-like request patterns
    consoleRequestPattern: (
      // Browser user agent but with console-like characteristics
      userAgent.includes('Mozilla') && 
      acceptHeader === '*/*' && 
      !contentType.includes('application/json') &&
      !referer.includes('/api/') // Not from your API documentation page
    ),
    
    // Fetch API from console (common pattern)
    consoleFetchPattern: (
      userAgent.includes('Mozilla') &&
      acceptHeader.includes('*/*') &&
      !req.headers['sec-fetch-site'] && // Missing security headers that browsers normally send
      !req.headers['sec-fetch-mode']
    ),
    
    // Console XMLHttpRequest pattern
    consoleXHRPattern: (
      userAgent.includes('Mozilla') &&
      acceptHeader === '*/*' &&
      !req.headers['x-requested-with'] && // Missing common AJAX header
      contentType === 'text/plain' // Console often sends as text/plain
    ),
    
    // Missing standard browser security headers that legitimate requests have
    missingSecurityHeaders: (
      userAgent.includes('Mozilla') &&
      !req.headers['sec-fetch-dest'] &&
      !req.headers['sec-fetch-mode'] &&
      !req.headers['sec-fetch-site'] &&
      origin // Has origin but missing sec-fetch headers (suspicious)
    ),
    
    // Direct fetch/XHR from console typically lacks proper referer context
    suspiciousRefererPattern: (
      origin && 
      referer &&
      !referer.includes('/') && // Very short referer
      referer === origin // Referer exactly matches origin (often console)
    )
  };

  // API tools detection (allow these even with suspicious patterns)
  const toolUserAgents = /postman|insomnia|httpie|curl|wget|thunder|rest|api|postman-runtime|newman/i;
  const isApiTool = toolUserAgents.test(userAgent);

  // Allow known API tools
  if (isApiTool) {
    return next();
  }

  // Check for web console indicators
  const detectedIndicators = Object.entries(webConsoleIndicators)
    .filter(([_, value]) => value)
    .map(([key]) => key);

  // Block if any strong console indicator is present
  const strongIndicators = ['explicitConsole', 'devToolsUserAgent'];
  const hasStrongIndicator = detectedIndicators.some(indicator => 
    strongIndicators.includes(indicator)
  );

  // Block if 2+ indicators or 1 strong indicator
  if (hasStrongIndicator || detectedIndicators.length >= 2) {
    console.log(`🚫 Blocked web console request:`, {
      method: req.method,
      path: req.path,
      origin,
      referer: referer.substring(0, 100),
      userAgent: userAgent.substring(0, 100),
      detectedIndicators,
      headers: {
        accept: acceptHeader,
        contentType,
        'sec-fetch-site': req.headers['sec-fetch-site'],
        'sec-fetch-mode': req.headers['sec-fetch-mode'],
        'x-requested-with': req.headers['x-requested-with']
      }
    });
    
    return res.status(403).json({ 
      message: 'Forbidden: Web console requests are not allowed.',
      hint: 'Please use your application frontend or a proper API client like Postman.',
      blocked_reason: 'Web console detection triggered',
      indicators: detectedIndicators
    });
  }

  // Additional check for suspicious browser requests without proper context
  if (userAgent.includes('Mozilla') && origin) {
    const hasProperContext = (
      referer.includes(origin) || // Proper referer from same origin
      req.headers['sec-fetch-site'] || // Has security headers
      contentType.includes('application/json') || // Proper content type
      req.headers['x-requested-with'] === 'XMLHttpRequest' // Proper AJAX header
    );

    if (!hasProperContext && acceptHeader === '*/*') {
      console.log(`🚫 Blocked suspicious browser request:`, {
        method: req.method,
        path: req.path,
        origin,
        reason: 'Lacks proper browser request context'
      });
      
      return res.status(403).json({ 
        message: 'Forbidden: Request lacks proper browser context.',
        hint: 'Make requests through your application frontend, not browser console.'
      });
    }
  }

  next();
});

// CORS Configuration
app.use(
  cors({
    origin: function(origin, callback) {
      console.log('CORS Origin:', origin);
      if (!origin) return callback(null, true);

      // Allow localhost for local dev
      if (origin.startsWith('http://localhost:3000')) return callback(null, true);

      // Allow any https://*.swansorter.com
      const regex = /^https:\/\/([a-z0-9-]+\.)*swansorter\.com$/i;
      if (regex.test(origin)) return callback(null, true);

      // Allow your onrender.com staging
      if (origin === 'https://swanfinal.onrender.com') return callback(null, true);

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-web-console']
  })
);

// Security Headers Middleware
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure && req.headers['x-forwarded-proto'] !== 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

// Body Parser Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(trackActivity);

// Serve uploads with proper headers
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Database connection
connectToDatabase().catch(err => {
  console.error('Database connection error:', err);
});

// Database Connection Check Middleware
const checkDatabaseConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database connection is not established. Please try again later.'
    });
  }
  next();
};

// Import Routes
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

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the CRUD API',
    status: 'Server is running',
    timestamp: new Date().toISOString(),
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes with Database Connection Check
app.use('/api/swan-authentication', checkDatabaseConnection, authRoutes);
app.use('/api/swan-user-management', checkDatabaseConnection, userRoutes);
app.use('/api/swan-product-catalog', checkDatabaseConnection, productRoutes);
app.use('/api/swan-order-management', checkDatabaseConnection, orderRoutes);
app.use('/api/swan-enquiry-handling', checkDatabaseConnection, enquiryRoutes);
app.use('/api/swan-notification-center', checkDatabaseConnection, notificationRoutes);
app.use('/api/swan-active-users', checkDatabaseConnection, activeUserRoutes);
app.use('/api/swan-visitor-tracking', checkDatabaseConnection, visitorRoutes);
app.use('/api/swan-user-analytics', checkDatabaseConnection, userStatisticsRoutes);
app.use('/api/swan-blog-content', checkDatabaseConnection, blogRoutes);
app.use('/api/swan-card-system', checkDatabaseConnection, cardRoutes);

// Legacy route compatibility (if needed)
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

// API Proxy Route
app.use('/proxy/api/:path(*)', proxyRateLimit, cacheMiddleware, apiProxy);

// 404 Handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // CORS Error
  if (err.message && err.message.includes('Not allowed by CORS')) {
    return res.status(403).json({
      message: 'CORS Error: Origin not allowed',
      origin: req.headers.origin,
      allowedOrigins: [
        'http://localhost:3000',
        'https://*.swansorter.com',
        'https://swanfinal.onrender.com'
      ]
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Graceful shutdown...');
  try {
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Graceful shutdown...');
  try {
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📱 Health check available at: http://localhost:${PORT}/health`);
  console.log(`🔒 Web console blocking is active`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
});

module.exports = app;