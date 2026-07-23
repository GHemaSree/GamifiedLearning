const express = require('express');
const router = express.Router();
const {
  getRecommendations,
  refreshRecommendations,
} = require('../controllers/recommendations.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getRecommendations);
router.post('/refresh', protect, refreshRecommendations);

module.exports = router;