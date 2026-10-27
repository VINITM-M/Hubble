/**
 * ui/shared/RaiseRequestModal.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * "Raise a Request" modal — pops up on the first Launch Agent click.
 * 100% ContactModal CSS classes — same dark theme, same font, same palette.
 *
 * Props:
 *  isOpen    – boolean
 *  agent     – agent object
 *  onClose   – fn()
 *  onSubmit  – fn(agentId) — called after successful submission
 *  userEmail – string | null
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from "react";
import {
  X,
  Send,
  CheckCircle2,
  Sparkles,
  User,
  MessageSquare,
} from "lucide-react";
import { getActiveUserEmail } from "../../services/backendApi.js";
import "../../styles/stories.css";

export function RaiseRequestModal({ isOpen, agent, onClose, onSubmit, userEmail = null, isDarkMode = true }) {
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage]         = useState("");
  const [isSending, setIsSending]     = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  /* ── Reset + pre-fill whenever modal opens ── */
  useEffect(() => {
    if (isOpen) {
      setSenderEmail(userEmail || getActiveUserEmail() || "");
      setMessage("");
      setIsSending(false);
      setIsSubmitted(false);
    }
  }, [isOpen, userEmail, agent]);

  /* ── Escape key closes ── */
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  /* ── Prevent body scroll ── */
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  if (!isOpen || !agent) return null;

  /* ── Submit ── */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!senderEmail.trim()) return;
    setIsSending(true);

    try {
      const existing = JSON.parse(localStorage.getItem("hubble_raise_requests") || "[]");
      existing.unshift({
        id:        `RR-${Date.now()}`,
        agentId:   agent.id,
        agentName: agent.name,
        from:      senderEmail.trim(),
        message:   message.trim(),
        timestamp: new Date().toISOString(),
        status:    "pending",
      });
      localStorage.setItem("hubble_raise_requests", JSON.stringify(existing));
    } catch (err) {
      console.warn("Could not record raise request", err);
    }

    setTimeout(() => {
      setIsSending(false);
      setIsSubmitted(true);
      if (onSubmit) onSubmit(agent.id);
    }, 600);
  };

  return (
    /* Backdrop — identical class as ContactModal */
    <div
      className="contact-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rr-modal-title"
    >
      {/* Card — identical class as ContactModal */}
      <div
        className={`contact-modal-card ${isDarkMode ? "theme-dark" : "theme-light"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="contact-modal-header">
          <div className="contact-modal-title-group">
            <div className="contact-modal-icon-badge">
              <Sparkles size={18} />
            </div>
            <div>
              <span className="contact-modal-eyebrow">AGENT ACCESS REQUEST</span>
              <h2 id="rr-modal-title" className="contact-modal-title">
                Raise a Request
              </h2>
            </div>
          </div>
          <button
            type="button"
            className="contact-modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {isSubmitted ? (
          /* ── Success ── */
          <div className="contact-modal-success-pane">
            <div className="contact-success-icon-wrap">
              <CheckCircle2 size={52} />
            </div>
            <h3 className="contact-success-heading">Request Submitted!</h3>
            <p className="contact-success-desc">
              Your access request for{" "}
              <strong style={{ color: "#38bdf8" }}>{agent.name}</strong> has been
              received. The team will reach out to{" "}
              <span className="contact-success-email">{senderEmail}</span> shortly.
            </p>

            <div className="contact-success-summary-box">
              <div className="contact-summary-row">
                <span className="contact-summary-label">Agent</span>
                <span className="contact-summary-val">{agent.name}</span>
              </div>
              <div className="contact-summary-row">
                <span className="contact-summary-label">From</span>
                <span className="contact-summary-val">{senderEmail}</span>
              </div>
              {agent.department && (
                <div className="contact-summary-row">
                  <span className="contact-summary-label">Department</span>
                  <span className="contact-summary-val">{agent.department}</span>
                </div>
              )}
              <div className="contact-summary-row">
                <span className="contact-summary-label">Status</span>
                <span className="contact-summary-val" style={{ color: "#fbbf24" }}>
                  Pending Approval
                </span>
              </div>
            </div>

            <div className="contact-success-actions">
              <button type="button" className="contact-btn-primary" onClick={onClose}>
                <span>Done</span>
              </button>
            </div>
          </div>
        ) : (
          /* ── Form ── */
          <form className="contact-modal-form" onSubmit={handleSubmit}>
            <p className="contact-field-hint" style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 4 }}>
              Requesting access to{" "}
              <strong style={{ color: "#38bdf8", fontWeight: 700 }}>{agent.name}</strong>.
              Fill in your details and the Hubble team will follow up.
            </p>

            {/* Agent (read-only) */}
            <div className="contact-form-group">
              <label className="contact-form-label">
                <Sparkles size={13} />
                <span>Agent</span>
              </label>
              <input
                type="text"
                className="contact-form-input"
                value={agent.name}
                readOnly
                tabIndex={-1}
                style={{ opacity: 0.55, cursor: "default" }}
              />
            </div>

            {/* Work Email */}
            <div className="contact-form-group">
              <label htmlFor="rr-sender-email" className="contact-form-label">
                <User size={13} />
                <span>Your Work Email</span>
                <span className="contact-badge-req">Required</span>
              </label>
              <input
                id="rr-sender-email"
                type="email"
                className="contact-form-input"
                placeholder="e.g. yourname@aurigeneservices.com"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                required
                autoFocus
              />
              <span className="contact-field-hint">
                Auto-detected from your session. Edit if needed.
              </span>
            </div>

            {/* Notes (optional) */}
            <div className="contact-form-group">
              <label htmlFor="rr-message" className="contact-form-label">
                <MessageSquare size={13} />
                <span>Use Case / Notes</span>
                <span className="contact-field-hint" style={{ marginLeft: 4 }}>
                  Optional
                </span>
              </label>
              <textarea
                id="rr-message"
                className="contact-form-textarea"
                rows={3}
                placeholder="Briefly describe your use case or why you need access..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="contact-modal-actions" style={{ justifyContent: "flex-end" }}>
              <div className="contact-actions-right">
                <button type="button" className="contact-btn-cancel" onClick={onClose}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="contact-btn-primary"
                  disabled={isSending || !senderEmail.trim()}
                >
                  {isSending ? (
                    <span>Submitting…</span>
                  ) : (
                    <>
                      <span>Raise Request</span>
                      <Send size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
