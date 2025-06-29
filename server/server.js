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

// STRICT Web Console Detection Middleware (blocks ALL console requests regardless of origin)
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

  // API tools detection (allow these first)
  const toolUserAgents = /postman|insomnia|httpie|curl|wget|thunder|rest|api|postman-runtime|newman|axios|node-fetch/i;
  const isApiTool = toolUserAgents.test(userAgent);

  // Allow known API tools
  if (isApiTool) {
    console.log(`✅ Allowed API tool: ${userAgent.substring(0, 50)}`);
    return next();
  }

  // STRICT console detection - blocks ALL console requests even from allowed origins
  const consoleDetectionRules = {
    // Rule 1: Explicit console indicators
    explicitConsole: req.headers['x-web-console'] === 'vikasvs6363',
    devToolsUserAgent: /chrome-devtools|firefox-devtools|safari-web-inspector|edge-devtools/i.test(userAgent),
    
    // Rule 2: Browser request WITHOUT referer (99% console indicator)
    browserWithoutReferer: (
      userAgent.includes('Mozilla') &&
      origin && // Has origin (so it's from a browser)
      !referer && // NO referer (major red flag)
      !isApiTool // Not an API tool
    ),
    
    // Rule 3: Missing ALL modern browser security headers
    missingAllSecHeaders: (
      userAgent.includes('Mozilla') &&
      !req.headers['sec-fetch-site'] && 
      !req.headers['sec-fetch-mode'] && 
      !req.headers['sec-fetch-dest'] &&
      origin && // Has origin but missing security context
      !isApiTool
    ),
    
    // Rule 4: Generic accept header with proper content-type (console fetch pattern)
    consoleFetchPattern: (
      userAgent.includes('Mozilla') &&
      acceptHeader.includes('*/*') &&
      contentType &&
      !req.headers['sec-fetch-site'] &&
      !isApiTool
    ),
    
    // Rule 5: Browser with origin but referer equals origin exactly (console pattern)
    refererEqualsOrigin: (
      userAgent.includes('Mozilla') &&
      origin &&
      referer === origin && // Exact match (not a page URL)
      !req.headers['sec-fetch-site'] &&
      !isApiTool
    ),
    
    // Rule 6: Missing user interaction headers that real browsers send
    missingUserInteraction: (
      userAgent.includes('Mozilla') &&
      origin &&
      !req.headers['sec-fetch-user'] && // No user interaction
      !req.headers['sec-fetch-site'] &&
      acceptHeader.includes('*/*') &&
      !isApiTool
    )
  };

  // Check which rules are triggered
  const triggeredRules = Object.entries(consoleDetectionRules)
    .filter(([_, value]) => value)
    .map(([key]) => key);

  // STRICT BLOCKING: Block if ANY rule is triggered for browser requests
  if (triggeredRules.length > 0 && userAgent.includes('Mozilla') && !isApiTool) {
    console.log(`🚫 BLOCKED console request from origin: ${origin}`, {
      method: req.method,
      path: req.path,
      origin,
      referer: referer || 'NO_REFERER',
      userAgent: userAgent.substring(0, 80),
      triggeredRules,
      allHeaders: {
        accept: acceptHeader,
        contentType,
        'sec-fetch-site': req.headers['sec-fetch-site'] || 'MISSING',
        'sec-fetch-mode': req.headers['sec-fetch-mode'] || 'MISSING',
        'sec-fetch-dest': req.headers['sec-fetch-dest'] || 'MISSING',
        'sec-fetch-user': req.headers['sec-fetch-user'] || 'MISSING',
        'x-requested-with': req.headers['x-requested-with'] || 'MISSING'
      }
    });
    
    return res.status(403).json({ 
      message: 'Forbidden: Web console/direct API requests are not allowed.',
      hint: 'Use your application frontend or a proper API client like Postman.',
      blocked_reason: 'Console request detection triggered',
      triggered_rules: triggeredRules,
      note: 'All browser console requests are blocked regardless of origin.',
      origin_note: origin ? `Request from ${origin} was blocked` : 'No origin provided'
    });
  }

  // Additional safety net: Block ANY browser request that looks suspicious
  if (userAgent.includes('Mozilla') && !isApiTool) {
    // Only allow browser requests that have PROPER navigation context
    const hasProperBrowserContext = (
      referer && 
      referer !== origin && // Referer is not just the origin
      referer.includes(origin) && // Referer includes origin (proper navigation)
      (
        req.headers['sec-fetch-site'] === 'same-origin' || 
        req.headers['sec-fetch-mode'] === 'cors' ||
        req.headers['x-requested-with'] === 'XMLHttpRequest'
      )
    );

    if (!hasProperBrowserContext) {
      console.log(`🚫 BLOCKED suspicious browser request:`, {
        method: req.method,
        path: req.path,
        origin,
        referer: referer || 'NO_REFERER',
        reason: 'Lacks proper browser navigation context'
      });
      
      return res.status(403).json({ 
        message: 'Forbidden: Browser requests must have proper navigation context.',
        hint: 'Navigate to your application and use the UI, do not make direct API calls.',
        note: 'Direct API calls from browser console are blocked.',
        debug: {
          has_referer: !!referer,
          referer_matches_origin: referer === origin,
          has_sec_fetch: !!req.headers['sec-fetch-site']
        }
      });
    }
  }

  console.log(`✅ Allowed request:`, {
    method: req.method,
    path: req.path,
    origin,
    userAgent: userAgent.substring(0, 50) + '...',
    type: isApiTool ? 'API_TOOL' : 'LEGITIMATE_BROWSER'
  });

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
      if (origin === 'https://swanfinal-1.onrender.com') return callback(null, true);

      if (origin === 'https://swan-testing.vercel.app') return callback(null, true);


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