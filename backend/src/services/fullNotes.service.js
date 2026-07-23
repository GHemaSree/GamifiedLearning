// ─── Full Notes Service ─────────────────────────────────────────────
// Orchestrates generation of comprehensive study notes for a
// student + module pair. Mirrors the moduleContent.service.js pattern.
//
// Flow:
//   1. Check cache (StudentFullNotes)
//   2. Determine first-subtopic vs subsequent
//   3. Build appropriate prompt (default or adaptive)
//   4. Call LLM
//   5. Validate response
//   6. Save & return
// ─────────────────────────────────────────────────────────────────────

const StudentFullNotes = require('../models/StudentFullNotes');
const Module           = require('../models/Module');
const Trail            = require('../models/Trail');
const Topic            = require('../models/Topic');
const Mastery          = require('../models/Mastery');

const { buildPrompt }                 = require('./ai/promptBuilder');
const { generateResponse }            = require('./ai/llm.service');
const { parseJSONObject, ParseError } = require('./ai/responseParser');

// ── Required fields the LLM must return ─────────────────────────────
const REQUIRED_FIELDS = ['title', 'sections'];

/**
 * Validate that the parsed LLM response contains every required field
 * and that sections is a properly structured array.
 *
 * @param {object} parsed – Parsed JSON object from the LLM
 * @throws {Error}        – If a required field is missing or malformed
 */
const _validateNotesFields = (parsed) => {
  const missing = REQUIRED_FIELDS.filter((f) => parsed[f] === undefined);

  if (missing.length > 0) {
    throw new Error(
      `LLM response missing required fields: ${missing.join(', ')}`
    );
  }

  // Validate sections structure
  if (!Array.isArray(parsed.sections) || parsed.sections.length === 0) {
    throw new Error(
      'LLM response "sections" must be a non-empty array of { heading, content } objects.'
    );
  }

  for (let i = 0; i < parsed.sections.length; i++) {
    const s = parsed.sections[i];
    if (!s.heading || !s.content) {
      throw new Error(
        `Section at index ${i} is missing "heading" or "content".`
      );
    }
    // Ensure heading and content are strings
    s.heading = String(s.heading);
    s.content = String(s.content);
  }

  // Normalise gamifiedExamples to an array
  if (!Array.isArray(parsed.gamifiedExamples)) {
    parsed.gamifiedExamples = typeof parsed.gamifiedExamples === 'string'
      ? [parsed.gamifiedExamples]
      : [];
  }
};

/**
 * Identify weak concepts for a student within a given topic.
 * A concept is "weak" if its mastery at the current difficulty < 0.5.
 *
 * @param {string} studentId – The student's user ID
 * @param {string} topicId   – The parent topic ID
 * @returns {Promise<Array<{ concept: string, score: number }>>}
 */
const _getWeakConcepts = async (studentId, topicId) => {
  const masteryRecords = await Mastery.find({
    user: studentId,
    topic: topicId,
  });

  return masteryRecords
    .map((m) => ({
      concept: m.concept,
      score: Math.round(m[m.currentDifficulty] * 100),
    }))
    .filter((c) => c.score < 50)
    .sort((a, b) => a.score - b.score); // weakest first
};

// ── Public API ──────────────────────────────────────────────────────

/**
 * Get or generate comprehensive full notes for a student + module pair.
 *
 * @param {string} studentId – The student's user ID
 * @param {string} moduleId  – The module ID
 * @returns {Promise<object>} – The StudentFullNotes document
 * @throws {Error}            – 404 if module/trail/topic not found,
 *                              parse/validation errors from LLM
 */
const getOrGenerateFullNotes = async (studentId, moduleId) => {
  // ── 1. Cache check ────────────────────────────────────────────────
  const existing = await StudentFullNotes.findOne({
    studentId,
    moduleId,
  });

  if (existing) {
    return existing;
  }

  // ── 2. Load module ────────────────────────────────────────────────
  const moduleDoc = await Module.findById(moduleId);
  if (!moduleDoc) {
    const err = new Error('Module not found');
    err.statusCode = 404;
    throw err;
  }

  // ── 3. Load trail & topic ─────────────────────────────────────────
  const trail = await Trail.findById(moduleDoc.trail);
  if (!trail) {
    const err = new Error('Parent trail not found');
    err.statusCode = 404;
    throw err;
  }

  const topic = await Topic.findById(trail.topic);
  if (!topic) {
    const err = new Error('Parent topic not found');
    err.statusCode = 404;
    throw err;
  }

  // ── 4. Determine if first subtopic ────────────────────────────────
  const isFirstSubtopic = moduleDoc.order === 0;

  // ── 5. Build prompt ───────────────────────────────────────────────
  let prompt;
  let masteryUsed = null;

  const baseParams = {
    topic:      topic.title,
    concept:    moduleDoc.concept,
    subject:    topic.title,
    difficulty: moduleDoc.difficulty,
  };

  if (isFirstSubtopic) {
    // Default prompt — no mastery data
    prompt = buildPrompt('fullNotesDefault', baseParams);
  } else {
    // Retrieve student's mastery for this specific concept
    const mastery = await Mastery.findOne({
      user: studentId,
      topic: trail.topic,
      concept: moduleDoc.concept,
    });

    // Build mastery snapshot
    const masterySnapshot = mastery
      ? {
          concept: mastery.concept,
          beginner: mastery.beginner,
          intermediate: mastery.intermediate,
          advanced: mastery.advanced,
          currentDifficulty: mastery.currentDifficulty,
        }
      : { note: 'No prior mastery data for this concept' };

    // Identify weak concepts across the topic
    const weakConcepts = await _getWeakConcepts(studentId, trail.topic);

    masteryUsed = masterySnapshot;

    prompt = buildPrompt('fullNotesAdaptive', {
      ...baseParams,
      masterySnapshot: JSON.stringify(masterySnapshot),
      weakConcepts:
        weakConcepts.length > 0
          ? weakConcepts
              .map((c) => `${c.concept} (${c.score}%)`)
              .join(', ')
          : 'none identified',
    });
  }

  // ── 6. Call LLM ───────────────────────────────────────────────────
  const llmResult = await generateResponse(prompt);

  // ── 7. Validate response ──────────────────────────────────────────
  const parsed = parseJSONObject(llmResult.content);
  _validateNotesFields(parsed);

  // ── 8. Save ───────────────────────────────────────────────────────
  const saved = await StudentFullNotes.create({
    studentId,
    moduleId,
    masteryUsed,
    title:            parsed.title,
    sections:         parsed.sections,
    gamifiedExamples: parsed.gamifiedExamples,
    generatedAt:      new Date(),
  });

  // ── 9. Return ─────────────────────────────────────────────────────
  return saved;
};

module.exports = { getOrGenerateFullNotes };
