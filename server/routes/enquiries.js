// enquiries.js
const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');

// Create a new enquiry
router.post('/', enquiryController.createEnquiry);

// Get all enquiries
router.get('/', enquiryController.getEnquiries);

// Get a single enquiry
router.get('/:id', enquiryController.getEnquiry);

// Update an enquiry
router.put('/:id', enquiryController.updateEnquiry);

// Delete an enquiry
router.delete('/:id', enquiryController.deleteEnquiry);

module.exports = router;