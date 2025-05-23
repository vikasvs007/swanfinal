// enquiries.js
const express = require('express');
const router = express.Router();
const enquiryController = require('../controllers/enquiryController');
const { combinedAuth, adminAuth } = require('../middleware/auth');

// Create a new enquiry - now requires admin authentication for security
router.post('/', adminAuth, enquiryController.createEnquiry);

// Get all enquiries - protected endpoint (can remain combinedAuth if non-admins should view)
// If only admins should view, change to adminAuth as well.
router.get('/', combinedAuth, enquiryController.getEnquiries);

// Get a single enquiry - protected endpoint (can remain combinedAuth if non-admins should view)
// If only admins should view, change to adminAuth as well.
router.get('/:id', combinedAuth, enquiryController.getEnquiry);

// Update an enquiry - protected endpoint, requires admin authentication
router.put('/:id', adminAuth, enquiryController.updateEnquiry);

// Delete an enquiry - protected endpoint, requires admin authentication
router.delete('/:id', adminAuth, enquiryController.deleteEnquiry);

module.exports = router;