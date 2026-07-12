const Trail = require('../models/Trail');
const Module = require('../models/Module');
const Topic = require('../models/Topic');
const Progress = require('../models/Progress');
const Mastery = require('../models/Mastery');
const { generateModuleContent } = require('../services/ai.service');

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

    const trail = await Trail.create({
      user: req.user._id,
      topic: topic._id,
      title: topic.title,
      status: 'generating',
    });

    try {
      const firstConcept = [...topic.concepts].sort((a, b) => a.order - b.order)[0];

      const ai = await generateModuleContent(topic.title, firstConcept.name, 'beginner');

      const module = await Module.create({
        trail: trail._id,
        concept: ai.concept,
        title: ai.title,
        content: ai.content,
        objective: ai.objective,
        keyPoints: ai.keyPoints,
        summary: ai.summary,
        duration: ai.duration,
        difficulty: ai.difficulty,
        order: 0,
      });

      await Progress.create({
        user: req.user._id,
        trail: trail._id,
        module: module._id,
        completionStatus: 'in_progress',
      });

      await Mastery.findOneAndUpdate(
        { user: req.user._id, topic: topic._id, concept: firstConcept.name },
        { $setOnInsert: { beginner: 0.5, intermediate: 0.5, advanced: 0.5, currentDifficulty: 'beginner' } },
        { upsert: true, new: true }
      );

      trail.status = 'active';
      await trail.save();

      return res.status(201).json({ trail, modules: [module] });
    } catch (aiErr) {
      trail.status = 'failed';
      await trail.save();
      return res.status(502).json({
        message: 'Trail generation failed. Please try again.',
        trailId: trail._id,
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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
      modules,                       // real generated modules — full detail
      concepts: trail.topic.concepts, // full roadmap — name + order only
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};