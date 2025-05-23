const express = require('express');
const router = express.Router();
const userStatisticsController = require('../controllers/userStatisticsController');
const { combinedAuth, adminAuth } = require('../middleware/auth');

// Public route - allows recording statistics (consider if this needs restriction)
router.post('/record', userStatisticsController.createOrUpdateStatistics);

// Protected routes - viewing and managing statistics requires admin authentication
router.get('/all', adminAuth, userStatisticsController.getAllStatistics);
router.get('/user/:userId/details', adminAuth, userStatisticsController.getUserStatistics);
router.delete('/remove/:id', adminAuth, userStatisticsController.deleteStatistics);
router.get('/summary', adminAuth, userStatisticsController.getOverallStatistics);

module.exports = router;