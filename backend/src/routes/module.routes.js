const express = require('express');
const router = express.Router();
const { getModuleById } = require('../controllers/module.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/:id', protect, getModuleById);

module.exports = router;