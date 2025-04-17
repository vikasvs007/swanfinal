// routes/blogs.js
const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
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

// Get all blogs with filtering/pagination
router.get('/', blogController.getAllBlogs);

// Get blog categories
router.get('/categories', blogController.getBlogCategories);

// Get blog tags
router.get('/tags', blogController.getBlogTags);

// Get blog by ID
router.get('/:id', blogController.getBlog);

// Get blog by slug
router.get('/slug/:slug', blogController.getBlogBySlug);

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

// Upload an image for a blog
router.post('/upload-image', upload.single('image'), handleUploadErrors, blogController.uploadImage);

// Create a new blog
router.post('/', blogController.createBlog);

// Update a blog
router.put('/:id', blogController.updateBlog);

// Delete a blog
router.delete('/:id', blogController.deleteBlog);

module.exports = router; 