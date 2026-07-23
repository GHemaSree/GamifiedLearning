// ─── LLM Service ────────────────────────────────────────────────────
// Provider-agnostic service layer.  Controllers call *this* file,
// never a provider directly.  The active provider is selected from
// llmConfig.provider so adding a new one is just a new case + file.
// ─────────────────────────────────────────────────────────────────────

const { llmConfig } = require('../../config/llm.config');
const groqProvider  = require('./providers/groq.provider');

/**
 * Return the provider module that matches the current LLM_PROVIDER.
 * Throws if the provider string is unrecognised.
 */
const _getProvider = () => {
  switch (llmConfig.provider) {
    case 'groq':
      return groqProvider;

    // Future providers go here:
    // case 'openai':    return require('./providers/openai.provider');
    // case 'anthropic': return require('./providers/anthropic.provider');

    default:
      throw new Error(`Unsupported LLM provider: "${llmConfig.provider}"`);
  }
};

/**
 * Send a prompt to the active LLM and return the assistant's reply text.
 *
 * @param {string} prompt            – The user-facing prompt string
 * @param {object} [options]         – Forwarded to the provider (model, temperature, …)
 * @returns {Promise<{content: string, model: string, provider: string, usage: object}>}
 */
const generateResponse = async (prompt, options = {}) => {
  const provider = _getProvider();

  const messages = [{ role: 'user', content: prompt }];

  const response = await provider.chatCompletion(messages, options);

  const choice = response.choices?.[0];

  return {
    content:  choice?.message?.content ?? '',
    model:    response.model,
    provider: llmConfig.provider,
    usage:    response.usage ?? null,
  };
};

module.exports = { generateResponse };
