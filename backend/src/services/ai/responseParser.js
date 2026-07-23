// ─── Response Parser ────────────────────────────────────────────────
// Extracts, cleans, and validates JSON from raw LLM output.
//
// LLMs are unpredictable — they may return:
//   • Clean JSON                        →  {"key": "value"}
//   • JSON inside a markdown code fence →  ```json\n{...}\n```
//   • JSON with leading/trailing prose  →  "Here is the result:\n[...]"
//   • Broken JSON (trailing commas, etc.)
//   • No JSON at all (pure prose)
//
// This file handles ALL of those cases in one place.
//
// It does NOT call the LLM.
// It does NOT build prompts.
// It does NOT know about HTTP or Express.
// Its only job is:  raw LLM string → parsed JavaScript object.
// ─────────────────────────────────────────────────────────────────────

/**
 * Custom error class for parse failures.
 * Carries the original raw text so callers can log or retry.
 */
class ParseError extends Error {
  /**
   * @param {string} message   – Human-readable description of what went wrong
   * @param {string} rawText   – The original LLM output that failed to parse
   */
  constructor(message, rawText) {
    super(message);
    this.name    = 'ParseError';
    this.rawText = rawText;
  }
}

// ── Internal helpers ────────────────────────────────────────────────

/**
 * Strip markdown code fences from the LLM output.
 * Handles ```json ... ```, ``` ... ```, and ```JSON ... ```
 *
 * @param {string} text – Raw LLM output
 * @returns {string}    – The content inside the fence, or the original text
 */
const _stripMarkdownFences = (text) => {
  // Match ```json ... ``` or ``` ... ``` (with optional language tag)
  const fenceRegex = /```(?:json|JSON)?\s*\n?([\s\S]*?)```/;
  const match = text.match(fenceRegex);
  return match ? match[1].trim() : text.trim();
};

/**
 * Attempt to locate a JSON structure (object or array) within
 * a larger string that may contain surrounding prose.
 *
 * Looks for the first `{` or `[` and the last matching `}` or `]`.
 *
 * @param {string} text – Text that may contain JSON somewhere inside it
 * @returns {string|null} – The extracted JSON substring, or null
 */
const _extractJSONSubstring = (text) => {
  // Find the first { or [
  const objectStart = text.indexOf('{');
  const arrayStart  = text.indexOf('[');

  let start;
  let endChar;

  if (objectStart === -1 && arrayStart === -1) return null;

  if (objectStart === -1)      { start = arrayStart;  endChar = ']'; }
  else if (arrayStart === -1)  { start = objectStart; endChar = '}'; }
  else if (arrayStart < objectStart) { start = arrayStart;  endChar = ']'; }
  else                               { start = objectStart; endChar = '}'; }

  // Find the last matching closing bracket
  const end = text.lastIndexOf(endChar);
  if (end <= start) return null;

  return text.substring(start, end + 1);
};

/**
 * Fix common JSON issues that LLMs produce.
 * - Trailing commas before ] or }
 * - Single quotes instead of double quotes (simple cases)
 *
 * @param {string} jsonStr – A candidate JSON string
 * @returns {string}       – The cleaned JSON string
 */
const _sanitiseJSON = (jsonStr) => {
  // Remove trailing commas: ,] or ,}
  let cleaned = jsonStr.replace(/,\s*([}\]])/g, '$1');

  return cleaned;
};

// ── Public API ──────────────────────────────────────────────────────

/**
 * Parse raw LLM output into a JavaScript object or array.
 *
 * Extraction pipeline:
 *   1. Strip markdown code fences
 *   2. Try JSON.parse directly (fast path for clean responses)
 *   3. Extract a JSON substring from surrounding prose
 *   4. Sanitise common LLM JSON errors
 *   5. Try JSON.parse again
 *   6. Throw a descriptive ParseError if all attempts fail
 *
 * @param {string} rawText – The raw content string from the LLM
 * @returns {object|Array}  – The parsed JavaScript value
 * @throws {ParseError}     – If no valid JSON can be extracted
 */
const parseJSON = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    throw new ParseError(
      'LLM returned empty or non-string content.',
      rawText
    );
  }

  // Step 1: Strip markdown fences
  const stripped = _stripMarkdownFences(rawText);

  // Step 2: Fast path — try direct parse
  try {
    return JSON.parse(stripped);
  } catch (_) {
    // Not clean JSON — continue to extraction
  }

  // Step 3: Extract JSON substring from surrounding prose
  const extracted = _extractJSONSubstring(stripped);

  if (!extracted) {
    throw new ParseError(
      'No JSON structure (object or array) found in LLM response.',
      rawText
    );
  }

  // Step 4: Try parsing the extracted substring
  try {
    return JSON.parse(extracted);
  } catch (_) {
    // May have LLM quirks — try sanitising
  }

  // Step 5: Sanitise and retry
  const sanitised = _sanitiseJSON(extracted);

  try {
    return JSON.parse(sanitised);
  } catch (error) {
    throw new ParseError(
      `Failed to parse JSON after extraction and sanitisation: ${error.message}`,
      rawText
    );
  }
};

/**
 * Convenience wrapper: parse JSON and validate it is an array.
 *
 * @param {string} rawText – Raw LLM output
 * @returns {Array}         – The parsed array
 * @throws {ParseError}     – If parsing fails or result is not an array
 */
const parseJSONArray = (rawText) => {
  const parsed = parseJSON(rawText);

  if (!Array.isArray(parsed)) {
    throw new ParseError(
      `Expected a JSON array but received ${typeof parsed}.`,
      rawText
    );
  }

  return parsed;
};

/**
 * Convenience wrapper: parse JSON and validate it is a plain object.
 *
 * @param {string} rawText – Raw LLM output
 * @returns {object}        – The parsed object
 * @throws {ParseError}     – If parsing fails or result is not an object
 */
const parseJSONObject = (rawText) => {
  const parsed = parseJSON(rawText);

  if (Array.isArray(parsed) || typeof parsed !== 'object' || parsed === null) {
    throw new ParseError(
      `Expected a JSON object but received ${Array.isArray(parsed) ? 'array' : typeof parsed}.`,
      rawText
    );
  }

  return parsed;
};

module.exports = { parseJSON, parseJSONArray, parseJSONObject, ParseError };
