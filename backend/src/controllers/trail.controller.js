const Trail = require('../models/Trail');
const Module = require('../models/Module');
const Topic = require('../models/Topic');
const Progress = require('../models/Progress');
const Mastery = require('../models/Mastery');
const Quiz = require('../models/Quiz');
const { generateModuleContent } = require('../services/ai.service');

// @desc    Create (or fetch existing) trail for a topic — no AI call, no modules yet
// @route   POST /trails
// @access  Private
exports.createTrail = async (req, res) => {
  try {
    const { topicId } = req.body;

    if (!topicId) {
      return res.status(400).json({ message: 'topicId is required' });
    }

    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    if (!topic.concepts || topic.concepts.length === 0) {
      return res.status(400).json({ message: 'This topic has no concepts defined yet' });
    }

    const existingTrail = await Trail.findOne({ user: req.user._id, topic: topic._id });
    if (existingTrail) {
      return res.status(200).json({ trail: existingTrail });
    }

    let trail;
    try {
      trail = await Trail.create({
        user: req.user._id,
        topic: topic._id,
        title: topic.title,
        status: 'active',
      });
    } catch (dupErr) {
      if (dupErr.code === 11000) {
        const raceWinnerTrail = await Trail.findOne({ user: req.user._id, topic: topic._id });
        return res.status(200).json({ trail: raceWinnerTrail });
      }
      throw dupErr;
    }

    return res.status(201).json({ trail });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Generate the next concept's module + quiz for a trail (triggered by clicking a concept)
// @route   POST /trails/:id/next-module
// @access  Private
exports.generateNextModule = async (req, res) => {
  try {
    const trail = await Trail.findById(req.params.id).populate('topic');
    if (!trail) return res.status(404).json({ message: 'Trail not found' });

    if (trail.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const existingModules = await Module.find({ trail: trail._id }).sort({ order: 1 });

    // Block generating ahead — only one module can be active/incomplete at a time
    if (existingModules.length > 0) {
      const lastModule = existingModules[existingModules.length - 1];
      const lastProgress = await Progress.findOne({ trail: trail._id, module: lastModule._id });
      if (lastProgress && lastProgress.completionStatus !== 'completed') {
        // Don't generate a new one — just return the still-incomplete one
        return res.status(200).json({ module: lastModule });
      }
    }

    const sortedConcepts = [...trail.topic.concepts].sort((a, b) => a.order - b.order);
    const existingConceptNames = new Set(existingModules.map((m) => m.concept));
    const nextConcept = sortedConcepts.find((c) => !existingConceptNames.has(c.name));

    if (!nextConcept) {
      trail.status = 'completed';
      await trail.save();
      return res.status(200).json({ message: 'All concepts completed', trail });
    }

    try {
      const ai = await generateModuleContent(trail.topic.title, nextConcept.name, 'beginner');

      const module = await Module.create({
        trail: trail._id,
        concept: ai.concept,
        title: ai.title,
        content: ai.content,
        objective: ai.objective,
        keyPoints: ai.keyPoints,
        summary: ai.summary,
        sections: ai.sections,
        duration: ai.duration,
        difficulty: ai.difficulty,
        order: existingModules.length,
      });

      // Quiz is generated on demand by quiz.service.js when the student
      // first opens the quiz — no pre-creation needed here.

      await Progress.create({
        user: req.user._id,
        trail: trail._id,
        module: module._id,
        completionStatus: 'in_progress',
      });

      await Mastery.findOneAndUpdate(
        { user: req.user._id, topic: trail.topic._id, concept: nextConcept.name },
        { $setOnInsert: { beginner: 0.5, intermediate: 0.5, advanced: 0.5, currentDifficulty: 'beginner' } },
        { upsert: true, new: true }
      );

      return res.status(201).json({ module });
    } catch (aiErr) {
      console.error('Module generation failed:',aiErr);
      return res.status(502).json({ message: 'Module generation failed. Please try again.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
// @desc    Get all trails for the logged-in user
// @route   GET /trails
// @access  Private
exports.getMyTrails = async (req, res) => {
  try {
    const trails = await Trail.find({ user: req.user._id })
      .populate('topic', 'title icon level concepts')
      .sort({ createdAt: -1 });

    const progressCounts = await Progress.aggregate([
      { $match: { user: req.user._id, trail: { $in: trails.map((t) => t._id) } } },
      {
        $group: {
          _id: '$trail',
          completed: { $sum: { $cond: [{ $eq: ['$completionStatus', 'completed'] }, 1, 0] } },
        },
      },
    ]);

    const countsMap = new Map(progressCounts.map((p) => [p._id.toString(), p]));

    const trailsWithProgress = trails.map((trail) => {
      const counts = countsMap.get(trail._id.toString()) || { completed: 0 };
      const totalConcepts = trail.topic.concepts.length;
      const progressPercent = totalConcepts > 0 ? Math.round((counts.completed / totalConcepts) * 100) : 0;

      return {
        _id: trail._id,
        title: trail.title,
        status: trail.status,
        topic: trail.topic,
        progressPercent,
        modulesCompleted: counts.completed,
        modulesTotal: totalConcepts, // now the full curriculum length, matching Trail page's own math
        updatedAt: trail.updatedAt,
      };
    });

    res.status(200).json(trailsWithProgress);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get trail details
// @route   GET /trails/:id
// @access  Private
exports.getTrailById = async (req, res) => {
  try {
    const trail = await Trail.findById(req.params.id).populate('topic');
    if (!trail) return res.status(404).json({ message: 'Trail not found' });

    if (trail.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const modules = await Module.find({ trail: trail._id }).sort({ order: 1 });

    res.status(200).json({
      trail,
      modules,
      concepts: trail.topic.concepts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Check if a trail exists for a given topic (for the logged-in user)
// @route   GET /trails/topic/:topicId
// @access  Private
exports.getTrailByTopic = async (req, res) => {
  try {
    const trail = await Trail.findOne({ user: req.user._id, topic: req.params.topicId });
    if (!trail) return res.status(404).json({ message: 'No trail started for this topic yet' });
    res.status(200).json(trail);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};