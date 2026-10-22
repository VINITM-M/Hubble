/**
 * ui/landing/LandingPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Main landing page: header nav, discovery hero, filter bar, agent grid,
 * details drawer, feedback modal, video modal, and floating chatbot.
 *
 * Receives all state and handlers from the parent App component via props.
 * This component is pure UI — no Groq calls directly.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);
import {
  Activity,
  BarChart3,
  Bookmark,
  Building2,
  Check,
  ChevronDown,
  Compass,
  Cpu,
  CreditCard,
  FileText,
  Folder,
  Home,
  LayoutGrid,
  Layers,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";

import hubblePngLogo from "../../assets/hubble.png";
import aiHubbleLogo from "../../assets/ai_hubble_logo.png";
import { AgentCard } from "./AgentCard.jsx";
import { DetailsDrawer } from "./DetailsDrawer.jsx";
import { FeedbackModal } from "./FeedbackModal.jsx";
import { VideoModal } from "../shared/VideoModal.jsx";
import { Chatbot } from "../chatbot/Chatbot.jsx";



export function LandingPage({
  // agent data
  agentsList,
  sortedAndFilteredAgents,
  favorites,
  trendingCount,
  // filter state
  query,
  setQuery,
  isAiSearching,
  aiMatchedIds,
  aiReason,
  selectedFavFilters,
  setSelectedFavFilters,
  selectedDepartments,
  selectedTools,
  selectedStatuses,
  openPopover,
  setOpenPopover,
  popoverSearch,
  setPopoverSearch,
  filterBarRef,
  departmentCounts,
  toolsCounts,
  statusCounts,
  hasActiveFilters,
  isAllAgentsActive,
  // handlers
  handleResetFilters,
  handleSearchSubmit,
  clearSearch,
  toggleDepartment,
  toggleTool,
  toggleStatus,
  handleLaunchAgent,
  handleOpenDemo,
  highlightedAgentId,
  handleLocateAgent,
  toggleFavorite,
  handleSubmitRating,
  navigate,
  // modals
  selectedAgent,
  setSelectedAgent,
  activeDemo,
  setActiveDemo,
  feedbackModal,
  setFeedbackModal,
  isDarkMode = false,
}) {
  const containerRef = useRef(null);
  const headlineRef = useRef(null);
  const subtitleRef = useRef(null);

  // ── Hero text animations (runs once on mount) ──
  useGSAP(() => {
    const headline = headlineRef.current;
    const subtitle = subtitleRef.current;
    if (!headline || !subtitle) return;

    let splitH = null;
    let splitS = null;
    let cancelled = false;

    const runAnimations = () => {
      if (cancelled) return;

      try {
        // 1. HEADLINE: Horizontal character-by-character slide in (slowed to 2s)
        splitH = new SplitText(headline, { type: "chars,words" });
        if (splitH.chars.length) {
          gsap.fromTo(
            splitH.chars,
            { opacity: 0, x: -20 },
            {
              opacity: 1,
              x: 0,
              stagger: 0.080,
              duration: 4.0,
              ease: "power2.out",
            }
          );
        }
      } catch {
        // If SplitText fails, just fade in the whole headline
        gsap.fromTo(headline, { opacity: 0 }, { opacity: 1, duration: 4.0 });
      }

      try {
        // 2. SUBTITLE: Fade + slide up line-by-line (slowed to 2s)
        splitS = new SplitText(subtitle, { type: "lines" });
        if (splitS.lines.length) {
          gsap.fromTo(
            splitS.lines,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              stagger: 0.45,
              duration: 4.0,
              ease: "power2.out",
              delay: 0.5,
            }
          );
        }
      } catch {
        gsap.fromTo(subtitle, { opacity: 0 }, { opacity: 1, duration: 4.0, delay: 0.5 });
      }
    };

    // Double rAF after fonts ready — guarantees layout is fully painted
    document.fonts.ready.then(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => runAnimations());
      });
    });

    return () => {
      cancelled = true;
      try { if (splitH) splitH.revert(); } catch { }
      try { if (splitS) splitS.revert(); } catch { }
    };
  }, []);

  // Stable key of visible agent IDs to prevent re-triggering entrance animation on favorite toggle
  const agentIdsKey = useMemo(
    () => sortedAndFilteredAgents.map((a) => a.id).join(","),
    [sortedAndFilteredAgents]
  );

  useGSAP(
    () => {
      const cards = gsap.utils.toArray(".agent-card");
      if (!cards.length) return;

      // Group cards into rows based on responsive column layout
      const cols = window.innerWidth <= 768 ? 1 : window.innerWidth <= 1180 ? 2 : 3;
      const rows = [];
      for (let i = 0; i < cards.length; i += cols) {
        rows.push(cards.slice(i, i + cols));
      }

      rows.forEach((rowCards, rowIndex) => {
        const isFirstRow = rowIndex === 0;

        const tl = gsap.timeline(
          isFirstRow
            ? { delay: 0.1 }
            : {
              scrollTrigger: {
                trigger: rowCards[0],
                start: "top 90%",
                toggleActions: "play none none none",
              },
            }
        );

        // Animate cards in with safe opacity + y (NO clipPath to avoid blank screen)
        tl.from(rowCards, {
          opacity: 0,
          y: 40,
          stagger: 0.15,
          duration: 2.0,
          ease: "power2.out",
          clearProps: "transform",
        });
      });
    },
    { scope: containerRef, dependencies: [agentIdsKey] }
  );

  return (
    <div className={`app-shell${isDarkMode ? " app-shell--dark" : ""}`}>
      {/* ─────────────────────────────── Header ──────────────────────────── */}
      <header className="header">
        <div className="header-left">
          <div className="navbar-left-logo-wrap">
            <img
              src={aiHubbleLogo}
              alt="Hubble AI Logo"
              className="navbar-ai-hubble-logo"
            />
          </div>
        </div>

        <div className="header-center">
          <div
            className="brand-logo-container"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img src={hubblePngLogo} alt="HUBBLE.AI" className="brand-logo-img" />
            <span className="brand-title">HUBBLE<span className="brand-title-suffix">.AI</span></span>
          </div>
        </div>

        <div className="header-right">
          <nav className="header-nav-links" aria-label="Main Navigation">
            <button
              type="button"
              className="nav-tab active"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                navigate("/");
              }}
            >
              <Home size={17} />
              <span>Catalog Hub</span>
            </button>
            <button
              type="button"
              className="nav-tab nav-tab-upcoming"
              onClick={() => navigate("/upcoming")}
              title="Explore Next-Gen Upcoming Agents, Roadmaps, and System Prompts"
            >
              <span>Upcoming Agents</span>
            </button>
          </nav>

          <div className="header-actions">
            <div className="user-avatar-pill" title="user@aurigene.com">
              <div className="avatar-circle">U</div>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* ────────────────────────── Discovery Hero ───────────────────── */}
        <section className="discovery-hero">
          {/* kicker pill removed per request */}
          <h1 ref={headlineRef} className="discovery-headline">
            Discover AI Agents for{" "}
            <span className="highlight-text" style={{ color: "#0a58ca" }}>Every Need from the Hub</span>
          </h1>
          <p ref={subtitleRef} className="discovery-subtitle">
            Automate work, accelerate research, and unlock productivity with specialized AI agents.
          </p>
        </section>

        {/* ─────────────────────── Directory + Filters ─────────────────── */}
        <section className="directory" id="agents" ref={containerRef}>

          {/* Row 1: Search + Dropdowns */}
          <div className="discovery-controls-top" ref={filterBarRef}>
            <form className="discovery-search-box" onSubmit={handleSearchSubmit}>
              <Search size={18} className="search-icon-left" />
              <input
                id="agent-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search agents by task or question (e.g. 'I want to perform antibody analysis', 'Peptide synthesis', 'ELISA screening')..."
                aria-label="Search agents, capabilities, departments"
              />
              {isAiSearching && (
                <div className="ai-search-indicator" title="Groq AI analyzing user intent...">
                  <span className="ai-searching-spinner" />
                  <span>AI</span>
                </div>
              )}
              {query && (
                <button type="button" className="search-clear-btn" onClick={clearSearch} aria-label="Clear search">
                  <X size={15} />
                </button>
              )}
            </form>

            {/* Dropdown filters */}
            <div className="discovery-dropdowns-bar">
              {/* Department dropdown */}
              <DropdownFilter
                id="dept"
                label="Department"
                icon={<Building2 size={15} className="dropdown-left-icon" />}
                count={selectedDepartments.length}
                isOpen={openPopover === "dept"}
                onToggle={() => { setOpenPopover(openPopover === "dept" ? null : "dept"); setPopoverSearch(""); }}
              >
                <div className="popover-search-wrap">
                  <Search size={13} className="popover-search-icon" />
                  <input
                    type="text"
                    placeholder="Search Department..."
                    value={popoverSearch}
                    onChange={(e) => setPopoverSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="popover-list">
                  {departmentCounts
                    .filter((d) => d.name.toLowerCase().includes(popoverSearch.toLowerCase().trim()))
                    .map((item) => {
                      const isChecked = selectedDepartments.includes(item.name);
                      return (
                        <div key={item.name} className={`popover-item ${isChecked ? "checked" : ""}`} onClick={() => toggleDepartment(item.name)}>
                          <div className={`popover-checkbox ${isChecked ? "checked" : ""}`}>{isChecked && <Check size={11} strokeWidth={3} />}</div>
                          <span className="popover-label" title={item.name}>{item.name}</span>
                          <span className="popover-count">{item.count}</span>
                        </div>
                      );
                    })}
                </div>
                <div className="popover-footer">
                  <button type="button" className="popover-clear-btn" onClick={() => toggleDepartment("__clear__")}>Clear filters</button>
                </div>
              </DropdownFilter>

              {/* Tools dropdown */}
              <DropdownFilter
                id="tools"
                label="Tools"
                icon={<Wrench size={15} className="dropdown-left-icon" />}
                count={selectedTools.length}
                isOpen={openPopover === "tools"}
                onToggle={() => { setOpenPopover(openPopover === "tools" ? null : "tools"); setPopoverSearch(""); }}
              >
                <div className="popover-search-wrap">
                  <Search size={13} className="popover-search-icon" />
                  <input type="text" placeholder="Search Tools..." value={popoverSearch} onChange={(e) => setPopoverSearch(e.target.value)} autoFocus />
                </div>
                <div className="popover-list">
                  {[
                    { id: "application", label: "Applications", count: toolsCounts.applications, icon: <Layers size={13} /> },
                    { id: "agent", label: "Agents", count: toolsCounts.agents, icon: <Cpu size={13} /> },
                  ]
                    .filter((t) => t.label.toLowerCase().includes(popoverSearch.toLowerCase().trim()))
                    .map((item) => {
                      const isChecked = selectedTools.includes(item.id);
                      return (
                        <div key={item.id} className={`popover-item ${isChecked ? "checked" : ""}`} onClick={() => toggleTool(item.id)}>
                          <div className={`popover-checkbox ${isChecked ? "checked" : ""}`}>{isChecked && <Check size={11} strokeWidth={3} />}</div>
                          <span className="popover-item-icon">{item.icon}</span>
                          <span className="popover-label">{item.label}</span>
                          <span className="popover-count">{item.count}</span>
                        </div>
                      );
                    })}
                </div>
                <div className="popover-footer">
                  <button type="button" className="popover-clear-btn" onClick={() => toggleTool("__clear__")}>Clear filters</button>
                </div>
              </DropdownFilter>


              {/* All Categories dropdown */}
              <DropdownFilter
                id="favorites"
                label="All Categories"
                icon={<LayoutGrid size={15} className="dropdown-left-icon" />}
                count={selectedFavFilters.length}
                isOpen={openPopover === "favorites"}
                onToggle={() => { setOpenPopover(openPopover === "favorites" ? null : "favorites"); setPopoverSearch(""); }}
              >
                <div className="popover-list">
                  {[
                    { id: "favorites", label: "Favorites", count: favorites.length, icon: <Bookmark size={13} fill={favorites.length > 0 ? "#d97706" : "none"} color="#d97706" strokeWidth={2} /> },
                    { id: "trending", label: "Trending", count: trendingCount, icon: null },
                  ].map((item) => {
                    const isChecked = selectedFavFilters.includes(item.id);
                    return (
                      <div key={item.id} className={`popover-item ${isChecked ? "checked" : ""}`}
                        onClick={() => setSelectedFavFilters((prev) => prev.includes(item.id) ? prev.filter((x) => x !== item.id) : [...prev, item.id])}>
                        <div className={`popover-checkbox ${isChecked ? "checked" : ""}`}>{isChecked && <Check size={11} strokeWidth={3} />}</div>
                        <span className="popover-item-icon">{item.icon}</span>
                        <span className="popover-label">{item.label}</span>
                        <span className="popover-count">{item.count}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="popover-footer">
                  <button type="button" className="popover-clear-btn" onClick={() => setSelectedFavFilters([])}>Clear filters</button>
                </div>
              </DropdownFilter>
            </div>
          </div>

          {/* Clear Filters link */}
          <div className="discovery-clear-filters-row">
            <button type="button" className="clear-filters-link" onClick={handleResetFilters}>
              <RotateCcw size={14} /><span>Clear Filters</span>
            </button>
          </div>


          {/* AI Recommendation bar */}
          {Array.isArray(aiMatchedIds) && query && (
            <div className="ai-recommendation-bar">
              <div className="ai-rec-info">
                <Sparkles size={16} className="ai-sparkle-icon" />
                <div>
                  <div>
                    <strong>Groq AI Recommendation:</strong>
                    <span>
                      {" "}Found {sortedAndFilteredAgents.length} matching agent
                      {sortedAndFilteredAgents.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  {aiReason && <div className="ai-rec-reason">{aiReason}</div>}
                </div>
              </div>
              <button type="button" className="ai-rec-clear" onClick={clearSearch}>Show All Agents</button>
            </div>
          )}

          {/* Agent grid / empty states */}
          {sortedAndFilteredAgents.length ? (
            <div className="agent-grid">
              {sortedAndFilteredAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onLaunch={handleLaunchAgent}
                  onOpenDemo={handleOpenDemo}
                  onOpenDetails={() => setSelectedAgent(agent)}
                  isHighlighted={highlightedAgentId === agent.id}
                  isFavorited={favorites.includes(agent.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          ) : selectedFavFilters.includes("favorites") && favorites.length === 0 ? (
            <div className="empty-state">
              <Bookmark size={28} color="#d97706" fill="rgba(217, 119, 6, 0.2)" strokeWidth={2} />
              <h3>No saved favorites yet</h3>
              <p>Click the save bookmark icon on any agent card to add it to your favorites list.</p>
              <button type="button" className="popover-clear-btn" style={{ marginTop: 14, padding: "7px 16px", borderRadius: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: "#cbd5e1", cursor: "pointer" }} onClick={() => setSelectedFavFilters([])}>
                Show All Agents
              </button>
            </div>
          ) : (
            <div className="empty-state">
              <Zap size={22} />
              <h3>No agents found</h3>
              <p>Try a different capability, provider, or agent name.</p>
            </div>
          )}
        </section>
      </main>

      {/* ─────────────────────────────── Footer ──────────────────────── */}
      <footer className="footer" id="support">
        <span>© 2026 Aurigene Pharmaceutical Services Limited. All rights reserved.</span>
        <div>
          <a href="#">Privacy Policy</a>
          <i /> <a href="#">Terms of Use</a>
          <i /> <a href="#">Help &amp; Support</a>
        </div>
      </footer>

      {/* ─────────────────────── Overlays & Modals ───────────────────── */}
      <DetailsDrawer
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
        onLaunch={handleLaunchAgent}
        onOpenDemo={handleOpenDemo}
        isFavorited={selectedAgent ? favorites.includes(selectedAgent.id) : false}
        onToggleFavorite={toggleFavorite}
      />

      <VideoModal
        isOpen={Boolean(activeDemo)}
        videoUrl={activeDemo?.videoUrl}
        title={activeDemo?.title}
        onClose={() => setActiveDemo(null)}
      />

      {feedbackModal && (
        <FeedbackModal
          agent={feedbackModal.agent}
          onClose={() => setFeedbackModal(null)}
          onSubmitRating={handleSubmitRating}
        />
      )}

      <Chatbot
        agentsList={agentsList}
        onLocateAgent={handleLocateAgent}
        onLaunchAgent={handleLaunchAgent}
      />
    </div>
  );
}

// ── Internal helper: generic dropdown filter wrapper ──────────────────────────
function DropdownFilter({ id, label, icon, count, isOpen, onToggle, children }) {
  return (
    <div className="faceted-filter-wrapper">
      <button
        type="button"
        className={`discovery-dropdown-btn ${count > 0 ? "has-selection" : ""} ${isOpen ? "open" : ""}`}
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        {icon}
        <span>{label}</span>
        {count > 0 && <span className="filter-count-badge">{count}</span>}
        <ChevronDown size={14} className={`dropdown-chevron ${isOpen ? "rotated" : ""}`} />
      </button>
      {isOpen && (
        <div className="faceted-popover" role="dialog" aria-label={`${label} filter`}>
          {children}
        </div>
      )}
    </div>
  );
}
