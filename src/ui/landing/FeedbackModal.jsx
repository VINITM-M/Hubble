/**
 * ui/landing/FeedbackModal.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Modal that collects a star rating + review before launching an agent.
 * Opens when user clicks "Launch Agent" on an Available agent card.
 *
 * Props:
 *  agent          – agent object
 *  onClose        – fn()
 *  onSubmitRating – fn(agentId, rating, email, review) → updatedStats | null
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import {
  getActiveUserEmail,
  setActiveUserEmail,
  submitFeedbackToBackend,
  recordLaunchClick,
} from "../../services/backendApi.js";

const STAR_LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

export function FeedbackModal({ agent, onClose, onSubmitRating }) {
  const [hovered, setHovered]         = useState(0);
  const [selected, setSelected]       = useState(0);
  const [email, setEmail]             = useState(() => getActiveUserEmail() || "");
  const [review, setReview]           = useState("");
  const [attachment, setAttachment]   = useState(null);
  const [submitted, setSubmitted]     = useState(false);
  const [updatedStats, setUpdatedStats] = useState(null);
  const fileRef = useRef(null);

  // Close on ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;
    const finalEmail = (email && email.trim()) || "user@aurigene.com";
    setActiveUserEmail(finalEmail);

    // Immediate optimistic local update
    if (onSubmitRating) {
      const stats = onSubmitRating(agent.id, selected, finalEmail, review.trim());
      if (stats) setUpdatedStats(stats);
    }
    setSubmitted(true);

    // Call backend API with rating, review, and attachment
    submitFeedbackToBackend({
      email: finalEmail,
      agentId: agent.id,
      agentName: agent.name,
      rating: selected,
      feedbackText: review.trim(),
      attachmentFile: attachment,
    }).then((backendRes) => {
      if (backendRes?.updated_stats) {
        setUpdatedStats(backendRes.updated_stats);
        if (onSubmitRating) {
          onSubmitRating(agent.id, selected, finalEmail, review.trim(), backendRes.updated_stats);
        }
      }
    });

    // Brief acknowledgement then open agent in new tab
    setTimeout(() => {
      window.open(agent.primary.url, "_blank", "noreferrer");
      onClose();
    }, 1400);
  };

  const handleSkipLaunch = () => {
    const finalEmail = (email && email.trim()) || getActiveUserEmail();
    setActiveUserEmail(finalEmail);
    recordLaunchClick(finalEmail, agent.id, "agent");
    window.open(agent.primary.url, "_blank", "noreferrer");
    onClose();
  };

  const isImageIcon = typeof agent.icon === "string";
  const Icon        = !isImageIcon ? agent.icon : null;

  return (
    <div className="fb-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="fb-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="fb-header">
          <div className="fb-header-left">
            <div className={`fb-agent-icon accent-${agent.accent}`}>
              {isImageIcon ? <img src={agent.icon} alt={agent.name} /> : <Icon size={20} strokeWidth={1.8} />}
            </div>
            <div>
              <p className="fb-label">You've used this agent before — Share your rating</p>
              <h3 className="fb-agent-name">{agent.name}</h3>
            </div>
          </div>
          <button className="fb-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          /* Success state */
          <div className="fb-success">
            <div className="fb-success-icon">✓</div>
            <h4>Thank you! Rating recorded.</h4>
            <p>
              Your <strong>{selected}★</strong> rating was saved for <strong>{agent.name}</strong>.
            </p>
            {updatedStats && (
              <div className="fb-live-stat-badge">
                ⭐ Updated Live Score: <strong>{Number(updatedStats.rating).toFixed(1)}</strong> ({updatedStats.reviews} ratings)
              </div>
            )}
            <p className="fb-launching-text">Launching agent now…</p>
          </div>
        ) : (
          <form className="fb-body" onSubmit={handleSubmit}>

            {/* Email */}
            <div className="fb-user-identity">
              <div className="fb-identity-row">
                <label className="fb-section-label" htmlFor="fb-email-input">
                  Your User Email ID <span className="fb-required">*</span>
                </label>
                <span className="fb-email-hint">Ratings tracked uniquely per email</span>
              </div>
              <div className="fb-email-box">
                <span className="fb-email-badge">
                  {email && email[0] ? email[0].toUpperCase() : "U"}
                </span>
                <input
                  id="fb-email-input"
                  type="email"
                  className="fb-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. user@aurigene.com"
                  required
                />
              </div>
            </div>

            {/* Stars */}
            <div className="fb-stars-section">
              <div className="fb-stars-header">
                <p className="fb-section-label">Select Your Rating</p>
                <span className="fb-current-stat">
                  Current: <strong>{Number(agent.rating).toFixed(1)} ★</strong> ({agent.reviews} ratings)
                </span>
              </div>
              <div className="fb-stars">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`fb-star ${s <= (hovered || selected) ? "fb-star-active" : ""}`}
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setSelected(s)}
                    aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {(hovered || selected) > 0 && (
                <span className="fb-star-label">
                  {hovered || selected} Star{(hovered || selected) > 1 ? "s" : ""} — {STAR_LABELS[hovered || selected]}
                </span>
              )}
            </div>

            {/* Review */}
            <div className="fb-field">
              <label className="fb-section-label" htmlFor="fb-review">
                Share your feedback <span className="fb-optional">(optional)</span>
              </label>
              <textarea
                id="fb-review"
                className="fb-textarea"
                rows={3}
                placeholder="How did this agent perform? What worked best?"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                maxLength={500}
              />
              <span className="fb-char-count">{review.length}/500</span>
            </div>

            {/* Attachment */}
            <div className="fb-field">
              <label className="fb-section-label">
                Attach a file <span className="fb-optional">(optional)</span>
              </label>
              <div
                className="fb-attachment-zone"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) setAttachment(file);
                }}
              >
                <input
                  ref={fileRef}
                  type="file"
                  style={{ display: "none" }}
                  onChange={(e) => setAttachment(e.target.files[0] || null)}
                  accept=".png,.jpg,.jpeg,.pdf,.docx,.xlsx,.txt"
                />
                {attachment ? (
                  <span className="fb-attachment-name">
                    📎 {attachment.name}
                    <button
                      type="button"
                      className="fb-attachment-remove"
                      onClick={(e) => { e.stopPropagation(); setAttachment(null); }}
                    >
                      ×
                    </button>
                  </span>
                ) : (
                  <span className="fb-attachment-hint">
                    Click or drag &amp; drop a file here
                    <em>.png, .jpg, .pdf, .docx, .xlsx, .txt</em>
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="fb-actions">
              <button
                type="button"
                className="fb-skip"
                onClick={handleSkipLaunch}
              >
                Skip &amp; Launch
              </button>
              <button
                type="submit"
                className={`fb-submit ${selected ? "fb-submit-active" : ""}`}
                disabled={!selected}
              >
                Submit &amp; Launch <ArrowRight size={15} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
