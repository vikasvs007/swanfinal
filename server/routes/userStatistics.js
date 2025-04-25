const express = require('express');
const router = express.Router();
const userStatisticsController = require('../controllers/userStatisticsController');
const { combinedAuth } = require('../middleware/auth');

// Public route - allows recording statistics
router.post('/', userStatisticsController.createOrUpdateStatistics);

// Protected routes - viewing and managing statistics requires auth
router.get('/', combinedAuth, userStatisticsController.getAllStatistics);
router.get('/user/:userId', combinedAuth, userStatisticsController.getUserStatistics);
router.delete('/:id', combinedAuth, userStatisticsController.deleteStatistics);
router.get('/overall', combinedAuth, userStatisticsController.getOverallStatistics);

module.exports = router;