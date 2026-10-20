import React, { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft,
  ArrowUpDown,
  Building2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Download,
  ExternalLink,
  Search,
  Users,
  Zap,
} from "lucide-react";
import aurigeneLogo from "../../assets/aurigene.svg";
import hubbleLogo from "../../assets/hubble-logo.png";
import { agentDataByTimeframe, userDataByTimeframe } from "../../models/trackerData.js";
import { TrackerChatbot } from "./TrackerChatbot";

export function TrackerPage({ onNavigate }) {

  // Tabs: "agent" | "user"
  const [activeView, setActiveView] = useState("agent");

  // Global Timeframe: "daily" | "weekly" | "monthly"
  const [timeframe, setTimeframe] = useState("monthly");

  // Category filter for Agent-Wise breakdown (alphabetically sorted)
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Agent name filter for Department-Wise breakdown
  const [selectedDeptAgent, setSelectedDeptAgent] = useState("All");

  // Search & Sort for tables
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("tokens");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination state:
  // Daily -> at least 10 items per page
  // Weekly -> 20 items per page
  // Monthly -> 50 items per page
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = useMemo(() => {
    if (timeframe === "daily") return 10;
    if (timeframe === "weekly") return 20;
    return 50; // monthly
  }, [timeframe]);

  // Reset page to 1 whenever filters, timeframe, or tab switch
  useEffect(() => {
    setCurrentPage(1);
  }, [timeframe, activeView, selectedCategory, selectedDeptAgent, searchTerm]);

  // Alphabetically sorted distinct categories
  const categories = useMemo(() => {
    const uniqueCats = Array.from(new Set(agentDataByTimeframe.map((a) => a.category))).sort((a, b) =>
      a.localeCompare(b)
    );
    return ["All", ...uniqueCats];
  }, []);

  // Computed Agent Data for selected timeframe
  const computedAgentData = useMemo(() => {
    return agentDataByTimeframe.map((item) => {
      const tfData = item[timeframe];
      const totalTokens = tfData.inputTokens + tfData.outputTokens;
      return {
        ...item,
        totalTokens,
      };
    });
  }, [timeframe]);

  // Computed User Data for selected timeframe
  const computedUserData = useMemo(() => {
    return userDataByTimeframe.map((user) => {
      const tfData = user[timeframe];
      const totalTokens = tfData.inputTokens + tfData.outputTokens;
      return {
        ...user,
        lastActive: tfData.lastActive,
        totalTokens,
      };
    });
  }, [timeframe]);

  // Computed Department Data — aggregate users by dept, sorted A-Z
  const computedDeptData = useMemo(() => {
    const deptMap = {};
    computedUserData.forEach((user) => {
      const dept = user.dept || "Unknown";
      if (!deptMap[dept]) {
        deptMap[dept] = {
          id: dept,
          deptName: dept,
          totalTokens: 0,
          topAgentUsed: user.topAgentUsed,
          topAgentTokens: user.totalTokens,
          userCount: 0,
          agentsUsed: new Set(),
        };
      }
      deptMap[dept].totalTokens += user.totalTokens;
      deptMap[dept].userCount += 1;
      if (user.topAgentUsed) deptMap[dept].agentsUsed.add(user.topAgentUsed);
      if (user.totalTokens > deptMap[dept].topAgentTokens) {
        deptMap[dept].topAgentUsed = user.topAgentUsed;
        deptMap[dept].topAgentTokens = user.totalTokens;
      }
    });
    return Object.values(deptMap)
      .map((d) => ({ ...d, agentsUsed: Array.from(d.agentsUsed) }))
      .sort((a, b) => a.deptName.localeCompare(b.deptName));
  }, [computedUserData]);

  // Unique agent names present across all canonical agents and dept rows (for the dept agent filter dropdown)
  const uniqueDeptAgents = useMemo(() => {
    const fromAgents = agentDataByTimeframe.map((a) => a.agentName);
    const fromDepts = computedDeptData.map((d) => d.topAgentUsed);
    const names = Array.from(new Set([...fromAgents, ...fromDepts].filter(Boolean))).sort((a, b) =>
      a.localeCompare(b)
    );
    return ["All", ...names];
  }, [computedDeptData]);

  // Overall KPIs for current timeframe
  const globalKPIs = useMemo(() => {
    const totalTokens = computedAgentData.reduce((a, c) => a + c.totalTokens, 0);
    const topAgent = [...computedAgentData].sort((a, b) => b.totalTokens - a.totalTokens)[0];
    return { totalTokens, topAgent };
  }, [computedAgentData]);

  // Filter & sort for tables (with Category Filter)
  const filteredAgentRows = useMemo(() => {
    return computedAgentData
      .filter((item) => {
        if (selectedCategory !== "All" && item.category !== selectedCategory) {
          return false;
        }
        const q = searchTerm.toLowerCase();
        return (
          item.agentName.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.topUser.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === "tokens") diff = b.totalTokens - a.totalTokens;
        else if (sortBy === "category") diff = a.category.localeCompare(b.category);
        else diff = a.agentName.localeCompare(b.agentName);
        return sortOrder === "asc" ? -diff : diff;
      });
  }, [computedAgentData, searchTerm, selectedCategory, sortBy, sortOrder]);

  // Filtered & Sorted Department rows
  const filteredDeptRows = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return computedDeptData
      .filter((item) => {
        const matchesAgent =
          selectedDeptAgent === "All" ||
          item.topAgentUsed === selectedDeptAgent ||
          item.agentsUsed?.includes(selectedDeptAgent);
        const matchesSearch =
          item.deptName.toLowerCase().includes(q) ||
          item.topAgentUsed.toLowerCase().includes(q);
        return matchesAgent && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "tokens") {
          const diff = b.totalTokens - a.totalTokens;
          return sortOrder === "asc" ? -diff : diff;
        }
        return a.deptName.localeCompare(b.deptName);
      });
  }, [computedDeptData, searchTerm, selectedDeptAgent, sortBy, sortOrder]);

  // Paginated Rows Calculation
  const totalItems = activeView === "agent" ? filteredAgentRows.length : filteredDeptRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Current page safety
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedAgentRows = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredAgentRows.slice(startIndex, startIndex + pageSize);
  }, [filteredAgentRows, safeCurrentPage, pageSize]);

  const paginatedDeptRows = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredDeptRows.slice(startIndex, startIndex + pageSize);
  }, [filteredDeptRows, safeCurrentPage, pageSize]);

  // Google Search Style Pagination Generator (Prev, 1, 2, 3, 4, 5..., Next)
  const getPaginationItems = () => {
    const delta = 2; // Show 2 pages before and after current
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, safeCurrentPage - delta);
      i <= Math.min(totalPages - 1, safeCurrentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (safeCurrentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (safeCurrentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    // Remove duplicates if totalPages is 1
    return Array.from(new Set(rangeWithDots));
  };


  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortOrder("desc");
    }
  };

  // CSV Export for active table & timeframe
  const handleExportCSV = () => {
    const rows = activeView === "agent" ? filteredAgentRows : filteredDeptRows;
    const headers =
      activeView === "agent"
        ? "Agent Name,Category,Top User,Total Tokens,Timeframe\n"
        : "Department,Most Consumed Agent,Total Tokens,Timeframe\n";

    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers +
      rows
        .map((r) =>
          activeView === "agent"
            ? `"${r.agentName}","${r.category}","${r.topUser}",${r.totalTokens},"${timeframe}"`
            : `"${r.deptName}","${r.topAgentUsed}",${r.totalTokens},"${timeframe}"`
        )
        .join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `hubble_llm_${activeView}_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="tracker-shell">
      {/* Header */}
      <header className="header tracker-header">
        <div className="header-left">
          <img id="logo" alt="Aurigene Logo" className="logo" src={aurigeneLogo} />
          <div className="hubble-logo-text">
            <img id="hublogo" alt="Hubble Logo" className="hubble-icon" src={hubbleLogo} />
            <h1>HubblePilot.AI</h1>
          </div>
        </div>
        <div className="tracker-top-actions">
          <button className="back-btn" onClick={() => onNavigate("/")} title="Return to Hubble Launchpad">
            <ArrowLeft size={16} /> Back to Launchpad
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="tracker-content">
        {/* Banner */}
        <div className="tracker-banner">
          <div>
            <div className="section-kicker">Token Consumption Telemetry</div>
            <h2 className="tracker-title">LLM Token Tracker</h2>
            <p className="tracker-subtitle">
              Token consumption analytics across <strong>Daily</strong>, <strong>Weekly</strong>, and <strong>Monthly</strong> intervals. Track top consuming agents and users.
            </p>
          </div>
        </div>

        {/* Global KPI Cards */}
        <div className="tracker-metrics-grid">
          <div className="metric-card">
            <div className="metric-icon-wrap cyan">
              <Cpu size={22} />
            </div>
            <div className="metric-copy">
              <span className="metric-label">TOTAL TOKENS ({timeframe.toUpperCase()})</span>
              <strong className="metric-val">
                {(globalKPIs.totalTokens / 1_000_000).toFixed(2)}M
              </strong>
              <span className="metric-sub">
                Enterprise Cumulative Tokens
              </span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrap amber">
              <Zap size={22} />
            </div>
            <div className="metric-copy">
              <span className="metric-label">TOP AGENT ({timeframe.toUpperCase()})</span>
              <strong className="metric-val highlight-amber">{globalKPIs.topAgent?.agentName}</strong>
              <span className="metric-sub">
                {(globalKPIs.topAgent?.totalTokens / 1_000_000).toFixed(2)}M tokens
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <section className="tracker-table-section">
          <div className="cost-tab-switcher">
            <button
              className={`cost-tab-btn ${activeView === "agent" ? "active" : ""}`}
              onClick={() => setActiveView("agent")}
            >
              <Zap size={15} /> Agent-Wise Breakdown
            </button>
            <button
              className={`cost-tab-btn ${activeView === "user" ? "active" : ""}`}
              onClick={() => setActiveView("user")}
            >
              <Users size={15} /> Department-Wise Consumption Breakdown
            </button>
          </div>

          {/* TAB 1: AGENT-WISE TABLE */}
          {activeView === "agent" && (
            <div>
              <div className="table-toolbar">
                <div className="search-box">
                  <Search size={16} className="search-icon-inside" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search agent name, category, or top user..."
                  />
                </div>
                <div className="toolbar-filters">
                  {/* Category Filter */}
                  <div className="category-filter-group">
                    <span className="filter-label">Category:</span>
                    <select
                      className="category-filter-select"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      aria-label="Filter agents by category"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat === "All" ? "All Categories" : cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="timeframe-selector-group">
                    <span className="filter-label">Timeframe:</span>
                    <div className="segmented-timeframe">
                      <button
                        className={`tf-btn ${timeframe === "daily" ? "active" : ""}`}
                        onClick={() => setTimeframe("daily")}
                      >
                        Daily (24h)
                      </button>
                      <button
                        className={`tf-btn ${timeframe === "weekly" ? "active" : ""}`}
                        onClick={() => setTimeframe("weekly")}
                      >
                        Weekly (7d)
                      </button>
                      <button
                        className={`tf-btn ${timeframe === "monthly" ? "active" : ""}`}
                        onClick={() => setTimeframe("monthly")}
                      >
                        Monthly (30d)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="table-wrapper">
                <table className="tracker-table">
                  <thead>
                    <tr>
                      <th onClick={() => toggleSort("agentName")} className="sortable-th">
                        Agent Name <ArrowUpDown size={12} />
                      </th>
                      <th onClick={() => toggleSort("category")} className="sortable-th">
                        Category <ArrowUpDown size={12} />
                      </th>
                      <th>Top Consuming User</th>
                      <th onClick={() => toggleSort("tokens")} className="sortable-th text-right">
                        Total Tokens <ArrowUpDown size={12} />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAgentRows.length > 0 ? (
                      paginatedAgentRows.map((row) => (
                        <tr key={row.id}>
                          <td className="agent-name-cell">
                            <button
                              type="button"
                              className="agent-link-btn"
                              onClick={() => onNavigate(`/tracker/usage/${row.id}`)}
                              title={`Click to view user history for ${row.agentName}`}
                            >
                              <strong>{row.agentName}</strong>
                              <ExternalLink size={12} className="agent-link-icon" />
                            </button>
                          </td>
                          <td>
                            <span className="cat-badge">{row.category}</span>
                          </td>
                          <td className="user-text-cell">{row.topUser}</td>
                          <td className="text-right font-mono font-bold text-white">
                            {row.totalTokens.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="no-data-cell">
                          No agents match your filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              {filteredAgentRows.length > 0 && (
                <div className="table-pagination-footer">
                  <div className="pagination-info">
                    Showing{" "}
                    <strong>
                      {(safeCurrentPage - 1) * pageSize + 1}-
                      {Math.min(safeCurrentPage * pageSize, filteredAgentRows.length)}
                    </strong>{" "}
                    of <strong>{filteredAgentRows.length}</strong> agents ({pageSize}/page for {timeframe})
                  </div>

                  <div className="google-pagination" role="navigation" aria-label="Agent table pagination">
                    <button
                      className="page-nav-btn prev-btn"
                      disabled={safeCurrentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={15} /> Prev
                    </button>

                    <div className="page-numbers-group">
                      {getPaginationItems().map((item, idx) =>
                        item === "..." ? (
                          <span key={`dots-${idx}`} className="pagination-ellipsis">
                            ...
                          </span>
                        ) : (
                          <button
                            key={`page-${item}`}
                            className={`page-num-btn ${safeCurrentPage === item ? "active" : ""}`}
                            onClick={() => setCurrentPage(item)}
                            aria-current={safeCurrentPage === item ? "page" : undefined}
                          >
                            {item}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      className="page-nav-btn next-btn"
                      disabled={safeCurrentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      aria-label="Next page"
                    >
                      Next <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DEPARTMENT-WISE TABLE */}
          {activeView === "user" && (
            <div>
              <div className="table-toolbar">
                <div className="search-box">
                  <Search size={16} className="search-icon-inside" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search department name or agent..."
                  />
                </div>
                <div className="toolbar-filters">
                  {/* Agent Name Filter */}
                  <div className="category-filter-group">
                    <span className="filter-label">Agent:</span>
                    <select
                      className="category-filter-select"
                      value={selectedDeptAgent}
                      onChange={(e) => setSelectedDeptAgent(e.target.value)}
                      aria-label="Filter departments by agent name"
                    >
                      {uniqueDeptAgents.map((agent) => (
                        <option key={agent} value={agent}>
                          {agent === "All" ? "All Agents" : agent}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Timeframe Selector */}
                  <div className="timeframe-selector-group">
                    <span className="filter-label">Timeframe:</span>
                    <div className="segmented-timeframe">
                      <button
                        className={`tf-btn ${timeframe === "daily" ? "active" : ""}`}
                        onClick={() => setTimeframe("daily")}
                      >
                        Daily (24h)
                      </button>
                      <button
                        className={`tf-btn ${timeframe === "weekly" ? "active" : ""}`}
                        onClick={() => setTimeframe("weekly")}
                      >
                        Weekly (7d)
                      </button>
                      <button
                        className={`tf-btn ${timeframe === "monthly" ? "active" : ""}`}
                        onClick={() => setTimeframe("monthly")}
                      >
                        Monthly (30d)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="table-wrapper">
                <table className="tracker-table">
                  <thead>
                    <tr>
                      <th onClick={() => toggleSort("deptName")} className="sortable-th">
                        Department Name <ArrowUpDown size={12} />
                      </th>
                      <th>Most Consumed Agent</th>
                      <th onClick={() => toggleSort("tokens")} className="sortable-th text-right">
                        Total Tokens <ArrowUpDown size={12} />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDeptRows.length > 0 ? (
                      paginatedDeptRows.map((dept) => (
                        <tr
                          key={dept.id}
                          className="dept-row-hoverable"
                          onClick={() => onNavigate(`/tracker/department/${encodeURIComponent(dept.deptName)}`)}
                          title={`View all users in ${dept.deptName}`}
                          style={{ cursor: "pointer" }}
                        >
                          <td className="agent-name-cell">
                            <button
                              type="button"
                              className="agent-link-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigate(`/tracker/department/${encodeURIComponent(dept.deptName)}`);
                              }}
                              title={`View users in ${dept.deptName}`}
                            >
                              <Building2 size={14} className="dept-row-icon" />
                              <strong>{dept.deptName}</strong>
                              <ExternalLink size={12} className="agent-link-icon" />
                            </button>
                          </td>
                          <td className="text-cyan font-bold">{dept.topAgentUsed}</td>
                          <td className="text-right font-mono font-bold text-white">
                            {dept.totalTokens.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="no-data-cell">
                          No department records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              {filteredDeptRows.length > 0 && (
                <div className="table-pagination-footer">
                  <div className="pagination-info">
                    Showing{" "}
                    <strong>
                      {(safeCurrentPage - 1) * pageSize + 1}-
                      {Math.min(safeCurrentPage * pageSize, filteredDeptRows.length)}
                    </strong>{" "}
                    of <strong>{filteredDeptRows.length}</strong> departments ({pageSize}/page for {timeframe})
                  </div>

                  <div className="google-pagination" role="navigation" aria-label="Department table pagination">
                    <button
                      className="page-nav-btn prev-btn"
                      disabled={safeCurrentPage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={15} /> Prev
                    </button>

                    <div className="page-numbers-group">
                      {getPaginationItems().map((item, idx) =>
                        item === "..." ? (
                          <span key={`dots-${idx}`} className="pagination-ellipsis">
                            ...
                          </span>
                        ) : (
                          <button
                            key={`page-${item}`}
                            className={`page-num-btn ${safeCurrentPage === item ? "active" : ""}`}
                            onClick={() => setCurrentPage(item)}
                            aria-current={safeCurrentPage === item ? "page" : undefined}
                          >
                            {item}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      className="page-nav-btn next-btn"
                      disabled={safeCurrentPage >= totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      aria-label="Next page"
                    >
                      Next <ChevronRight size={15} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <span>&copy; 2026 Aurigene Pharmaceutical Services Limited. All rights reserved.</span>
        <div>
          <button className="footer-link-btn" onClick={() => onNavigate("/")}>
            Hubble Launchpad
          </button>
        </div>
      </footer>

      {/* Tracker Analytics Chatbot — separate component, trk- CSS, no conflict with main Chatbot */}
      <TrackerChatbot
        timeframe={timeframe}
        activeView={activeView}
        globalKPIs={globalKPIs}
        agentRows={filteredAgentRows}
        deptRows={filteredDeptRows}
      />
    </div>
  );
}
