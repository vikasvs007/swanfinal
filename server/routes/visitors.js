const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');

// Routes without authentication
router.get('/', visitorController.getVisitors);
router.get('/ip/:ip', visitorController.getVisitorByIp);
router.post('/', visitorController.createOrUpdateVisitor);
router.put('/:id', visitorController.updateVisitor);
router.delete('/:id', visitorController.deleteVisitor);
router.get('/statistics', visitorController.getVisitorStats);
router.get('/geography', visitorController.getVisitorGeography);

module.exports = router;