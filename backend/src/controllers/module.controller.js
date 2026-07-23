const Module = require('../models/Module');
const Trail = require('../models/Trail');
const { getOrGenerateContent } = require('../services/moduleContent.service');
const { getOrGenerateFullNotes } = require('../services/fullNotes.service');
const { ParseError } = require('../services/ai/responseParser');

// @desc    Get all modules for the logged-in user (or all if admin)
// @route   GET /modules
// @access  Private
exports.getAllModules = async (req, res) => {
  try {
    let modules;
    if (req.user.role === 'admin') {
      modules = await Module.find().populate('trail', 'title topic').sort({ createdAt: -1 });
    } else {
      const userTrails = await Trail.find({ user: req.user._id }).select('_id');
      const trailIds = userTrails.map((t) => t._id);
      modules = await Module.find({ trail: { $in: trailIds } })
        .populate('trail', 'title topic')
        .sort({ createdAt: -1 });
    }

    res.status(200).json(modules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get a single module's static metadata
// @route   GET /modules/:id
// @access  Private
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

// @desc    Get or generate personalised module content for the logged-in student
// @route   GET /modules/:id/content
// @access  Private
exports.getModuleContent = async (req, res) => {
  try {
    const studentId = req.user._id;
    const moduleId = req.params.id;

    // Ownership check — the module must belong to a trail owned by this user
    const moduleDoc = await Module.findById(moduleId);
    if (!moduleDoc) return res.status(404).json({ message: 'Module not found' });

    const trail = await Trail.findById(moduleDoc.trail);
    if (!trail) return res.status(404).json({ message: 'Parent trail not found' });

    if (trail.user.toString() !== studentId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const content = await getOrGenerateContent(studentId, moduleId);

    return res.status(200).json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error('[module.controller] getModuleContent error:', error.message);

    // Known status codes from the service layer
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    // JSON parsing / extraction failed
    if (error instanceof ParseError) {
      return res.status(422).json({
        success: false,
        message: 'LLM response could not be parsed as valid module content',
        error: error.message,
      });
    }

    // LLM call or other upstream failure
    return res.status(502).json({
      success: false,
      message: 'Content generation failed. Please try again.',
      error: error.message,
    });
  }
};

// @desc    Explicitly trigger content generation for a student + module pair
// @route   POST /modules/:id/generate-content
// @access  Private (developer / admin use)
exports.generateModuleContent = async (req, res) => {
  try {
    const moduleId = req.params.id;
    // Accept studentId from body so a developer can generate for any student
    const studentId = req.body?.studentId || req.user._id;

    const moduleDoc = await Module.findById(moduleId);
    if (!moduleDoc) return res.status(404).json({ message: 'Module not found' });

    const trail = await Trail.findById(moduleDoc.trail);
    if (!trail) return res.status(404).json({ message: 'Parent trail not found' });

    const content = await getOrGenerateContent(studentId, moduleId);

    return res.status(201).json({
      success: true,
      message: content.createdAt === content.updatedAt
        ? 'Content generated successfully'
        : 'Content already existed (returned from cache)',
      data: content,
    });
  } catch (error) {
    console.error('[module.controller] generateModuleContent error:', error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    if (error instanceof ParseError) {
      return res.status(422).json({
        success: false,
        message: 'LLM response could not be parsed as valid module content',
        error: error.message,
      });
    }

    return res.status(502).json({
      success: false,
      message: 'Content generation failed. Please try again.',
      error: error.message,
    });
  }
};

// @desc    Get or generate comprehensive full notes for a module
// @route   GET /modules/:id/full-notes
// @access  Private
exports.getFullNotes = async (req, res) => {
  try {
    const studentId = req.user._id;
    const moduleId = req.params.id;

    // Ownership check — the module must belong to a trail owned by this user
    const moduleDoc = await Module.findById(moduleId);
    if (!moduleDoc) return res.status(404).json({ message: 'Module not found' });

    const trail = await Trail.findById(moduleDoc.trail);
    if (!trail) return res.status(404).json({ message: 'Parent trail not found' });

    if (trail.user.toString() !== studentId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const notes = await getOrGenerateFullNotes(studentId, moduleId);

    return res.status(200).json({
      success: true,
      data: notes,
    });
  } catch (error) {
    console.error('[module.controller] getFullNotes error:', error.message);

    // Known status codes from the service layer
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    // JSON parsing / extraction failed
    if (error instanceof ParseError) {
      return res.status(422).json({
        success: false,
        message: 'LLM response could not be parsed as valid full notes',
        error: error.message,
      });
    }

    // LLM call or other upstream failure
    return res.status(502).json({
      success: false,
      message: 'Full notes generation failed. Please try again.',
      error: error.message,
    });
  }
};
