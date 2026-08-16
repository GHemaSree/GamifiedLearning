const mongoose = require('mongoose');

// ─── Quest Attempt ──────────────────────────────────────────────────
// Records a student's single attempt at a gamified quest embedded in
// Full Notes. One document per (user, moduleId, questIndex).
//
// questIndex — the 0-based index into StudentFullNotes.gamifiedExamples
// isCorrect  — set by the LLM judge
// feedback   — LLM explanation (correction or confirmation)
// xpAwarded  — 0 if wrong; difficulty-scaled if correct
// ────────────────────────────────────────────────────────────────────

const questAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    questIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    questText: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    feedback: {
      type: String,
      default: '',
    },
    xpAwarded: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// One attempt per (user, module, quest) — prevents re-submission
questAttemptSchema.index(
  { user: 1, moduleId: 1, questIndex: 1 },
  { unique: true }
);

module.exports = mongoose.model('QuestAttempt', questAttemptSchema);
