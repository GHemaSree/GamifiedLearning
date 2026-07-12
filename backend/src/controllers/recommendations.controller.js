const Mastery = require('../models/Mastery');

const REVISE_THRESHOLD = 0.5; // below this mastery score → flagged for concept revision

// @desc    Get personalized recommendations — concepts to revise (Mastery-based)
// @route   GET /recommendations
// @access  Private
exports.getRecommendations = async (req, res) => {
  try {
    const masteryRecords = await Mastery.find({ user: req.user._id }).populate(
      'topic',
      'title icon'
    );

    const conceptsToRevise = masteryRecords
      .map((m) => {
        const currentScore = m[m.currentDifficulty]; // score at whichever tier they're on
        return {
          concept: m.concept,
          topicTitle: m.topic?.title,
          topicIcon: m.topic?.icon,
          masteryPercent: Math.round(currentScore * 100),
        };
      })
      .filter((c) => c.masteryPercent < REVISE_THRESHOLD * 100)
      .sort((a, b) => a.masteryPercent - b.masteryPercent); // weakest first

    res.status(200).json({
      conceptsToRevise,
      suggestedRevision: [], // populated in Week 3 once QuizAttempt exists
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};