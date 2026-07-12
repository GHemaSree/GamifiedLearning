const Module = require('../models/Module');
const Trail = require('../models/Trail');

// @desc    Get a single module's content
// @route   GET /modules/:id
// @access  Private
exports.getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ message: 'Module not found' });

    // self-only access — check ownership via the parent Trail
    const trail = await Trail.findById(module.trail);
    if (!trail) return res.status(404).json({ message: 'Parent trail not found' });

    if (trail.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json(module);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};