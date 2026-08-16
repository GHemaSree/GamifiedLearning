// ─── Quest Evaluation Service ────────────────────────────────────────
// Uses the LLM as a judge to evaluate a student's answer to a
// gamified quest. Returns { isCorrect, feedback }.
//
// This service is intentionally isolated from fullNotes.service.js —
// it only calls the LLM for answer evaluation, not content generation.
// ─────────────────────────────────────────────────────────────────────

const { generateResponse } = require('./ai/llm.service');
const { parseJSONObject, parseJSON } = require('./ai/responseParser');

// ── XP reward by module difficulty ──────────────────────────────────
const XP_BY_DIFFICULTY = {
  beginner:     15,
  intermediate: 25,
  advanced:     40,
};

/**
 * Build a judge prompt asking the LLM to evaluate a quest answer.
 *
 * @param {string} questText   – The gamified quest/challenge string
 * @param {string} userAnswer  – The student's submitted answer
 * @returns {string}           – Ready-to-send prompt string
 */
const _buildJudgePrompt = (questText, userAnswer) =>
  'You are a fair and educational answer evaluator. ' +
  'A student was given the following gamified challenge:\n\n' +
  `QUEST: ${questText}\n\n` +
  `STUDENT ANSWER: ${userAnswer}\n\n` +
  'Evaluate whether the student\'s answer is correct. ' +
  'Accept reasonable paraphrases and conceptually correct responses — ' +
  'do not require word-for-word matches. ' +
  'If incorrect, clearly explain the right answer in an encouraging, educational tone. ' +
  'If correct, confirm it and add a brief insight to reinforce learning. ' +
  'Your response must be a SINGLE JSON object with exactly these two keys: ' +
  '{"isCorrect": true/false, "feedback": "<your evaluation and explanation>"}. ' +
  'Return ONLY raw JSON — no markdown, no prose, no code fences.';

/**
 * Evaluate a student's quest answer using the LLM as judge.
 *
 * @param {string} questText   – The full gamified quest string from StudentFullNotes
 * @param {string} userAnswer  – The student's submitted free-text answer
 * @param {string} difficulty  – 'beginner' | 'intermediate' | 'advanced' (from Module)
 * @returns {Promise<{ isCorrect: boolean, feedback: string, xpAwarded: number }>}
 */
const evaluateQuestAnswer = async (questText, userAnswer, difficulty) => {
  const prompt = _buildJudgePrompt(questText, userAnswer);

  const llmResult = await generateResponse(prompt);

  // Parse — try parseJSONObject first, fall back to unwrap array
  let parsed;
  try {
    parsed = parseJSONObject(llmResult.content);
  } catch (_) {
    const fallback = parseJSON(llmResult.content);
    if (Array.isArray(fallback) && fallback.length > 0 && typeof fallback[0] === 'object') {
      parsed = fallback[0];
    } else {
      throw new Error('LLM judge returned an unparseable response. Please try again.');
    }
  }

  if (typeof parsed.isCorrect !== 'boolean') {
    throw new Error('LLM judge response missing "isCorrect" boolean field.');
  }

  const xpAwarded = parsed.isCorrect
    ? (XP_BY_DIFFICULTY[difficulty] ?? XP_BY_DIFFICULTY.intermediate)
    : 0;

  return {
    isCorrect:  parsed.isCorrect,
    feedback:   parsed.feedback ?? '',
    xpAwarded,
  };
};

module.exports = { evaluateQuestAnswer, XP_BY_DIFFICULTY };
