const Topic = require('../models/Topic');

exports.createTopic = async (req, res) => {
  try {
    const { title, description, icon, level, order, concepts } = req.body;

    if (!level) {
      return res.status(400).json({ message: 'level is required' });
    }
    if (!concepts || concepts.length === 0) {
      return res.status(400).json({ message: 'concepts array is required' });
    }

    const topic = await Topic.create({
      title,
      description,
      icon,
      level,
      order,
      concepts,
      createdBy: req.user._id,
    });
    res.status(201).json(topic);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTopics = async (req, res) => {
  try {
    const topics = await Topic.find().sort({ order: 1 });
    res.status(200).json(topics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });
    res.status(200).json(topic);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTopic = async (req, res) => {
  try {
    const topic = await Topic.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!topic) return res.status(404).json({ message: 'Topic not found' });
    res.status(200).json(topic);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTopic = async (req, res) => {
  try {
    const topic = await Topic.findByIdAndDelete(req.params.id);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });
    res.status(200).json({ message: 'Topic deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};