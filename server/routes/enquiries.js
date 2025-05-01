// enquiries.js
const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');
const { combinedAuth } = require('../middleware/auth');

// Create a new enquiry - now requires authentication for security
router.post('/', combinedAuth, enquiryController.createEnquiry);

// Get all enquiries - protected endpoint
router.get('/', combinedAuth, enquiryController.getEnquiries);

// Get a single enquiry - protected endpoint
router.get('/:id', combinedAuth, enquiryController.getEnquiry);

// Update an enquiry - protected endpoint
router.put('/:id', combinedAuth, enquiryController.updateEnquiry);

// Delete an enquiry - protected endpoint
router.delete('/:id', combinedAuth, enquiryController.deleteEnquiry);

module.exports = router;