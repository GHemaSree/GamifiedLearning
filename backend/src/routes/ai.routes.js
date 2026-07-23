const express = require('express');
const router = express.Router();
const { testLLM } = require('../controllers/ai.controller');

// POST /api/ai/test — temporary smoke-test for Groq integration
router.post('/test', testLLM);

module.exports = router;
