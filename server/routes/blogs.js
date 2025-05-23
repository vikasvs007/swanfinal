// routes/blogs.js
const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { combinedAuth, adminAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/blogs');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created blog uploads directory:', uploadDir);
}

// Configure multer for blog image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'blog-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get all blogs with filtering/pagination - public endpoint
router.get('/posts', blogController.getAllBlogs);

// Get blog categories - public endpoint
router.get('/categories', blogController.getBlogCategories);

// Get blog tags - public endpoint
router.get('/tags', blogController.getBlogTags);

// Get blog by ID - public endpoint
router.get('/posts/:id', blogController.getBlog);

// Get blog by slug - public endpoint
router.get('/posts/slug/:slug', blogController.getBlogBySlug);

// Upload error handler middleware
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer error occurred during file upload
    console.error('Multer error:', err);
    return res.status(400).json({ 
      success: false,
      message: `File upload error: ${err.message}` 
    });
  } else if (err) {
    // Other error occurred
    console.error('Upload error:', err);
    return res.status(500).json({ 
      success: false,
      message: `File upload failed: ${err.message}` 
    });
  }
  
  // No error, proceed to next middleware
  next();
};

// Upload an image for a blog - requires admin authentication
router.post('/images/upload', adminAuth, upload.single('image'), handleUploadErrors, blogController.uploadImage);

// Create a new blog - requires admin authentication
router.post('/posts/create', adminAuth, blogController.createBlog);

// Update a blog - requires admin authentication
router.put('/posts/update/:id', adminAuth, blogController.updateBlog);

// Delete a blog - requires admin authentication
router.delete('/posts/remove/:id', adminAuth, blogController.deleteBlog);

module.exports = router; 