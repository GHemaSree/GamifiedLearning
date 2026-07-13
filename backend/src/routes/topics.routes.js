const express = require('express');
const router = express.Router();
const {
  createTopic,
  getTopics,
  getTopicById,
  updateTopic,
  deleteTopic,
} = require('../controllers/topic.controller');
const { protect } = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.middleware');

router.get('/', getTopics);
router.get('/:id', getTopicById);
router.post('/', protect, admin, createTopic);
router.put('/:id', protect, admin, updateTopic);
router.delete('/:id', protect, admin, deleteTopic);

module.exports = router;