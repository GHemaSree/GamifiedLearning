const Progress = require('../models/Progress');
const QuizAttempt = require('../models/QuizAttempt');
const Mastery = require('../models/Mastery');

// Merge completed Progress entries and QuizAttempt entries into one
// chronological activity feed, newest first, capped at 10 items.
const _buildRecentActivity = (progress, attempts) => {
  const moduleActivity = progress
    .filter((p) => p.completionStatus === 'completed')
    .map((p) => ({
      type: 'module_completed',
      moduleTitle: p.module?.title || 'Module',
      trailTitle: p.trail?.title || '',
      timestamp: p.updatedAt,
    }));

  const quizActivity = attempts.map((a) => ({
    type: 'quiz_taken',
    moduleTitle: a.module?.title || 'Module',
    score: a.score,
    passed: a.passed,
    timestamp: a.createdAt,
  }));

  return [...moduleActivity, ...quizActivity]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 10);
};

// @desc    Get the learner's own overall progress
// @route   GET /progress
// @access  Private
exports.getMyProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user._id })
      .populate('trail', 'title status')
      .populate('module', 'title order');

    const attempts = await QuizAttempt.find({ user: req.user._id })
      .populate('module', 'title')
      .sort({ createdAt: -1 });

    const mastery = await Mastery.find({ user: req.user._id })
      .populate('topic', 'title icon');

    const totalQuizzesTaken = attempts.length;
    const averageScore = totalQuizzesTaken > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / totalQuizzesTaken)
      : 0;

    const recentActivity = _buildRecentActivity(progress, attempts);

    res.status(200).json({ progress, totalQuizzesTaken, averageScore, recentActivity, mastery });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get detailed progress per trail for a specific user
// @route   GET /progress/:userId
// @access  Self or Admin
exports.getProgressByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const progress = await Progress.find({ user: userId })
      .populate('trail', 'title status')
      .populate('module', 'title order');

    const attempts = await QuizAttempt.find({ user: userId })
      .populate('module', 'title')
      .sort({ createdAt: -1 });

    const mastery = await Mastery.find({ user: userId })
      .populate('topic', 'title icon');

    const totalQuizzesTaken = attempts.length;
    const averageScore = totalQuizzesTaken > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.score, 0) / totalQuizzesTaken)
      : 0;

    const recentActivity = _buildRecentActivity(progress, attempts);

    res.status(200).json({ progress, totalQuizzesTaken, averageScore, recentActivity, mastery });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};