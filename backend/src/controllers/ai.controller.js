// ─── AI Controller ──────────────────────────────────────────────────
// Thin controller layer — no business logic lives here.
// Each handler validates the request, delegates to a service,
// and maps the result to an HTTP response.
// ─────────────────────────────────────────────────────────────────────

const { generateResponse } = require('../services/ai/llm.service');
const { buildPrompt }      = require('../services/ai/promptBuilder');
const { parseJSON, ParseError } = require('../services/ai/responseParser');

// POST /api/ai/test
// Temporary endpoint to verify Groq + Prompt Builder + Parser integration.
const testLLM = async (req, res) => {
  try {
    const prompt = buildPrompt('quizDefault', {
      topic:      'Variables in Java',
      subtopics:  'int, double, boolean, scope',
      subject:    'Java Programming',
      difficulty: 'Advanced',
      mastery:    'Advanced',
    });

    const result = await generateResponse(prompt);

    // Parse the raw LLM string into a structured JS object/array
    const parsed = parseJSON(result.content);

    return res.status(200).json({
      success:  true,
      message:  'LLM integration test successful',
      data: {
        response: parsed,
        model:    result.model,
        provider: result.provider,
        usage:    result.usage,
      },
    });
  } catch (error) {
    console.error('[ai.controller] testLLM error:', error.message);

    // JSON parsing / extraction failed
    if (error instanceof ParseError) {
      return res.status(422).json({
        success: false,
        message: 'LLM response could not be parsed as JSON',
        error:   error.message,
        raw:     error.rawText,
      });
    }

    // Surface auth / quota errors with a distinct status code.
    if (error.status === 401 || error.status === 403) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or missing GROQ_API_KEY',
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        message: 'Groq rate limit exceeded. Try again later.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'LLM integration test failed',
      error:   error.message,
    });
  }
};

module.exports = { testLLM };

