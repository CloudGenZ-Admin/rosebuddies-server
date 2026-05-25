const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/submit', protect, quizController.submitQuiz);

module.exports = router;