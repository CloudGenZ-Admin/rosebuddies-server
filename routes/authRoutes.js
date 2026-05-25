const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Registration & Verification
router.post('/register', authController.register);
router.post('/verify-email', authController.verifyEmailOTP);
router.post('/resend-otp', authController.resendOTP);

// Login
router.post('/login', authController.login);
router.post('/google', authController.googleLogin);
router.post('/logout', authController.logout);

// Password Reset Flow
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;