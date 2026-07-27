// --- Quiz Service ----------------------------------------------------
// Orchestrates AI quiz generation for a student + module pair.
//
// Flow:
//   1. Cache check (Quiz — one per module)
//   2. Determine first attempt vs subsequent (adaptive)
//   3. Build appropriate prompt (quizDefault or quizAdaptive)
//   4. Call LLM
//   5. Parse & validate response
//   6. Save & return
//
// This file owns the quiz-generation business logic.
// Controllers call it; it calls the prompt builder, LLM service,
// and response parser.
// ---------------------------------------------------------------------

const Quiz        = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Module      = require('../models/Module');
const Trail       = require('../models/Trail');
const Topic       = require('../models/Topic');
const Mastery     = require('../models/Mastery');

const { buildPrompt }                 = require('./ai/promptBuilder');
const { generateResponse }            = require('./ai/llm.service');
const { parseJSONObject, ParseError } = require('./ai/responseParser');

// -- Validation -------------------------------------------------------

/**
 * Validate that the parsed LLM response contains a non-empty questions array
 * and that every question has the required fields.
 */
const _validateQuizResponse = (parsed) => {
  if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
    throw new Error('LLM response missing required "questions" array.');
  }

  parsed.questions.forEach((q, i) => {
    const missing = ['question', 'options', 'correctAnswer'].filter(
      (f) => q[f] === undefined || q[f] === null
    );
    if (missing.length > 0) {
      throw new Error(
        `Question ${i + 1} missing required fields: ${missing.join(', ')}`
      );
    }
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error(`Question ${i + 1} must have exactly 4 options.`);
    }
    if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
      throw new Error(`Question ${i + 1} correctAnswer must be an integer 0-3.`);
    }
  });
};

// -- Weak-concept helper ----------------------------------------------

const _getWeakConcepts = async (studentId, topicId) => {
  const masteryRecords = await Mastery.find({ user: studentId, topic: topicId });

  return masteryRecords
    .map((m) => ({
      concept: m.concept,
      score:   Math.round(m[m.currentDifficulty] * 100),
    }))
    .filter((c) => c.score < 50)
    .sort((a, b) => a.score - b.score);
};

// -- Public API --------------------------------------------------------

/**
 * Get or generate a quiz for a module.
 * On first access the quiz is generated via LLM and cached.
 * Subsequent requests for the same module return the cached document.
 *
 * @param {string} studentId - The student user ID
 * @param {string} moduleId  - The module ID
 * @returns {Promise<object>} The Quiz mongoose document
 */
const getOrGenerateQuiz = async (studentId, moduleId) => {
  // -- 1. Cache check -------------------------------------------------
  const existing = await Quiz.findOne({ module: moduleId });
  if (existing) return existing;

  // -- 2. Load module -------------------------------------------------
  const moduleDoc = await Module.findById(moduleId);
  if (!moduleDoc) {
    const err = new Error('Module not found');
    err.statusCode = 404;
    throw err;
  }

  // -- 3. Load trail & topic ------------------------------------------
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

  // -- 4. Base params shared by both prompt modes ---------------------
  const baseParams = {
    topic:         topic.title,
    concept:       moduleDoc.concept,
    subject:       topic.title,
    difficulty:    moduleDoc.difficulty,
    questionCount: '5',
  };

  // -- 5. Determine prompt mode ---------------------------------------
  const priorAttempt = await QuizAttempt.findOne({
    user:   studentId,
    module: moduleId,
  });

  let prompt;

  if (!priorAttempt) {
    prompt = buildPrompt('quizDefault', baseParams);
  } else {
    const mastery = await Mastery.findOne({
      user:    studentId,
      topic:   trail.topic,
      concept: moduleDoc.concept,
    });

    const masterySnapshot = mastery
      ? {
          concept:           mastery.concept,
          beginner:          mastery.beginner,
          intermediate:      mastery.intermediate,
          advanced:          mastery.advanced,
          currentDifficulty: mastery.currentDifficulty,
        }
      : { note: 'No prior mastery data for this concept' };

    const weakConcepts = await _getWeakConcepts(studentId, trail.topic);

    prompt = buildPrompt('quizAdaptive', {
      ...baseParams,
      masterySnapshot: JSON.stringify(masterySnapshot),
      weakConcepts:
        weakConcepts.length > 0
          ? weakConcepts.map((c) => `${c.concept} (${c.score}%)`).join(', ')
          : 'none identified',
    });
  }

  // -- 6. Call LLM ----------------------------------------------------
  const llmResult = await generateResponse(prompt);

  // -- 7. Parse & validate --------------------------------------------
  const parsed = parseJSONObject(llmResult.content);
  _validateQuizResponse(parsed);

  // -- 8. Save --------------------------------------------------------
  const saved = await Quiz.create({
    module:    moduleId,
    questions: parsed.questions.map((q) => ({
      question:      q.question,
      options:       q.options,
      correctAnswer: q.correctAnswer,
      explanation:   q.explanation  || '',
      difficulty:    q.difficulty   || moduleDoc.difficulty,
    })),
  });

  return saved;
};

module.exports = { getOrGenerateQuiz };
