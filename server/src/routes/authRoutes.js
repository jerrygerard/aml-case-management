const express = require('express');
const router = express.Router();
const { AuthController, validateRegister, validateLogin, validateChangePassword } = require('../controllers/authController');
const { auth, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', validateRegister, AuthController.register);
router.post('/login', validateLogin, AuthController.login);

// Protected routes
router.get('/profile', auth, AuthController.getProfile);
router.post('/change-password', auth, validateChangePassword, AuthController.changePassword);

// Admin-only routes
router.get('/users', auth, authorize('admin'), async (req, res) => {
  // This would be implemented in a UserController
  res.json({ message: 'List of users (admin only)' });
});

module.exports = router; 