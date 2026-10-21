/**
 * algorithms/routeParser.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Lightweight client-side router — parses window.location.pathname into a
 * structured route object consumed by the App component.
 *
 * Supported routes:
 *   /                           → { route: "/" }
 *   /tracker                    → { route: "/tracker" }
 *   /tracker/usage/:agentId     → { route: "/tracker/usage", agentId }
 *   /tracker/department/:name   → { route: "/tracker/department", deptName }
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * @param {string} pathname – e.g. window.location.pathname
 * @returns {{ route: string, agentId: string|null, deptName: string|null }}
 */
export function parseRoute(pathname) {
  const lower = pathname.toLowerCase();

  if (lower.startsWith("/tracker/usage")) {
    const rawAgent  = pathname.slice("/tracker/usage".length).replace(/^\/+/, "");
    const decoded   = rawAgent ? decodeURIComponent(rawAgent) : "Agent-Wise Usage";
    return { route: "/tracker/usage", agentId: decoded, deptName: null };
  }

  if (lower.startsWith("/tracker/department")) {
    const rawDept = pathname.slice("/tracker/department".length).replace(/^\/+/, "");
    const decoded = rawDept ? decodeURIComponent(rawDept) : "All Departments";
    return { route: "/tracker/department", agentId: null, deptName: decoded };
  }

  if (lower.startsWith("/tracker")) {
    return { route: "/tracker", agentId: null, deptName: null };
  }

  if (lower.startsWith("/stories") || lower.startsWith("/story")) {
    return { route: "/stories", agentId: null, deptName: null };
  }

  if (lower.startsWith("/upcoming") || lower.startsWith("/preview-agents") || lower.startsWith("/preview")) {
    return { route: "/upcoming", agentId: null, deptName: null };
  }

  return { route: "/", agentId: null, deptName: null };
}
