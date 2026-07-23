// ─── Quiz Prompt Templates ──────────────────────────────────────────
// Two prompt modes for adaptive quiz question generation:
//
//   1. Default   — first quiz attempt; no mastery data exists yet.
//   2. Adaptive  — subsequent quizzes; mastery-aware personalisation
//                  emphasises weak areas and adjusts question difficulty.
//
// Output schema (enforced by both prompts):
//   { questions: [{ id, question, options[], correctAnswer, explanation, difficulty }] }
//
// Placeholders: {{role}}, {{topic}}, {{concept}}, {{subject}},
//               {{difficulty}}, {{questionCount}}, {{masterySnapshot}},
//               {{weakConcepts}}, {{outputFormat}}
// The PromptBuilder injects runtime values before sending to the LLM.
// ─────────────────────────────────────────────────────────────────────

/**
 * Default quiz prompt — used for the first quiz attempt when no prior
 * mastery exists. Generates a balanced set of MCQs without any
 * personalisation signals.
 */
const getDefaultQuizPrompt = () => {
  return (
    'You are {{role}}. ' +
    'Generate a quiz with exactly {{questionCount}} multiple-choice questions ' +
    'to test understanding of the concept "{{concept}}" ' +
    'within the topic "{{topic}}" in the subject of {{subject}}. ' +
    'The target difficulty level is {{difficulty}}. ' +

    'For each question: ' +
    '- Write a clear, unambiguous question stem. ' +
    '- Provide exactly 4 answer options. ' +
    '- Include plausible distractors that test genuine understanding, not trick wording. ' +
    '- Indicate the correct answer as a zero-based index (0-3). ' +
    '- Provide a brief explanation of WHY the correct answer is right. ' +
    '- Tag each question with a difficulty level (beginner, intermediate, or advanced). ' +

    'Mix difficulty levels proportionally: ' +
    '~40% at the target difficulty, ~30% one level below, ~30% one level above ' +
    '(clamp to beginner/advanced at the extremes). ' +

    'Provide the result as a JSON object with this exact structure: ' +
    '{ "questions": [ ' +
    '  { "id": "q1", "question": "...", "options": ["A","B","C","D"], ' +
    '    "correctAnswer": 0, "explanation": "...", "difficulty": "beginner" } ' +
    '] } ' +

    'Return ONLY the JSON object — no extra text, no markdown fences. ' +
    'Return the result as {{outputFormat}}.'
  );
};

/**
 * Adaptive quiz prompt — used from the second quiz onwards.
 * Includes the student's mastery snapshot and weak concepts so the
 * LLM can weight questions towards areas needing reinforcement.
 */
const getAdaptiveQuizPrompt = () => {
  return (
    'You are {{role}}. ' +
    'Generate a personalised quiz with exactly {{questionCount}} multiple-choice questions ' +
    'to test understanding of the concept "{{concept}}" ' +
    'within the topic "{{topic}}" in the subject of {{subject}}. ' +
    'The target difficulty level is {{difficulty}}. ' +

    'The student\'s current mastery snapshot is: {{masterySnapshot}}. ' +
    'The student\'s weak concepts that need reinforcement are: {{weakConcepts}}. ' +

    'Use this mastery information to adapt the quiz: ' +
    '- Allocate MORE questions to weak areas and concepts with low mastery scores. ' +
    '- For weak concepts, include questions that test foundational understanding. ' +
    '- For strong concepts, include questions that push to the next difficulty level. ' +
    '- If the student struggles at the current difficulty, include some easier warm-up questions. ' +
    '- If the student excels, include challenging edge-case questions. ' +

    'For each question: ' +
    '- Write a clear, unambiguous question stem. ' +
    '- Provide exactly 4 answer options. ' +
    '- Include plausible distractors that test genuine understanding, not trick wording. ' +
    '- Indicate the correct answer as a zero-based index (0-3). ' +
    '- Provide a brief explanation of WHY the correct answer is right. ' +
    '- Tag each question with a difficulty level (beginner, intermediate, or advanced). ' +

    'Provide the result as a JSON object with this exact structure: ' +
    '{ "questions": [ ' +
    '  { "id": "q1", "question": "...", "options": ["A","B","C","D"], ' +
    '    "correctAnswer": 0, "explanation": "...", "difficulty": "beginner" } ' +
    '] } ' +

    'Return ONLY the JSON object — no extra text, no markdown fences. ' +
    'Return the result as {{outputFormat}}.'
  );
};

module.exports = { getDefaultQuizPrompt, getAdaptiveQuizPrompt };
