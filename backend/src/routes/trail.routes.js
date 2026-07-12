const express = require('express');
const router = express.Router();
const { createTrail, getTrailById } = require('../controllers/trail.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/', protect, createTrail);
router.get('/:id', protect, getTrailById);

module.exports = router;