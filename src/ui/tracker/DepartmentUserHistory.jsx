import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  ArrowUpDown,
  Building2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Download,
  Search,
  Users,
  Zap,
} from "lucide-react";
import aurigeneLogo from "../../assets/aurigene.svg";
import hubbleLogo from "../../assets/hubble-logo.png";
import { getDepartmentUserHistory } from "../../models/trackerData.js";
import { UsagePageChatbot } from "./UsagePageChatbot";


export function DepartmentUserHistory({ departmentName, onBack, onNavigateHome }) {
  // Global Timeframe: "daily" | "weekly" | "monthly"
  const [timeframe, setTimeframe] = useState("monthly");

  // Search & Sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("tokens");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);

  const deptTitle = departmentName || "Department";

  // Page size: Daily=10, Weekly=20, Monthly=50
  const pageSize = useMemo(() => {
    if (timeframe === "daily") return 10;
    if (timeframe === "weekly") return 20;
    return 50;
  }, [timeframe]);

  // Reset page on filter/timeframe/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [timeframe, searchTerm, sortBy, sortOrder]);

  // Raw user list for this department & timeframe
  const rawDeptUsers = useMemo(() => {
    return getDepartmentUserHistory(deptTitle, timeframe);
  }, [deptTitle, timeframe]);

  // Aggregate stats
  const totalTokens = useMemo(() => {
    return rawDeptUsers.reduce((acc, row) => acc + (row.totalTokens || 0), 0);
  }, [rawDeptUsers]);

  // Filtered & Sorted rows
  const filteredRows = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return rawDeptUsers
      .filter((row) => {
        return (
          row.userName.toLowerCase().includes(q) ||
          row.email.toLowerCase().includes(q) ||
          row.topAgentUsed.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        let diff = 0;
        if (sortBy === "sNo") diff = a.sNo - b.sNo;
        else if (sortBy === "userName") diff = a.userName.localeCompare(b.userName);
        else if (sortBy === "email") diff = a.email.localeCompare(b.email);
        else if (sortBy === "agent") diff = a.topAgentUsed.localeCompare(b.topAgentUsed);
        else if (sortBy === "tokens") diff = b.totalTokens - a.totalTokens;
        else if (sortBy === "lastActive") diff = a.lastActive.localeCompare(b.lastActive);
        else diff = b.totalTokens - a.totalTokens;
        return sortOrder === "asc" ? diff : -diff;
      });
  }, [rawDeptUsers, searchTerm, sortBy, sortOrder]);

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
      setSortOrder("desc");
    }
  };

  // CSV Export for Department User History
  const handleExportCSV = () => {
    const headers = "S.No,User Name,Email Address,Agent Used,Tokens Consumed,Last Active,Department,Timeframe\n";
    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers +
      filteredRows
        .map(
          (r, idx) =>
            `${idx + 1},"${r.userName}","${r.email}","${r.topAgentUsed}",${r.totalTokens},"${r.lastActive}","${deptTitle}","${timeframe}"`
        )
        .join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    const safeName = deptTitle.toLowerCase().replace(/[^a-z0-9]/g, "_");
    link.setAttribute("download", `${safeName}_department_users_${timeframe}.csv`);
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
          <button className="back-btn" onClick={onBack} title="Return to Department breakdown">
            <ArrowLeft size={16} /> Back to Tracker
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="tracker-content">
        {/* Banner */}
        <div className="tracker-banner">
          <div>
            <div className="section-kicker">Department Consumption Telemetry</div>
            <div className="history-title-row">
              <Building2 size={28} className="text-cyan" />
              <h2 className="tracker-title" style={{ margin: 0 }}>
                {deptTitle}
              </h2>
            </div>
            <p className="tracker-subtitle" style={{ marginTop: 6 }}>
              Department-level consumption history and active users breakdown across{" "}
              <strong>Daily</strong>, <strong>Weekly</strong>, and <strong>Monthly</strong> time intervals.
            </p>
          </div>

          <div className="tracker-banner-actions">
            <button className="refresh-button" onClick={handleExportCSV} title="Export current table to CSV">
              <Download size={15} /> Export CSV
            </button>
          </div>
        </div>

        {/* Aggregate KPI Cards */}
        <div className="tracker-metrics-grid">
          <div className="metric-card">
            <div className="metric-icon-wrap cyan">
              <Cpu size={22} />
            </div>
            <div className="metric-copy">
              <span className="metric-label">TOTAL TOKENS ({timeframe.toUpperCase()})</span>
              <strong className="metric-val">
                {(totalTokens / 1_000_000).toFixed(2)}M
              </strong>
              <span className="metric-sub">
                Department Total: {totalTokens.toLocaleString()} tokens
              </span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon-wrap amber">
              <Users size={22} />
            </div>
            <div className="metric-copy">
              <span className="metric-label">ACTIVE MEMBERS ({timeframe.toUpperCase()})</span>
              <strong className="metric-val highlight-amber">
                {rawDeptUsers.length} Users
              </strong>
              <span className="metric-sub">
                Top User: {rawDeptUsers[0]?.userName || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Department User Table Section */}
        <section className="tracker-table-section">
          <div className="history-section-header">
            <div className="history-section-title">
              <Building2 size={16} className="text-cyan" />
              <span>Users in <strong>{deptTitle}</strong></span>
              <span className="badge-count">{filteredRows.length} users</span>
            </div>
          </div>

          <div className="table-toolbar">
            <div className="search-box">
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user name, email, or agent used..."
              />
            </div>
            <div className="toolbar-filters">
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
                  <th onClick={() => toggleSort("userName")} className="sortable-th">
                    User Name <ArrowUpDown size={12} />
                  </th>
                  <th onClick={() => toggleSort("email")} className="sortable-th">
                    Email Address <ArrowUpDown size={12} />
                  </th>
                  <th onClick={() => toggleSort("agent")} className="sortable-th">
                    Agent Used <ArrowUpDown size={12} />
                  </th>
                  <th onClick={() => toggleSort("tokens")} className="sortable-th text-right">
                    Tokens Consumed <ArrowUpDown size={12} />
                  </th>
                  <th onClick={() => toggleSort("lastActive")} className="sortable-th">
                    Last Active <ArrowUpDown size={12} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((row, idx) => (
                    <tr key={row.id}>
                      <td className="text-center font-mono text-muted">
                        {(safeCurrentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="agent-name-cell">
                        <strong>{row.userName}</strong>
                      </td>
                      <td className="muted-cell">{row.email}</td>
                      <td className="text-cyan font-bold">{row.topAgentUsed}</td>
                      <td className="text-right font-mono font-bold text-white">
                        {row.totalTokens.toLocaleString()}
                      </td>
                      <td className="muted-cell">{row.lastActive}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="no-data-cell">
                      No users found in this department for the selected criteria.
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

              <div className="google-pagination" role="navigation" aria-label="Department user pagination">
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
        pageType="department"
        entityName={deptTitle}
        timeframe={timeframe}
        totalTokens={totalTokens}
        userCount={rawDeptUsers.length}
        rows={filteredRows}
      />
    </div>
  );
}

export default DepartmentUserHistory;
