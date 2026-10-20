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

import React from "react";
import {
  Activity,
  BarChart3,
  Building2,
  Check,
  ChevronDown,
  Compass,
  Cpu,
  CreditCard,
  FileText,
  Flame,
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
import aiHubbleLogo   from "../../assets/ai_hubble_logo.png";
import { AgentCard }      from "./AgentCard.jsx";
import { DetailsDrawer }  from "./DetailsDrawer.jsx";
import { FeedbackModal }  from "./FeedbackModal.jsx";
import { VideoModal }     from "../shared/VideoModal.jsx";
import { Chatbot }        from "../chatbot/Chatbot.jsx";

// ── Department quick-filter chip definitions ───────────────────────────────
const DEPT_CHIPS = [
  { name: "Project Management", icon: Folder },
  { name: "Research & Analysis", icon: FileText },
  { name: "Business Ops",        icon: BarChart3 },
  { name: "Engineering",         icon: Wrench },
  { name: "Marketing",           icon: Compass },
  { name: "HR",                  icon: Users },
  { name: "Finance",             icon: CreditCard },
];

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
  isDarkMode,
  setIsDarkMode,
}) {
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
              <Sparkles size={16} className="sparkle-amber" />
              <span>Upcoming Agents</span>
            </button>
          </nav>

          <div className="header-actions">
            {/* ── Theme Toggle ── */}
            <button
              type="button"
              className={`theme-toggle-btn${isDarkMode ? " dark" : ""}`}
              onClick={() => setIsDarkMode((v) => !v)}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
            >
              <span className="theme-toggle-track">
                <span className="theme-toggle-thumb" />
              </span>
              <span className="theme-toggle-label">
                {isDarkMode ? "🌙 Dark" : "☀️ Light"}
              </span>
            </button>

            <div className="user-avatar-pill" title="user@aurigene.com">
              <div className="avatar-circle">U</div>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* ────────────────────────── Discovery Hero ───────────────────── */}
        <section className="discovery-hero">
          <div className="discovery-kicker">
            <span className="kicker-pill">{sortedAndFilteredAgents.length} AGENTS</span>
          </div>
          <h1 className="discovery-headline">
            Discover AI Agents for{" "}
            <span className="highlight-text">Every Need from the Hub</span>
          </h1>
          <p className="discovery-subtitle">
            Automate work, accelerate research, and unlock productivity with specialized AI agents.
          </p>
        </section>

        {/* ─────────────────────── Directory + Filters ─────────────────── */}
        <section className="directory" id="agents">

          {/* Row 1: Search + Dropdowns */}
          <div className="discovery-controls-top" ref={filterBarRef}>
            <form className="discovery-search-box" onSubmit={handleSearchSubmit}>
              <Search size={18} className="search-icon-left" />
              <input
                id="agent-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search agents, capabilities, departments (e.g. 'research paper for bio', 'data analysis')..."
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
                    { id: "agent",       label: "Agents",       count: toolsCounts.agents,       icon: <Cpu size={13} />   },
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

              {/* Status dropdown */}
              <DropdownFilter
                id="status"
                label="Status"
                icon={<Activity size={15} className="dropdown-left-icon" />}
                count={selectedStatuses.length}
                isOpen={openPopover === "status"}
                onToggle={() => { setOpenPopover(openPopover === "status" ? null : "status"); setPopoverSearch(""); }}
              >
                <div className="popover-list">
                  {[
                    { id: "available",   label: "Available",   count: statusCounts.available,   dotClass: "available" },
                    { id: "coming-soon", label: "Coming Soon", count: statusCounts.comingSoon,  dotClass: "coming-soon" },
                    { id: "tbd",         label: "TBD",         count: statusCounts.tbd,         dotClass: "tbd" },
                  ].map((item) => {
                    const isChecked = selectedStatuses.includes(item.id);
                    return (
                      <div key={item.id} className={`popover-item ${isChecked ? "checked" : ""}`} onClick={() => toggleStatus(item.id)}>
                        <div className={`popover-checkbox ${isChecked ? "checked" : ""}`}>{isChecked && <Check size={11} strokeWidth={3} />}</div>
                        <span className="popover-item-icon"><span className={`status-dot status-dot-${item.dotClass}`} /></span>
                        <span className="popover-label">{item.label}</span>
                        <span className="popover-count">{item.count}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="popover-footer">
                  <button type="button" className="popover-clear-btn" onClick={() => toggleStatus("__clear__")}>Clear filters</button>
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
                    { id: "favorites", label: "Saved Favorites", count: favorites.length,  icon: <Star size={13} fill={favorites.length > 0 ? "#f59e0b" : "none"} color="#f59e0b" /> },
                    { id: "trending",  label: "Trending / Hot",  count: trendingCount,     icon: <Flame size={13} className="hot-flame-icon" /> },
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

          {/* Row 2: Quick filter chips */}
          <div className="discovery-quick-filters">
            <div className="quick-filter-chips">
              <button
                type="button"
                className={`chip-btn all-agents-chip ${isAllAgentsActive ? "active" : ""}`}
                onClick={handleResetFilters}
              >
                <LayoutGrid size={14} />
                <span>All Agents ({agentsList.length})</span>
              </button>

              <button
                type="button"
                className={`chip-btn ${selectedFavFilters.includes("favorites") ? "active" : ""}`}
                onClick={() =>
                  setSelectedFavFilters((prev) =>
                    prev.includes("favorites") ? prev.filter((x) => x !== "favorites") : [...prev, "favorites"],
                  )
                }
              >
                <Star size={14} fill={selectedFavFilters.includes("favorites") ? "#f59e0b" : "none"} color={selectedFavFilters.includes("favorites") ? "#f59e0b" : "currentColor"} />
                <span>Favorites</span>
              </button>

              {DEPT_CHIPS.map(({ name, icon: ChipIcon }) => {
                const isSelected = selectedDepartments.includes(name);
                return (
                  <button key={name} type="button" className={`chip-btn ${isSelected ? "active" : ""}`} onClick={() => toggleDepartment(name)}>
                    <ChipIcon size={14} />
                    <span>{name}</span>
                  </button>
                );
              })}
            </div>

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
              <Star size={28} color="#f59e0b" fill="rgba(245, 158, 11, 0.2)" />
              <h3>No saved favorites yet</h3>
              <p>Click the ★ star icon on any agent card to save it to your personal favorites list.</p>
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
