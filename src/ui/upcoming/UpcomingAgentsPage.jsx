/**
 * ui/upcoming/UpcomingAgentsPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Next-Gen AI Agents & Prototype Previews Lab.
 * Shows future roadmap agents, real-time development milestones, and
 * transparent system prompts & cognitive algorithms for each upcoming agent.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Code2,
  Copy,
  Cpu,
  ExternalLink,
  Flame,
  Home,
  Layers,
  PlusCircle,
  Search,
  Send,
  Sparkles,
  Terminal,
  ThumbsUp,
  X,
  Zap,
} from "lucide-react";

import hubblePngLogo from "../../assets/hubble.png";
import aiHubbleLogo   from "../../assets/ai_hubble_logo.png";
import { UPCOMING_AGENTS } from "../../models/upcomingAgents.js";

export function UpcomingAgentsPage({ onNavigate, isDarkMode = false, setIsDarkMode }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Expanded prompt tabs: { [agentId]: "system" | "sample" | "cot" | "output" }
  const [activePromptTab, setActivePromptTab] = useState(() => {
    const init = {};
    UPCOMING_AGENTS.forEach((a) => {
      init[a.id] = "system";
    });
    return init;
  });

  // Expanded prompt accordion states: { [agentId]: boolean }
  const [expandedPrompts, setExpandedPrompts] = useState(() => {
    const init = {};
    UPCOMING_AGENTS.forEach((a) => {
      init[a.id] = true; // default open so users immediately see the prompts
    });
    return init;
  });

  // Copied toast state: { [key]: boolean }
  const [copiedKey, setCopiedKey] = useState(null);

  // Upvotes state: { [agentId]: number }
  const [upvotes, setUpvotes] = useState(() => {
    const map = {};
    UPCOMING_AGENTS.forEach((a) => {
      map[a.id] = a.upvotes;
    });
    return map;
  });

  const [votedMap, setVotedMap] = useState({});

  // Early access modal state
  const [accessModalAgent, setAccessModalAgent] = useState(null);
  const [accessFormData, setAccessFormData] = useState({ name: "", email: "", dept: "" });
  const [accessSubmitted, setAccessSubmitted] = useState(false);

  // New Agent Request modal state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [submittedReqId, setSubmittedReqId] = useState("");
  const [requestFormData, setRequestFormData] = useState({
    dept: "",
    agentName: "",
    useCase: "",
    impact: "High",
    name: "",
    email: "",
  });

  const allEnterpriseDepts = [
    "IPDO / Technology Transfer",
    "Biologics R&D",
    "Biologics Process Development",
    "Downstream mAb Team",
    "CDMO Biologics",
    "Analytical R&D",
    "Quality Assurance & Stability",
    "Antibody Discovery / R&D",
    "Chemical Process R&D (ROS)",
    "Discovery Chemistry",
    "Preclinical & In-Vivo",
    "Project Management",
    "Commercial Strategy & LeadGen",
    "Enterprise AI Platforms",
    "Cross-Functional / Other",
  ];

  // Department Dropdown state
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [deptSearch, setDeptSearch] = useState("");
  const deptDropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isDeptDropdownOpen) return;
    const handleClickOutside = (e) => {
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(e.target)) {
        setIsDeptDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDeptDropdownOpen]);

  // Department counts for dropdown
  const departmentCounts = useMemo(() => {
    const counts = {};
    UPCOMING_AGENTS.forEach((a) => {
      counts[a.department] = (counts[a.department] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Unique departments
  const departments = useMemo(() => {
    return ["All", ...departmentCounts.map((d) => d.name)];
  }, [departmentCounts]);

  // Filtered upcoming agents
  const filteredAgents = useMemo(() => {
    return UPCOMING_AGENTS.filter((agent) => {
      if (selectedDept !== "All" && agent.department !== selectedDept) return false;
      if (selectedStatus !== "All" && agent.status !== selectedStatus) return false;

      if (!searchTerm.trim()) return true;
      const q = searchTerm.toLowerCase();
      return (
        agent.name.toLowerCase().includes(q) ||
        agent.codeName.toLowerCase().includes(q) ||
        agent.tagline.toLowerCase().includes(q) ||
        agent.department.toLowerCase().includes(q) ||
        agent.category.toLowerCase().includes(q) ||
        agent.prompts.systemPrompt.toLowerCase().includes(q) ||
        agent.prompts.sampleUserPrompt.toLowerCase().includes(q)
      );
    });
  }, [searchTerm, selectedDept, selectedStatus]);

  const handleCopy = (text, key) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleUpvote = (agentId) => {
    if (votedMap[agentId]) return;
    setUpvotes((prev) => ({ ...prev, [agentId]: (prev[agentId] || 0) + 1 }));
    setVotedMap((prev) => ({ ...prev, [agentId]: true }));
  };

  const handleOpenAccessModal = (agent) => {
    setAccessModalAgent(agent);
    setAccessSubmitted(false);
    setAccessFormData({ name: "", email: "", dept: agent.department });
  };

  const handleAccessSubmit = (e) => {
    e.preventDefault();
    setAccessSubmitted(true);
    setTimeout(() => {
      setAccessModalAgent(null);
      setAccessSubmitted(false);
    }, 2200);
  };

  const handleOpenRequestModal = () => {
    setRequestFormData((prev) => ({
      ...prev,
      dept: selectedDept !== "All" ? selectedDept : "",
      agentName: "",
    }));
    setRequestSubmitted(false);
    setIsRequestModalOpen(true);
  };

  const handleOpenSuggestionModal = (agent) => {
    setRequestFormData({
      dept: agent.department,
      agentName: agent.name,
      useCase: "",
      impact: "High",
      name: "",
      email: "",
    });
    setRequestSubmitted(false);
    setIsRequestModalOpen(true);
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    const reqId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmittedReqId(reqId);
    try {
      const existing = JSON.parse(localStorage.getItem("requested_ai_agents") || "[]");
      existing.unshift({
        id: reqId,
        ...requestFormData,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem("requested_ai_agents", JSON.stringify(existing));
    } catch (err) {
      console.warn("Could not save request to localStorage", err);
    }
    setRequestSubmitted(true);
  };

  return (
    <div className={`upcoming-shell${!isDarkMode ? " upcoming-shell--light" : ""}`}>
      {/* ────────────────────────── Header ────────────────────────── */}
      <header className="header upcoming-header">
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
            onClick={() => onNavigate("/")}
            style={{ cursor: "pointer" }}
          >
            <img src={hubblePngLogo} alt="HUBBLE.AI" className="brand-logo-img" />
            <span className="brand-title">HUBBLE<span className="brand-title-suffix">.AI</span></span>
          </div>
        </div>

        <div className="header-right">
          <nav className="header-nav-links" aria-label="Main Navigation">
            <button type="button" className="nav-tab" onClick={() => onNavigate("/")}>
              <Home size={17} />
              <span>Catalog Hub</span>
            </button>

            <button type="button" className="nav-tab active">
              <Sparkles size={17} className="sparkle-amber" />
              <span>Upcoming Agents</span>
            </button>
          </nav>

          <div className="header-actions">
            {/* ── Theme Toggle ── */}
            {setIsDarkMode && (
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
            )}

            <div className="user-avatar-pill" title="user@aurigene.com">
              <div className="avatar-circle">U</div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Top-Right Action: Request New Agent (10px below header, right margin) ── */}
      <div className="upcoming-top-bar-action">
        <button
          type="button"
          className="btn-request-agent-top"
          onClick={handleOpenRequestModal}
        >
          <PlusCircle size={16} />
          <span>Request for New Agent</span>
        </button>
      </div>

      {/* ────────────────────────── Hero Section ────────────────────────── */}
      <section className="upcoming-hero">
        <div className="upcoming-hero-content">
          <div className="section-kicker">
            <Sparkles size={14} /> NEXT-GENERATION ENTERPRISE ROADMAP
          </div>
          <h2 className="upcoming-title">
            Upcoming AI Agents & Prototype Previews
          </h2>
          <p className="upcoming-subtitle">
            Experience tomorrow's enterprise AI capabilities before release. Inspect engineered system prompts,
            examine multi-step cognitive reasoning algorithms, follow real-time engineering milestones, and vote for early pilot access.
          </p>
        </div>
      </section>

      {/* ────────────────────────── Controls & Filter Bar ────────────────────────── */}
      <div className="upcoming-filters-container">
        <div className="upcoming-search-row">
          <div className="upcoming-search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search upcoming agents, capabilities, algorithms, or prompt keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="search-clear-btn" onClick={() => setSearchTerm("")}>
                <X size={15} />
              </button>
            )}
          </div>

          {/* Department Dropdown Filter (matches Landing Page style) */}
          <div ref={deptDropdownRef} className="faceted-filter-wrapper upcoming-dept-dropdown-wrapper">
            <button
              type="button"
              className={`discovery-dropdown-btn ${selectedDept !== "All" ? "has-selection" : ""} ${isDeptDropdownOpen ? "open" : ""}`}
              onClick={() => {
                setIsDeptDropdownOpen(!isDeptDropdownOpen);
                setDeptSearch("");
              }}
              aria-expanded={isDeptDropdownOpen}
            >
              <Building2 size={15} className="dropdown-left-icon" />
              <span>{selectedDept !== "All" ? selectedDept : "Department"}</span>
              {selectedDept !== "All" && <span className="filter-count-badge">1</span>}
              <ChevronDown size={14} className={`dropdown-chevron ${isDeptDropdownOpen ? "rotated" : ""}`} />
            </button>

            {isDeptDropdownOpen && (
              <div className="faceted-popover upcoming-dept-popover" role="dialog" aria-label="Department filter">
                <div className="popover-search-wrap">
                  <Search size={13} className="popover-search-icon" />
                  <input
                    type="text"
                    placeholder="Search Department..."
                    value={deptSearch}
                    onChange={(e) => setDeptSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="popover-list">
                  {departmentCounts
                    .filter((d) => d.name.toLowerCase().includes(deptSearch.toLowerCase().trim()))
                    .map((item) => {
                      const isChecked = selectedDept === item.name;
                      return (
                        <div
                          key={item.name}
                          className={`popover-item ${isChecked ? "checked" : ""}`}
                          onClick={() => {
                            setSelectedDept(isChecked ? "All" : item.name);
                            setIsDeptDropdownOpen(false);
                          }}
                        >
                          <div className={`popover-checkbox ${isChecked ? "checked" : ""}`}>
                            {isChecked && <Check size={11} strokeWidth={3} />}
                          </div>
                          <span className="popover-label" title={item.name}>
                            {item.name}
                          </span>
                          <span className="popover-count">{item.count}</span>
                        </div>
                      );
                    })}
                </div>
                <div className="popover-footer">
                  <button
                    type="button"
                    className="popover-clear-btn"
                    onClick={() => {
                      setSelectedDept("All");
                      setIsDeptDropdownOpen(false);
                    }}
                  >
                    Clear filter (Show All)
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="upcoming-count-badge">
            Showing {filteredAgents.length} of {UPCOMING_AGENTS.length} Upcoming Agents
          </div>
        </div>
      </div>

      {/* ────────────────────────── Agent Previews Grid ────────────────────────── */}
      <main className="upcoming-main-grid">
        {filteredAgents.length === 0 ? (
          <div className="upcoming-empty-state">
            <Search size={40} className="empty-icon" />
            <h3>No upcoming agents match your search</h3>
            <p>Try clearing your search query or selecting "All" departments.</p>
            <button
              type="button"
              className="action-btn-primary"
              onClick={() => {
                setSearchTerm("");
                setSelectedDept("All");
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredAgents.map((agent) => {
            const isPromptOpen = expandedPrompts[agent.id] !== false;
            const currentTab = activePromptTab[agent.id] || "system";
            const isVoted = votedMap[agent.id];

            return (
              <article key={agent.id} className="upcoming-agent-card">
                {/* Department Header */}
                <div className="upcoming-dept-header">
                  <span className="category-label">{agent.department}</span>
                  <div className="release-target">
                    <Clock size={13} />
                    <span>Target: <strong>{agent.releaseTarget}</strong></span>
                  </div>
                </div>

                {/* Title & Tagline */}
                <div className="upcoming-title-area">
                  <h3 className="upcoming-agent-name">{agent.name}</h3>
                  <p className="upcoming-agent-tagline">{agent.tagline}</p>
                </div>

                {/* Progress Bar */}
                <div className="progress-section">
                  <div className="progress-label-row">
                    <span>Engineering Completion</span>
                    <strong>{agent.progressPercent}%</strong>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className={`progress-bar-fill ${agent.statusColor}`}
                      style={{ width: `${agent.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Description */}
                <p className="upcoming-desc">{agent.description}</p>

                {/* Feature Highlights */}
                <div className="highlights-box">
                  <div className="box-title">
                    <Zap size={14} className="text-amber" /> Key Engineering Innovations
                  </div>
                  <ul className="highlights-list">
                    {agent.highlights.map((item, idx) => (
                      <li key={idx}>
                        <Check size={14} className="check-icon" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ──────────────── Prompts & Algorithm Inspector ──────────────── */}
                <div className="prompt-inspector-box">
                  <div
                    className="prompt-inspector-header"
                    onClick={() =>
                      setExpandedPrompts((p) => ({ ...p, [agent.id]: !isPromptOpen }))
                    }
                  >
                    <div className="inspector-title">
                      <Code2 size={16} className="text-purple" />
                      <span>Agent Prompt & Cognitive Algorithm</span>
                      <span className="badge-inspect">Prompt Transparency</span>
                    </div>

                    <button type="button" className="toggle-expand-btn">
                      {isPromptOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>

                  {isPromptOpen && (
                    <div className="prompt-inspector-body">
                      {/* Sub-tabs */}
                      <div className="prompt-tabs-bar">
                        <button
                          type="button"
                          className={`prompt-tab-btn ${currentTab === "system" ? "active" : ""}`}
                          onClick={() =>
                            setActivePromptTab((p) => ({ ...p, [agent.id]: "system" }))
                          }
                        >
                          System Prompt
                        </button>
                        <button
                          type="button"
                          className={`prompt-tab-btn ${currentTab === "sample" ? "active" : ""}`}
                          onClick={() =>
                            setActivePromptTab((p) => ({ ...p, [agent.id]: "sample" }))
                          }
                        >
                          Sample User Task
                        </button>
                        <button
                          type="button"
                          className={`prompt-tab-btn ${currentTab === "cot" ? "active" : ""}`}
                          onClick={() =>
                            setActivePromptTab((p) => ({ ...p, [agent.id]: "cot" }))
                          }
                        >
                          Cognitive Steps (CoT)
                        </button>
                        <button
                          type="button"
                          className={`prompt-tab-btn ${currentTab === "output" ? "active" : ""}`}
                          onClick={() =>
                            setActivePromptTab((p) => ({ ...p, [agent.id]: "output" }))
                          }
                        >
                          Expected Output
                        </button>
                      </div>

                      {/* Tab Content Box */}
                      <div className="prompt-content-view">
                        <div className="prompt-code-actions">
                          <span className="code-lang-tag">
                            {currentTab === "system"
                              ? "SYSTEM PROMPT"
                              : currentTab === "sample"
                                ? "USER INPUT QUERY"
                                : currentTab === "cot"
                                  ? "CHAIN OF THOUGHT"
                                  : "STRUCTURED JSON"}
                          </span>

                          <button
                            type="button"
                            className="copy-prompt-btn"
                            onClick={() => {
                              const content =
                                currentTab === "system"
                                  ? agent.prompts.systemPrompt
                                  : currentTab === "sample"
                                    ? agent.prompts.sampleUserPrompt
                                    : currentTab === "cot"
                                      ? agent.prompts.chainOfThought
                                      : agent.prompts.expectedOutputFormat;
                              handleCopy(content, `${agent.id}-${currentTab}`);
                            }}
                          >
                            {copiedKey === `${agent.id}-${currentTab}` ? (
                              <>
                                <Check size={13} className="text-emerald" /> Copied!
                              </>
                            ) : (
                              <>
                                <Copy size={13} /> Copy Content
                              </>
                            )}
                          </button>
                        </div>

                        <pre className="prompt-code-block">
                          <code>
                            {currentTab === "system" && agent.prompts.systemPrompt}
                            {currentTab === "sample" && agent.prompts.sampleUserPrompt}
                            {currentTab === "cot" && agent.prompts.chainOfThought}
                            {currentTab === "output" && agent.prompts.expectedOutputFormat}
                          </code>
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggestion Feature Action */}
                <div className="suggestion-feature-container">
                  <button
                    type="button"
                    className="btn-suggestion-feature"
                    onClick={() => handleOpenSuggestionModal(agent)}
                  >
                    <Sparkles size={14} className="sparkle-amber" />
                    <span>Suggestion Feature</span>
                  </button>
                </div>

                {/* Footer Actions */}
                <div className="upcoming-card-footer">
                  <button
                    type="button"
                    className={`upvote-btn ${isVoted ? "voted" : ""}`}
                    onClick={() => handleUpvote(agent.id)}
                    title="Endorse and prioritize this agent"
                  >
                    <ThumbsUp size={15} />
                    <span>{upvotes[agent.id] || agent.upvotes}</span>
                    <span className="upvote-sub">{isVoted ? "Endorsed!" : "Upvote"}</span>
                  </button>

                  <button
                    type="button"
                    className="beta-access-btn"
                    onClick={() => handleOpenAccessModal(agent)}
                  >
                    <Send size={14} /> Request Early Pilot Access
                  </button>
                </div>
              </article>
            );
          })
        )}
      </main>

      {/* ────────────────────────── Beta Access Request Modal ────────────────────────── */}
      {accessModalAgent && (
        <div className="modal-backdrop" onClick={() => setAccessModalAgent(null)}>
          <div className="access-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <span className="modal-kicker">EARLY PILOT ACCESS ENROLLMENT</span>
                <h3>Enroll for {accessModalAgent.name}</h3>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setAccessModalAgent(null)}
              >
                <X size={18} />
              </button>
            </div>

            {accessSubmitted ? (
              <div className="modal-success-state">
                <div className="success-icon-ring">
                  <Check size={28} />
                </div>
                <h4>Enrollment Received!</h4>
                <p>
                  You've been added to the priority pilot cohort for{" "}
                  <strong>{accessModalAgent.name}</strong> ({accessModalAgent.codeName}).
                  We'll contact you at <strong>{accessFormData.email}</strong> once the sandbox is provisioned.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAccessSubmit} className="access-modal-form">
                <p className="modal-instructions">
                  Get priority sandbox access to test the upcoming agent and provide early feedback to the engineering team.
                </p>

                <div className="form-group">
                  <label htmlFor="user-name">Your Full Name</label>
                  <input
                    id="user-name"
                    type="text"
                    required
                    placeholder="e.g. Dr. Rajesh Kumar"
                    value={accessFormData.name}
                    onChange={(e) =>
                      setAccessFormData((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="user-email">Enterprise Work Email</label>
                  <input
                    id="user-email"
                    type="email"
                    required
                    placeholder="e.g. r.kumar@aurigene.com"
                    value={accessFormData.email}
                    onChange={(e) =>
                      setAccessFormData((p) => ({ ...p, email: e.target.value }))
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="user-dept">Department / Research Division</label>
                  <input
                    id="user-dept"
                    type="text"
                    required
                    value={accessFormData.dept}
                    onChange={(e) =>
                      setAccessFormData((p) => ({ ...p, dept: e.target.value }))
                    }
                  />
                </div>

                <div className="modal-actions-row">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setAccessModalAgent(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-confirm-access">
                    Submit Access Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────── Request New Agent Modal ────────────────────────── */}
      {isRequestModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsRequestModalOpen(false)}>
          <div className="access-modal-sheet request-agent-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <span className="modal-kicker">ENTERPRISE AGENT INTAKE</span>
                <h3>Request a New AI Agent</h3>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setIsRequestModalOpen(false)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {requestSubmitted ? (
              <div className="modal-success-state">
                <div className="success-icon-ring">
                  <Check size={28} />
                </div>
                <h4>Agent Proposal Submitted!</h4>
                <p>
                  Your request <strong>{submittedReqId}</strong> for the{" "}
                  <strong>{requestFormData.dept || "selected"}</strong> department has been queued for evaluation.
                </p>
                <p style={{ marginTop: "10px", fontSize: "13px", color: "#94a3b8" }}>
                  The Enterprise AI Engineering & Roadmap committee reviews proposals weekly. A confirmation email has been logged for <strong>{requestFormData.email}</strong>.
                </p>
                <div className="modal-actions-row" style={{ justifyContent: "center", marginTop: "22px", gap: "10px" }}>
                  {requestFormData.dept && departments.includes(requestFormData.dept) && (
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => {
                        setSelectedDept(requestFormData.dept);
                        setIsRequestModalOpen(false);
                        setRequestSubmitted(false);
                      }}
                    >
                      Filter by {requestFormData.dept}
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-confirm-access"
                    onClick={() => {
                      setIsRequestModalOpen(false);
                      setRequestSubmitted(false);
                      setRequestFormData({
                        dept: "",
                        agentName: "",
                        useCase: "",
                        impact: "High",
                        name: "",
                        email: "",
                      });
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRequestSubmit} className="access-modal-form">
                <p className="modal-instructions">
                  Have a workflow bottleneck or new automation idea? Specify your department and describe the use case below to initiate scoping.
                </p>

                {/* Department Dropdown Selection */}
                <div className="form-group">
                  <label htmlFor="req-dept">Department / Research Division *</label>
                  <select
                    id="req-dept"
                    required
                    value={requestFormData.dept}
                    onChange={(e) =>
                      setRequestFormData((p) => ({ ...p, dept: e.target.value }))
                    }
                    className="modal-select-input"
                  >
                    <option value="" disabled>Select your department from the dropdown...</option>
                    {allEnterpriseDepts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Proposed Agent Name */}
                <div className="form-group">
                  <label htmlFor="req-agent-name">Proposed Agent Name (Optional)</label>
                  <input
                    id="req-agent-name"
                    type="text"
                    placeholder="e.g. BioReactivity Predictor, Analytical DocuBot..."
                    value={requestFormData.agentName}
                    onChange={(e) =>
                      setRequestFormData((p) => ({ ...p, agentName: e.target.value }))
                    }
                  />
                </div>

                {/* Agent Use Case */}
                <div className="form-group">
                  <label htmlFor="req-usecase">Agent Use Case & Problem Statement *</label>
                  <textarea
                    id="req-usecase"
                    required
                    rows={4}
                    placeholder="Describe what you want the agent to do: manual tasks to automate, data sources to analyze, tools to integrate with, and expected outcomes..."
                    value={requestFormData.useCase}
                    onChange={(e) =>
                      setRequestFormData((p) => ({ ...p, useCase: e.target.value }))
                    }
                    className="modal-textarea-input"
                  />
                </div>

                {/* Priority / Impact */}
                <div className="form-group">
                  <label htmlFor="req-impact">Priority & Expected Frequency</label>
                  <select
                    id="req-impact"
                    value={requestFormData.impact}
                    onChange={(e) =>
                      setRequestFormData((p) => ({ ...p, impact: e.target.value }))
                    }
                    className="modal-select-input"
                  >
                    <option value="High">High - Daily repetitive workflow / major bottleneck</option>
                    <option value="Medium">Medium - Weekly operational assistance</option>
                    <option value="Exploratory">Exploratory - Novel R&D prototype or feasibility study</option>
                  </select>
                </div>

                {/* Requester Info */}
                <div className="form-row-two">
                  <div className="form-group">
                    <label htmlFor="req-name">Your Full Name *</label>
                    <input
                      id="req-name"
                      type="text"
                      required
                      placeholder="e.g. Dr. Rajesh Kumar"
                      value={requestFormData.name}
                      onChange={(e) =>
                        setRequestFormData((p) => ({ ...p, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="req-email">Enterprise Work Email *</label>
                    <input
                      id="req-email"
                      type="email"
                      required
                      placeholder="e.g. r.kumar@aurigene.com"
                      value={requestFormData.email}
                      onChange={(e) =>
                        setRequestFormData((p) => ({ ...p, email: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="modal-actions-row">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setIsRequestModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-confirm-access btn-submit-request">
                    <Send size={14} /> Submit Agent Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
