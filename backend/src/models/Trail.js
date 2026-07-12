const mongoose = require('mongoose');

const trailSchema = new mongoose.Schema(
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
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['generating', 'active', 'completed', 'failed'],
      default: 'generating',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trail', trailSchema);