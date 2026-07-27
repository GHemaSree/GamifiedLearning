const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
      unique: true, // one quiz per module
    },
    questions: [
      {
        question:      { type: String, required: true },
        options:       { type: [String], required: true },
        correctAnswer: { type: Number, required: true }, // index into options — NEVER sent to frontend
        explanation:   { type: String, default: '' },
        difficulty:    {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced'],
          default: 'beginner',
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);