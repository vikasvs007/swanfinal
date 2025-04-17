const express = require('express');
const router = express.Router();
const userStatisticsController = require('../controllers/userStatisticsController');

// Routes without authentication
router.get('/', userStatisticsController.getAllStatistics);
router.get('/user/:userId', userStatisticsController.getUserStatistics);
router.post('/', userStatisticsController.createOrUpdateStatistics);
router.delete('/:id', userStatisticsController.deleteStatistics);
router.get('/overall', userStatisticsController.getOverallStatistics);

module.exports = router;