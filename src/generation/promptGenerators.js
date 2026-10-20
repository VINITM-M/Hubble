/**
 * generation/promptGenerators.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Generation tasks & prompt synthesis module.
 * Constructs task-specific instructions, reasoning chains, and prompt payloads.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Builds the semantic catalog context string for agent discovery.
 */
export function buildAgentCatalogContext(agentsList = []) {
  return agentsList
    .map(
      (a) =>
        `• ID: ${a.id} | Name: "${a.name}" | Dept: ${a.department || "General"} | Category: ${a.category}\n` +
        `  Desc: ${a.description}\n` +
        `  Capabilities: ${(a.capabilities || []).join(", ")}`
    )
    .join("\n\n");
}

/**
 * Generates the semantic routing prompt payload for user agent discovery.
 */
export function generateAgentRoutingPrompt(userQuery, agentsList = []) {
  const catalog = buildAgentCatalogContext(agentsList);

  return [
    {
      role: "system",
      content: `You are HubblePilot.AI's intelligent agent routing engine.
Analyze the user's natural language request, task, or prompt.
Examine each available agent's name, category, description, and capabilities.

Available Agents:
${catalog}

Return a valid JSON object strictly matching this format:
{
  "matchedIds": ["agent-id-1", "agent-id-2"],
  "reason": "Clear 1-sentence explanation of why these agents were selected."
}
If no agent is relevant, return: {"matchedIds": [], "reason": "No agent directly matches your query."}`,
    },
    {
      role: "user",
      content: userQuery,
    },
  ];
}

/**
 * Generates the analytics query prompt for token/usage tracking analysis.
 */
export function generateTrackerAnalyticsPrompt(userQuery, usageContext = {}) {
  return [
    {
      role: "system",
      content: `You are Hubble AI Tracker Assistant, an expert analytics AI specializing in enterprise LLM cost, token utilization, and agent efficiency monitoring.
Current context: ${JSON.stringify(usageContext, null, 2)}
Provide concise, metric-grounded responses.`,
    },
    {
      role: "user",
      content: userQuery,
    },
  ];
}
