/**
 * ui/landing/DetailsDrawer.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Slide-in side drawer that shows full details for a selected agent.
 *
 * Props:
 *  agent            – agent object or null
 *  onClose          – fn()
 *  onLaunch         – fn(agentId)
 *  onOpenDemo       – fn(agent)
 *  isFavorited      – boolean
 *  onToggleFavorite – fn(agentId)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from "react";
import { ExternalLink, Play, Star, X } from "lucide-react";
import trendingIcon from "../../assets/trending-48.png";

export function DetailsDrawer({ agent, onClose, onLaunch, onOpenDemo, isFavorited, onToggleFavorite }) {
  if (!agent) return null;

  const isImageIcon       = typeof agent.icon === "string";
  const Icon              = !isImageIcon ? agent.icon : null;
  const primaryEnabled    = agent.primary?.status === "Available";

  return (
    <div className="drawer-layer" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside className="details-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">

        {/* Top controls: favorite + close */}
        <div className="drawer-top-controls">
          <button
            type="button"
            className={`favorite-btn drawer-fav-btn ${isFavorited ? "is-favorited" : ""}`}
            onClick={() => onToggleFavorite(agent.id)}
            title={isFavorited ? "In Favorites (Click to remove)" : "Add to Favorites"}
            aria-label={isFavorited ? "In Favorites" : "Add to Favorites"}
          >
            <Star
              size={16}
              className="fav-star-icon"
              fill={isFavorited ? "#f59e0b" : "none"}
              color={isFavorited ? "#f59e0b" : "currentColor"}
            />
          </button>

          <button className="drawer-close" onClick={onClose} aria-label="Close details">
            <X size={19} />
          </button>
        </div>

        {/* Icon + trending badge */}
        <div className="drawer-header-row">
          <div className={`drawer-icon accent-${agent.accent}`}>
            {isImageIcon ? (
              <img src={agent.icon} alt={agent.name} className="drawer-icon-img" />
            ) : (
              <Icon size={25} />
            )}
          </div>

          <div className="drawer-header-badges">
            {agent.isTrending && (
              <span className="badge hot-tag" title="Trending / Frequently Used">
                <img src={trendingIcon} alt="Trending" className="trending-icon-img" />
              </span>
            )}
          </div>
        </div>

        {/* Title + description */}
        <div className="drawer-kicker">Agent details</div>
        <h2 id="drawer-title">{agent.name}</h2>
        <p className="drawer-description">{agent.detailedDescription || agent.description}</p>

        {/* Department */}
        <section className="drawer-section">
          <span className="meta-label">Department</span>
          <strong>{agent.department}</strong>
        </section>

        {/* Capabilities */}
        {agent.capabilities && agent.capabilities.length > 0 && (
          <section className="drawer-section">
            <span className="meta-label">Capabilities</span>
            <ul className="capability-list">
              {agent.capabilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Meta facts */}
        <section className="drawer-facts">
          <div>
            <span>Rating Score</span>
            <strong style={{ color: "#fbbf24" }}>⭐ {Number(agent.rating).toFixed(1)} ({agent.reviews})</strong>
          </div>
          <div>
            <span>Developer</span>
            <strong>{agent.owner ?? "AI Innovation Team"}</strong>
          </div>
          <div>
            <span>Version</span>
            <strong>{agent.version ?? "1.0"}</strong>
          </div>
          <div>
            <span>Last updated</span>
            <strong>{agent.updated ?? "September 2026"}</strong>
          </div>
        </section>

        {/* Actions */}
        <div className="drawer-actions" style={{ flexDirection: "column", gap: "10px" }}>
          <button type="button" className="demo-button wide" onClick={() => onOpenDemo(agent)}>
            <Play size={14} fill="currentColor" /> Watch Demo Video
          </button>
          <a
            className={`launch-button wide ${!primaryEnabled ? "disabled" : ""}`}
            href={primaryEnabled ? agent.primary?.url : undefined}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => {
              e.preventDefault();
              if (primaryEnabled && onLaunch) onLaunch(agent.id);
            }}
          >
            Launch Agent <ExternalLink size={15} />
          </a>
        </div>
      </aside>
    </div>
  );
}
