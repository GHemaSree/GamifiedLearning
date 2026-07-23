// ─── Module Content Prompt Templates ────────────────────────────────
// Two prompt modes for adaptive module content generation:
//
//   1. Default   — first subtopic; no mastery data exists yet.
//   2. Adaptive  — subsequent subtopics; mastery-aware personalisation.
//
// Placeholders: {{role}}, {{topic}}, {{concept}}, {{subject}},
//               {{difficulty}}, {{masterySnapshot}}, {{weakConcepts}},
//               {{outputFormat}}
// The PromptBuilder injects runtime values before sending to the LLM.
// ─────────────────────────────────────────────────────────────────────

/**
 * Default prompt — used for the first subtopic when no prior
 * mastery exists. Generates foundational content without any
 * personalisation signals.
 */
const getDefaultModuleContentPrompt = () => {
  return (
    'You are {{role}}. ' +
    'Generate detailed learning content for the concept "{{concept}}" ' +
    'within the topic "{{topic}}" in the subject of {{subject}}. ' +
    'The target difficulty level is {{difficulty}}. ' +
    'Provide the content as a JSON object with these exact keys: ' +
    '"introduction" (a brief engaging introduction), ' +
    '"objective" (the learning objective for this module), ' +
    '"content" (the main detailed lesson body with clear explanations), ' +
    '"keyPoints" (an array of key takeaway strings), ' +
    '"examples" (an array of practical example strings), ' +
    '"summary" (a concise summary paragraph). ' +
    'Keep the tone engaging, clear, and accessible. ' +
    'Return ONLY the JSON object — no extra text. ' +
    'Return the result as {{outputFormat}}.'
  );
};

/**
 * Adaptive prompt — used from the second subtopic onwards.
 * Includes the student's mastery snapshot and weak concepts so the
 * LLM can tailor depth, emphasis, and examples accordingly.
 */
const getAdaptiveModuleContentPrompt = () => {
  return (
    'You are {{role}}. ' +
    'Generate personalised learning content for the concept "{{concept}}" ' +
    'within the topic "{{topic}}" in the subject of {{subject}}. ' +
    'The target difficulty level is {{difficulty}}. ' +
    'The student\'s current mastery snapshot is: {{masterySnapshot}}. ' +
    'The student\'s weak concepts that need reinforcement are: {{weakConcepts}}. ' +
    'Use this mastery information to adjust the depth and emphasis of explanations. ' +
    'If the student is weak in prerequisite areas, include brief refreshers. ' +
    'If the student is strong, move faster and include more advanced examples. ' +
    'Provide the content as a JSON object with these exact keys: ' +
    '"introduction" (a brief engaging introduction that connects to prior knowledge), ' +
    '"objective" (the learning objective for this module), ' +
    '"content" (the main detailed lesson body, adapted to the student\'s level), ' +
    '"keyPoints" (an array of key takeaway strings), ' +
    '"examples" (an array of practical example strings tailored to the student\'s level), ' +
    '"summary" (a concise summary paragraph). ' +
    'Keep the tone engaging, clear, and accessible. ' +
    'Return ONLY the JSON object — no extra text. ' +
    'Return the result as {{outputFormat}}.'
  );
};

module.exports = { getDefaultModuleContentPrompt, getAdaptiveModuleContentPrompt };
