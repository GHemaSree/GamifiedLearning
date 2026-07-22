const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    score: {
      type: Number, // percentage, 0-100
      required: true,
    },
    passed: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

quizAttemptSchema.index({ user: 1, module: 1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);