// routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { combinedAuth, adminAuth } = require('../middleware/auth');

// Create a new user - public for registration
router.post('/', userController.createUser);

// Get all users - admin only
router.get('/', combinedAuth, userController.getAllUsers);

// Get a single user - authenticated users can view their own profile
router.get('/:id', combinedAuth, userController.getUser);

// Update a user - authenticated users can update their own profile
router.put('/:id', combinedAuth, userController.updateUser);

// Delete a user - admin only
router.delete('/:id', combinedAuth, userController.deleteUser);

module.exports = router;