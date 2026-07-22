const Mastery = require('../models/Mastery');
const QuizAttempt = require('../models/QuizAttempt');

const REVISE_THRESHOLD = 50; // mastery % below this → flagged for concept revision
const REVISIT_THRESHOLD = 65; // quiz % below this → flagged for module revisit

// @desc    Get personalized recommendations — concepts to revise + modules to revisit
// @route   GET /recommendations
// @access  Private
exports.getRecommendations = async (req, res) => {
  try {
    // ---- 1. Concepts to Revise (from Mastery) ----
    const masteryRecords = await Mastery.find({ user: req.user._id }).populate(
      'topic',
      'title icon'
    );

    const conceptsToRevise = masteryRecords
      .map((m) => {
        const currentScore = m[m.currentDifficulty];
        return {
          concept: m.concept,
          topicTitle: m.topic?.title,
          topicIcon: m.topic?.icon,
          masteryPercent: Math.round(currentScore * 100),
        };
      })
      .filter((c) => c.masteryPercent < REVISE_THRESHOLD)
      .sort((a, b) => a.masteryPercent - b.masteryPercent);

    // ---- 2. Suggested Revision (from QuizAttempt — latest attempt per module) ----
    const attempts = await QuizAttempt.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'module',
        select: 'title concept trail',
        populate: { path: 'trail', select: 'title' },
      });

    const latestPerModule = new Map();
    for (const attempt of attempts) {
      const moduleId = attempt.module?._id?.toString();
      if (moduleId && !latestPerModule.has(moduleId)) {
        latestPerModule.set(moduleId, attempt);
      }
    }

    const suggestedRevision = Array.from(latestPerModule.values())
      .filter((a) => a.score < REVISIT_THRESHOLD)
      .map((a) => ({
        moduleId: a.module._id,
        moduleTitle: a.module.title,
        trailTitle: a.module.trail?.title,
        lastScore: a.score,
      }));

    res.status(200).json({
      conceptsToRevise,
      suggestedRevision,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};