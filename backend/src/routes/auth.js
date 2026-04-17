const express = require('express');
const { signup, login } = require('../controllers/authController');
const { validateSignup, validateLogin } = require('../middlewares/validators');

const router = express.Router();

/**
 * POST /api/auth/signup
 * Register a new user
 */
router.post('/signup', validateSignup, signup);

/**
 * POST /api/auth/login
 * Login user and get JWT token
 */
router.post('/login', validateLogin, login);

module.exports = router;
