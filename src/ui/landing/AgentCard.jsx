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

import React, { useMemo, useRef, useState, useEffect } from "react";
import { ArrowRight, Play, Star } from "lucide-react";
import trendingIcon from "../../assets/trending-48.png";

export function AgentCard({
  agent,
  index = 0,
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

  const cardRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const row = Math.floor(index / 3);

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

  return (
    <article
      ref={cardRef}
      id={`agent-card-${agent.id}`}
      style={{ "--card-index": index, "--card-row": row }}
      className={`agent-card accent-${agent.accent || "blue"} ${isInView ? "is-in-view" : ""} ${isHighlighted ? "card-highlight-active" : ""} ${disabled ? "card-unavailable" : ""}`}
    >
      {/* Top row: icon + badges + favorite */}
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
            <span className="badge hot-tag" title="Trending / Frequently Used">
              <img src={trendingIcon} alt="Trending" className="trending-icon-img" />
            </span>
          )}
          <button
            type="button"
            className={`favorite-btn ${isFavorited ? "is-favorited" : ""}`}
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(agent.id); }}
            title={isFavorited ? "In Favorites (Click to remove)" : "Add to Favorites"}
            aria-label={isFavorited ? "In Favorites" : "Add to Favorites"}
          >
            <Star
              size={14}
              className="fav-star-icon"
              fill={isFavorited ? "#f59e0b" : "none"}
              color={isFavorited ? "#f59e0b" : "#94a3b8"}
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

      {/* Capability chips */}
      {tags.length > 0 && (
        <div className="card-capability-chips">
          {tags.map((tag, idx) => (
            <span key={idx} className="capability-chip">{tag}</span>
          ))}
        </div>
      )}

      {/* Footer: ratings + actions */}
      <div className="card-footer-container">
        <div className="card-ratings-row">
          <div className="card-ratings">
            <span className="card-ratings-score">{Number(agent.rating).toFixed(1)}</span>
            <span className="card-ratings-stars">
              {[1, 2, 3, 4, 5].map((s) => {
                const full    = s <= Math.floor(agent.rating);
                const partial = !full && s - 1 < agent.rating && agent.rating < s;
                return (
                  <svg key={s} viewBox="0 0 24 24" className={`star-svg ${full ? "star-full" : partial ? "star-partial" : "star-empty"}`}>
                    {partial && (
                      <defs>
                        <linearGradient id={`pg-${agent.id}-${s}`}>
                          <stop offset={`${(agent.rating - (s - 1)) * 100}%`} stopColor="#f59e0b" />
                          <stop offset={`${(agent.rating - (s - 1)) * 100}%`} stopColor="transparent" />
                        </linearGradient>
                      </defs>
                    )}
                    <polygon
                      points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
                      fill={full ? "#f59e0b" : partial ? `url(#pg-${agent.id}-${s})` : "none"}
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                    />
                  </svg>
                );
              })}
            </span>
            <span className="card-ratings-count">({agent.reviews})</span>
          </div>
        </div>

        <div className="card-actions-row">
          <button
            type="button"
            className="demo-button"
            onClick={(e) => { e.stopPropagation(); onOpenDemo(agent); }}
            title={`Watch Demo for ${agent.name}`}
          >
            <Play size={12} fill="currentColor" /> Demo
          </button>

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
