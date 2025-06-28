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
app.use((req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  const referer = req.headers['referer'] || '';

  const isLikelyFromWebConsole = userAgent.includes('Mozilla') && !referer;

  // If request has 'x-web-console' header, treat it as Web Console or Postman
  const isExplicitWebConsole = req.headers['x-web-console'] === 'vikasvs6363';

  if ((isLikelyFromWebConsole || isExplicitWebConsole) && req.method !== 'GET') {
    return res.status(403).json({ message: 'Forbidden: POST requests from web console or tools are blocked.' });
  }

  next();
});

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




app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure && req.headers['x-forwarded-proto'] !== 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(trackActivity);

// Serve uploads
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

const checkDatabaseConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database connection is not established. Please try again later.'
    });
  }
  next();
};

// Routes
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

app.use('/proxy/api/:path(*)', proxyRateLimit, cacheMiddleware, apiProxy);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
