const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../auth/userAuth');

// Auth routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Test routes
router.get('/', userController.getAllUsers);
router.get('/:userId', userController.getUserById);

// Protected routes
router.post('/follow/:userId', authMiddleware, userController.followUser);
router.delete('/unfollow/:userId', authMiddleware, userController.unfollowUser);

module.exports = router;