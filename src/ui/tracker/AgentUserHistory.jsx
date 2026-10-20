import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Search,
  Users,
  Zap,
  Calendar,
  Clock,
  Cpu,
} from "lucide-react";
import aurigeneLogo from "../../assets/aurigene.svg";
import hubbleLogo from "../../assets/hubble-logo.png";
import { getAgentUserHistory } from "../../models/trackerData.js";
import { UsagePageChatbot } from "./UsagePageChatbot";


export function AgentUserHistory({ agent, onBack, onNavigateHome }) {
  // Global Timeframe: "daily" | "weekly" | "monthly"
  const [timeframe, setTimeframe] = useState("monthly");

  // Search, Department Filter & Sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [sortBy, setSortBy] = useState("sNo");
  const [sortOrder, setSortOrder] = useState("asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  const agentName = agent?.agentName || agent?.name || "Agent";
  const category = agent?.category || "AI Agent";

  // Page size: Daily=10, Weekly=20, Monthly=50
  const pageSize = useMemo(() => {
    if (timeframe === "daily") return 10;
    if (timeframe === "weekly") return 20;
    return 50;
  }, [timeframe]);

  // Reset page on filter/timeframe/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [timeframe, searchTerm, selectedDept, sortBy, sortOrder]);

  // Raw user history list for this agent & timeframe
  const rawHistoryList = useMemo(() => {
    return getAgentUserHistory(agent, timeframe);
  }, [agent, timeframe]);

  // Aggregate stats
  const totalTokens = useMemo(() => {
    return rawHistoryList.reduce((acc, row) => acc + (row.totalTokens || 0), 0);
  }, [rawHistoryList]);

  // Unique departments for filter dropdown (sorted A-Z)
  const uniqueDepts = useMemo(() => {
    const depts = Array.from(
      new Set(rawHistoryList.map((r) => r.department).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b));
    return ["All", ...depts];
  }, [rawHistoryList]);

  // Filtered & Sorted rows
  const filteredRows = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return rawHistoryList
      .filter((row) => {
        const matchesSearch =
          row.user.toLowerCase().includes(q) ||
          row.userEmail.toLowerCase().includes(q) ||
          row.department.toLowerCase().includes(q);
        const matchesDept = selectedDept === "All" || row.department === selectedDept;
        return matchesSearch && matchesDept;
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === "sNo") diff = a.sNo - b.sNo;
        else if (sortBy === "user") diff = a.user.localeCompare(b.user);
        else if (sortBy === "department") diff = a.department.localeCompare(b.department);
        else if (sortBy === "totalTokens") diff = b.totalTokens - a.totalTokens;
        else if (sortBy === "lastActive") diff = a.lastActive.localeCompare(b.lastActive);
        else if (sortBy === "createdAt") diff = a.createdAt.localeCompare(b.createdAt);
        else diff = a.sNo - b.sNo;
        return sortOrder === "asc" ? diff : -diff;
      });
  }, [rawHistoryList, searchTerm, selectedDept, sortBy, sortOrder]);

  // Pagination computed values
  const totalItems = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRows = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, safeCurrentPage, pageSize]);

  // Google-style page number items
  const getPaginationItems = useCallback(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const items = [];
    const delta = 2;
    const left = Math.max(2, safeCurrentPage - delta);
    const right = Math.min(totalPages - 1, safeCurrentPage + delta);

    items.push(1);
    if (left > 2) items.push("...");
    for (let i = left; i <= right; i++) items.push(i);
    if (right < totalPages - 1) items.push("...");
    if (totalPages > 1) items.push(totalPages);
    return items;
  }, [safeCurrentPage, totalPages]);

  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortOrder("asc");
    }
  };

  // CSV Export for Agent User History
  const handleExportCSV = () => {
    const headers = "S.No,User,Agent Name,User Email Address,Department,Total Tokens Consumed,Last Active,Created At,Timeframe\n";
    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers +
      filteredRows
        .map(
          (r) =>
            `${r.sNo},"${r.user}","${r.agentName}","${r.userEmail}","${r.department}",${r.totalTokens},"${r.lastActive}","${r.createdAt}","${timeframe}"`
        )
        .join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    const safeName = agentName.toLowerCase().replace(/[^a-z0-9]/g, "_");
    link.setAttribute("download", `${safeName}_user_history_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="tracker-shell">
      {/* Header / Navbar */}
      <header className="header tracker-header">
        <div className="header-left">
          <img id="logo" alt="Aurigene Logo" className="logo" src={aurigeneLogo} />
          <div className="hubble-logo-text">
            <img id="hublogo" alt="Hubble Logo" className="hubble-icon" src={hubbleLogo} />
            <h1>HubblePilot.AI</h1>
          </div>
        </div>
        <div className="tracker-top-actions">
          <span className="live-status-badge">
            <span className="live-pulse" /> Live Token Telemetry
          </span>
          <button
            className="back-btn"
            onClick={onNavigateHome}
            title="Return to Hubble Launchpad"
          >
            <ArrowLeft size={16} /> Back to Launchpad
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="tracker-content">
        {/* Agent Header Bar */}
        <div className="agent-history-top-bar">
          <div className="agent-history-left">
            <button className="history-back-btn" onClick={onBack}>
              <ArrowLeft size={15} /> Back to Agent Breakdown
            </button>
            <h2 className="agent-history-title">{agentName}</h2>
          </div>
          <div className="agent-history-right">
            <button className="refresh-button" onClick={handleExportCSV}>
              <Download size={15} /> Export {timeframe.toUpperCase()} CSV
            </button>
          </div>
        </div>

        {/* Agent Summary Cards */}
        <div className="tracker-metrics-grid">
          <div className="metric-card">
            <div className="metric-icon-wrap cyan">
              <Cpu size={22} />
            </div>
            <div className="metric-copy">
              <span className="metric-label">TOTAL TOKENS CONSUMED ({timeframe.toUpperCase()})</span>
              <strong className="metric-val">
                {(totalTokens / 1_000_000).toFixed(2)}M
              </strong>
              <span className="metric-sub">
                Total across all {rawHistoryList.length} registered users
              </span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrap amber">
              <Users size={22} />
            </div>
            <div className="metric-copy">
              <span className="metric-label">ACTIVE USERS ({timeframe.toUpperCase()})</span>
              <strong className="metric-val highlight-amber">
                {rawHistoryList.length} Users
              </strong>
              <span className="metric-sub">
                Top Contributor: {rawHistoryList[0]?.user || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* User History Table Section */}
        <section className="tracker-table-section">
          <div className="history-section-header">
            <div className="history-section-title">
              <Zap size={16} className="text-cyan" />
              <span>Users Consuming <strong>{agentName}</strong></span>
              <span className="badge-count">{filteredRows.length} users</span>
            </div>
          </div>

          <div className="table-toolbar">
            {/* Search Box */}
            <div className="search-box">
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user name, email, or department..."
              />
            </div>

            <div className="toolbar-filters">
              {/* Department Filter */}
              <div className="category-filter-group">
                <span className="filter-label">
                  <Filter size={13} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
                  Department:
                </span>
                <select
                  className="category-filter-select"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  aria-label="Filter by department"
                >
                  {uniqueDepts.map((d) => (
                    <option key={d} value={d}>
                      {d === "All" ? "All Departments" : d}
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
                  <th onClick={() => toggleSort("sNo")} className="sortable-th text-center" style={{ width: "60px" }}>
                    S.No <ArrowUpDown size={12} />
                  </th>
                  <th onClick={() => toggleSort("user")} className="sortable-th">
                    User <ArrowUpDown size={12} />
                  </th>
                  <th>Agent Name</th>
                  <th>User Email Address</th>
                  <th onClick={() => toggleSort("department")} className="sortable-th">
                    Department <ArrowUpDown size={12} />
                  </th>
                  <th onClick={() => toggleSort("totalTokens")} className="sortable-th text-right">
                    Total Tokens Consumed <ArrowUpDown size={12} />
                  </th>
                  <th onClick={() => toggleSort("lastActive")} className="sortable-th">
                    Last Active <ArrowUpDown size={12} />
                  </th>
                  <th onClick={() => toggleSort("createdAt")} className="sortable-th">
                    Created At <ArrowUpDown size={12} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((row) => (
                    <tr key={row.id}>
                      <td className="text-center font-mono text-muted">{row.sNo}</td>
                      <td className="agent-name-cell">
                        <strong>{row.user}</strong>
                      </td>
                      <td>
                        <span className="agent-badge-inline">{row.agentName}</span>
                      </td>
                      <td className="muted-cell">{row.userEmail}</td>
                      <td>
                        <span className="cat-badge">{row.department}</span>
                      </td>
                      <td className="text-right font-mono font-bold text-white">
                        {row.totalTokens.toLocaleString()}
                      </td>
                      <td className="muted-cell font-mono">
                        <Clock size={12} className="inline-icon text-cyan" /> {row.lastActive}
                      </td>
                      <td className="muted-cell font-mono">
                        <Calendar size={12} className="inline-icon text-muted" /> {row.createdAt}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="no-data-cell">
                      No user history records found matching "{searchTerm}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Google-style Pagination Bar */}
          {filteredRows.length > 0 && (
            <div className="table-pagination-footer">
              <div className="pagination-info">
                Showing{" "}
                <strong>
                  {(safeCurrentPage - 1) * pageSize + 1}–
                  {Math.min(safeCurrentPage * pageSize, filteredRows.length)}
                </strong>{" "}
                of <strong>{filteredRows.length}</strong> users ({pageSize}/page for {timeframe})
              </div>

              <div className="google-pagination" role="navigation" aria-label="User history pagination">
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
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <span>&copy; 2026 Aurigene Pharmaceutical Services Limited. All rights reserved.</span>
        <div>
          <button className="footer-link-btn" onClick={onNavigateHome}>
            Hubble Launchpad
          </button>
        </div>
      </footer>

      {/* Usage Page Chatbot */}
      <UsagePageChatbot
        pageType="agent"
        entityName={agentName}
        timeframe={timeframe}
        totalTokens={totalTokens}
        userCount={rawHistoryList.length}
        rows={filteredRows}
      />
    </div>
  );
}
