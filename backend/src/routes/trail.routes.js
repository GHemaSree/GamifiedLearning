const express = require('express');
const router = express.Router();
const {
  createTrail,
  getTrailById,
  getMyTrails,
  getTrailByTopic,
  generateNextModule,
} = require('../controllers/trail.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, createTrail);
router.get('/', protect, getMyTrails);
router.get('/topic/:topicId', protect, getTrailByTopic);
router.post('/:id/next-module', protect, generateNextModule);
router.get('/:id', protect, getTrailById);

module.exports = router;