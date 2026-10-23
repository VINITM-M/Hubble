/**
 * services/backendApi.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Client service for connecting the React front-end to the FastAPI / SQLite backend.
 * Provides functions for:
 *   - User management (email storage)
 *   - Feedback submission (ratings, reviews, attachment file upload)
 *   - Trending interactions (launch agent click tracking, favorites, likes)
 *   - User data replication to front-end
 *   - Aggregated upcoming agent likes & trending metrics
 * ─────────────────────────────────────────────────────────────────────────────
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Default or persisted user email
export function getActiveUserEmail() {
  try {
    const saved = localStorage.getItem("hubble_user_email");
    return saved && saved.trim() ? saved.trim().toLowerCase() : null;
  } catch {
    return null;
  }
}

export function setActiveUserEmail(email) {
  if (!email || !email.trim()) return;
  try {
    localStorage.setItem("hubble_user_email", email.trim().toLowerCase());
  } catch { }
}

export function clearUserSession() {
  try {
    localStorage.removeItem("hubble_user_email");
  } catch { }
}

/**
 * Derives the first two letters of user's name/email (e.g. "JO" or "SC")
 * Returns "GU" if user is guest.
 */
export function getUserInitials(email) {
  if (!email || !email.trim()) return "GU";
  const namePart = email.split("@")[0].trim();
  if (!namePart) return "GU";
  const segments = namePart.split(/[._-]/).filter(Boolean);
  if (segments.length >= 2 && segments[0] && segments[1]) {
    return (segments[0][0] + segments[1][0]).toUpperCase();
  }
  return namePart.slice(0, 2).toUpperCase();
}

/**
 * Check backend health status
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[BackendApi] Health check warning:", err.message);
    return null;
  }
}

/**
 * Ensure user exists or register user email
 */
export async function registerOrGetUser(email) {
  if (!email || !email.trim()) return null;
  try {
    const res = await fetch(`${API_BASE}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[BackendApi] registerOrGetUser error:", err.message);
    return null;
  }
}

/**
 * Submit feedback with rating, review, and optional file attachment via multipart/form-data
 */
export async function submitFeedbackToBackend({
  email,
  agentId,
  agentName = "",
  rating,
  feedbackText = "",
  attachmentFile = null,
}) {
  if (!email || !email.trim()) return null;
  try {
    const formData = new FormData();
    formData.append("email", email.trim().toLowerCase());
    formData.append("agent_id", agentId);
    formData.append("agent_name", agentName);
    formData.append("rating", String(rating));
    formData.append("feedback_text", feedbackText);

    if (attachmentFile) {
      formData.append("attachment", attachmentFile);
    }

    const res = await fetch(`${API_BASE}/api/feedback`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to submit feedback: ${errText}`);
    }

    return await res.json();
  } catch (err) {
    console.warn("[BackendApi] submitFeedbackToBackend error:", err.message);
    return null;
  }
}

/**
 * Fetch feedback stats for an agent
 */
export async function fetchAgentFeedbackStats(agentId) {
  try {
    const res = await fetch(`${API_BASE}/api/feedback/agent/${encodeURIComponent(agentId)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[BackendApi] fetchAgentFeedbackStats error:", err.message);
    return null;
  }
}

/**
 * Record a launch click on an agent card
 */
export async function recordLaunchClick(email, cardId, cardType = "agent") {
  if (!email || !email.trim()) return null;
  try {
    const res = await fetch(`${API_BASE}/api/trending/launch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        card_id: cardId,
        card_type: cardType,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[BackendApi] recordLaunchClick error:", err.message);
    return null;
  }
}

/**
 * Save / Favorite an agent card
 */
export async function toggleSaveCard(email, cardId, isSaved = null) {
  if (!email || !email.trim()) return null;
  try {
    const res = await fetch(`${API_BASE}/api/trending/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        card_id: cardId,
        is_saved: isSaved,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[BackendApi] toggleSaveCard error:", err.message);
    return null;
  }
}

/**
 * Like / Upvote an upcoming or catalog card
 */
export async function toggleLikeCard(email, cardId, cardType = "upcoming", isLiked = null) {
  if (!email || !email.trim()) return null;
  try {
    const res = await fetch(`${API_BASE}/api/trending/like`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        card_id: cardId,
        card_type: cardType,
        is_liked: isLiked,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[BackendApi] toggleLikeCard error:", err.message);
    return null;
  }
}

/**
 * Replicate & retrieve user-specific data from SQLite to the front-end
 */
export async function fetchUserData(email) {
  if (!email || !email.trim()) {
    return {
      email: "guest",
      saved_card_ids: [],
      liked_card_ids: [],
      launch_clicks: {},
      feedbacks: [],
    };
  }
  try {
    const res = await fetch(`${API_BASE}/api/user/data?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[BackendApi] fetchUserData error:", err.message);
    return null;
  }
}

/**
 * Fetch global trending summary
 */
export async function fetchTrendingSummary() {
  try {
    const res = await fetch(`${API_BASE}/api/trending`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[BackendApi] fetchTrendingSummary error:", err.message);
    return null;
  }
}

/**
 * Fetch upcoming agents likes & upvote stats
 */
export async function fetchUpcomingStats() {
  try {
    const res = await fetch(`${API_BASE}/api/upcoming/stats`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[BackendApi] fetchUpcomingStats error:", err.message);
    return null;
  }
}

/**
 * Fetch all agent ratings and review counts from SQLite backend
 * Returns { [agentId]: { average_rating: number, total_reviews: number } }
 */
export async function fetchAllAgentRatings() {
  try {
    const res = await fetch(`${API_BASE}/api/feedback/ratings`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn("[BackendApi] fetchAllAgentRatings error:", err.message);
    return {};
  }
}

