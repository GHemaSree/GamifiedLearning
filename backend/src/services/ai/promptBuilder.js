// ─── Prompt Builder ─────────────────────────────────────────────────
// Accepts runtime parameters, selects the correct prompt template,
// injects values into {{placeholders}}, and returns the final string.
//
// This file does NOT call the LLM.
// This file does NOT parse LLM responses.
// Its only job is:  (template + params) → ready-to-send prompt string.
// ─────────────────────────────────────────────────────────────────────

const { getModulePrompt }   = require('../../prompts/module.prompt');
const { getRevisionPrompt } = require('../../prompts/revision.prompt');
const {
  getDefaultModuleContentPrompt,
  getAdaptiveModuleContentPrompt,
} = require('../../prompts/moduleContent.prompt');
const {
  getDefaultFullNotesPrompt,
  getAdaptiveFullNotesPrompt,
} = require('../../prompts/fullNotes.prompt');
const {
  getDefaultQuizPrompt,
  getAdaptiveQuizPrompt,
} = require('../../prompts/quiz.prompt');
const { getRecommendationPrompt } = require('../../prompts/recommendation.prompt');

// ── Template registry ───────────────────────────────────────────────
// Maps a prompt type string to its template getter function.
// Adding a new prompt type = add one entry here + one template file.
const TEMPLATES = {
  module:                getModulePrompt,
  revision:              getRevisionPrompt,
  moduleContentDefault:  getDefaultModuleContentPrompt,
  moduleContentAdaptive: getAdaptiveModuleContentPrompt,
  fullNotesDefault:      getDefaultFullNotesPrompt,
  fullNotesAdaptive:     getAdaptiveFullNotesPrompt,
  quizDefault:           getDefaultQuizPrompt,
  quizAdaptive:          getAdaptiveQuizPrompt,
  recommendation:        getRecommendationPrompt,
};

// ── Default values ──────────────────────────────────────────────────
// Applied when the caller omits a parameter, so every {{placeholder}}
// is always replaced — no raw `{{topic}}` leaks into the LLM call.
const DEFAULTS = {
  role:               'an expert educator',
  topic:              'general knowledge',
  concept:            'general concept',
  subject:            'general',
  difficulty:         'intermediate',
  mastery:            'beginner',
  learningObjectives: 'understand the core concepts',
  subtopics:          'all key areas',
  masterySnapshot:    'no mastery data available',
  weakConcepts:       'none identified',
  outputFormat:       'a JSON object',
  questionCount:      '5',
  completedTopics:    'none yet',
  availableTopics:    'all topics',
  learnerGoals:       'no specific goals set',
};

// ── Core interpolation ──────────────────────────────────────────────
// Replaces every `{{key}}` in the template with the matching value
// from the merged (defaults + caller params) object.

/**
 * @param {string} template   – A string containing {{placeholders}}
 * @param {object} values     – Key-value pairs to inject
 * @returns {string}          – The final prompt string, ready for the LLM
 */
const _interpolate = (template, values) => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return values[key] !== undefined ? values[key] : match;
  });
};

// ── Public API ──────────────────────────────────────────────────────

/**
 * Build a complete, ready-to-send prompt string.
 *
 * @param {string} type                   – One of: 'trail', 'module', 'quiz', 'revision'
 * @param {object} [params]               – Runtime values to inject
 * @param {string} [params.role]          – LLM persona (e.g. "a senior Java instructor")
 * @param {string} [params.topic]         – The specific topic (e.g. "Variables in Java")
 * @param {string} [params.subject]       – Broader subject (e.g. "Java Programming")
 * @param {string} [params.difficulty]    – beginner | intermediate | advanced
 * @param {string} [params.mastery]       – Learner's current mastery level
 * @param {string} [params.learningObjectives] – Comma-separated objectives
 * @param {string} [params.subtopics]     – Comma-separated subtopics to focus on
 * @param {string} [params.outputFormat]  – Expected response format
 * @returns {string}                      – The final interpolated prompt
 * @throws {Error}                        – If the prompt type is unknown
 */
const buildPrompt = (type, params = {}) => {
  const templateFn = TEMPLATES[type];

  if (!templateFn) {
    throw new Error(
      `Unknown prompt type: "${type}". ` +
      `Valid types: ${Object.keys(TEMPLATES).join(', ')}`
    );
  }

  const template = templateFn();
  const values   = { ...DEFAULTS, ...params };

  return _interpolate(template, values);
};

module.exports = { buildPrompt };
