const Mastery      = require('../models/Mastery');
const QuizAttempt  = require('../models/QuizAttempt');
const Trail        = require('../models/Trail');
const Topic        = require('../models/Topic');

const { buildPrompt }                 = require('../services/ai/promptBuilder');
const { generateResponse }            = require('../services/ai/llm.service');
const { parseJSONObject, ParseError } = require('../services/ai/responseParser');

const REVISE_THRESHOLD  = 50; // mastery % below this → flagged for concept revision
const REVISIT_THRESHOLD = 65; // quiz % below this → flagged for module revisit

// ── Helpers ─────────────────────────────────────────────────────────

const _getConceptsToRevise = async (userId) => {
  const masteryRecords = await Mastery.find({ user: userId }).populate(
    'topic',
    'title icon'
  );

  return masteryRecords
    .map((m) => {
      const currentScore = m[m.currentDifficulty];
      return {
        concept: m.concept,
        topicTitle: m.topic?.title,
        topicIcon: m.topic?.icon,
        masteryPercent: Math.round(currentScore * 100),
      };
    })
    .filter((c) => c.masteryPercent < REVISE_THRESHOLD)
    .sort((a, b) => a.masteryPercent - b.masteryPercent);
};

const _getSuggestedRevision = async (userId) => {
  const attempts = await QuizAttempt.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate({
      path: 'module',
      select: 'title concept trail',
      populate: { path: 'trail', select: 'title' },
    });

  const latestPerModule = new Map();
  for (const attempt of attempts) {
    const moduleId = attempt.module?._id?.toString();
    if (moduleId && !latestPerModule.has(moduleId)) {
      latestPerModule.set(moduleId, attempt);
    }
  }

  return Array.from(latestPerModule.values())
    .filter((a) => a.score < REVISIT_THRESHOLD)
    .map((a) => ({
      moduleId: a.module._id,
      moduleTitle: a.module.title,
      trailTitle: a.module.trail?.title,
      lastScore: a.score,
    }));
};

/**
 * Generate AI-powered next-topic recommendations.
 * Uses the recommendation prompt with the student's learning context.
 */
const _getAIRecommendations = async (userId) => {
  try {
    const masteryRecords = await Mastery.find({ user: userId }).populate(
      'topic',
      'title'
    );

    const trails = await Trail.find({ user: userId }).populate('topic', 'title icon level');

    const completedTopics = trails
      .filter((t) => t.status === 'completed' || t.status === 'active')
      .map((t) => {
        const topicMastery = masteryRecords.filter(
          (m) => m.topic?._id?.toString() === t.topic?._id?.toString()
        );
        const avgMastery =
          topicMastery.length > 0
            ? Math.round(
                topicMastery.reduce((sum, m) => sum + m[m.currentDifficulty] * 100, 0) /
                  topicMastery.length
              )
            : 0;
        return `${t.topic?.title || t.title} (${avgMastery}% mastery, ${t.status})`;
      });

    const allTopics = await Topic.find({}, 'title level icon description');
    const trailTopicIds = trails.map((t) => t.topic?._id?.toString()).filter(Boolean);

    const availableTopics = allTopics
      .filter((t) => !trailTopicIds.includes(t._id.toString()))
      .map((t) => `${t.title} (${t.level})${t.description ? ': ' + t.description : ''}`);

    if (availableTopics.length === 0) {
      return [];
    }

    const snapshot = masteryRecords.map(
      (m) => `${m.concept}: ${Math.round(m[m.currentDifficulty] * 100)}%`
    );

    const prompt = buildPrompt('recommendation', {
      completedTopics:
        completedTopics.length > 0 ? completedTopics.join('; ') : 'none yet',
      masterySnapshot:
        snapshot.length > 0 ? snapshot.join('; ') : 'no mastery data available',
      availableTopics: availableTopics.join('; '),
    });

    const llmResult = await generateResponse(prompt);
    const parsed = parseJSONObject(llmResult.content);

    if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      return [];
    }

    return parsed.recommendations.map((rec) => {
      const matchingTopic = allTopics.find(
        (t) => t.title.toLowerCase() === rec.title.toLowerCase()
      );
      return {
        title: rec.title,
        icon: matchingTopic?.icon || '🚀',
        topicId: matchingTopic?._id || null,
        category: rec.category || 'General',
        level: rec.suggestedLevel || 'beginner',
        reason: rec.reason,
        confidence: rec.confidence,
      };
    });
  } catch (error) {
    // AI recommendations are best-effort — don't fail the whole request
    console.error('[recommendations.controller] AI recommendation error:', error.message);
    return [];
  }
};

// ── Controllers ─────────────────────────────────────────────────────

// @desc    Get personalized recommendations — concepts to revise, revision modules, AI suggestions
// @route   GET /recommendations
// @access  Private
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    const [conceptsToRevise, suggestedRevision, nextTopics] = await Promise.all([
      _getConceptsToRevise(userId),
      _getSuggestedRevision(userId),
      _getAIRecommendations(userId),
    ]);

    res.status(200).json({
      conceptsToRevise,
      suggestedRevision,
      nextTopics,
    });
  } catch (err) {
    console.error('[recommendations.controller] getRecommendations error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

// @desc    Force-refresh AI recommendations (re-runs LLM analysis)
// @route   POST /recommendations/refresh
// @access  Private
exports.refreshRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;

    const [conceptsToRevise, suggestedRevision, nextTopics] = await Promise.all([
      _getConceptsToRevise(userId),
      _getSuggestedRevision(userId),
      _getAIRecommendations(userId),
    ]);

    res.status(200).json({
      conceptsToRevise,
      suggestedRevision,
      nextTopics,
    });
  } catch (err) {
    console.error('[recommendations.controller] refreshRecommendations error:', err.message);
    res.status(500).json({ message: err.message });
  }
};