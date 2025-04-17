const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const trackActivity = require('./middleware/trackActivity');
const path = require('path');
const fs = require('fs');

// Configure environment variables
dotenv.config();

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

// Middleware
app.use(cors({
  origin: '*', // Allow any origin in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
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
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crud_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('MongoDB connection error:', err));

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the CRUD API',
    endpoints: {
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

// API routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/active-users', activeUserRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/user-statistics', userStatisticsRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/cards', cardRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT =  5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at: http://localhost:${PORT}/api`);
});