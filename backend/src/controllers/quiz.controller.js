const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Module = require('../models/Module');
const Trail = require('../models/Trail');
const Progress = require('../models/Progress');
const Mastery = require('../models/Mastery');
const User = require('../models/User');
const { getDKTPrediction } = require('../services/ai.service');
const { checkAndAwardBadges } = require('../services/badge.service');

const PASS_THRESHOLD = 85;
const LEVEL_THRESHOLDS = [0, 500, 1000, 2000, 3500, 5000];

const calculateLevel = (xp) => {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  return level;
};

const updateStreak = (user) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (!user.lastActiveDate) {
    user.streak = 1;
    user.lastActiveDate = now;
    return;
  }

  const last = new Date(user.lastActiveDate);
  const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
  const diffDays = Math.round((today - lastDay) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // already active today
  } else if (diffDays === 1) {
    user.streak += 1;
    user.lastActiveDate = now;
  } else {
    user.streak = 1;
    user.lastActiveDate = now;
  }
};

exports.getQuizByModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ message: 'Module not found' });

    const trail = await Trail.findById(module.trail);
    if (trail.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const quiz = await Quiz.findOne({ module: module._id });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found for this module' });

    const safeQuestions = quiz.questions.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
    }));

    res.status(200).json({ quizId: quiz._id, questions: safeQuestions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const module = await Module.findById(quiz.module);
    if (!module) return res.status(404).json({ message: 'Module not found' });

    const trail = await Trail.findById(module.trail).populate('topic');
    if (!trail) return res.status(404).json({ message: 'Trail not found' });

    if (trail.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const existingProgress = await Progress.findOne({ user: req.user._id, module: module._id });
    if (existingProgress?.completionStatus === 'completed') {
      return res.status(200).json({
        message: 'This module was already completed.',
        alreadyCompleted: true,
      });
    }

    let correctCount = 0;
    quiz.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correctCount++;
    });
    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= PASS_THRESHOLD;

    await QuizAttempt.create({
      user: req.user._id,
      module: module._id,
      quiz: quiz._id,
      score,
      passed,
    });

    await Progress.findOneAndUpdate(
      { user: req.user._id, module: module._id },
      { completionStatus: passed ? 'completed' : 'in_progress' }
    );

    await Progress.findOneAndUpdate(
      { user: req.user._id, module: module._id },
      { completionStatus: passed ? 'completed' : 'in_progress' }
    );

    // Check if this was the last concept — if so, mark the trail complete
    if (passed) {
      const totalConcepts = trail.topic.concepts.length;
      const completedModulesCount = await Progress.countDocuments({
        user: req.user._id,
        trail: trail._id,
        completionStatus: 'completed',
      });
      if (completedModulesCount >= totalConcepts && trail.status !== 'completed') {
        trail.status = 'completed';
        await trail.save();
      }
    }

    const mastery = await Mastery.findOne({
      user: req.user._id,
      topic: trail.topic._id,
      concept: module.concept,
    });

    if (!mastery) {
      return res.status(404).json({
        message: 'Mastery record not found for this module. Please regenerate the module and try again.',
      });
    }

    const priorScores = {
      beginner: mastery.beginner,
      intermediate: mastery.intermediate,
      advanced: mastery.advanced,
    };
    const dktResult = await getDKTPrediction(priorScores, module.difficulty, passed);

    mastery.beginner = dktResult.updated.beginner;
    mastery.intermediate = dktResult.updated.intermediate;
    mastery.advanced = dktResult.updated.advanced;
    mastery.currentDifficulty = dktResult.nextDifficulty;
    await mastery.save();

    const xpEarned = passed ? correctCount * 10 : 0;

    const user = await User.findById(req.user._id);
    user.xp += xpEarned;
    user.level = calculateLevel(user.xp);
    updateStreak(user);
    await user.save();

    // --- Badge check — runs after everything else has been saved ---
    const newBadges = await checkAndAwardBadges(req.user._id, {
      score,
      currentStreak: user.streak,
      moduleId: module._id,
    });

    res.status(200).json({
      score,
      passed,
      correctCount,
      totalQuestions: quiz.questions.length,
      xpEarned,
      newLevel: user.level,
      streak: user.streak,
      mastery: dktResult.updated,
      readyToAdvance: dktResult.readyToAdvanceConcept,
      newBadges, // array of newly earned badge definitions, empty if none
    });
  } catch (err) {
    console.error('Quiz submit failed:', err);
    res.status(500).json({ message: err.message });
  }
};