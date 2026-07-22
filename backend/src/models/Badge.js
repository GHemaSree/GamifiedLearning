const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    key: {
      type: String,
      required: true,
      enum: ['first_step', 'seven_day_streak', 'goal_crusher', 'trail_blazer', 'knowledge_seeker', 'speed_learner'],
    },
    label: { type: String, required: true },
    icon: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

// A user can only earn each badge once
badgeSchema.index({ user: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('Badge', badgeSchema);