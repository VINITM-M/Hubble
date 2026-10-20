/**
 * services/groqService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Groq AI integration layer — all Groq API calls live here.
 *
 * Functions:
 *  searchAgentsWithAI(prompt, agents)           → semantic agent search
 *  askChatbot(msg, history, agents)             → main agent advisor chatbot
 *  askTrackerChatbot(msg, history, context)     → LLM token tracker chatbot
 *  askUsagePageChatbot(msg, history, context)   → usage detail page chatbot
 *
 * Configuration:
 *  VITE_GROQ_API_KEY – set in .env.local (never commit the raw key)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { GROQ_CONFIG, getAuthHeaders } from "../endpoints/groqEndpoints.js";

// ── API config ────────────────────────────────────────────────────────────────
const GROQ_API_KEY =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_GROQ_API_KEY) ||
  ""; // ← Fallback empty; set VITE_GROQ_API_KEY in .env.local

const GROQ_ENDPOINT  = GROQ_CONFIG.CHAT_COMPLETIONS;
const PRIMARY_MODEL  = GROQ_CONFIG.MODELS.PRIMARY;
const FALLBACK_MODEL = GROQ_CONFIG.MODELS.FALLBACK;

// ── Shared Groq caller ────────────────────────────────────────────────────────
async function callGroq(model, messages, { temperature = 0.1, max_tokens = 400 } = {}) {
  const res = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: getAuthHeaders(GROQ_API_KEY),
    body: JSON.stringify({ model, temperature, max_tokens, messages }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || "";
}

/**
 * Calls PRIMARY_MODEL, falls back to FALLBACK_MODEL on error.
 */
async function callGroqWithFallback(messages, opts = {}) {
  try {
    return await callGroq(PRIMARY_MODEL, messages, opts);
  } catch (e) {
    console.warn("Primary Groq model failed, using fallback:", e);
    return await callGroq(FALLBACK_MODEL, messages, opts);
  }
}

/**
 * Strips markdown code fences and returns the raw text.
 */
function stripFences(raw = "") {
  return raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

// ── 1. Semantic agent search ──────────────────────────────────────────────────
/**
 * Analyzes the user's natural language prompt and returns matched agent IDs.
 *
 * @param {string}   userPrompt
 * @param {Object[]} agentsList
 * @returns {Promise<{ matchedIds: string[]|null, summary?: string, error?: string }>}
 */
export async function searchAgentsWithAI(userPrompt, agentsList) {
  if (!userPrompt?.trim()) return { matchedIds: null, reason: "" };

  const catalog = agentsList.map((a) => ({
    id: a.id,
    name: a.name,
    category: a.category,
    department: a.department || "",
    description: a.description,
    capabilities: a.capabilities || [],
  }));

  const systemPrompt = `You are HubblePilot.AI's intelligent agent routing engine.
Analyze the user's natural language request, task, or prompt.
Examine each available agent's name, category, description, and capabilities.
Determine WHICH specific agent(s) genuinely address or solve the user's prompt.
Strict rules:
1. Return ONLY the agent IDs that match the intent. Filter out all irrelevant agents.
2. Order them from highest relevance to lowest.
3. If no agent is relevant, return an empty array: [].
4. Return strictly valid JSON in this exact structure:
{"matchedIds": ["agent-id-1"], "summary": "Brief 1-sentence reason why these agents were selected."}
Do NOT include any markdown code blocks, backticks, or other text outside the JSON object.`;

  const userContent = `User query / task prompt: "${userPrompt.trim()}"

Available Agents Catalog:
${JSON.stringify(catalog, null, 2)}`;

  try {
    const raw     = await callGroqWithFallback(
      [{ role: "system", content: systemPrompt }, { role: "user", content: userContent }],
      { temperature: 0.1, max_tokens: 350 },
    );
    const cleaned = stripFences(raw);

    // Handle bare array response
    if (cleaned.startsWith("[") && cleaned.endsWith("]")) {
      const arr = JSON.parse(cleaned);
      return {
        matchedIds: Array.isArray(arr) ? arr : [],
        summary: `Matched ${arr.length} agent${arr.length === 1 ? "" : "s"} for your prompt.`,
      };
    }

    const parsed = JSON.parse(cleaned);
    return {
      matchedIds: Array.isArray(parsed.matchedIds) ? parsed.matchedIds : [],
      summary: parsed.summary || "",
    };
  } catch (error) {
    console.error("AI semantic agent search error:", error);
    return { matchedIds: null, error: error.message };
  }
}

// ── 2. Main chatbot ───────────────────────────────────────────────────────────
/**
 * HubbleBot — agent advisor chatbot for the landing page.
 *
 * @param {string}   userMessage
 * @param {Object[]} conversationHistory  – [{ role, content }]
 * @param {Object[]} agentsList
 * @returns {Promise<{ reply: string, agentIds: string[] }>}
 */
export async function askChatbot(userMessage, conversationHistory = [], agentsList = []) {
  if (!userMessage?.trim()) return { reply: "Please ask a question about any agent or task!", agentIds: [] };

  const agentsKnowledge = agentsList
    .map(
      (a) =>
        `### Agent: "${a.name}" (ID: "${a.id}")
- Department: ${a.department || "Enterprise"}
- Category: ${a.category || "General"}
- Status: ${a.status || "Available"}
- Detailed Description & Scope: ${a.description}
- Key Capabilities & Outputs: ${(a.capabilities || []).join(", ") || "General"}`,
    )
    .join("\n\n");

  const systemPrompt = `You are HubbleBot, the official intelligent AI advisor for Hubble.AI (HubblePilot).
You help users explore, select, and deeply understand all AI agents available on the platform.

Here is the current catalog of Hubble AI Agents with their detailed descriptions, capabilities, and domains:
${agentsKnowledge}

CRITICAL RULES:
1. When a user asks to EXPLAIN or asks ABOUT a specific agent, ground your explanation deeply in the agent's exact description, scope, and capabilities.
   Provide a RICH, DETAILED, and COMPREHENSIVE explanation (aim for 7 to 10 clear sentences) covering:
   - Core purpose, scope, and specific operational focus.
   - Real-world problems it solves and exact workflows/use cases.
   - Specific artifacts, documents, or outputs it produces.
   - Which departments and teams benefit most from it.
   - Standout capabilities and key technical or analytical strengths.
2. When a user asks for a RECOMMENDATION, clearly state WHICH agent to use, WHY it is the best match, and cite specific capabilities and deliverables (5 to 7 sentences).
3. For general platform questions, provide structured, knowledgeable, and helpful answers.
4. Keep the tone warm, professional, articulate, and engaging.
5. NEVER truncate or cut short an explanation. Always complete your full answer.
6. Return your response strictly in valid JSON format:
{
  "reply": "Your full, detailed answer here with complete explanations.",
  "agentIds": ["exact-agent-id-here"]
}
Do NOT include markdown fences outside the JSON.`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.slice(-6).map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    })),
    { role: "user", content: userMessage.trim() },
  ];

  try {
    const raw       = await callGroqWithFallback(messages, { temperature: 0.3, max_tokens: 900 });
    let replyText   = raw || "I'm here to help! Ask me about any agent or task.";
    let detectedIds = [];

    try {
      const cleaned = stripFences(raw);
      if (cleaned.startsWith("{") && cleaned.endsWith("}")) {
        const parsed = JSON.parse(cleaned);
        if (parsed.reply) replyText = parsed.reply;
        if (Array.isArray(parsed.agentIds)) detectedIds = parsed.agentIds;
      }
    } catch { /* keep raw */ }

    // Secondary scan: ensure every mentioned agent is included
    const combinedText = (userMessage + " " + replyText).toLowerCase();
    agentsList.forEach((agent) => {
      const idNorm    = agent.id.toLowerCase().trim();
      const nameNorm  = agent.name.toLowerCase().trim();
      const cleanName = nameNorm.replace(/\s*agent$/i, "").trim();
      if (
        combinedText.includes(idNorm) ||
        combinedText.includes(nameNorm) ||
        (cleanName.length > 3 && combinedText.includes(cleanName))
      ) {
        if (!detectedIds.some((id) => String(id).toLowerCase().trim() === idNorm)) {
          detectedIds.push(agent.id);
        }
      }
    });

    return { reply: replyText, agentIds: detectedIds };
  } catch (error) {
    console.error("Chatbot Groq error:", error);
    return { reply: "I had a momentary connection issue with the AI engine. Please ask again!", agentIds: [] };
  }
}

// ── 3. Tracker chatbot ────────────────────────────────────────────────────────
/**
 * HubbleBot Analytics — LLM Token Tracker chatbot.
 *
 * @param {string}   userMessage
 * @param {Object[]} conversationHistory
 * @param {Object}   trackerContext   – { timeframe, activeView, totalTokens, topAgent, agentRows, deptRows }
 * @returns {Promise<{ reply: string }>}
 */
export async function askTrackerChatbot(userMessage, conversationHistory = [], trackerContext = {}) {
  if (!userMessage?.trim()) {
    return { reply: "Please ask a question about LLM token consumption, agent activity, or department usage!" };
  }

  const {
    timeframe  = "monthly",
    activeView = "agent",
    totalTokens = 0,
    topAgent   = null,
    agentRows  = [],
    deptRows   = [],
  } = trackerContext;

  const tfLabel =
    timeframe === "daily"   ? "Daily (Past 24 Hours)" :
    timeframe === "weekly"  ? "Weekly (Past 7 Days)"  : "Monthly (Past 30 Days)";

  const agentSummary = (agentRows || []).slice(0, 30)
    .map((a) => `- Agent: "${a.agentName}" | Category: ${a.category} | Total Tokens: ${a.totalTokens?.toLocaleString() || "0"} | Top User: ${a.topUser || "N/A"}`)
    .join("\n");

  const deptSummary = (deptRows || [])
    .map((d) => `- Department: "${d.deptName}" | Total Tokens: ${d.totalTokens?.toLocaleString() || "0"} | Top Agent: ${d.topAgentUsed || "N/A"} | Users: ${d.userCount || "N/A"}`)
    .join("\n");

  const systemPrompt = `You are HubbleBot Analytics, the intelligent AI data analyst for HubblePilot.AI's LLM Token Tracker.

CURRENT ACTIVE CONTEXT:
- Active Timeframe: ${tfLabel}
- Currently Selected Tab: ${activeView === "agent" ? "Agent-Wise Breakdown" : "Department-Wise Breakdown"}
- Platform Total Tokens (${tfLabel}): ${totalTokens ? totalTokens.toLocaleString() : "N/A"}
- Platform Top Consuming Agent: ${topAgent ? `${topAgent.agentName} (${topAgent.totalTokens?.toLocaleString()} tokens)` : "N/A"}

AGENT-WISE CONSUMPTION DATA (${tfLabel}):
${agentSummary || "No agent data available"}

DEPARTMENT-WISE CONSUMPTION DATA (${tfLabel}):
${deptSummary || "No department data available"}

CRITICAL RULES:
1. Provide BRIEF, CONCISE, and DIRECT answers (2 to 4 sentences max).
2. Base your analysis STRICTLY on the provided data for the active timeframe (${tfLabel}).
3. Cite exact numbers from the context.
4. Tone: Analytical, sharp, professional, and helpful.
5. Return your response strictly in valid JSON format:
{ "reply": "Your concise 2-4 sentence data analysis response here." }
Do NOT include markdown fences outside the JSON.`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.slice(-6).map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    })),
    { role: "user", content: userMessage.trim() },
  ];

  try {
    const raw     = await callGroqWithFallback(messages, { temperature: 0.15, max_tokens: 380 });
    let replyText = raw || "Here is the token consumption summary based on your selected timeframe.";

    try {
      const cleaned = stripFences(raw);
      if (cleaned.startsWith("{") && cleaned.endsWith("}")) {
        const parsed = JSON.parse(cleaned);
        if (parsed.reply) replyText = parsed.reply;
      }
    } catch { /* keep raw */ }

    return { reply: replyText };
  } catch (error) {
    console.error("Tracker Chatbot Groq error:", error);
    return { reply: "I encountered a connection issue while analyzing the tracker data. Please ask again!" };
  }
}

// ── 4. Usage detail page chatbot ──────────────────────────────────────────────
/**
 * HubbleBot Analytics — Usage Detail page chatbot (agent-wise or dept-wise).
 *
 * @param {string}   userMessage
 * @param {Object[]} conversationHistory
 * @param {Object}   usageContext – { pageType, timeframe, entityName, totalTokens, userCount, rows }
 * @returns {Promise<{ reply: string }>}
 */
export async function askUsagePageChatbot(userMessage, conversationHistory = [], usageContext = {}) {
  if (!userMessage?.trim()) return { reply: "Please ask a question about the usage data shown on this page!" };

  const {
    pageType   = "agent",
    timeframe  = "monthly",
    entityName = "",
    totalTokens = 0,
    userCount  = 0,
    rows       = [],
  } = usageContext;

  const tfLabel = timeframe === "daily"  ? "Daily (Past 24 Hours)" :
                  timeframe === "weekly" ? "Weekly (Past 7 Days)"  : "Monthly (Past 30 Days)";

  const isAgent    = pageType === "agent";
  const rowSummary = (rows || []).slice(0, 60).map((r, i) => {
    if (isAgent) {
      return `${i + 1}. ${r.user} (${r.department}) — ${r.totalTokens?.toLocaleString() || 0} tokens | Last Active: ${r.lastActive}`;
    }
    return `${i + 1}. ${r.userName} | Agent: ${r.topAgentUsed} — ${r.totalTokens?.toLocaleString() || 0} tokens | Last Active: ${r.lastActive}`;
  }).join("\n");

  const contextBlock = isAgent
    ? `PAGE: Agent Usage Detail | AGENT: ${entityName} | TIMEFRAME: ${tfLabel}\nTOTAL TOKENS: ${totalTokens.toLocaleString()} | TOTAL USERS: ${userCount}\nUSER-LEVEL TABLE:\n${rowSummary || "No data."}`
    : `PAGE: Department Usage Detail | DEPARTMENT: ${entityName} | TIMEFRAME: ${tfLabel}\nTOTAL TOKENS: ${totalTokens.toLocaleString()} | TOTAL MEMBERS: ${userCount}\nMEMBER-LEVEL TABLE:\n${rowSummary || "No data."}`;

  const systemPrompt = `You are HubbleBot Analytics, the AI data analyst embedded in HubblePilot.AI's Usage Detail pages.
You analyze granular, ${isAgent ? "user-level token consumption for a specific agent" : "member-level token consumption for a specific department"}.

${contextBlock}

RULES:
- Answer precisely from the data above. Cite exact names and numbers.
- For simple lookups: 1-2 sentences. For analysis: 4-6 thorough sentences.
- NEVER fabricate. If data is absent, say so.
- Tone: analytical, sharp, professional.

Return strictly valid JSON: { "reply": "Your answer here." }
No markdown fences outside the JSON.`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.slice(-8).map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    })),
    { role: "user", content: userMessage.trim() },
  ];

  try {
    const raw     = await callGroqWithFallback(messages, { temperature: 0.15, max_tokens: 600 });
    let replyText = raw || "I'm here to help analyze the usage data on this page.";

    try {
      const cleaned = stripFences(raw);
      if (cleaned.startsWith("{") && cleaned.endsWith("}")) {
        const parsed = JSON.parse(cleaned);
        if (parsed.reply) replyText = parsed.reply;
      }
    } catch { /* keep raw */ }

    return { reply: replyText };
  } catch (error) {
    console.error("Usage Page Chatbot error:", error);
    return { reply: "I encountered a connection issue. Please try again!" };
  }
}
