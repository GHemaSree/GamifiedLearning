// ─── Revision Prompt Template ───────────────────────────────────────
// Returns the prompt template for generating revision / recap
// material (summaries, flashcards, misconceptions).
//
// Placeholders: {{role}}, {{topic}}, {{subject}}, {{mastery}},
//               {{subtopics}}, {{outputFormat}}
// The PromptBuilder injects runtime values before sending to the LLM.
// ─────────────────────────────────────────────────────────────────────

const getRevisionPrompt = () => {
  return (
    'You are {{role}}. ' +
    'Generate concise revision material for the topic: "{{topic}}" ' +
    'within the subject of {{subject}}. ' +
    'The learner\'s current mastery level is {{mastery}}. ' +
    'Focus on these subtopics: {{subtopics}}. ' +
    'Include a summary of key concepts, a set of flashcard-style Q&A pairs, ' +
    'and a list of common misconceptions to watch out for. ' +
    'Return the result as {{outputFormat}}.'
  );
};

module.exports = { getRevisionPrompt };
