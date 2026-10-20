import React, { useState, useMemo } from "react";
import {
  BarChart3,
  Calendar,
  Clock,
  Cpu,
  Coins,
  Flame,
  User,
  Users,
  Zap,
  TrendingUp,
  Award
} from "lucide-react";
import { agentDataByTimeframe, userDataByTimeframe } from "../../models/trackerData.js";

export function VisualizationPane({
  timeframe,
  setTimeframe,
  computedAgentData,
  computedUserData,
  globalKPIs,
}) {
  const [selectedEntityId, setSelectedEntityId] = useState("all-users");
  const [entityFilterType, setEntityFilterType] = useState("all"); // "all" | "users" | "agents"
  const [chartMetric, setChartMetric] = useState("tokens"); // "tokens" | "cost"
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const isAllUsers = selectedEntityId === "all-users";
  const isAllAgents = selectedEntityId === "all-agents";
  const selectedUser = !isAllUsers && !isAllAgents ? userDataByTimeframe.find((u) => u.id === selectedEntityId) : null;
  const selectedAgent = !isAllUsers && !isAllAgents && !selectedUser ? agentDataByTimeframe.find((a) => a.id === selectedEntityId) : null;

  const entityTitle = isAllUsers
    ? "All Users Consolidated"
    : isAllAgents
    ? "All Agents Consolidated"
    : selectedUser
    ? `${selectedUser.userName} (${selectedUser.dept})`
    : selectedAgent
    ? selectedAgent.agentName
    : "Consumption Overview";

  // Time series generation based on entity and timeframe
  const timeSeriesPoints = useMemo(() => {
    let sourceSeries = [];

    if (selectedUser) {
      sourceSeries = selectedUser.timeSeries[timeframe] || [];
    } else if (selectedAgent) {
      sourceSeries = selectedAgent.timeSeries[timeframe] || [];
    } else if (isAllAgents) {
      const count = agentDataByTimeframe[0]?.timeSeries[timeframe]?.length || 0;
      sourceSeries = Array.from({ length: count }, (_, idx) => {
        let label = "";
        let inTok = 0;
        let outTok = 0;
        agentDataByTimeframe.forEach((agent) => {
          const pt = agent.timeSeries[timeframe]?.[idx];
          if (pt) {
            label = pt.label;
            inTok += pt.inTok;
            outTok += pt.outTok;
          }
        });
        return { label, inTok, outTok };
      });
    } else {
      // Default: All Users
      const count = userDataByTimeframe[0]?.timeSeries[timeframe]?.length || 0;
      sourceSeries = Array.from({ length: count }, (_, idx) => {
        let label = "";
        let inTok = 0;
        let outTok = 0;
        userDataByTimeframe.forEach((user) => {
          const pt = user.timeSeries[timeframe]?.[idx];
          if (pt) {
            label = pt.label;
            inTok += pt.inTok;
            outTok += pt.outTok;
          }
        });
        return { label, inTok, outTok };
      });
    }

    const avgInCostPer1M = selectedAgent ? selectedAgent.inputCostPer1M : 4.5;
    const avgOutCostPer1M = selectedAgent ? selectedAgent.outputCostPer1M : 16.0;

    return sourceSeries.map((pt) => {
      const totalTok = pt.inTok + pt.outTok;
      const cost = (pt.inTok / 1_000_000) * avgInCostPer1M + (pt.outTok / 1_000_000) * avgOutCostPer1M;
      return {
        ...pt,
        totalTok,
        cost,
      };
    });
  }, [selectedEntityId, selectedUser, selectedAgent, isAllAgents, isAllUsers, timeframe]);

  // Max value for SVG scale
  const maxMetricValue = useMemo(() => {
    if (chartMetric === "cost") {
      const maxCost = Math.max(...timeSeriesPoints.map((p) => p.cost), 1);
      return maxCost * 1.18;
    } else {
      const maxTok = Math.max(...timeSeriesPoints.map((p) => p.totalTok), 1);
      return maxTok * 1.18;
    }
  }, [timeSeriesPoints, chartMetric]);

  // Ranked users for Leaderboard
  const rankedUsers = useMemo(() => {
    return [...computedUserData].sort((a, b) => b.totalTokens - a.totalTokens);
  }, [computedUserData]);

  // Filtered entity chips for the 1st scrollable bar
  const scrollableEntities = useMemo(() => {
    const list = [];
    if (entityFilterType === "all" || entityFilterType === "users") {
      list.push({ id: "all-users", name: "All Users (Consolidated)", type: "user-all", icon: "users" });
      userDataByTimeframe.forEach((u) => {
        const tf = u[timeframe];
        const tot = tf.inputTokens + tf.outputTokens;
        list.push({ id: u.id, name: u.userName, sub: u.dept, total: tot, type: "user", icon: "user" });
      });
    }
    if (entityFilterType === "all" || entityFilterType === "agents") {
      list.push({ id: "all-agents", name: "All Agents (Consolidated)", type: "agent-all", icon: "zap" });
      agentDataByTimeframe.forEach((a) => {
        const tf = a[timeframe];
        const tot = tf.inputTokens + tf.outputTokens;
        list.push({ id: a.id, name: a.agentName, sub: a.category, total: tot, type: "agent", icon: "zap" });
      });
    }
    return list;
  }, [entityFilterType, timeframe]);

  // Period focus stats
  const visFocusStats = useMemo(() => {
    const totalTokensInFocus = timeSeriesPoints.reduce((acc, p) => acc + p.totalTok, 0);
    const totalCostInFocus = timeSeriesPoints.reduce((acc, p) => acc + p.cost, 0);
    const peakPoint = [...timeSeriesPoints].sort((a, b) => b.totalTok - a.totalTok)[0];
    return { totalTokensInFocus, totalCostInFocus, peakPoint };
  }, [timeSeriesPoints]);

  return (
    <div className="vis-pane">
      {/* Visualizer Top Header */}
      <div className="vis-controls-header">
        <div>
          <h3 className="vis-title">
            <BarChart3 size={20} className="vis-title-icon" /> Token Consumption & LLM Cost Visualizer
          </h3>
          <p className="vis-description">
            Interactive visualization engine: select any User or Agent and toggle between Daily, Weekly, and Monthly intervals to track who used the most tokens and LLM spend.
          </p>
        </div>
        <div className="vis-metric-toggle">
          <button
            className={`vis-toggle-btn ${chartMetric === "tokens" ? "active" : ""}`}
            onClick={() => setChartMetric("tokens")}
          >
            <Cpu size={14} /> Tokens Breakdown
          </button>
          <button
            className={`vis-toggle-btn ${chartMetric === "cost" ? "active" : ""}`}
            onClick={() => setChartMetric("cost")}
          >
            <Coins size={14} /> LLM Cost ($)
          </button>
        </div>
      </div>

      {/* 1st Small Scrollable Bar: User / Agent Selection */}
      <div className="vis-scroll-section">
        <div className="vis-scroll-label-row">
          <span className="vis-scroll-label">
            <User size={14} className="text-cyan" /> 1. Select User or Agent (Scroll horizontally to pick):
          </span>
          <div className="vis-mini-filters">
            <button
              className={`vis-filter-pill ${entityFilterType === "all" ? "active" : ""}`}
              onClick={() => setEntityFilterType("all")}
            >
              All Entities
            </button>
            <button
              className={`vis-filter-pill ${entityFilterType === "users" ? "active" : ""}`}
              onClick={() => setEntityFilterType("users")}
            >
              Users Only
            </button>
            <button
              className={`vis-filter-pill ${entityFilterType === "agents" ? "active" : ""}`}
              onClick={() => setEntityFilterType("agents")}
            >
              Agents Only
            </button>
          </div>
        </div>

        <div className="vis-scrollable-bar horizontal-scroll-custom">
          {scrollableEntities.map((ent) => {
            const isSelected = selectedEntityId === ent.id;
            return (
              <button
                key={ent.id}
                className={`vis-entity-chip ${isSelected ? "active" : ""} ${ent.type}`}
                onClick={() => setSelectedEntityId(ent.id)}
              >
                <div className="chip-icon-box">
                  {ent.icon === "users" && <Users size={14} />}
                  {ent.icon === "user" && <User size={14} />}
                  {ent.icon === "zap" && <Zap size={14} />}
                </div>
                <div className="chip-text-wrap">
                  <span className="chip-name">{ent.name}</span>
                  {ent.total ? (
                    <span className="chip-sub">{(ent.total / 1_000_000).toFixed(2)}M tok</span>
                  ) : (
                    <span className="chip-sub">Consolidated</span>
                  )}
                </div>
                {isSelected && <span className="chip-active-dot" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2nd Small Scrollable Bar / Button Group: Daily, Weekly, Monthly */}
      <div className="vis-scroll-section">
        <div className="vis-scroll-label-row">
          <span className="vis-scroll-label">
            <Calendar size={14} className="text-emerald" /> 2. Select Timeframe Interval (Graph updates dynamically):
          </span>
          <span className="vis-current-selection-badge">
            Tracking: <strong className="text-cyan">{entityTitle}</strong> &bull; <strong className="text-emerald">{timeframe.toUpperCase()}</strong>
          </span>
        </div>

        <div className="vis-timeframe-scrollable-bar horizontal-scroll-custom">
          <button
            className={`vis-timeframe-btn ${timeframe === "daily" ? "active" : ""}`}
            onClick={() => setTimeframe("daily")}
          >
            <Clock size={16} />
            <div className="tf-text">
              <strong>Daily Tracking</strong>
              <span>24 Hours Hourly Intervals</span>
            </div>
          </button>

          <button
            className={`vis-timeframe-btn ${timeframe === "weekly" ? "active" : ""}`}
            onClick={() => setTimeframe("weekly")}
          >
            <Calendar size={16} />
            <div className="tf-text">
              <strong>Weekly Tracking</strong>
              <span>7-Day Progression</span>
            </div>
          </button>

          <button
            className={`vis-timeframe-btn ${timeframe === "monthly" ? "active" : ""}`}
            onClick={() => setTimeframe("monthly")}
          >
            <BarChart3 size={16} />
            <div className="tf-text">
              <strong>Monthly Tracking</strong>
              <span>30-Day Aggregation</span>
            </div>
          </button>
        </div>
      </div>

      {/* Visualization Grid: Interactive Graph on Left + Ranked Leaderboard on Right */}
      <div className="vis-grid-layout">
        {/* Main Graph Panel */}
        <div className="vis-chart-panel">
          <div className="vis-chart-header">
            <div className="vis-chart-title-area">
              <span className="chart-tag">Telemetry Visualization</span>
              <h4 className="chart-main-heading">
                {entityTitle} &mdash; {timeframe === "daily" ? "Daily 24h Distribution" : timeframe === "weekly" ? "Weekly 7-Day Progression" : "Monthly 30-Day Aggregation"}
              </h4>
            </div>

            <div className="chart-legend-box">
              {chartMetric === "tokens" ? (
                <>
                  <span className="legend-item">
                    <span className="legend-color cyan-box" /> Input Tokens
                  </span>
                  <span className="legend-item">
                    <span className="legend-color emerald-box" /> Output Tokens
                  </span>
                </>
              ) : (
                <span className="legend-item">
                  <span className="legend-color gold-box" /> LLM Spend ($)
                </span>
              )}
            </div>
          </div>

          {/* Responsive SVG Chart */}
          <div className="vis-svg-container">
            <svg viewBox="0 0 700 280" className="vis-svg-chart" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="cyanBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00e6ff" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#0077ff" stopOpacity="0.75" />
                </linearGradient>
                <linearGradient id="emeraldBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00ff99" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#00aa66" stopOpacity="0.75" />
                </linearGradient>
                <linearGradient id="goldBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffd700" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#ff8800" stopOpacity="0.75" />
                </linearGradient>
                <linearGradient id="goldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffc107" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#ffc107" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              <line x1="60" y1="30" x2="670" y2="30" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <line x1="60" y1="90" x2="670" y2="90" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <line x1="60" y1="150" x2="670" y2="150" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <line x1="60" y1="210" x2="670" y2="210" stroke="rgba(255,255,255,0.08)" strokeDasharray="4 4" />
              <line x1="60" y1="240" x2="670" y2="240" stroke="rgba(255,255,255,0.22)" />

              {/* Y-Axis Labels */}
              <text x="52" y="34" textAnchor="end" className="svg-axis-label">
                {chartMetric === "cost" ? `$${maxMetricValue.toFixed(0)}` : `${(maxMetricValue / 1_000_000).toFixed(1)}M`}
              </text>
              <text x="52" y="94" textAnchor="end" className="svg-axis-label">
                {chartMetric === "cost" ? `$${(maxMetricValue * 0.75).toFixed(0)}` : `${((maxMetricValue * 0.75) / 1_000_000).toFixed(1)}M`}
              </text>
              <text x="52" y="154" textAnchor="end" className="svg-axis-label">
                {chartMetric === "cost" ? `$${(maxMetricValue * 0.5).toFixed(0)}` : `${((maxMetricValue * 0.5) / 1_000_000).toFixed(1)}M`}
              </text>
              <text x="52" y="214" textAnchor="end" className="svg-axis-label">
                {chartMetric === "cost" ? `$${(maxMetricValue * 0.25).toFixed(0)}` : `${((maxMetricValue * 0.25) / 1_000_000).toFixed(1)}M`}
              </text>
              <text x="52" y="244" textAnchor="end" className="svg-axis-label">0</text>

              {/* Chart Points */}
              {(() => {
                const totalSlots = timeSeriesPoints.length;
                const availableWidth = 590;
                const slotWidth = availableWidth / totalSlots;
                const barWidth = Math.min(slotWidth * 0.45, 38);

                if (chartMetric === "cost") {
                  const pts = timeSeriesPoints.map((pt, i) => {
                    const x = 70 + i * slotWidth + slotWidth / 2;
                    const heightRatio = Math.min(pt.cost / maxMetricValue, 1);
                    const y = 240 - heightRatio * 210;
                    return { x, y, pt };
                  });

                  const pathD = pts.reduce((acc, p, i) => {
                    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
                  }, "");

                  const areaD = `${pathD} L ${pts[pts.length - 1].x} 240 L ${pts[0].x} 240 Z`;

                  return (
                    <g>
                      <path d={areaD} fill="url(#goldAreaGrad)" />
                      <path d={pathD} fill="none" stroke="#ffd700" strokeWidth="3.5" strokeLinecap="round" />
                      {pts.map((p, idx) => (
                        <g key={idx}>
                          <rect
                            x={p.x - slotWidth / 2}
                            y="20"
                            width={slotWidth}
                            height="225"
                            fill="transparent"
                            className="svg-bar-hit"
                            onMouseEnter={() => setHoveredPoint(p.pt)}
                            onMouseLeave={() => setHoveredPoint(null)}
                          />
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={hoveredPoint?.label === p.pt.label ? "6" : "4"}
                            fill="#ffd700"
                            stroke="#01032e"
                            strokeWidth="2"
                          />
                          <text x={p.x} y="260" textAnchor="middle" className="svg-x-label">
                            {p.pt.label}
                          </text>
                        </g>
                      ))}
                    </g>
                  );
                }

                // Tokens Stacked Bars
                return timeSeriesPoints.map((pt, idx) => {
                  const centerX = 70 + idx * slotWidth + slotWidth / 2;
                  const inHeightRatio = Math.min(pt.inTok / maxMetricValue, 1);
                  const inHeight = Math.max(inHeightRatio * 210, 4);

                  const outHeightRatio = Math.min(pt.outTok / maxMetricValue, 1);
                  const outHeight = Math.max(outHeightRatio * 210, 4);

                  const barX1 = centerX - barWidth / 2 - 2;
                  const barX2 = centerX + 2;
                  const singleBarWidth = (barWidth - 2) / 2;

                  const isHovered = hoveredPoint?.label === pt.label;

                  return (
                    <g
                      key={idx}
                      className="svg-bar-group"
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    >
                      <rect
                        x={centerX - slotWidth / 2}
                        y="20"
                        width={slotWidth}
                        height="225"
                        fill="transparent"
                        className="svg-bar-hit"
                      />
                      <rect
                        x={barX1}
                        y={240 - inHeight}
                        width={singleBarWidth}
                        height={inHeight}
                        rx="3"
                        fill="url(#cyanBarGrad)"
                        className={`svg-bar ${isHovered ? "hovered" : ""}`}
                      />
                      <rect
                        x={barX2}
                        y={240 - outHeight}
                        width={singleBarWidth}
                        height={outHeight}
                        rx="3"
                        fill="url(#emeraldBarGrad)"
                        className={`svg-bar ${isHovered ? "hovered" : ""}`}
                      />
                      <text
                        x={centerX}
                        y="260"
                        textAnchor="middle"
                        className={`svg-x-label ${isHovered ? "highlight-x" : ""}`}
                      >
                        {pt.label}
                      </text>
                    </g>
                  );
                });
              })()}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div className="chart-floating-tooltip">
                <div className="tooltip-header">
                  <Clock size={12} /> {hoveredPoint.label}
                </div>
                <div className="tooltip-row">
                  <span className="text-cyan">Input Tokens:</span>
                  <strong>{hoveredPoint.inTok.toLocaleString()}</strong>
                </div>
                <div className="tooltip-row">
                  <span className="text-emerald">Output Tokens:</span>
                  <strong>{hoveredPoint.outTok.toLocaleString()}</strong>
                </div>
                <div className="tooltip-row border-top">
                  <span>Total Tokens:</span>
                  <strong>{hoveredPoint.totalTok.toLocaleString()}</strong>
                </div>
                <div className="tooltip-row text-gold">
                  <span>Estimated Spend:</span>
                  <strong>${hoveredPoint.cost.toFixed(2)}</strong>
                </div>
              </div>
            )}
          </div>

          {/* Metric Chips under Graph */}
          <div className="vis-summary-chips-row">
            <div className="summary-chip">
              <span className="sc-label">PERIOD TOTAL TOKENS</span>
              <strong className="sc-val">
                {(visFocusStats.totalTokensInFocus / 1_000_000).toFixed(2)}M
              </strong>
            </div>
            <div className="summary-chip">
              <span className="sc-label">PERIOD TOTAL SPEND</span>
              <strong className="sc-val text-gold-bold">
                ${visFocusStats.totalCostInFocus.toFixed(2)}
              </strong>
            </div>
            <div className="summary-chip">
              <span className="sc-label">PEAK CONSUMPTION INTERVAL</span>
              <strong className="sc-val text-cyan">
                {visFocusStats.peakPoint?.label || "N/A"}
              </strong>
            </div>
          </div>
        </div>

        {/* Right Column: "Who Used the Most" Leaderboard */}
        <div className="vis-leaderboard-panel">
          <div className="lb-header">
            <div>
              <div className="lb-kicker">Top Token Burners</div>
              <h4 className="lb-title">Who Used The Most</h4>
            </div>
            <span className="lb-badge-timeframe">
              <Flame size={13} /> {timeframe.toUpperCase()}
            </span>
          </div>

          <p className="lb-subtext">
            Ranked by total tokens & spend during this <strong>{timeframe}</strong> basis:
          </p>

          <div className="lb-list-wrap">
            {rankedUsers.slice(0, 6).map((usr, i) => {
              const sharePct = ((usr.totalTokens / globalKPIs.totalTokens) * 100).toFixed(1);
              const isTop1 = i === 0;
              return (
                <div
                  key={usr.id}
                  className={`lb-card ${isTop1 ? "top-consumer-card" : ""} ${selectedEntityId === usr.id ? "selected" : ""}`}
                  onClick={() => setSelectedEntityId(usr.id)}
                  title="Click to focus this user on graph"
                >
                  <div className="lb-rank-col">
                    <span className={`rank-num ${isTop1 ? "top-rank" : ""}`}>#{i + 1}</span>
                  </div>
                  <div className="lb-info-col">
                    <div className="lb-name-row">
                      <strong className="lb-user-name">{usr.userName}</strong>
                      <span className="lb-cost-tag">${usr.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="lb-meta-row">
                      <span>{usr.dept}</span>
                      <span className="dot-sep">&bull;</span>
                      <span className="text-cyan font-mono">
                        {(usr.totalTokens / 1_000_000).toFixed(2)}M tok
                      </span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="lb-progress-bar-wrap">
                      <div
                        className="lb-progress-bar-fill"
                        style={{
                          width: `${Math.min(parseFloat(sharePct) * 2.8, 100)}%`,
                          background: isTop1
                            ? "linear-gradient(90deg, #ffc107, #ff5722)"
                            : "linear-gradient(90deg, #00aaff, #00ff99)",
                        }}
                      />
                      <span className="lb-pct-text">{sharePct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Agent Breakdown subcard */}
          <div className="lb-agents-subcard">
            <div className="subcard-title">
              <Zap size={14} className="text-amber" /> Most Consumed Agent ({timeframe.toUpperCase()})
            </div>
            <div className="subcard-row">
              <strong>{globalKPIs.topAgent?.agentName}</strong>
              <span className="text-gold-bold">${globalKPIs.topAgent?.totalCost.toFixed(2)}</span>
            </div>
            <div className="subcard-meta">
              {(globalKPIs.topAgent?.totalTokens / 1_000_000).toFixed(2)}M tokens consumed by {globalKPIs.topAgent?.topUser}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
