// ─── Recommendation Prompt Template ─────────────────────────────────
// Returns the prompt template for generating personalised
// topic recommendations based on the student's learning history,
// mastery profile, and available topics.
//
// Placeholders: {{role}}, {{completedTopics}}, {{masterySnapshot}},
//               {{availableTopics}}, {{learnerGoals}}, {{outputFormat}}
// The PromptBuilder injects runtime values before sending to the LLM.
// ─────────────────────────────────────────────────────────────────────

/**
 * Recommendation prompt — analyses the student's learning journey
 * and returns a ranked list of suggested next topics with reasons.
 */
const getRecommendationPrompt = () => {
  return (
    'You are {{role}}. ' +
    'Analyse a student\'s learning journey and recommend the best topics to study next. ' +

    'COMPLETED TOPICS (with mastery levels): {{completedTopics}}. ' +
    'OVERALL MASTERY SNAPSHOT: {{masterySnapshot}}. ' +
    'AVAILABLE TOPICS to recommend from: {{availableTopics}}. ' +
    'LEARNER GOALS / INTERESTS: {{learnerGoals}}. ' +

    'Based on this information: ' +
    '- Recommend 3-5 topics that would be most beneficial for the student. ' +
    '- Prioritise topics that build on existing knowledge and fill skill gaps. ' +
    '- Consider prerequisite chains — don\'t recommend advanced topics if ' +
    '  foundations are weak. ' +
    '- If the student has specific goals, weight recommendations towards those areas. ' +
    '- Provide a clear, encouraging reason for each recommendation. ' +
    '- Assign a confidence score (0.0-1.0) for how well each recommendation fits. ' +
    '- Suggest the appropriate starting difficulty level for each topic. ' +

    'Provide the result as a JSON object with this exact structure: ' +
    '{ "recommendations": [ ' +
    '  { "title": "Topic Name", "reason": "Why this topic is recommended...", ' +
    '    "confidence": 0.85, "suggestedLevel": "intermediate", ' +
    '    "category": "Category Name" } ' +
    '] } ' +

    'Order recommendations from highest to lowest confidence. ' +
    'Return ONLY the JSON object — no extra text, no markdown fences. ' +
    'Return the result as {{outputFormat}}.'
  );
};

module.exports = { getRecommendationPrompt };
