const express = require('express');
const router = express.Router();
const { getModuleById } = require('../controllers/module.controller');
const { getQuizByModule } = require('../controllers/quiz.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/:id', protect, getModuleById);
router.get('/:id/quiz', protect, getQuizByModule);

module.exports = router;