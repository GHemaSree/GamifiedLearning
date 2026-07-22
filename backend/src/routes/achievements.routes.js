const express = require('express');
const router = express.Router();
const { getMyBadges } = require('../controllers/badge.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getMyBadges);

module.exports = router;