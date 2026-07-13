const Module = require('../models/Module');
const Trail = require('../models/Trail');

exports.getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ message: 'Module not found' });

    const trail = await Trail.findById(module.trail).populate('topic', 'title icon');
    if (!trail) return res.status(404).json({ message: 'Parent trail not found' });

    if (trail.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ ...module.toObject(), trailTitle: trail.title, icon: trail.topic?.icon });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};