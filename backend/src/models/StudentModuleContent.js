const mongoose = require('mongoose');

// ─── Student Module Content ────────────────────────────────────────
// Per-student, per-module personalized learning content generated
// by the LLM. The Module document remains static; this collection
// holds the adaptive variant each student actually sees.
// ────────────────────────────────────────────────────────────────────

const studentModuleContentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    masteryUsed: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    introduction: {
      type: String,
      required: true,
    },
    objective: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    keyPoints: {
      type: [String],
      default: [],
    },
    examples: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// One generated content document per student per module
studentModuleContentSchema.index(
  { studentId: 1, moduleId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  'StudentModuleContent',
  studentModuleContentSchema
);
