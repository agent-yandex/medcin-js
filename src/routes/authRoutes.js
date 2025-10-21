const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validators');

router.post('/register', validateUserRegistration, authController.register);

router.post('/login', validateUserLogin, authController.login);

router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;

