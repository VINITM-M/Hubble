/**
 * ui/landing/AgentCard.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Individual agent card rendered in the discovery grid on the Landing Page.
 *
 * Props:
 *  agent            – agent object from models/agents.js
 *  onLaunch         – fn(agentId)
 *  onOpenDemo       – fn(agent)
 *  onOpenDetails    – fn()
 *  isHighlighted    – boolean (chatbot locate highlight)
 *  isFavorited      – boolean
 *  onToggleFavorite – fn(agentId)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useMemo } from "react";
import { ArrowRight, Bookmark, Play } from "lucide-react";
import { isDemoVideoEnabled } from "../../models/agents.js";

export function AgentCard({
  agent,
  onLaunch,
  onOpenDemo,
  onOpenDetails,
  isHighlighted,
  isFavorited,
  onToggleFavorite,
}) {
  const isImageIcon = typeof agent.icon === "string";
  const Icon        = !isImageIcon ? agent.icon : null;
  const disabled    = agent.primary.status !== "Available";

  // Trim capability tags to 3 words max each, show first 3
  const tags = useMemo(() => {
    const list = agent.cardTags || agent.capabilities;
    if (Array.isArray(list) && list.length > 0) {
      return list.slice(0, 3).map((c) => {
        const words = c.trim().split(" ");
        return words.length > 3 ? words.slice(0, 3).join(" ") : c;
      });
    }
    return ["Workflow AI", "Automation", "Intelligence"];
  }, [agent.cardTags, agent.capabilities]);

  // Calmer, warm amber for saved/favorited state
  const SAVE_COLOR = "#d97706";
  const STAR_COLOR = "#f59e0b";

  return (
    <article
      id={`agent-card-${agent.id}`}
      className={`agent-card accent-${agent.accent || "blue"} ${isHighlighted ? "card-highlight-active" : ""} ${disabled ? "card-unavailable" : ""}`}
    >
      {/* Top row: icon + badges + favorite/save */}
      <div className="card-topline">
        <div
          className={`agent-icon-box accent-${agent.accent || "blue"}`}
          onClick={onOpenDetails}
          style={{ cursor: "pointer" }}
          title="Click to view details"
        >
          {isImageIcon ? (
            <img src={agent.icon} alt={agent.name} className="agent-icon-img" />
          ) : (
            <Icon size={20} strokeWidth={2} />
          )}
        </div>

        <div className="card-topline-right">
          {agent.isTrending && (
            <span className="product-badge badge-trending" title="Trending / Frequently Used">
              Trending
            </span>
          )}
          {(agent.isTopRated || agent.rating >= 4.7) && (
            <span className="product-badge badge-top-rated" title="Top Rated Agent">
              Top Rated
            </span>
          )}
          <button
            type="button"
            className={`favorite-btn ${isFavorited ? "is-favorited" : ""}`}
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(agent.id); }}
            title={isFavorited ? "Saved (Click to remove)" : "Save agent"}
            aria-label={isFavorited ? "Saved in Favorites" : "Save to Favorites"}
          >
            <Bookmark
              size={14}
              className="fav-icon"
              strokeWidth={2}
              fill={isFavorited ? SAVE_COLOR : "none"}
              color={isFavorited ? SAVE_COLOR : "#94a3b8"}
            />
          </button>
        </div>
      </div>

      {/* Copy block */}
      <div className="card-copy" onClick={onOpenDetails} style={{ cursor: "pointer" }} title="Click to view details">
        <div className="category-label">{agent.department}</div>
        <h3>{agent.name}</h3>
        <p>{agent.description}</p>
      </div>

      {/* Footer: ratings + actions */}
      <div className="card-footer-container">
        <div className="card-ratings-row">
          <div className="card-ratings">
            <span className="card-ratings-score">{Number(agent.rating).toFixed(1)}</span>
            <svg viewBox="0 0 24 24" className="star-svg star-full" style={{ width: 14, height: 14 }} aria-hidden="true">
              <polygon
                points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                fill={STAR_COLOR}
                stroke={STAR_COLOR}
                strokeWidth="1.5"
              />
            </svg>
            <span className="card-ratings-count">({agent.reviews})</span>
          </div>
        </div>

        <div className="card-actions-row">
          {(() => {
            const hasDemo = isDemoVideoEnabled(agent);
            return (
              <button
                type="button"
                className={`demo-button ${!hasDemo ? "disabled" : ""}`}
                disabled={!hasDemo}
                onClick={(e) => {
                  e.stopPropagation();
                  if (hasDemo) onOpenDemo(agent);
                }}
                title={hasDemo ? `Watch Demo for ${agent.name}` : "Demo video not available"}
                aria-disabled={!hasDemo}
              >
                <Play size={12} fill="currentColor" /> Demo
              </button>
            );
          })()}

          <a
            className={`launch-button ${disabled ? "disabled" : ""}`}
            href={disabled ? undefined : agent.primary.url}
            target="_blank"
            rel="noreferrer"
            aria-disabled={disabled}
            title={disabled ? "This agent is not yet available" : `Launch ${agent.name}`}
            onClick={(e) => {
              e.preventDefault();
              if (!disabled && onLaunch) onLaunch(agent.id);
            }}
          >
            {disabled ? "Coming Soon" : "Launch Agent"}
            {!disabled && <ArrowRight size={14} />}
          </a>
        </div>
      </div>
    </article>
  );
}
