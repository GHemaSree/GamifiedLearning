const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Module = require('../models/Module');
const Trail = require('../models/Trail');
const Progress = require('../models/Progress');
const Mastery = require('../models/Mastery');
const User = require('../models/User');
const { getDKTPrediction } = require('../services/ai.service');
const { checkAndAwardBadges } = require('../services/badge.service');
const { getOrGenerateQuiz } = require('../services/quiz.service');
const { ParseError } = require('../services/ai/responseParser');
const { titleToSlug } = require('../utils/topicSlug');

const PASS_THRESHOLD = 80;
const LEVEL_THRESHOLDS = [0, 543, 1090, 2063, 3567, 5081];

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
    const moduleDoc = await Module.findById(req.params.id);
    if (!moduleDoc) return res.status(404).json({ message: 'Module not found' });

    const trail = await Trail.findById(moduleDoc.trail);
    if (!trail) return res.status(404).json({ message: 'Trail not found' });

    if (trail.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const studentId = req.user._id;
    console.log(`[quiz.controller] getQuizByModule — module=${req.params.id} student=${studentId}`);

    const quiz = await getOrGenerateQuiz(studentId, req.params.id);

    // Strip correctAnswer and explanation from the response — never expose to frontend during quiz
    const safeQuestions = quiz.questions.map((q) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
    }));

    res.status(200).json({ quizId: quiz._id, questions: safeQuestions });
  } catch (err) {
    console.error('[quiz.controller] getQuizByModule error:', err.message);

    if (err.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    if (err instanceof ParseError) {
      return res.status(422).json({
        success: false,
        message: 'LLM response could not be parsed as a valid quiz',
        error: err.message,
      });
    }
    res.status(502).json({
      success: false,
      message: 'Quiz generation failed. Please try again.',
      error: err.message,
    });
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
    const alreadyCompleted = existingProgress?.completionStatus === 'completed';

    let correctCount = 0;
    const questionBreakdown = quiz.questions.map((q, i) => {
      const isCorrect = answers[i] === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        question: q.question,
        options: q.options,
        userAnswer: answers[i] ?? null,    // index the student picked
        correctAnswer: q.correctAnswer,       // correct index
        explanation: q.explanation || '',
        isCorrect,
      };
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

    // On re-attempts of an already-completed module: skip all side-effects
    // (XP, mastery, progress, DKT, badges) but still return the score page.
    if (alreadyCompleted) {
      const mastery = await Mastery.findOne({
        user: req.user._id,
        topic: trail.topic._id,
        concept: module.concept,
      });
      return res.status(200).json({
        score,
        passed,
        correctCount,
        totalQuestions: quiz.questions.length,
        xpEarned: 0,
        newLevel: null,
        streak: null,
        mastery: mastery ? { beginner: mastery.beginner, intermediate: mastery.intermediate, advanced: mastery.advanced } : null,
        readyToAdvance: false,
        newBadges: [],
        questionBreakdown,
        alreadyCompleted: true,
      });
    }

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

    // Convert human-readable topic title → DKT snake_case slug
    const topicSlug = titleToSlug(trail.topic?.title || trail.topic?.toString());
    console.log(`[quiz.controller] DKT call → topic=${topicSlug} concept=${module.concept} difficulty=${module.difficulty} passed=${passed}`);

    // Extract array of 1s and 0s for each question
    const results = questionBreakdown.map(q => q.isCorrect ? 1 : 0);

    const dktResult = await getDKTPrediction({
      userId: req.user._id.toString(),
      topicSlug,
      concept: module.concept,
      difficulty: module.difficulty,
      results,
      priorMastery: priorScores,   // used only if ml-backend is unreachable
    });

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
      newBadges,
      questionBreakdown,   // per-question review — not stored, computed on submit

    });
  } catch (err) {
    console.error('Quiz submit failed:', err);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete cached quiz for a module so it re-generates using the
//          adaptive prompt (reads current mastery + weak concepts).
//          Called by the Score page "AI Revision Mode" button.
// @route   DELETE /modules/:id/quiz/cache   (registered in module.routes.js)
// @access  Private
exports.clearModuleQuiz = async (req, res) => {
  try {
    await Quiz.deleteMany({ module: req.params.id });
    return res.status(200).json({ cleared: true });
  } catch (err) {
    console.error('[quiz.controller] clearModuleQuiz error:', err.message);
    return res.status(500).json({ message: err.message });
  }
};
