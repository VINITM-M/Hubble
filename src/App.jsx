/**
 * App.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Root application component.
 *
 * Application Flow:
 *   1. IntroFlow  (Hubble.AI SVG animation)
 *   2. IntroFlow  (Story cards carousel)
 *   3. LandingPage (Agent hub discovery)
 *   4. TrackerPage  (/tracker route)
 *   5. AgentUserHistory  (/tracker/usage/:id)
 *   6. DepartmentUserHistory  (/tracker/department/:name)
 *
 * State management:
 *  All filter/search/modal state lives here and is passed down as props.
 *  Groq AI search is triggered here; results flow down to LandingPage.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useMemo, useRef, useState } from "react";

// ── Models ────────────────────────────────────────────────────────────────────
import { initialAgents } from "./models/agents.js";

// ── Algorithms ────────────────────────────────────────────────────────────────
import { parseRoute } from "./algorithms/routeParser.js";
import {
  filterAgents,
  computeAgentRatings,
  getSavedFavorites,
  saveFavorites,
  saveRatingForAgent,
  computeAgentRatings as recomputeRatings,
  computeDepartmentCounts,
  computeToolsCounts,
  computeStatusCounts,
} from "./algorithms/agentFilters.js";

// ── Services ─────────────────────────────────────────────────────────────────
import { searchAgentsWithAI } from "./services/groqService.js";
import {
  getActiveUserEmail,
  setActiveUserEmail,
  clearUserSession,
  registerOrGetUser,
  fetchUserData,
  fetchTrendingSummary,
  toggleSaveCard,
  recordLaunchClick,
  fetchAllAgentRatings,
} from "./services/backendApi.js";

// ── UI – Shared ───────────────────────────────────────────────────────────────
import { LoginModal } from "./ui/shared/LoginModal.jsx";

// ── UI – Intro ────────────────────────────────────────────────────────────────
import { IntroFlow } from "./ui/intro/IntroFlow.jsx";

// ── UI – Landing page ─────────────────────────────────────────────────────────
import { LandingPage } from "./ui/landing/LandingPage.jsx";

// ── UI – Upcoming Previews page ───────────────────────────────────────────────
import { UpcomingAgentsPage } from "./ui/upcoming/UpcomingAgentsPage.jsx";

// ── UI – Stories page ─────────────────────────────────────────────────────────
import { StoriesPage } from "./ui/stories/StoriesPage.jsx";

// ── UI – Tracker pages ────────────────────────────────────────────────────────
import { TrackerPage } from "./ui/tracker/Tracker.jsx";
import { AgentUserHistory } from "./ui/tracker/AgentUserHistory.jsx";
import { DepartmentUserHistory } from "./ui/tracker/DepartmentUserHistory.jsx";

// ── Models ────────────────────────────────────────────────────────────────────
import { agentDataByTimeframe } from "./models/trackerData.js";

// ── Styles ────────────────────────────────────────────────────────────────────
import "./styles/styles.css";

// ─────────────────────────────────────────────────────────────────────────────

export default function App() {
  // ── Intro flow ──────────────────────────────────────────────────────────────
  const [showIntro, setShowIntro] = useState(true);

  // ── Global theme (defaults to crisp light theme #FAFBFB) ─────────────────────
  const isDarkMode = false;
  useEffect(() => {
    try {
      localStorage.removeItem("hubble_dark_mode");
    } catch { }
    document.documentElement.classList.remove("dark-mode");
  }, []);

  // ── Client-side routing ─────────────────────────────────────────────────────
  const [routeState, setRouteState] = useState(() => parseRoute(window.location.pathname));

  const navigate = (to) => {
    window.history.pushState({}, "", to);
    setRouteState(parseRoute(to));
  };

  useEffect(() => {
    const onPopState = () => setRouteState(parseRoute(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    window.addEventListener("hashchange", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("hashchange", onPopState);
    };
  }, []);

  // ── Agent catalog ────────────────────────────────────────────────────────────
  const [agentsList, setAgentsList] = useState(() => computeAgentRatings(initialAgents));
  const [favorites, setFavorites] = useState(() => getSavedFavorites());

  // ── User Identity & Login Modal State (Defaults to Guest) ───────────────────
  const [userEmail, setUserEmail] = useState(() => getActiveUserEmail());
  const [userLaunchClicks, setUserLaunchClicks] = useState({});
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pendingLaunchAgent, setPendingLaunchAgent] = useState(null);

  // ── Sync with FastAPI / SQLite Backend on load or user change ────────────────
  useEffect(() => {
    // 1. Fetch live feedback ratings from SQLite backend (replaces defaults with live averages & review counts)
    fetchAllAgentRatings().then((ratingsMap) => {
      if (ratingsMap) {
        setAgentsList((prev) => recomputeRatings(prev, ratingsMap));
      }
    });

    // 2. If user is logged in, fetch their saved bookmarks and launch counts
    if (userEmail) {
      fetchUserData(userEmail).then((userData) => {
        if (userData?.saved_card_ids && Array.isArray(userData.saved_card_ids)) {
          if (userData.saved_card_ids.length > 0) {
            setFavorites(userData.saved_card_ids);
            saveFavorites(userData.saved_card_ids);
          }
        }
        if (userData?.launch_clicks) {
          setUserLaunchClicks(userData.launch_clicks);
        }
      });
    }

    // 3. Fetch global trending summary from SQLite backend
    fetchTrendingSummary().then((summary) => {
      if (summary?.top_trending_cards && Array.isArray(summary.top_trending_cards)) {
        const trendingIds = new Set(
          summary.top_trending_cards
            .filter((c) => c.is_trending)
            .map((c) => c.card_id)
        );

        if (trendingIds.size > 0) {
          setAgentsList((prev) =>
            prev.map((agent) => ({
              ...agent,
              isTrending: agent.isTrending || trendingIds.has(agent.id),
            }))
          );
        }
      }
    });
  }, [userEmail]);

  // ── Filter state ─────────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [aiMatchedIds, setAiMatchedIds] = useState(null);
  const [aiReason, setAiReason] = useState("");
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [selectedFavFilters, setSelectedFavFilters] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [openPopover, setOpenPopover] = useState(null);
  const [popoverSearch, setPopoverSearch] = useState("");
  const filterBarRef = useRef(null);

  // ── Modal / overlay state ────────────────────────────────────────────────────
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [activeDemo, setActiveDemo] = useState(null);
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [highlightedAgentId, setHighlightedAgentId] = useState(null);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        document.querySelector("#agent-search")?.focus();
      }
      if (e.key === "Escape") {
        setSelectedAgent(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = selectedAgent ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedAgent]);

  // Click-outside to close popover
  useEffect(() => {
    const onMouseDown = (e) => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target)) {
        setOpenPopover(null);
        setPopoverSearch("");
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") { setOpenPopover(null); setPopoverSearch(""); }
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // ── Computed filter stats ─────────────────────────────────────────────────────
  const departmentCounts = useMemo(() => computeDepartmentCounts(agentsList), [agentsList]);
  const toolsCounts = useMemo(() => computeToolsCounts(agentsList), [agentsList]);
  const statusCounts = useMemo(() => computeStatusCounts(agentsList), [agentsList]);
  const trendingCount = useMemo(() => agentsList.filter((a) => Boolean(a.isTrending)).length, [agentsList]);

  // ── Filtered agent list ───────────────────────────────────────────────────────
  const isFavoritesFilterActive = selectedFavFilters.includes("favorites");
  const sortedAndFilteredAgents = useMemo(
    () =>
      filterAgents(agentsList, {
        selectedFavFilters,
        favorites,
        selectedDepartments,
        selectedTools,
        selectedStatuses,
        query,
        aiMatchedIds,
      }),
    [
      agentsList,
      isFavoritesFilterActive ? favorites : null,
      selectedFavFilters,
      selectedDepartments,
      selectedTools,
      selectedStatuses,
      query,
      aiMatchedIds,
    ],
  );

  const hasActiveFilters =
    selectedFavFilters.length > 0 ||
    selectedDepartments.length > 0 ||
    selectedTools.length > 0 ||
    selectedStatuses.length > 0 ||
    Boolean(query);

  const isAllAgentsActive = !hasActiveFilters;

  // ── Groq AI semantic search ───────────────────────────────────────────────────
  const performAiSearch = async (searchTerm) => {
    if (!searchTerm?.trim()) {
      setAiMatchedIds(null);
      setAiReason("");
      setIsAiSearching(false);
      return;
    }
    setIsAiSearching(true);
    try {
      const result = await searchAgentsWithAI(searchTerm, agentsList);
      if (Array.isArray(result?.matchedIds)) {
        setAiMatchedIds(result.matchedIds);
        setAiReason(result.summary || "");
      } else {
        setAiMatchedIds(null);
        setAiReason("");
      }
    } catch (err) {
      console.error("AI search failed:", err);
      setAiMatchedIds(null);
      setAiReason("");
    } finally {
      setIsAiSearching(false);
    }
  };

  // Debounced search trigger on query change
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setAiMatchedIds(null);
      setAiReason("");
      setIsAiSearching(false);
      return;
    }
    const timer = setTimeout(() => performAiSearch(trimmed), 450);
    return () => clearTimeout(timer);
  }, [query]);

  // ── Handler functions ─────────────────────────────────────────────────────────
  const clearSearch = () => {
    setQuery("");
    setAiMatchedIds(null);
    setAiReason("");
    setIsAiSearching(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) performAiSearch(query.trim());
  };

  const handleResetFilters = () => {
    setSelectedFavFilters([]);
    setSelectedDepartments([]);
    setSelectedTools([]);
    setSelectedStatuses([]);
    setQuery("");
    setAiMatchedIds(null);
    setAiReason("");
    setOpenPopover(null);
    setPopoverSearch("");
  };

  const toggleDepartment = (deptName) => {
    if (deptName === "__clear__") { setSelectedDepartments([]); return; }
    setSelectedDepartments((prev) =>
      prev.includes(deptName) ? prev.filter((d) => d !== deptName) : [...prev, deptName],
    );
  };

  const toggleTool = (toolType) => {
    if (toolType === "__clear__") { setSelectedTools([]); return; }
    setSelectedTools((prev) =>
      prev.includes(toolType) ? prev.filter((t) => t !== toolType) : [...prev, toolType],
    );
  };

  const toggleStatus = (statusId) => {
    if (statusId === "__clear__") { setSelectedStatuses([]); return; }
    setSelectedStatuses((prev) =>
      prev.includes(statusId) ? prev.filter((s) => s !== statusId) : [...prev, statusId],
    );
  };

  const toggleFavorite = (agentId) => {
    if (!userEmail) {
      setIsLoginModalOpen(true);
      return;
    }
    setFavorites((prev) => {
      const willBeSaved = !prev.includes(agentId);
      const next = willBeSaved ? [...prev, agentId] : prev.filter((id) => id !== agentId);
      saveFavorites(next);
      // Persist to SQLite backend
      toggleSaveCard(userEmail, agentId, willBeSaved);
      return next;
    });
  };

  const proceedWithLaunch = (agent, clicksMap, email) => {
    const currentClicks = (clicksMap && clicksMap[agent.id]) || 0;
    const nextClicks = currentClicks + 1;

    // Update local click count
    setUserLaunchClicks((prev) => ({ ...prev, [agent.id]: nextClicks }));
    // Persist launch count to SQLite backend
    recordLaunchClick(email, agent.id, "agent");

    // Only trigger feedback modal if the user has launched this agent MORE THAN TWICE (i.e. 2 or more prior launches)
    if (currentClicks >= 2) {
      setFeedbackModal({ agent });
    } else {
      // 1st or 2nd time: directly launch agent in new tab!
      window.open(agent.primary.url, "_blank", "noreferrer");
    }
  };

  const handleLaunchAgent = (agentId) => {
    const agent = agentsList.find((a) => a.id === agentId);
    if (!agent || agent.primary?.status !== "Available") return;

    // 1. If user is guest (not logged in), prompt simple Login modal first
    if (!userEmail) {
      setPendingLaunchAgent(agent);
      setIsLoginModalOpen(true);
      return;
    }

    // 2. User is logged in -> proceed with launch logic based on launch counts
    proceedWithLaunch(agent, userLaunchClicks, userEmail);
  };

  const handleLoginSuccess = async (email) => {
    setActiveUserEmail(email);
    setUserEmail(email);
    setIsLoginModalOpen(false);

    // Register user in backend SQLite
    await registerOrGetUser(email);

    // Replicate previous bookmarks & launch counts from SQLite backend
    let latestClicks = {};
    try {
      const userData = await fetchUserData(email);
      if (userData) {
        if (Array.isArray(userData.saved_card_ids) && userData.saved_card_ids.length > 0) {
          setFavorites(userData.saved_card_ids);
          saveFavorites(userData.saved_card_ids);
        }
        if (userData.launch_clicks) {
          latestClicks = userData.launch_clicks;
          setUserLaunchClicks(userData.launch_clicks);
        }
      }
    } catch (err) {
      console.warn("Could not retrieve user data:", err);
    }

    // Automatically trigger launch if an agent card was pending
    if (pendingLaunchAgent) {
      const agentToLaunch = pendingLaunchAgent;
      setPendingLaunchAgent(null);
      proceedWithLaunch(agentToLaunch, latestClicks, email);
    }
  };

  const handleLogout = () => {
    clearUserSession();
    setUserEmail(null);
    setUserLaunchClicks({});
    setFavorites([]);
  };

  const handleOpenDemo = (agent) => {
    setActiveDemo({ videoUrl: agent.video || "", title: agent.name });
  };

  const handleSubmitRating = (agentId, ratingValue, userEmail, reviewText, backendStats = null) => {
    saveRatingForAgent(agentId, {
      email: userEmail || "user@aurigene.com",
      rating: Number(ratingValue),
      review: reviewText || "",
      timestamp: Date.now(),
    });

    let updatedStats = null;
    setAgentsList((prev) => {
      if (backendStats && backendStats.rating !== undefined) {
        const finalR = Number(backendStats.rating) || 0;
        const finalC = Number(backendStats.reviews) || 0;
        updatedStats = { rating: finalR, reviews: finalC };
        return prev.map((a) =>
          a.id === agentId
            ? {
                ...a,
                rating: finalR,
                reviews: finalC,
                isTopRated: finalR >= 4.5 && finalC > 0,
              }
            : a
        );
      }
      const computed = recomputeRatings(prev);
      const target = computed.find((a) => a.id === agentId);
      if (target) updatedStats = { rating: target.rating, reviews: target.reviews };
      return computed;
    });
    return updatedStats;
  };

  const handleLocateAgent = (agentId) => {
    // Clear any search / filters that might hide the agent card
    if (query) { setQuery(""); setAiMatchedIds(null); setAiReason(""); }
    if (selectedDepartments.length) setSelectedDepartments([]);
    if (selectedTools.length) setSelectedTools([]);
    if (selectedStatuses.length) setSelectedStatuses([]);

    setHighlightedAgentId(agentId);

    setTimeout(() => {
      document.getElementById(`agent-card-${agentId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);

    setTimeout(() => setHighlightedAgentId(null), 4500);
  };

  // ── Routing ───────────────────────────────────────────────────────────────────
  const { route, agentId, deptName } = routeState;

  if (route === "/tracker/department") {
    return (
      <DepartmentUserHistory
        departmentName={deptName || "Department"}
        onBack={() => navigate("/tracker")}
        onNavigateHome={() => navigate("/")}
      />
    );
  }

  if (route === "/tracker/usage") {
    const rawName = agentId || "Agent-Wise";
    const isGeneric =
      rawName.toLowerCase().includes("agetn") ||
      rawName.toLowerCase().includes("agent-wise") ||
      rawName.toLowerCase().includes("agent wise");
    const displayAgentName = isGeneric ? "Agent-Wise Usage Breakdown" : rawName;
    const agentData = agentDataByTimeframe.find(
      (a) => a.id.toLowerCase() === rawName.toLowerCase() || a.agentName.toLowerCase() === rawName.toLowerCase(),
    );
    return (
      <AgentUserHistory
        agent={agentData || { id: rawName, agentName: displayAgentName, department: "AI Agent Telemetry" }}
        onBack={() => navigate("/tracker")}
        onNavigateHome={() => navigate("/")}
      />
    );
  }

  if (route === "/tracker") {
    return <TrackerPage onNavigate={navigate} />;
  }

  if (route === "/upcoming") {
    return (
      <>
        <UpcomingAgentsPage
          onNavigate={navigate}
          isDarkMode={isDarkMode}
          userEmail={userEmail}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
        />
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => {
            setIsLoginModalOpen(false);
            setPendingLaunchAgent(null);
          }}
          onLoginSuccess={handleLoginSuccess}
          pendingAgentName={pendingLaunchAgent?.name}
        />
      </>
    );
  }

  if (route === "/stories") {
    return (
      <StoriesPage
        onLaunchPortal={() => navigate("/")}
        onNavigate={navigate}
        isDarkMode={isDarkMode}
        userEmail={userEmail}
      />
    );
  }

  // ── Default: Landing Page ─────────────────────────────────────────────────────
  return (
    <>
      {showIntro && <IntroFlow onComplete={() => setShowIntro(false)} onNavigate={navigate} />}

      <LandingPage
        isDarkMode={isDarkMode}
        // user profile
        userEmail={userEmail}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        // data
        agentsList={agentsList}
        sortedAndFilteredAgents={sortedAndFilteredAgents}
        favorites={favorites}
        trendingCount={trendingCount}
        // search
        query={query}
        setQuery={setQuery}
        isAiSearching={isAiSearching}
        aiMatchedIds={aiMatchedIds}
        aiReason={aiReason}
        handleSearchSubmit={handleSearchSubmit}
        clearSearch={clearSearch}
        // filters
        selectedFavFilters={selectedFavFilters}
        setSelectedFavFilters={setSelectedFavFilters}
        selectedDepartments={selectedDepartments}
        selectedTools={selectedTools}
        setSelectedTools={setSelectedTools}
        selectedStatuses={selectedStatuses}
        openPopover={openPopover}
        setOpenPopover={setOpenPopover}
        popoverSearch={popoverSearch}
        setPopoverSearch={setPopoverSearch}
        filterBarRef={filterBarRef}
        departmentCounts={departmentCounts}
        toolsCounts={toolsCounts}
        statusCounts={statusCounts}
        hasActiveFilters={hasActiveFilters}
        isAllAgentsActive={isAllAgentsActive}
        // filter togglers
        handleResetFilters={handleResetFilters}
        toggleDepartment={toggleDepartment}
        toggleTool={toggleTool}
        toggleStatus={toggleStatus}
        // agent actions
        handleLaunchAgent={handleLaunchAgent}
        handleOpenDemo={handleOpenDemo}
        highlightedAgentId={highlightedAgentId}
        handleLocateAgent={handleLocateAgent}
        toggleFavorite={toggleFavorite}
        handleSubmitRating={handleSubmitRating}
        navigate={navigate}
        // modals
        selectedAgent={selectedAgent}
        setSelectedAgent={setSelectedAgent}
        activeDemo={activeDemo}
        setActiveDemo={setActiveDemo}
        feedbackModal={feedbackModal}
        setFeedbackModal={setFeedbackModal}
        userEmail={userEmail}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setPendingLaunchAgent(null);
        }}
        onLoginSuccess={handleLoginSuccess}
        pendingAgentName={pendingLaunchAgent?.name}
      />
    </>
  );
}
