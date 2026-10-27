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
  Bell,
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
  X,
  Zap,
} from "lucide-react";

import hubblePngLogo from "../../assets/hubble.png";
import aiHubbleLogo from "../../assets/ai_hubble_logo.png";
import tevaVideo from "../../assets/Teva Agent Demo.mp4";
import { UPCOMING_AGENTS } from "../../models/upcomingAgents.js";
import { CANONICAL_DEPARTMENTS, isDemoVideoEnabled } from "../../models/agents.js";
import { VideoModal } from "../shared/VideoModal.jsx";
import { RequestAgentModal } from "../shared/RequestAgentModal.jsx";
import { ContactModal } from "../shared/ContactModal.jsx";
import {
  getActiveUserEmail,
  getUserInitials,
  fetchUserData,
} from "../../services/backendApi.js";

export function UpcomingAgentsPage({
  onNavigate,
  isDarkMode = false,
  userEmail,
  onOpenLoginModal,
  onLogout,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [activeDemo, setActiveDemo] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

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

  // Early access & notification modal state
  const [accessModalAgent, setAccessModalAgent] = useState(null);
  const [accessFormData, setAccessFormData] = useState({ name: "", email: "", dept: "" });
  const [accessSubmitted, setAccessSubmitted] = useState(false);

  // Persisted set of agent IDs the user has already submitted "Notify Me" for
  const [notifiedAgentIds, setNotifiedAgentIds] = useState(() => {
    try {
      const saved = localStorage.getItem("hubble_notified_agents");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // New Agent Request modal state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestCustomPrompt, setRequestCustomPrompt] = useState("");
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

  // Department counts for dropdown across all canonical enterprise departments
  const departmentCounts = useMemo(() => {
    const counts = {};
    CANONICAL_DEPARTMENTS.forEach((dept) => {
      counts[dept] = 0;
    });
    UPCOMING_AGENTS.forEach((a) => {
      const dept = (a.department || "").trim();
      const match = CANONICAL_DEPARTMENTS.find(
        (c) => c.toLowerCase() === dept.toLowerCase()
      );
      const targetDept = match || dept;
      if (targetDept) {
        counts[targetDept] = (counts[targetDept] || 0) + 1;
      }
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
          duration: 1.2,
          ease: "power2.out",
          clearProps: "all",
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

  const handleOpenAccessModal = (agent) => {
    setAccessModalAgent(agent);
    setAccessSubmitted(false);
    setAccessFormData({ name: "", email: userEmail || "", dept: agent.department || "" });
  };

  const handleAccessSubmit = (e) => {
    e.preventDefault();
    setAccessSubmitted(true);
    // Persist this agent as notified so the card button stays disabled
    if (accessModalAgent) {
      setNotifiedAgentIds((prev) => {
        if (prev.includes(accessModalAgent.id)) return prev;
        const next = [...prev, accessModalAgent.id];
        try {
          localStorage.setItem("hubble_notified_agents", JSON.stringify(next));
        } catch (err) {
          console.warn("Could not save notified agents", err);
        }
        return next;
      });
    }
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
    setRequestCustomPrompt("");
    setIsRequestModalOpen(true);
  };

  const handleOpenSuggestionModal = (agent) => {
    setRequestFormData({
      dept: agent.department || "",
      agentName: agent.name || "",
      useCase: "",
      impact: "High",
      name: "",
      email: "",
    });
    setRequestCustomPrompt("");
    setIsRequestModalOpen(true);
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
            {!userEmail ? (
              <div
                className="user-avatar-pill is-guest"
                onClick={onOpenLoginModal}
                title="Guest mode — Click to Sign In"
              >
                <div className="avatar-circle">G</div>
                <span className="user-profile-tag">Guest</span>
              </div>
            ) : (
              <div
                className="user-avatar-pill"
                title={`Signed in as ${userEmail} (Click to Sign Out)`}
                onClick={() => {
                  if (window.confirm(`Signed in as ${userEmail}\n\nDo you want to sign out?`)) {
                    onLogout();
                  }
                }}
              >
                <div className="avatar-circle">{getUserInitials(userEmail)}</div>
                <span className="user-profile-name">{userEmail.split("@")[0]}</span>
              </div>
            )}
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
                            const willSelect = selectedDept !== item.name;
                            const newDept = willSelect ? item.name : "All";
                            setSelectedDept(newDept);
                            setIsDeptDropdownOpen(false);

                            // If selecting a department with 0 upcoming agents, pop out the request modal!
                            if (willSelect && item.count === 0) {
                              setRequestFormData((prev) => ({
                                ...prev,
                                dept: item.name,
                                agentName: "",
                              }));
                              setRequestCustomPrompt(
                                `Sorry, we don't have any upcoming agents for ${item.name} yet. Let's give your idea — we'll build it!`
                              );
                              setIsRequestModalOpen(true);
                            }
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
          <div className="upcoming-empty-state dept-empty-state">
            <Sparkles size={36} color="#0284c7" className="empty-icon" />
            <h3>
              {selectedDept !== "All"
                ? `Sorry, we don't have any upcoming agents for ${selectedDept} yet.`
                : "No upcoming agents match your search"}
            </h3>
            <p>
              {selectedDept !== "All"
                ? "Have an automation challenge or custom workflow requirement? Let's give your idea — we'll build it!"
                : "Try clearing your search query or selecting a different department."}
            </p>
            <div style={{ marginTop: "16px", display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                className="action-btn-primary"
                onClick={() => {
                  setRequestFormData((prev) => ({ ...prev, dept: selectedDept !== "All" ? selectedDept : "" }));
                  setRequestCustomPrompt(
                    selectedDept !== "All"
                      ? `Sorry, we don't have any upcoming agents for ${selectedDept} yet. Let's give your idea — we'll build it!`
                      : "Have an automation idea? Specify your department and use case below to initiate scoping."
                  );
                  setIsRequestModalOpen(true);
                }}
              >
                <Sparkles size={15} /> Request an Agent for {selectedDept !== "All" ? selectedDept : "Your Department"}
              </button>
              {selectedDept !== "All" && (
                <button
                  type="button"
                  className="popover-clear-btn"
                  style={{ padding: "8px 18px", borderRadius: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", color: !isDarkMode ? "#334155" : "#cbd5e1", cursor: "pointer" }}
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedDept("All");
                  }}
                >
                  Show All Departments
                </button>
              )}
            </div>
          </div>
        ) : (
          filteredAgents.map((agent) => {
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

                {/* Footer Actions: Bell + Notify Me */}
                <div className="upcoming-card-footer">
                  {(() => {
                    const isNotified = notifiedAgentIds.includes(agent.id);
                    return (
                      <div className="upcoming-notify-action-group">
                        <button
                          type="button"
                          className={`upcoming-bell-btn${isNotified ? " is-notified" : ""}`}
                          onClick={() => !isNotified && handleOpenAccessModal(agent)}
                          title={isNotified ? "You'll be notified on launch" : `Turn on launch alerts for ${agent.name}`}
                          aria-label={isNotified ? `Notification active for ${agent.name}` : `Alert bell for ${agent.name}`}
                          disabled={isNotified}
                          aria-disabled={isNotified}
                        >
                          {isNotified ? <Check size={15} /> : <Bell size={15} />}
                        </button>
                        <button
                          type="button"
                          className={`upcoming-notify-btn${isNotified ? " is-notified" : ""}`}
                          onClick={() => !isNotified && handleOpenAccessModal(agent)}
                          title={isNotified ? "You'll be notified on launch" : `Notify me when ${agent.name} is available`}
                          disabled={isNotified}
                          aria-disabled={isNotified}
                        >
                          <span>{isNotified ? "Notified ✓" : "Notify Me"}</span>
                        </button>
                      </div>
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
                <span className="modal-kicker">RELEASE NOTIFICATION & EARLY ACCESS</span>
                <h3>Notify Me for {accessModalAgent.name}</h3>
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
                <h4>Notification Request Received!</h4>
                <p>
                  You will receive launch notifications and priority pilot access at{" "}
                  <strong>{accessFormData.email}</strong> once <strong>{accessModalAgent.name}</strong> is live.
                </p>
              </div>
            ) : (
              <form onSubmit={handleAccessSubmit} className="access-modal-form">
                <p className="modal-instructions">
                  Be the first to know when {accessModalAgent.name} is deployed. Enter your enterprise details to receive launch alerts and priority pilot sandbox credentials.
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
                  <button type="submit" className="btn-confirm-access" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <Bell size={14} /> Notify Me on Launch
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Request New Agent Modal ── */}
      <RequestAgentModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        initialDept={requestFormData.dept}
        initialAgentName={requestFormData.agentName}
        customPrompt={requestCustomPrompt}
        departments={allEnterpriseDepts}
        onFilterByDept={(dept) => setSelectedDept(dept)}
      />

      {/* ── Demo Video Modal ── */}
      <VideoModal
        isOpen={Boolean(activeDemo)}
        videoUrl={activeDemo?.videoUrl}
        title={activeDemo?.title}
        onClose={() => setActiveDemo(null)}
      />

      {/* ── Contact Us Modal ── */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        userEmail={userEmail}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
