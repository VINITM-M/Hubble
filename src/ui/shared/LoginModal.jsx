/**
 * ui/shared/LoginModal.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Simple, elegant login modal for Hubble AI Portal.
 * Triggered when a guest clicks "Launch Agent".
 * 
 * Contains:
 *   - 1 email input box
 *   - 1 Login button
 *   - Upon successful login: stores email, sets profile avatar (first 2 letters),
 *     and automatically resumes launching the agent.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useRef } from "react";
import { X, ArrowRight, ShieldCheck, Mail } from "lucide-react";

export function LoginModal({ isOpen, onClose, onLoginSuccess, pendingAgentName = "" }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setError("");
    }
  }, [isOpen]);

  // Close on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    // Basic email validation
    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setError("Please enter a valid work email address (e.g. name@aurigene.com)");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (onLoginSuccess) {
        await onLoginSuccess(cleanEmail);
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="login-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="login-modal-header">
          <div className="login-modal-header-icon">
            <ShieldCheck size={22} className="login-shield-icon" />
          </div>
          <div className="login-modal-title-wrap">
            <h3 className="login-modal-title">Sign In to Launch Agent</h3>
            <p className="login-modal-subtitle">
              {pendingAgentName
                ? `Enter your email to launch ${pendingAgentName} and save your preferences`
                : "Enter your work email to access agents and track your favorites"}
            </p>
          </div>
          <button className="login-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form className="login-modal-form" onSubmit={handleSubmit}>
          <div className="login-input-group">
            <label htmlFor="user-login-email" className="login-input-label">
              Work Email Address <span className="login-required">*</span>
            </label>
            <div className="login-input-box">
              <Mail size={16} className="login-input-icon" />
              <input
                ref={inputRef}
                id="user-login-email"
                type="email"
                className="login-input-field"
                placeholder="e.g. scientist@aurigene.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                required
                disabled={isLoading}
              />
            </div>
            {error && <p className="login-error-text">{error}</p>}
          </div>

          <div className="login-modal-actions">
            <button
              type="submit"
              className="login-submit-btn"
              disabled={isLoading || !email.trim()}
            >
              <span>{isLoading ? "Signing in…" : "Login & Continue"}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
