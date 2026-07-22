const Badge = require('../models/Badge');
const Progress = require('../models/Progress');
const QuizAttempt = require('../models/QuizAttempt');
const Trail = require('../models/Trail');

const BADGE_DEFINITIONS = {
  first_step: { label: 'First Step', icon: '⭐', description: 'Completed your first module' },
  seven_day_streak: { label: '7 Day Streak', icon: '🔥', description: 'Maintained a 7-day streak' },
  goal_crusher: { label: 'Goal Crusher', icon: '🎯', description: 'Scored 100% on a quiz' },
  trail_blazer: { label: 'Trail Blazer', icon: '🏆', description: 'Completed your first trail' },
  knowledge_seeker: { label: 'Knowledge Seeker', icon: '🧠', description: 'Took 5 quizzes' },
  speed_learner: { label: 'Speed Learner', icon: '🚀', description: 'Completed 3 modules in one day' },
};

const awardBadge = async (userId, key) => {
  try {
    const def = BADGE_DEFINITIONS[key];
    await Badge.create({ user: userId, key, ...def });
    return true; // newly earned
  } catch (err) {
    if (err.code === 11000) return false; // already earned, not an error
    throw err;
  }
};

// Call this after every quiz submission — checks all badge conditions that could
// plausibly have just become true, and awards any newly earned ones.
const checkAndAwardBadges = async (userId, { score, currentStreak, moduleId }) => {
  const newlyEarned = [];

  // First Step — completed at least 1 module
  const completedCount = await Progress.countDocuments({ user: userId, completionStatus: 'completed' });
  if (completedCount >= 1 && (await awardBadge(userId, 'first_step'))) {
    newlyEarned.push(BADGE_DEFINITIONS.first_step);
  }

  // 7 Day Streak
  if (currentStreak >= 7 && (await awardBadge(userId, 'seven_day_streak'))) {
    newlyEarned.push(BADGE_DEFINITIONS.seven_day_streak);
  }

  // Goal Crusher — 100% on this quiz
  if (score === 100 && (await awardBadge(userId, 'goal_crusher'))) {
    newlyEarned.push(BADGE_DEFINITIONS.goal_crusher);
  }

  // Trail Blazer — completed a full trail
  const completedTrails = await Trail.countDocuments({ user: userId, status: 'completed' });
  if (completedTrails >= 1 && (await awardBadge(userId, 'trail_blazer'))) {
    newlyEarned.push(BADGE_DEFINITIONS.trail_blazer);
  }

  // Knowledge Seeker — 5 quizzes taken
  const attemptCount = await QuizAttempt.countDocuments({ user: userId });
  if (attemptCount >= 5 && (await awardBadge(userId, 'knowledge_seeker'))) {
    newlyEarned.push(BADGE_DEFINITIONS.knowledge_seeker);
  }

  // Speed Learner — 3 modules completed today
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const completedToday = await Progress.countDocuments({
    user: userId,
    completionStatus: 'completed',
    updatedAt: { $gte: startOfToday },
  });
  if (completedToday >= 3 && (await awardBadge(userId, 'speed_learner'))) {
    newlyEarned.push(BADGE_DEFINITIONS.speed_learner);
  }

  return newlyEarned;
};

module.exports = { checkAndAwardBadges, BADGE_DEFINITIONS };