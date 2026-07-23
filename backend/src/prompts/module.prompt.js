// ─── Module Prompt Template ─────────────────────────────────────────
// Returns the prompt template for generating the content of a
// single learning module (lesson body, examples, key takeaways).
//
// Placeholders: {{role}}, {{topic}}, {{subject}}, {{difficulty}},
//               {{learningObjectives}}, {{outputFormat}}
// The PromptBuilder injects runtime values before sending to the LLM.
// ─────────────────────────────────────────────────────────────────────

const getModulePrompt = () => {
  return (
    'You are {{role}}. ' +
    'Generate detailed learning content for the module: "{{topic}}" ' +
    'within the subject of {{subject}}. ' +
    'The target difficulty level is {{difficulty}}. ' +
    'The learning objectives are: {{learningObjectives}}. ' +
    'Include an introduction, core concepts explained clearly, ' +
    'practical examples, and key takeaways. ' +
    'Keep the tone engaging and accessible. ' +
    'Return the result as {{outputFormat}}.'
  );
};

module.exports = { getModulePrompt };
