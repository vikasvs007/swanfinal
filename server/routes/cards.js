const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cardController = require('../controllers/cardController');

// Ensure upload directory exists (for temporary file uploads)
const uploadDir = path.join(__dirname, '../uploads/cards');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created card uploads directory:', uploadDir);
}

// Configure multer for card image uploads (temporary storage)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'card-' + uniqueSuffix + ext);
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

// Get all cards
router.get('/', cardController.getAllCards);

// Get a single card by ID
router.get('/:id', cardController.getCard);

// Upload an image for a card (returns base64)
router.post('/upload-image', upload.single('image'), handleUploadErrors, cardController.uploadImage);

// Create a new card - accepts either base64 image data or file upload
router.post('/', upload.single('image'), handleUploadErrors, cardController.createCard);

// Update a card by ID - accepts either base64 image data or file upload
router.put('/:id', upload.single('image'), handleUploadErrors, cardController.updateCard);

// Delete a card by ID
router.delete('/:id', cardController.deleteCard);

module.exports = router; 