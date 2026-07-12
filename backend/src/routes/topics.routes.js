const express = require('express');
const router = express.Router();
const {
  getTopics,
  createTopic,
  updateTopic,
  deleteTopic,
} = require('../controllers/topic.controller');
const { protect } = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');

router.get('/', getTopics); // public, per API design table
router.post('/', protect, admin, createTopic);
router.put('/:id', protect, admin, updateTopic);
router.delete('/:id', protect, admin, deleteTopic);

module.exports = router;