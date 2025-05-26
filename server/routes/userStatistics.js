const express = require('express');
const router = express.Router();
const userStatisticsController = require('../controllers/userStatisticsController');
const { combinedAuth, adminAuth } = require('../middleware/auth');

// Public route - allows recording statistics (consider if this needs restriction)
router.post('/record', userStatisticsController.createOrUpdateStatistics);

// Protected routes - viewing and managing statistics requires admin authentication
router.get('/all', combinedAuth, userStatisticsController.getAllStatistics);
router.get('/user/:userId/details', combinedAuth, userStatisticsController.getUserStatistics);
router.delete('/remove/:id', combinedAuth, userStatisticsController.deleteStatistics);
router.get('/summary', combinedAuth, userStatisticsController.getOverallStatistics);
router.get('/', combinedAuth, userStatisticsController.getOverallStatistics);

module.exports = router;