const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// upload.single('avatar') means it expects a form-data field named 'avatar'
router.put('/update', protect, upload.single('avatar'), profileController.updateProfile);
router.get('/me', protect, profileController.getProfile);

module.exports = router;