const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema(
  {
    trail: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trail',
      required: true,
    },
    concept: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    objective: {
      type: String,
      default: '',
    },
    keyPoints: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      default: '',
    },
    sections: [
    {
    heading: { type: String, required: true },
    content: { type: String, required: true },
    },
    ],
    duration: {
      type: Number, // minutes
      default: 30,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
      default: 'beginner',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
moduleSchema.index({ trail: 1 });
module.exports = mongoose.model('Module', moduleSchema);