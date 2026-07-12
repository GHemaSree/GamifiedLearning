// MOCK VERSION — simulates Gemini + DKT. Swap internals once Sirivally's real service is live.
// DKT prediction is concept-agnostic: operates only on (difficulty, correct) history
// per concept, so new topics/concepts added later work without retraining.

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
    content: `Mock ${difficulty}-level detailed notes for ${concept} in ${topicTitle}. Includes a brief recap and basic example before going deeper, per design.`,
    summary: `A quick overview of ${concept}, covering the essentials needed to move forward in ${topicTitle}.`,
    duration: difficulty === 'beginner' ? 25 : difficulty === 'intermediate' ? 35 : 45,
  };
};

// priorMastery: { beginner, intermediate, advanced } for THIS concept only
const getDKTPrediction = async (priorMastery, difficulty, isCorrect) => {
  await new Promise((resolve) => setTimeout(resolve, 500));

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

module.exports = { generateModuleContent, getDKTPrediction };