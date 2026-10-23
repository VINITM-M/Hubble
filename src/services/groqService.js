/**
 * services/groqService.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Groq AI integration layer — all Groq API calls live here.
 *
 * Functions:
 *  searchAgentsWithAI(prompt, agents)           → semantic agent search
 *  askChatbot(msg, history, agents)             → main agent advisor chatbot
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
    department: a.department || "Enterprise",
    description: a.description,
    detailedDescription: a.detailedDescription || "",
    cardTags: a.cardTags || [],
    capabilities: a.capabilities || [],
  }));

  const systemPrompt = `You are Hubble.AI's intelligent agent search and discovery engine for the main landing page.
Your mission: Analyze the user's natural language request, problem statement, or task question (handling any informal wording, typos, or colloquial phrasing) and recommend ONLY the matching AI agent(s) available on the main landing page catalog.

Main Landing Page Agents Catalog:
${JSON.stringify(catalog, null, 2)}

Domain Matching & Problem-Solving Guidelines for Main Landing Page Agents:
1. "antibody-expert" (Antibody Agent, Department: Analytical R&D):
   - Solves: Monoclonal antibody (mAb) scientific literature search, citation verification, candidate screening, epitope targeting, biopharma corpora analysis.
   - User queries & variations: "antibody analysis", "anitbody analsyis", "analyze antibodies", "monoclonal antibodies", "mab", "literature citations", "screen antibody candidates".
2. "peptide-ai" (Peptide.AI, Department: PR&D):
   - Solves: Therapeutic peptide development, chemical synthesis planning, sequence optimization, minimizing aggregation and impurities.
   - User queries & variations: "peptide synthesis", "peptide sequence optimization", "peptide aggregation", "peptide impurities", "process R&D".
3. "carbohydrate-chemistry-expert-agent" (Carbo Agent, Department: PR&D):
   - Solves: Carbohydrate chemistry synthesis, "carbo" work, glycobiology, glycoengineering, reaction mechanism troubleshooting, purification bottlenecks.
   - User queries & variations: "carbo", "work related carbo", "carbohydrate synthesis", "glycobiology", "glycoengineering", "reaction mechanisms", "purification bottlenecks".
4. "ELISA-Hybridoma-AI" (Hybridoma ELISA, Department: NBE):
   - Solves: Laboratory automation for high-throughput hybridoma and serum ELISA clone screening, raw spectrophotometer optical density reading ingestion, duplicate well averaging, statistical titration curve modeling, audit-ready Excel reports.
   - User queries & variations: "ELISA", "elisa", "hybridoma screening", "titration curves", "optical density readings", "spectrophotometer data", "clone selection".
5. "Teva Agent" (Teva Agent, Department: General):
   - Solves: Cross-functional technical transfer documentation gap analysis, comparing analytical validation reports and formulation manufacturing practices between Teva and Aurigene/Dr. Reddy's, FT07 site alignment, compliance risk detection.
   - User queries & variations: "Teva", "gap analysis", "technical transfer", "formulation audit", "validation review", "FT07 site practices".
6. "documenter" (Documenter AI, Department: Quality Assurance):
   - Solves: Medical and scientific reports, Standard Operating Procedures (SOPs), technical documentation, typographical and formatting discrepancy correction, scientific text restructuring, corporate branding enforcement, audit compliance.
   - User queries & variations: "reports related medical", "medical reports", "scientific report", "documentation", "SOP", "compliance review", "standard operating procedures", "typos and formatting", "scientific writing".

Strict Evaluation Rules:
1. Gracefully interpret typos, informal phrasing, and varied conversational requests (e.g., "i want to perfor some reports related medical" -> "documenter", "anitbody analsyis" -> "antibody-expert", "i need do work related carbo" -> "carbohydrate-chemistry-expert-agent", "elisa" -> "ELISA-Hybridoma-AI").
2. Return ONLY the agent IDs from the catalog above that solve or genuinely assist with the user's request.
3. Order matched IDs from highest relevance to lowest.
4. If the query does not align with any of these main landing page agents, return an empty array: [].
5. Provide a helpful, clear 1-2 sentence "summary" explicitly naming the agent, its department, and how it solves the user's specific problem.
6. Return strictly valid JSON:
{
  "matchedIds": ["agent-id"],
  "summary": "Agent Name (Department) solves this by..."
}
Do NOT output any markdown backticks or text outside this JSON object.`;

  const userContent = `User query / task prompt: "${userPrompt.trim()}"`;

  try {
    const raw = await callGroqWithFallback(
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
• Department: ${a.department || "Enterprise"}
• Category / Tool Type: ${a.type === "application" ? "Laboratory Application" : "AI Cognitive Agent"}
• Primary Purpose & Scope:
  ${a.description}
${a.detailedDescription ? `• Technical Methodology & Workflow:\n  ${a.detailedDescription}` : ""}
• Real-World Problem Solved:
  ${(a.cardTags || []).join(", ") || "Laboratory Automation & Intelligence"}
• Key Capabilities & Deliverables:
  ${(a.capabilities || []).map((c) => `  - ${c}`).join("\n")}`,
    )
    .join("\n\n");

  const systemPrompt = `You are HubbleBot, the dedicated AI Agent Advisor for Hubble.AI.
Your role is to guide scientists, laboratory researchers, and quality engineers to the exact AI agents available on the Hubble.AI Main Landing Page.

Available Main Landing Page Agent Catalog:
${agentsKnowledge}

MANDATORY RESPONSE ARCHITECTURE & STRUCTURE:
1. EXCLUSIVE FOCUS ON MAIN LANDING PAGE AGENTS:
   Recommend and answer exclusively using the active agents from the catalog above. Never invent non-existent agents or recommend external software.

2. COMPREHENSIVE, STRUCTURED RESPONSES (When explaining an agent or answering a user's task/question):
   Provide a detailed, thorough, and scientifically articulate explanation (6 to 9 sentences). Always structure your response with:
   - **Agent Name & Department**: Explicitly identify the agent and its exact department (e.g. **Antibody Agent** in the **Analytical R&D** department).
   - **Problem Solved & Context**: Explain the real-world scientific, analytical, or regulatory bottleneck the agent is designed to solve.
   - **Operational Workflow & Analysis**: Describe how the agent operates (e.g., natural language querying over literature, ingesting raw OD readings, automated gap analysis matrices, SOP compliance restructuring).
   - **Tangible Artifacts & Deliverables**: Mention the concrete outputs delivered to the scientist (e.g. source-grounded citations, standardized multi-sheet Excel reports, gap comparison tables, audit-ready SOPs).
   - **Key Capabilities**: Highlight 3-4 bullet points summarizing standout capabilities.

3. DIRECT PROBLEM-SOLVING EXAMPLES:
   - If user asks: "I want to perform antibody analysis" -> Immediately recommend **Antibody Agent** (Department: **Analytical R&D**), explain how it executes grounded literature searches, retrieves verified citations, and accelerates candidate screening.
   - If user asks: "How does ELISA data get processed?" -> Recommend **Hybridoma ELISA** (Department: **NBE**), describe how it automates duplicate well averaging, titration curve fitting, and Excel report generation.
   - If user asks: "How to compare documents with Teva?" -> Recommend **Teva Agent** (Department: **General**), explain its validation and formulation practice gap analysis between Teva and Aurigene/Dr. Reddy's FT07 sites.
   - If user asks: "Peptide synthesis optimization" -> Recommend **Peptide.AI** (Department: **PR&D**).
   - If user asks: "Carbohydrate reaction mechanisms" -> Recommend **Carbo Agent** (Department: **PR&D**).
   - If user asks: "SOP formatting or compliance" -> Recommend **Documenter AI** (Department: **Quality Assurance**).

4. TONE & READABILITY:
   - Scientifically accurate, articulate, encouraging, and clear.
   - Use clean Markdown with bold headers and bullet points. Never truncate or cut answers short.

5. OUTPUT FORMAT:
   Return strictly valid JSON:
{
  "reply": "Your rich, detailed Markdown-formatted response.",
  "agentIds": ["exact-matched-agent-id"]
}
Do NOT include markdown fences outside the JSON object.`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationHistory.slice(-6).map((msg) => ({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    })),
    { role: "user", content: userMessage.trim() },
  ];

  try {
    const raw       = await callGroqWithFallback(messages, { temperature: 0.25, max_tokens: 950 });
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

