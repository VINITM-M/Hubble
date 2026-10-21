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
    PRIMARY: "llama-3.3-70b-versatile",
    FALLBACK: "llama-3.1-8b-instant",
    FAST: "llama-3.1-8b-instant",
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
