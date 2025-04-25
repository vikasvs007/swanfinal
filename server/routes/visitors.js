const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');
const { combinedAuth, adminAuth } = require('../middleware/auth');

// Public route - tracking visitors should work without auth
router.post('/', visitorController.createOrUpdateVisitor);

// Protected routes - require authentication
router.get('/', combinedAuth, visitorController.getVisitors);
router.get('/ip/:ip', combinedAuth, visitorController.getVisitorByIp);
router.put('/:id', combinedAuth, visitorController.updateVisitor);
router.delete('/:id', combinedAuth, visitorController.deleteVisitor);
router.get('/statistics', combinedAuth, visitorController.getVisitorStats);
router.get('/geography', combinedAuth, visitorController.getVisitorGeography);

module.exports = router;