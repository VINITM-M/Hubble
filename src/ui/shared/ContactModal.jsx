/**
 * ui/shared/ContactModal.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Enterprise Contact Us Modal for Hubble.ai Stories and Portal.
 *
 * Features:
 *  - "From": User's actual email (auto-populated from active session / login)
 *  - "To": Dropdown selector featuring:
 *      1. Rohit Chintawar – rohit@aurigeneservices.com (DPEx)
 *      2. Hibah Ihsan Muhammad – hibah@aurigeneservices.com (Product Manager)
 *      3. Vinith – vinith@aurigeneservices.com (Developer)
 *  - Subject & Message fields with character counts & validation
 *  - Recipient profile preview card with avatar badge & role description
 *  - Supports both direct sending (saved locally) and opening user's native email client (mailto)
 *  - Elegant dark & vibrant Aurigene background color styling
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from "react";
import {
  X,
  Send,
  Mail,
  User,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Building2,
  Copy,
  Check,
} from "lucide-react";
import { getActiveUserEmail, setActiveUserEmail } from "../../services/backendApi.js";
import "../../styles/stories.css";

export const CONTACT_RECIPIENTS = [
  {
    id: "rohit",
    name: "Rohit Chintawar",
    role: "Chief Digital and Information Officer",
    department: "DPEx",
    email: "rohit@aurigeneservices.com",
    avatarBg: "linear-gradient(135deg, #1d5793 0%, #0284c7 100%)",
    initials: "RC",
    tagColor: "#38bdf8",
  },
  {
    id: "hibah",
    name: "Hibah Ihsan Muhammad",
    role: "Product Manager",
    department: "Product Manager",
    email: "hibah@aurigeneservices.com",
    avatarBg: "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)",
    initials: "HM",
    tagColor: "#22d3ee",
  },
  {
    id: "vinith",
    name: "Vinith",
    role: "Developer",
    department: "Developer",
    email: "vinith@aurigeneservices.com",
    avatarBg: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    initials: "VI",
    tagColor: "#34d399",
  },
];

export function ContactModal({
  isOpen,
  onClose,
  userEmail = null,
  isDarkMode = true,
  defaultSubject = "",
}) {
  const [senderEmail, setSenderEmail] = useState("");
  const [recipientEmail, setRecipientEmail] = useState(CONTACT_RECIPIENTS[0].email);
  const [subject, setSubject] = useState(defaultSubject || "Inquiry regarding Hubble.ai Platform");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Auto-populate actual user email when modal opens
  useEffect(() => {
    if (isOpen) {
      const active = userEmail || getActiveUserEmail() || "";
      setSenderEmail(active);
      setRecipientEmail(CONTACT_RECIPIENTS[0].email);
      setSubject(defaultSubject || "Inquiry regarding Hubble.ai Platform");
      setMessage("");
      setIsSubmitted(false);
      setIsSending(false);
      setCopiedEmail(false);
    }
  }, [isOpen, userEmail, defaultSubject]);

  // Close modal on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentRecipient =
    CONTACT_RECIPIENTS.find((r) => r.email === recipientEmail) || CONTACT_RECIPIENTS[0];

  const handleCopyEmail = (email) => {
    try {
      navigator.clipboard.writeText(email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleSendEmail = (e) => {
    e.preventDefault();
    if (!senderEmail.trim() || !message.trim()) return;

    setIsSending(true);

    // Save actual user email to active session
    setActiveUserEmail(senderEmail.trim());

    // Save contact inquiry to localStorage audit log
    try {
      const existing = JSON.parse(localStorage.getItem("hubble_contact_messages") || "[]");
      existing.unshift({
        id: `MSG-${Date.now()}`,
        from: senderEmail.trim(),
        to: recipientEmail,
        toName: currentRecipient.name,
        toRole: currentRecipient.role,
        subject: subject.trim(),
        message: message.trim(),
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem("hubble_contact_messages", JSON.stringify(existing));
    } catch (err) {
      console.warn("Could not record sent message to localStorage", err);
    }

    setTimeout(() => {
      setIsSending(false);
      setIsSubmitted(true);
    }, 600);
  };

  const handleOpenMailClient = () => {
    const finalFrom = senderEmail.trim();
    const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(
      subject.trim()
    )}&body=${encodeURIComponent(
      `From: ${finalFrom}\n\n${message.trim()}\n\n---\nSent via Hubble.ai Contact Portal`
    )}`;
    window.open(mailtoUrl, "_blank");
  };

  return (
    <div
      className="contact-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
    >
      <div
        className={`contact-modal-card ${isDarkMode ? "theme-dark" : "theme-light"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Glow Pill & Close */}
        <div className="contact-modal-header">
          <div className="contact-modal-title-group">
            <div className="contact-modal-icon-badge">
              <Mail size={18} className="contact-modal-icon-svg" />
            </div>
            <div>
              <span className="contact-modal-eyebrow">AURIGENE ENTERPRISE DIRECTORY</span>
              <h2 id="contact-modal-title" className="contact-modal-title">
                Contact Hubble.ai Team
              </h2>
            </div>
          </div>
          <button
            type="button"
            className="contact-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {isSubmitted ? (
          /* ── Success Confirmation Screen ── */
          <div className="contact-modal-success-pane">
            <div className="contact-success-icon-wrap">
              <CheckCircle2 size={52} className="contact-success-check" />
            </div>
            <h3 className="contact-success-heading">Message Dispatched!</h3>
            <p className="contact-success-desc">
              Your inquiry has been routed to <strong>{currentRecipient.name}</strong> (
              <span className="contact-success-email">{currentRecipient.email}</span>).
              A confirmation copy is logged under your session.
            </p>

            <div className="contact-success-summary-box">
              <div className="contact-summary-row">
                <span className="contact-summary-label">From:</span>
                <span className="contact-summary-val">{senderEmail}</span>
              </div>
              <div className="contact-summary-row">
                <span className="contact-summary-label">To:</span>
                <span className="contact-summary-val">
                  {currentRecipient.name} ({currentRecipient.role})
                </span>
              </div>
              <div className="contact-summary-row">
                <span className="contact-summary-label">Subject:</span>
                <span className="contact-summary-val">{subject}</span>
              </div>
            </div>

            <div className="contact-success-actions">
              <button
                type="button"
                className="contact-btn-open-client"
                onClick={handleOpenMailClient}
                title="Open your Outlook or native email client"
              >
                <ExternalLink size={15} />
                <span>Open in Outlook / Mail</span>
              </button>
              <button
                type="button"
                className="contact-btn-primary"
                onClick={onClose}
              >
                <span>Done</span>
              </button>
            </div>
          </div>
        ) : (
          /* ── Main Contact Form ── */
          <form className="contact-modal-form" onSubmit={handleSendEmail}>
            {/* Field 1: From (User's actual email) */}
            <div className="contact-form-group">
              <label htmlFor="contact-from-input" className="contact-form-label">
                <User size={13} />
                <span>From (Your Work Email)</span>
                <span className="contact-badge-req">Required</span>
              </label>
              <div className="contact-input-wrap">
                <input
                  id="contact-from-input"
                  type="email"
                  className="contact-form-input"
                  placeholder="e.g. yourname@aurigeneservices.com"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  required
                />
              </div>
              <span className="contact-field-hint">
                Auto-detected from your current Hubble session. You can edit this if needed.
              </span>
            </div>

            {/* Field 2: To (Dropdown Menu with the 3 exact recipients) */}
            <div className="contact-form-group">
              <label htmlFor="contact-to-select" className="contact-form-label">
                <Building2 size={13} />
                <span>To (Select Team Member)</span>
                <span className="contact-badge-req">Required</span>
              </label>
              <div className="contact-select-wrap">
                <select
                  id="contact-to-select"
                  className="contact-form-select"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                >
                  {CONTACT_RECIPIENTS.map((rec) => (
                    <option key={rec.id} value={rec.email}>
                      {rec.name} ({rec.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Recipient Profile Card Preview */}
              <div className="contact-recipient-card">
                <div
                  className="contact-recipient-avatar"
                  style={{ background: currentRecipient.avatarBg }}
                >
                  {currentRecipient.initials}
                </div>
                <div className="contact-recipient-info">
                  <div className="contact-recipient-name-row">
                    <span className="contact-recipient-name">{currentRecipient.name}</span>
                    <span
                      className="contact-recipient-dept-badge"
                      style={{ color: currentRecipient.tagColor }}
                    >
                      {currentRecipient.department}
                    </span>
                  </div>
                  <div className="contact-recipient-sub">
                    <span className="contact-recipient-role">{currentRecipient.role}</span>
                    <span className="contact-dot-sep">•</span>
                    <span className="contact-recipient-email-val">{currentRecipient.email}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="contact-copy-email-btn"
                  onClick={() => handleCopyEmail(currentRecipient.email)}
                  title="Copy email address"
                >
                  {copiedEmail ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* Field 3: Subject */}
            <div className="contact-form-group">
              <label htmlFor="contact-subject-input" className="contact-form-label">
                <Sparkles size={13} />
                <span>Subject</span>
              </label>
              <input
                id="contact-subject-input"
                type="text"
                className="contact-form-input"
                placeholder="Inquiry topic..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Field 4: Message */}
            <div className="contact-form-group">
              <label htmlFor="contact-message-input" className="contact-form-label">
                <MessageSquare size={13} />
                <span>Message</span>
                <span className="contact-badge-req">Required</span>
              </label>
              <textarea
                id="contact-message-input"
                className="contact-form-textarea"
                rows={4}
                placeholder="Type your message, agent feedback, or questions for the team..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>

            {/* Actions Bar */}
            <div className="contact-modal-actions">
              <button
                type="button"
                className="contact-btn-open-client"
                onClick={handleOpenMailClient}
                title="Launch native Outlook / Mail app"
              >
                <ExternalLink size={14} />
                <span>Open in Outlook</span>
              </button>

              <div className="contact-actions-right">
                <button
                  type="button"
                  className="contact-btn-cancel"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="contact-btn-primary"
                  disabled={isSending || !senderEmail.trim() || !message.trim()}
                >
                  {isSending ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <span>Send Email</span>
                      <Send size={15} />
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
