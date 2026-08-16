// ─── Groq Provider ──────────────────────────────────────────────────
// Wraps the official groq-sdk so the rest of the app never imports it
// directly.  Adding a second provider (OpenAI, Anthropic, etc.) only
// requires creating a sibling file with the same interface.
// ─────────────────────────────────────────────────────────────────────

const Groq = require('groq-sdk');
const { llmConfig } = require('../../../config/llm.config');

// Initialise the client once — reused across all requests.
const client = new Groq({ apiKey: llmConfig.groq.apiKey });

/**
 * Send a chat-completion request to Groq.
 *
 * @param {Array<{role: string, content: string}>} messages  – OpenAI-compatible messages array
 * @param {object} [options]                                 – Optional overrides
 * @param {string} [options.model]                           – Override the default model
 * @param {number} [options.temperature]                     – Sampling temperature (0-2)
 * @param {number} [options.maxTokens]                       – Max tokens in the response
 * @returns {Promise<object>}  Raw Groq API response
 */
const chatCompletion = async (messages, options = {}) => {
  const requestParams = {
    messages,
    model:       options.model       || llmConfig.model,
    temperature: options.temperature ?? 0.7,
    max_tokens:  options.maxTokens   ?? 2000,
  };

  // Force JSON-only output when the caller expects structured data.
  // Skipped for free-text prompts by passing options.jsonMode = false.
  if (options.jsonMode !== false) {
    requestParams.response_format = { type: 'json_object' };
  }

  const response = await client.chat.completions.create(requestParams);

  return response;
};

module.exports = { chatCompletion };
