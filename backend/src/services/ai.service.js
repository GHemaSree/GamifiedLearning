// ─────────────────────────────────────────────────────────────────────────────
// ai.service.js
//
// getDKTPrediction — calls the Python ml-backend (FastAPI) to run real DKT
// inference after every quiz submission.
//
// Falls back to the previous mock arithmetic if the ml-backend is unreachable,
// so the quiz flow is never blocked by the ML service being down.
// ─────────────────────────────────────────────────────────────────────────────

const ML_BACKEND_URL = process.env.ML_BACKEND_URL || 'http://localhost:8000';

// ── Mock fallback (original arithmetic — used only when ml-backend is down) ──

const _mockDKTPrediction = (priorMastery, difficulty, isCorrect) => {
  const updated = { ...priorMastery };
  const delta = isCorrect ? 0.13 : -0.12;
  updated[difficulty] = Math.min(0.99, Math.max(0.05, updated[difficulty] + delta));

  let nextDifficulty = difficulty;
  if (isCorrect && updated[difficulty] >= 0.75) {
    if (difficulty === 'beginner') nextDifficulty = 'intermediate';
    else if (difficulty === 'intermediate') nextDifficulty = 'advanced';
  } else if (!isCorrect && updated[difficulty] < 0.4) {
    if (difficulty === 'advanced') nextDifficulty = 'intermediate';
    else if (difficulty === 'intermediate') nextDifficulty = 'beginner';
  }

  const readyToAdvanceConcept = updated[difficulty] >= 0.7 && difficulty !== 'beginner';
  return { updated, nextDifficulty, readyToAdvanceConcept };
};


// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Compute DKT mastery scores for a quiz submission.
 *
 * Calls POST http://<ML_BACKEND_URL>/quiz/submit and returns a normalised
 * result that quiz.controller.js can use directly.
 *
 * @param {object} params
 * @param {string} params.userId      - MongoDB user ObjectId string
 * @param {string} params.topicSlug   - DKT topic key  (e.g. "python_fundamentals")
 * @param {string} params.concept     - Concept name   (e.g. "loops")
 * @param {string} params.difficulty  - "beginner" | "intermediate" | "advanced"
 * @param {boolean} params.isCorrect  - Whether the student passed the quiz
 * @param {object} params.priorMastery - { beginner, intermediate, advanced } — used
 *                                       for the mock fallback only
 * @returns {Promise<{ updated, nextDifficulty, readyToAdvanceConcept }>}
 */
const getDKTPrediction = async ({
  userId,
  topicSlug,
  concept,
  difficulty,
  isCorrect,
  priorMastery,
}) => {
  try {
    const response = await fetch(`${ML_BACKEND_URL}/quiz/submit`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id:    userId,
        topic:      topicSlug,
        concept,
        difficulty,
        correct:    isCorrect ? 1 : 0,
      }),
      signal: AbortSignal.timeout(10_000),  // 10-second timeout
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`ml-backend returned ${response.status}: ${detail}`);
    }

    const data = await response.json();
    // data = { xp_earned, next_level, concept_complete, mastery, full_mastery }

    return {
      updated:                data.mastery,          // { beginner, intermediate, advanced }
      nextDifficulty:         data.next_level,
      readyToAdvanceConcept:  data.concept_complete,
      fullMastery:            data.full_mastery,     // all concepts — available for future use
    };

  } catch (err) {
    // ── Graceful fallback ────────────────────────────────────────────────────
    console.warn(
      `[ai.service] ml-backend unreachable (${err.message}). ` +
      'Falling back to mock DKT arithmetic.'
    );
    return _mockDKTPrediction(priorMastery, difficulty, isCorrect);
  }
};


// ── Legacy stubs (kept so nothing else breaks) ────────────────────────────────

const generateModuleContent = async (topicTitle, concept, difficulty) => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return {
    concept,
    difficulty,
    title: `${concept}`,
    objective: `Understand the fundamentals of ${concept} at a ${difficulty} level.`,
    keyPoints: [
      `Core definition of ${concept}`,
      `Why ${concept} matters in ${topicTitle}`,
      `Common syntax/usage patterns`,
      `Typical mistakes to avoid`,
      `How ${concept} connects to related concepts`,
    ],
    sections: [
      { heading: `What is ${concept}?`,      content: `Explanation of ${concept} at ${difficulty} depth.` },
      { heading: `Why ${concept} matters`,   content: `Why ${concept} is important in ${topicTitle}.` },
      { heading: `Working with ${concept}`,  content: `Detailed walkthrough of using ${concept}.` },
    ],
    content:  `${difficulty}-level detailed notes for ${concept} in ${topicTitle}.`,
    summary:  `A quick overview of ${concept}, covering the essentials needed to move forward in ${topicTitle}.`,
    duration: difficulty === 'beginner' ? 25 : difficulty === 'intermediate' ? 35 : 45,
  };
};

const generateQuiz = async (topicTitle, concept, difficulty) => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return Array.from({ length: 5 }, (_, i) => ({
    question:      `Mock ${difficulty} question ${i + 1} about ${concept} in ${topicTitle}?`,
    options:       ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 0,
  }));
};

module.exports = { generateModuleContent, getDKTPrediction, generateQuiz };