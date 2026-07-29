const express = require('express');
const router = express.Router();
const {
  getAllModules,
  getModuleById,
  getModuleContent,
  generateModuleContent,
  getFullNotes,
  clearModuleContent,
} = require('../controllers/module.controller');
const { getQuizByModule, clearModuleQuiz } = require('../controllers/quiz.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getAllModules);
router.get('/:id', protect, getModuleById);
router.get('/:id/quiz', protect, getQuizByModule);
router.get('/:id/content', protect, getModuleContent);
router.get('/:id/full-notes', protect, getFullNotes);
router.post('/:id/generate-content', protect, generateModuleContent);
router.delete('/:id/content/cache', protect, clearModuleContent);   // clears StudentModuleContent for re-gen
router.delete('/:id/quiz/cache', protect, clearModuleQuiz);          // clears Quiz for adaptive re-gen

module.exports = router;