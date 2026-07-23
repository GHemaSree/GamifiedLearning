// ─── Full Notes Prompt Templates ────────────────────────────────────
// Two prompt modes for generating comprehensive study notes:
//
//   1. Default   — no mastery data; produces detailed notes from scratch.
//   2. Adaptive  — mastery-aware; tailors depth and examples to the
//                  student's strengths and weaknesses.
//
// The output schema intentionally matches the Notes page frontend:
//   { title, sections: [{ heading, content }], gamifiedExamples }
//
// Placeholders: {{role}}, {{topic}}, {{concept}}, {{subject}},
//               {{difficulty}}, {{masterySnapshot}}, {{weakConcepts}},
//               {{outputFormat}}
// The PromptBuilder injects runtime values before sending to the LLM.
// ─────────────────────────────────────────────────────────────────────

/**
 * Default full-notes prompt — used when no prior mastery data exists.
 * Generates deep, comprehensive notes (NOT just an intro/objective)
 * with gamified examples to reinforce engagement.
 */
const getDefaultFullNotesPrompt = () => {
  return (
    'You are {{role}}. ' +
    'Generate comprehensive, in-depth study notes for the concept "{{concept}}" ' +
    'within the topic "{{topic}}" in the subject of {{subject}}. ' +
    'The target difficulty level is {{difficulty}}. ' +

    'IMPORTANT: These are FULL study notes — not a brief overview. ' +
    'Cover the concept thoroughly with clear explanations, real-world context, ' +
    'step-by-step breakdowns, and practical depth. ' +

    'Structure the notes into logical sections. Each section should have a ' +
    'descriptive heading and rich paragraph content that a student can study from independently. ' +

    'Include at least 5-7 well-organized sections covering: ' +
    '1) A compelling introduction that hooks the reader and explains why this concept matters, ' +
    '2) Core theory and fundamentals explained in depth, ' +
    '3) Detailed workings / how it operates under the hood, ' +
    '4) Practical usage patterns and best practices, ' +
    '5) Common pitfalls and how to avoid them, ' +
    '6) Connections to related concepts in {{topic}}, ' +
    '7) A concise recap that ties everything together. ' +

    'GAMIFIED EXAMPLES: For each major concept within the notes, embed at least one ' +
    'gamified example — use game-like scenarios, point systems, level-up analogies, ' +
    'quest/mission framing, or challenge-style problems to make examples fun and memorable. ' +
    'For instance, instead of "add 2 + 3", frame it as "You earn 2 XP from Quest A and 3 XP ' +
    'from Quest B — what is your total XP?". Weave these naturally into the section content. ' +

    'Provide the result as a JSON object with these exact keys: ' +
    '"title" (the concept name as a clear title), ' +
    '"sections" (an array of objects, each with "heading" (string) and "content" (string — ' +
    'a rich, detailed paragraph or multi-paragraph explanation with gamified examples embedded)), ' +
    '"gamifiedExamples" (an array of standalone gamified example strings that can be shown ' +
    'as bonus challenges — each framed as a mini-quest, puzzle, or point-scoring scenario). ' +

    'Keep the tone engaging, clear, and student-friendly. ' +
    'Return ONLY the JSON object — no extra text. ' +
    'Return the result as {{outputFormat}}.'
  );
};

/**
 * Adaptive full-notes prompt — used when mastery data is available.
 * Tailors the depth, examples, and reinforcement to the student's
 * current performance, spending more time on weak areas and
 * accelerating through strong ones.
 */
const getAdaptiveFullNotesPrompt = () => {
  return (
    'You are {{role}}. ' +
    'Generate comprehensive, personalised study notes for the concept "{{concept}}" ' +
    'within the topic "{{topic}}" in the subject of {{subject}}. ' +
    'The target difficulty level is {{difficulty}}. ' +

    'The student\'s current mastery snapshot is: {{masterySnapshot}}. ' +
    'The student\'s weak concepts that need reinforcement are: {{weakConcepts}}. ' +

    'Use this mastery information to adjust the depth and emphasis: ' +
    '- If the student is weak in prerequisite areas, include brief refresher sub-sections ' +
    '  before diving into new material. ' +
    '- If the student is strong, move faster through basics and include more advanced ' +
    '  examples, edge cases, and deeper analysis. ' +
    '- Emphasise weak concepts with additional explanations and extra gamified practice. ' +

    'IMPORTANT: These are FULL study notes — not a brief overview. ' +
    'Cover the concept thoroughly with clear explanations, real-world context, ' +
    'step-by-step breakdowns, and practical depth. ' +

    'Structure the notes into logical sections. Each section should have a ' +
    'descriptive heading and rich paragraph content that a student can study from independently. ' +

    'Include at least 5-7 well-organized sections covering: ' +
    '1) A compelling introduction that connects to the student\'s prior knowledge, ' +
    '2) Prerequisite refreshers (if needed based on weak concepts), ' +
    '3) Core theory and fundamentals, adapted to the student\'s level, ' +
    '4) Detailed workings / how it operates under the hood, ' +
    '5) Practical usage patterns and best practices, ' +
    '6) Common pitfalls tailored to the student\'s difficulty level, ' +
    '7) Advanced connections and extensions (if student mastery is high), ' +
    '8) A concise recap tying everything together. ' +

    'GAMIFIED EXAMPLES: For each major concept within the notes, embed at least one ' +
    'gamified example — use game-like scenarios, point systems, level-up analogies, ' +
    'quest/mission framing, or challenge-style problems to make examples fun and memorable. ' +
    'Adjust the difficulty of gamified examples to match the student\'s mastery level. ' +
    'For weaker areas, use simpler quests with hints; for stronger areas, use boss-level ' +
    'challenges that push the student. ' +

    'Provide the result as a JSON object with these exact keys: ' +
    '"title" (the concept name as a clear title), ' +
    '"sections" (an array of objects, each with "heading" (string) and "content" (string — ' +
    'a rich, detailed paragraph or multi-paragraph explanation with gamified examples embedded)), ' +
    '"gamifiedExamples" (an array of standalone gamified example strings that can be shown ' +
    'as bonus challenges — each framed as a mini-quest, puzzle, or point-scoring scenario, ' +
    'difficulty-matched to the student\'s mastery). ' +

    'Keep the tone engaging, clear, and student-friendly. ' +
    'Return ONLY the JSON object — no extra text. ' +
    'Return the result as {{outputFormat}}.'
  );
};

module.exports = { getDefaultFullNotesPrompt, getAdaptiveFullNotesPrompt };
