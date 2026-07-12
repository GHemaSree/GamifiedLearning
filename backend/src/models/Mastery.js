const mongoose = require('mongoose');

const masterySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },
    concept: {
      type: String,
      required: true,
      trim: true,
    },
    beginner: { type: Number, default: 0.5 },
    intermediate: { type: Number, default: 0.5 },
    advanced: { type: Number, default: 0.5 },
    currentDifficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
  },
  { timestamps: true }
);

masterySchema.index({ user: 1, topic: 1, concept: 1 }, { unique: true });

module.exports = mongoose.model('Mastery', masterySchema);