// ─── LLM Configuration ──────────────────────────────────────────────
// Single source of truth for every LLM-related setting.
// All values come from environment variables — nothing is hardcoded.
// ─────────────────────────────────────────────────────────────────────

const llmConfig = {
  provider: process.env.LLM_PROVIDER || 'groq',
  model: process.env.LLM_MODEL || 'openai/gpt-oss-120b',

  groq: {
    apiKey: process.env.GROQ_API_KEY,
  },
};
console.log(llmConfig);
// ── Startup validation ──────────────────────────────────────────────
// Fail fast if the active provider's API key is missing.
// This avoids confusing runtime errors deep inside a request handler.
function validateLLMConfig() {
  if (llmConfig.provider === 'groq' && !llmConfig.groq.apiKey) {
    console.error(
      '[llm.config] GROQ_API_KEY is not set. ' +
      'Add it to your .env file before starting the server.'
    );
    process.exit(1);
  }
}

module.exports = { llmConfig, validateLLMConfig };
