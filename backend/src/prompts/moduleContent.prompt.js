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
    'Your response must be a SINGLE JSON object matching this exact shape — ' +
    'do NOT wrap it in an array: ' +
    '{"introduction": "<brief engaging intro>", ' +
    '"objective": "<learning objective>", ' +
    '"content": "<detailed lesson body>", ' +
    '"keyPoints": ["<takeaway 1>", "<takeaway 2>"], ' +
    '"examples": ["<example 1>", "<example 2>"], ' +
    '"summary": "<concise summary>"}. ' +
    'Keep the tone engaging, clear, and accessible. ' +
    'Return ONLY the raw JSON object — no markdown, no prose, no code fences, no extra text.'
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
    'Your response must be a SINGLE JSON object matching this exact shape — ' +
    'do NOT wrap it in an array: ' +
    '{"introduction": "<brief engaging intro connecting to prior knowledge>", ' +
    '"objective": "<learning objective>", ' +
    '"content": "<detailed lesson body adapted to the student level>", ' +
    '"keyPoints": ["<takeaway 1>", "<takeaway 2>"], ' +
    '"examples": ["<example 1>", "<example 2>"], ' +
    '"summary": "<concise summary>"}. ' +
    'Keep the tone engaging, clear, and accessible. ' +
    'Return ONLY the raw JSON object — no markdown, no prose, no code fences, no extra text.'
  );
};

module.exports = { getDefaultModuleContentPrompt, getAdaptiveModuleContentPrompt };
