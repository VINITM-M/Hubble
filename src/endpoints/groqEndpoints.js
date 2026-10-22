/**
 * endpoints/groqEndpoints.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized API endpoints, model identifiers, and URL configurations for Groq AI.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const GROQ_CONFIG = {
  BASE_URL: "https://api.groq.com/openai/v1",
  CHAT_COMPLETIONS: "https://api.groq.com/openai/v1/chat/completions",
  MODELS: {
    PRIMARY: "openai/gpt-oss-120b",
    FALLBACK: "openai/gpt-oss-20b",
    FAST: "openai/gpt-oss-20b",
  },
  DEFAULT_PARAMS: {
    temperature: 0.1,
    max_tokens: 400,
    top_p: 0.9,
  },
};

export function getAuthHeaders(apiKey) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
}
