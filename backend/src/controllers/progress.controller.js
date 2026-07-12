const Progress = require('../models/Progress');

// @desc    Get the learner's own overall progress
// @route   GET /progress
// @access  Private
exports.getMyProgress = async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.user._id })
      .populate('trail', 'title status')
      .populate('module', 'title order');
    res.status(200).json(progress);
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
    res.status(200).json(progress);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};