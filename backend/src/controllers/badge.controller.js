const Badge = require('../models/Badge');
const { BADGE_DEFINITIONS } = require('../services/badge.service');

// @desc    Get all badges (earned + locked) for the logged-in user
// @route   GET /achievements
// @access  Private
exports.getMyBadges = async (req, res) => {
  try {
    const earned = await Badge.find({ user: req.user._id });
    const earnedKeys = new Set(earned.map((b) => b.key));

    const allBadges = Object.entries(BADGE_DEFINITIONS).map(([key, def]) => ({
      key,
      ...def,
      earned: earnedKeys.has(key),
    }));

    res.status(200).json(allBadges);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};