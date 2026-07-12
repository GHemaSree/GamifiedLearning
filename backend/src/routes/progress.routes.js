const express = require('express');
const router = express.Router();
const { getMyProgress, getProgressByUserId } = require('../controllers/progress.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getMyProgress);
router.get('/:userId', protect, getProgressByUserId);

module.exports = router;