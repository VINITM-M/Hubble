/**
 * algorithms/agentFilters.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure filtering / sorting algorithms for the agent catalog.
 * No React or side-effects — only data-in / data-out functions.
 *
 * Exports:
 *  filterAgents(pool, options)   – applies all active filters
 *  availabilityRank(agent)       – sort helper: 0=Available, 1=other
 *  computeAgentRatings(agents)   – merge base + saved user ratings
 *  getSavedFavorites()           – read favorites from localStorage
 *  saveFavorites(ids)            – write favorites to localStorage
 *  getSavedRatings()             – read all ratings from localStorage
 *  saveRatingForAgent(id, rec)   – append a rating record
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { CANONICAL_DEPARTMENTS } from "../models/agents.js";

// ── Storage keys ─────────────────────────────────────────────────────────────
const FAVORITES_KEY = "hubble_favorite_agents_v1";
const RATINGS_KEY   = "hubble_agent_user_ratings_v1";

// ── Department → category mapping (used by department filter) ─────────────────
const DEPT_CATEGORY_MAP = {};
CANONICAL_DEPARTMENTS.forEach((dept) => {
  DEPT_CATEGORY_MAP[dept] = [dept];
});

// ── Agent type helpers ────────────────────────────────────────────────────────
const APPLICATION_IDS = new Set(["Capacitor-Application", "Aurigene-AI-CDMO-Biologics", "ELISA-Hybridoma-AI"]);

export function isApplication(agent) {
  return agent.type === "application" || APPLICATION_IDS.has(agent.id);
}

// ── Availability rank ─────────────────────────────────────────────────────────
export function availabilityRank(agent) {
  return agent.primary?.status === "Available" ? 0 : 1;
}

// ── Primary filter orchestrator ───────────────────────────────────────────────
/**
 * @param {Object[]} pool              – full or pre-sliced agent array
 * @param {Object}   opts
 * @param {string[]} opts.selectedFavFilters  – ["favorites","trending"]
 * @param {string[]} opts.favorites           – favorited agent IDs
 * @param {string[]} opts.selectedDepartments – department category names
 * @param {string[]} opts.selectedTools       – ["application","agent"]
 * @param {string[]} opts.selectedStatuses    – ["available","coming-soon","tbd"]
 * @param {string}   opts.query               – current search text (normalized lower)
 * @param {string[]|null} opts.aiMatchedIds   – Groq AI match results
 * @returns {Object[]}
 */
export function filterAgents(pool, {
  selectedFavFilters = [],
  favorites = [],
  selectedDepartments = [],
  selectedTools = [],
  selectedStatuses = [],
  query = "",
  aiMatchedIds = null,
} = {}) {
  let result = [...pool];

  // 1. Favorites / Trending
  if (selectedFavFilters.length > 0) {
    result = result.filter((agent) => {
      const matchesFav     = selectedFavFilters.includes("favorites") && favorites.includes(agent.id);
      const matchesTrend   = selectedFavFilters.includes("trending")  && Boolean(agent.isTrending);
      return matchesFav || matchesTrend;
    });
  }

  // 2. Department
  if (selectedDepartments.length > 0) {
    result = result.filter((agent) => {
      const agentDept = (agent.department || "").trim();
      return selectedDepartments.some((selected) => {
        if (selected.toLowerCase() === agentDept.toLowerCase()) return true;
        const mapped = DEPT_CATEGORY_MAP[selected];
        return mapped && mapped.some((m) => m.toLowerCase() === agentDept.toLowerCase());
      });
    });
  }

  // 3. Tools (Applications vs Agents)
  if (selectedTools.length > 0) {
    result = result.filter((agent) => {
      const toolType = isApplication(agent) ? "application" : "agent";
      return selectedTools.includes(toolType);
    });
  }

  // 4. Status
  if (selectedStatuses.length > 0) {
    result = result.filter((agent) => {
      const s = (agent.primary?.status || "").toLowerCase();
      const mapped =
        s === "available"    ? "available"    :
        s === "coming soon"  ? "coming-soon"  : "tbd";
      return selectedStatuses.includes(mapped);
    });
  }

  // 5. Always sort: Available first
  result.sort((a, b) => availabilityRank(a) - availabilityRank(b));

  // 6. Search / AI matching
  const normalized = query.trim().toLowerCase();
  if (!normalized) return result;

  // 6a. Groq AI matched IDs
  if (Array.isArray(aiMatchedIds)) {
    if (aiMatchedIds.length === 0) return [];

    const matchMap = new Map();
    aiMatchedIds.forEach((id, idx) => matchMap.set(String(id).trim().toLowerCase(), idx));

    const matched = result.filter(
      (agent) =>
        matchMap.has(agent.id.trim().toLowerCase()) ||
        matchMap.has(agent.name.trim().toLowerCase()),
    );

    return matched.sort((a, b) => {
      const rankA = matchMap.get(a.id.trim().toLowerCase()) ?? matchMap.get(a.name.trim().toLowerCase()) ?? 999;
      const rankB = matchMap.get(b.id.trim().toLowerCase()) ?? matchMap.get(b.name.trim().toLowerCase()) ?? 999;
      return rankA - rankB;
    });
  }

  // 6b. Intelligent intent & keyword matching fallback
  // First, test direct substring match
  const directMatches = result.filter((agent) =>
    [
      agent.name,
      agent.description,
      agent.department,
      agent.primary?.provider ?? "",
      agent.alternative?.provider ?? "",
      ...(agent.cardTags ?? []),
      ...(agent.capabilities ?? []),
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );

  if (directMatches.length > 0) return directMatches;

  // Natural language query tokenization — strip filler and conversational stop words
  const STOP_WORDS = new Set([
    "i", "want", "to", "perform", "do", "need", "help", "with", "me", "a", "an",
    "the", "for", "in", "on", "at", "by", "from", "can", "you", "find", "show",
    "search", "which", "what", "is", "are", "solve", "my", "our", "task", "problem",
    "agent", "agents", "please", "would", "like", "how", "give"
  ]);

  const tokens = normalized
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));

  if (tokens.length === 0) return result;

  // Domain aliases for instant landing page agent matching
  const DOMAIN_ALIAS_MAP = {
    "antibody": ["antibody-expert"],
    "antibodies": ["antibody-expert"],
    "mab": ["antibody-expert"],
    "mabs": ["antibody-expert"],
    "monoclonal": ["antibody-expert"],
    "peptide": ["peptide-ai"],
    "peptides": ["peptide-ai"],
    "synthesis": ["peptide-ai", "carbohydrate-chemistry-expert-agent"],
    "carbohydrate": ["carbohydrate-chemistry-expert-agent"],
    "carbohydrates": ["carbohydrate-chemistry-expert-agent"],
    "carbo": ["carbohydrate-chemistry-expert-agent"],
    "glyco": ["carbohydrate-chemistry-expert-agent"],
    "glycobiology": ["carbohydrate-chemistry-expert-agent"],
    "glycoengineering": ["carbohydrate-chemistry-expert-agent"],
    "elisa": ["ELISA-Hybridoma-AI"],
    "hybridoma": ["ELISA-Hybridoma-AI"],
    "hybridomas": ["ELISA-Hybridoma-AI"],
    "titration": ["ELISA-Hybridoma-AI"],
    "spectrophotometer": ["ELISA-Hybridoma-AI"],
    "clone": ["ELISA-Hybridoma-AI"],
    "clones": ["ELISA-Hybridoma-AI"],
    "teva": ["Teva Agent"],
    "ft07": ["Teva Agent"],
    "transfer": ["Teva Agent"],
    "sop": ["documenter"],
    "sops": ["documenter"],
    "document": ["documenter"],
    "documenter": ["documenter"],
    "documentation": ["documenter"],
    "compliance": ["documenter", "Teva Agent"],
    "quality": ["documenter", "Teva Agent"],
  };

  const scored = result.map((agent) => {
    let score = 0;
    const searchableText = [
      agent.name,
      agent.id,
      agent.department || "",
      agent.description || "",
      agent.detailedDescription || "",
      ...(agent.cardTags || []),
      ...(agent.capabilities || []),
    ]
      .join(" ")
      .toLowerCase();

    tokens.forEach((t) => {
      if (searchableText.includes(t)) {
        score += 2;
        if (agent.name.toLowerCase().includes(t)) score += 4;
        if ((agent.department || "").toLowerCase().includes(t)) score += 3;
      }
      const mappedIds = DOMAIN_ALIAS_MAP[t];
      if (mappedIds && mappedIds.includes(agent.id)) {
        score += 8;
      }
    });

    return { agent, score };
  });

  // If query specifically contained domain keywords, return only agents in that domain
  const domainMatchedIds = new Set();
  tokens.forEach((t) => {
    const mapped = DOMAIN_ALIAS_MAP[t];
    if (mapped) {
      mapped.forEach((id) => domainMatchedIds.add(id));
    }
  });

  if (domainMatchedIds.size > 0) {
    const domainAgents = scored.filter((s) => domainMatchedIds.has(s.agent.id));
    if (domainAgents.length > 0) {
      return domainAgents.sort((a, b) => b.score - a.score).map((s) => s.agent);
    }
  }

  const maxScore = Math.max(...scored.map((s) => s.score), 0);
  if (maxScore <= 0) return [];
  const threshold = Math.max(Math.ceil(maxScore * 0.5), 2);
  const matched = scored.filter((s) => s.score >= threshold).sort((a, b) => b.score - a.score);
  return matched.map((s) => s.agent);
}

// ── Rating utilities ──────────────────────────────────────────────────────────
export function getSavedRatings() {
  try {
    const raw = localStorage.getItem(RATINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveRatingForAgent(agentId, ratingRecord) {
  try {
    const all         = getSavedRatings();
    const currentList = Array.isArray(all[agentId]) ? all[agentId] : [];
    const newRecord   = {
      id:        `rate_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email:     (ratingRecord.email || "user@aurigene.com").trim().toLowerCase(),
      rating:    Number(ratingRecord.rating),
      review:    ratingRecord.review || "",
      timestamp: Date.now(),
    };
    all[agentId] = [...currentList, newRecord];
    localStorage.setItem(RATINGS_KEY, JSON.stringify(all));
    return all;
  } catch (err) {
    console.error("Error saving rating:", err);
    return {};
  }
}

export function computeAgentRatings(baseAgents) {
  const savedRatings = getSavedRatings();
  return baseAgents.map((agent) => {
    const userReviews = Array.isArray(savedRatings[agent.id]) ? savedRatings[agent.id] : [];
    const baseR = agent.baseRating  !== undefined ? agent.baseRating  : (Number(agent.rating)  || 4.5);
    const baseC = agent.baseReviews !== undefined ? agent.baseReviews : (Number(agent.reviews) || 100);

    if (userReviews.length === 0) {
      return { ...agent, baseRating: baseR, baseReviews: baseC, rating: baseR, reviews: baseC };
    }

    const sumUser     = userReviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0);
    const totalReviews = baseC + userReviews.length;
    const avg         = (baseR * baseC + sumUser) / totalReviews;
    const finalRating = Math.round(avg * 10) / 10;

    return { ...agent, baseRating: baseR, baseReviews: baseC, rating: finalRating, reviews: totalReviews };
  });
}

// ── Favorites utilities ───────────────────────────────────────────────────────
export function getSavedFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveFavorites(favs) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  } catch (err) {
    console.error(err);
  }
}

// ── Computed stat helpers ─────────────────────────────────────────────────────
export function computeDepartmentCounts(agentsList) {
  const map = new Map();
  agentsList.forEach((agent) => {
    const dept = (agent.department || "General").trim();
    map.set(dept, (map.get(dept) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function computeToolsCounts(agentsList) {
  let applications = 0;
  let agents = 0;
  agentsList.forEach((agent) => {
    if (isApplication(agent)) applications++;
    else agents++;
  });
  return { applications, agents };
}

export function computeStatusCounts(agentsList) {
  let available = 0, comingSoon = 0;
  agentsList.forEach((agent) => {
    const s = (agent.primary?.status || "").toLowerCase();
    if (s === "available") available++;
    else comingSoon++; // covers "coming soon", "tbd", and anything else
  });
  return { available, comingSoon, tbd: 0 };
}
