const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    trail: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trail',
      required: true,
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    completionStatus: {
      type: String,
      enum: ['locked', 'in_progress', 'completed'],
      default: 'locked',
    },
  },
  { timestamps: true }
);

// Prevent duplicate progress entries for the same user+module
progressSchema.index({ user: 1, module: 1 }, { unique: true });
progressSchema.index({user: 1, trail: 1});

module.exports = mongoose.model('Progress', progressSchema);