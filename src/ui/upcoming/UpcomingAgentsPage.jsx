/**
 * ui/upcoming/UpcomingAgentsPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Next-Gen AI Agents & Prototype Previews Lab.
 * Shows future roadmap agents, real-time development milestones, and
 * transparent system prompts & cognitive algorithms for each upcoming agent.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);
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
  Home,
  Layers,
  Play,
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
import aiHubbleLogo from "../../assets/ai_hubble_logo.png";
import tevaVideo from "../../assets/Teva video recording.mp4";
import { UPCOMING_AGENTS } from "../../models/upcomingAgents.js";
import { CANONICAL_DEPARTMENTS, isDemoVideoEnabled } from "../../models/agents.js";
import { VideoModal } from "../shared/VideoModal.jsx";

export function UpcomingAgentsPage({ onNavigate, isDarkMode = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [activeDemo, setActiveDemo] = useState(null);

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

  const allEnterpriseDepts = CANONICAL_DEPARTMENTS;

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
      const dept = (a.department || "General").trim();
      counts[dept] = (counts[dept] || 0) + 1;
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
        (agent.name && agent.name.toLowerCase().includes(q)) ||
        (agent.codeName && agent.codeName.toLowerCase().includes(q)) ||
        (agent.tagline && agent.tagline.toLowerCase().includes(q)) ||
        (agent.department && agent.department.toLowerCase().includes(q)) ||
        (agent.category && agent.category.toLowerCase().includes(q)) ||
        (agent.description && agent.description.toLowerCase().includes(q)) ||
        (agent.highlights && agent.highlights.some((h) => h.toLowerCase().includes(q)))
      );
    });
  }, [searchTerm, selectedDept, selectedStatus]);

  const headlineRef = useRef(null);
  const subtitleRef = useRef(null);

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
              stagger: 0.085,
              duration: 3.0,
              ease: "power2.out",
            }
          );
        }
      } catch {
        gsap.fromTo(headline, { opacity: 0 }, { opacity: 1, duration: 3.0 });
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
              duration: 3.0,
              ease: "power2.out",
              delay: 0.5,
            }
          );
        }
      } catch {
        gsap.fromTo(subtitle, { opacity: 0 }, { opacity: 1, duration: 3.0, delay: 0.5 });
      }
    };

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

  const gridRef = useRef(null);

  // Stable key of visible agent IDs to prevent re-triggering entrance animation on upvote/tab change
  const upcomingIdsKey = useMemo(
    () => filteredAgents.map((a) => a.id).join(","),
    [filteredAgents]
  );

  useGSAP(
    () => {
      const cards = gsap.utils.toArray(".upcoming-agent-card");
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
            ? { delay: 0.2 }
            : {
              scrollTrigger: {
                trigger: rowCards[0],
                start: "top 88%",
                toggleActions: "play none none none",
              },
            }
        );

        // Smooth slower glide up animation when scrolling (card goes up into position)
        tl.from(rowCards, {
          opacity: 0,
          y: 35,
          stagger: 0.15,
          duration: 2.0,
          ease: "power2.out",
          clearProps: "transform",
        });
      });
    },
    { scope: gridRef, dependencies: [upcomingIdsKey] }
  );

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
          <h1 ref={headlineRef} className="upcoming-title">
            Upcoming AI Agents
          </h1>
          <p ref={subtitleRef} className="upcoming-subtitle">
            Experience tomorrow's enterprise AI capabilities before release. Follow real-time engineering milestones, and vote for early pilot access.
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
        </div>
      </div>

      {/* ────────────────────────── Agent Previews Grid ────────────────────────── */}
      <main className="upcoming-main-grid" ref={gridRef}>
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
            const isVoted = votedMap[agent.id];

            return (
              <article key={agent.id} className="upcoming-agent-card">
                {/* Department Header & Target */}
                <div className="upcoming-dept-header">
                  <span className="category-label">{agent.department}</span>
                  <div className="release-target">
                    <span>Target: <strong>{agent.releaseTarget}</strong></span>
                  </div>
                </div>

                {/* Agent Name */}
                <div className="upcoming-title-area">
                  <h3 className="upcoming-agent-name">{agent.name}</h3>
                </div>

                {/* Description: 400-char plain paragraph with use case & problem solving */}
                <p className="upcoming-desc">{agent.description}</p>

                {/* Footer Actions: Likes + Demo Video */}
                <div className="upcoming-card-footer">
                  <button
                    type="button"
                    className={`upvote-btn ${isVoted ? "voted" : ""}`}
                    onClick={() => handleUpvote(agent.id)}
                    title="Likes"
                  >
                    <ThumbsUp size={14} />
                    <span>{upvotes[agent.id] || agent.upvotes} Likes</span>
                  </button>

                  {(() => {
                    const hasDemo = isDemoVideoEnabled(agent);
                    return (
                      <button
                        type="button"
                        className={`demo-button upcoming-demo-btn ${!hasDemo ? "disabled" : ""}`}
                        disabled={!hasDemo}
                        onClick={() => {
                          if (hasDemo) {
                            setActiveDemo({ videoUrl: agent.video || tevaVideo, title: agent.name });
                          }
                        }}
                        title={hasDemo ? `Watch Demo Video for ${agent.name}` : "Demo video not available"}
                        aria-disabled={!hasDemo}
                      >
                        <Play size={12} fill="currentColor" /> Demo Video
                      </button>
                    );
                  })()}
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

      {/* ── Demo Video Modal ── */}
      <VideoModal
        isOpen={Boolean(activeDemo)}
        videoUrl={activeDemo?.videoUrl}
        title={activeDemo?.title}
        onClose={() => setActiveDemo(null)}
      />
    </div>
  );
}
