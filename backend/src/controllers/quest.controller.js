// ─── Quest Controller ────────────────────────────────────────────────
// Handles student quest answer submissions from Full Notes.
//
// POST /modules/:id/quests/:questIndex/answer
//   – Validates one-attempt-per-quest
//   – Loads quest text from StudentFullNotes
//   – Calls the LLM judge via quest.service.js
//   – Awards XP (difficulty-scaled) on correct answer
//   – Recalculates level using the same LEVEL_THRESHOLDS as quiz.controller.js
//   – Saves QuestAttempt and returns structured feedback
// ─────────────────────────────────────────────────────────────────────

const StudentFullNotes = require('../models/StudentFullNotes');
const QuestAttempt     = require('../models/QuestAttempt');
const Module           = require('../models/Module');
const User             = require('../models/User');
const { evaluateQuestAnswer } = require('../services/quest.service');

// Reuse the same level thresholds as quiz.controller.js
const LEVEL_THRESHOLDS = [0, 543, 1090, 2063, 3567, 5081];

const calculateLevel = (xp) => {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  return level;
};

/**
 * POST /modules/:id/quests/:questIndex/answer
 *
 * Body: { answer: string }
 *
 * Returns:
 * {
 *   isCorrect:  boolean,
 *   feedback:   string,   // LLM correction or confirmation
 *   xpAwarded:  number,   // 0 if wrong; 15/25/40 based on difficulty
 *   totalXp:    number,   // user's updated total XP
 *   level:      number,   // user's updated level
 *   alreadyAttempted: false
 * }
 */
exports.submitQuestAnswer = async (req, res) => {
  try {
    const moduleId    = req.params.id;
    const questIndex  = parseInt(req.params.questIndex, 10);
    const studentId   = req.user._id;
    const { answer }  = req.body;

    // ── Validate input ────────────────────────────────────────────────
    if (!answer || typeof answer !== 'string' || !answer.trim()) {
      return res.status(400).json({ message: 'Answer is required.' });
    }

    if (isNaN(questIndex) || questIndex < 0) {
      return res.status(400).json({ message: 'Invalid quest index.' });
    }

    // ── One-attempt guard ─────────────────────────────────────────────
    const existingAttempt = await QuestAttempt.findOne({
      user: studentId,
      moduleId,
      questIndex,
    });

    if (existingAttempt) {
      return res.status(409).json({
        alreadyAttempted: true,
        isCorrect:   existingAttempt.isCorrect,
        feedback:    existingAttempt.feedback,
        xpAwarded:   existingAttempt.xpAwarded,
        message:     'You have already attempted this quest.',
      });
    }

    // ── Load quest text from StudentFullNotes ─────────────────────────
    const notes = await StudentFullNotes.findOne({ studentId, moduleId });
    if (!notes) {
      return res.status(404).json({ message: 'Full notes not found for this module. Generate notes first.' });
    }

    const questText = notes.gamifiedExamples?.[questIndex];
    if (!questText) {
      return res.status(404).json({ message: `Quest at index ${questIndex} not found.` });
    }

    // ── Load module for difficulty ────────────────────────────────────
    const moduleDoc = await Module.findById(moduleId);
    if (!moduleDoc) {
      return res.status(404).json({ message: 'Module not found.' });
    }

    // ── LLM evaluation ────────────────────────────────────────────────
    const { isCorrect, feedback, xpAwarded } = await evaluateQuestAnswer(
      questText,
      answer.trim(),
      moduleDoc.difficulty
    );

    // ── Save attempt ──────────────────────────────────────────────────
    await QuestAttempt.create({
      user:       studentId,
      moduleId,
      questIndex,
      questText,
      answer:     answer.trim(),
      isCorrect,
      feedback,
      xpAwarded,
    });

    // ── Award XP if correct ───────────────────────────────────────────
    const user = await User.findById(studentId);
    if (isCorrect && xpAwarded > 0) {
      user.xp   += xpAwarded;
      user.level = calculateLevel(user.xp);
      await user.save();
    }

    return res.status(200).json({
      isCorrect,
      feedback,
      xpAwarded,
      totalXp:          user.xp,
      level:            user.level,
      alreadyAttempted: false,
    });

  } catch (err) {
    console.error('[quest.controller] submitQuestAnswer error:', err.message);
    return res.status(500).json({
      message: 'Quest evaluation failed. Please try again.',
      error:   err.message,
    });
  }
};

/**
 * GET /modules/:id/quests/attempts
 * Returns all quest attempts for the logged-in student on this module.
 * Useful for the frontend to know which quests are already attempted.
 */
exports.getQuestAttempts = async (req, res) => {
  try {
    const attempts = await QuestAttempt.find({
      user:     req.user._id,
      moduleId: req.params.id,
    }).select('questIndex isCorrect xpAwarded feedback createdAt');

    return res.status(200).json({ attempts });
  } catch (err) {
    console.error('[quest.controller] getQuestAttempts error:', err.message);
    return res.status(500).json({ message: err.message });
  }
};
