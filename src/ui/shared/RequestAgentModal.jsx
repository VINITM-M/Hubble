/**
 * ui/shared/RequestAgentModal.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Shared Enterprise New Agent Request Modal.
 * Used by both LandingPage and UpcomingAgentsPage when:
 *   - The user selects a department that currently has 0 agents.
 *   - The user clicks "Request a New Agent" or "Suggest Idea".
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState } from "react";
import { Check, Send, Sparkles, X } from "lucide-react";
import { CANONICAL_DEPARTMENTS } from "../../models/agents.js";
import { getActiveUserEmail } from "../../services/backendApi.js";

export function RequestAgentModal({
  isOpen,
  onClose,
  initialDept = "",
  initialAgentName = "",
  customPrompt = null,
  departments = CANONICAL_DEPARTMENTS,
  onFilterByDept,
}) {
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [submittedReqId, setSubmittedReqId] = useState("");
  const [requestFormData, setRequestFormData] = useState({
    dept: initialDept || "",
    agentName: initialAgentName || "",
    useCase: "",
    impact: "High",
    name: "",
    email: getActiveUserEmail() || "",
  });

  // Sync initialDept if it changes when modal opens
  useEffect(() => {
    if (isOpen) {
      setRequestSubmitted(false);
      setRequestFormData((prev) => ({
        ...prev,
        dept: initialDept || prev.dept || "",
        agentName: initialAgentName || prev.agentName || "",
        email: getActiveUserEmail() || prev.email || "",
      }));
    }
  }, [isOpen, initialDept, initialAgentName]);

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    const reqId = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    setSubmittedReqId(reqId);
    try {
      const existing = JSON.parse(localStorage.getItem("requested_ai_agents") || "[]");
      existing.unshift({
        id: reqId,
        ...requestFormData,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem("requested_ai_agents", JSON.stringify(existing));
    } catch (err) {
      console.warn("Could not save request to localStorage", err);
    }
    setRequestSubmitted(true);
  };

  const handleModalClose = () => {
    setIsFormReset();
    onClose();
  };

  const setIsFormReset = () => {
    setRequestSubmitted(false);
    setRequestFormData({
      dept: "",
      agentName: "",
      useCase: "",
      impact: "High",
      name: "",
      email: getActiveUserEmail() || "",
    });
  };

  return (
    <div className="modal-backdrop" onClick={handleModalClose} role="dialog" aria-modal="true">
      <div className="access-modal-sheet request-agent-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <span className="modal-kicker">ENTERPRISE AGENT INTAKE</span>
            <h3>Request a New AI Agent</h3>
          </div>
          <button
            type="button"
            className="close-modal-btn"
            onClick={handleModalClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {requestSubmitted ? (
          <div className="modal-success-state">
            <div className="success-icon-ring">
              <Check size={28} />
            </div>
            <h4>Agent Proposal Submitted!</h4>
            <p>
              Your request <strong>{submittedReqId}</strong> for the{" "}
              <strong>{requestFormData.dept || "selected"}</strong> department has been queued for evaluation.
            </p>
            <p style={{ marginTop: "10px", fontSize: "13px", color: "#94a3b8" }}>
              The Enterprise AI Engineering & Roadmap committee reviews proposals weekly. A confirmation record has been logged for <strong>{requestFormData.email || "your department"}</strong>.
            </p>
            <div className="modal-actions-row" style={{ justifyContent: "center", marginTop: "22px", gap: "10px" }}>
              {requestFormData.dept && onFilterByDept && (
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => {
                    onFilterByDept(requestFormData.dept);
                    handleModalClose();
                  }}
                >
                  Filter by {requestFormData.dept}
                </button>
              )}
              <button
                type="button"
                className="btn-confirm-access"
                onClick={handleModalClose}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRequestSubmit} className="access-modal-form">
            {customPrompt ? (
              <div className="request-modal-banner">
                <Sparkles size={18} style={{ flexShrink: 0 }} />
                <span>{customPrompt}</span>
              </div>
            ) : (
              <p className="modal-instructions">
                Have a workflow bottleneck or new automation idea? Specify your department and describe the use case below to initiate scoping.
              </p>
            )}

            {/* Department Dropdown Selection */}
            <div className="form-group">
              <label htmlFor="req-dept">Department / Research Division *</label>
              <select
                id="req-dept"
                required
                value={requestFormData.dept}
                onChange={(e) =>
                  setRequestFormData((p) => ({ ...p, dept: e.target.value }))
                }
                className="modal-select-input"
              >
                <option value="" disabled>Select your department from the dropdown...</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Proposed Agent Name */}
            <div className="form-group">
              <label htmlFor="req-agent-name">Proposed Agent Name (Optional)</label>
              <input
                id="req-agent-name"
                type="text"
                placeholder="e.g. BioReactivity Predictor, Analytical DocuBot..."
                value={requestFormData.agentName}
                onChange={(e) =>
                  setRequestFormData((p) => ({ ...p, agentName: e.target.value }))
                }
              />
            </div>

            {/* Agent Use Case */}
            <div className="form-group">
              <label htmlFor="req-usecase">Agent Use Case & Problem Statement *</label>
              <textarea
                id="req-usecase"
                required
                rows={4}
                placeholder="Describe what you want the agent to do: manual tasks to automate, data sources to analyze, tools to integrate with, and expected outcomes..."
                value={requestFormData.useCase}
                onChange={(e) =>
                  setRequestFormData((p) => ({ ...p, useCase: e.target.value }))
                }
                className="modal-textarea-input"
              />
            </div>

            {/* Priority / Impact */}
            <div className="form-group">
              <label htmlFor="req-impact">Priority & Expected Frequency</label>
              <select
                id="req-impact"
                value={requestFormData.impact}
                onChange={(e) =>
                  setRequestFormData((p) => ({ ...p, impact: e.target.value }))
                }
                className="modal-select-input"
              >
                <option value="High">High - Daily repetitive workflow / major bottleneck</option>
                <option value="Medium">Medium - Weekly operational assistance</option>
                <option value="Exploratory">Exploratory - Novel R&D prototype or feasibility study</option>
              </select>
            </div>

            {/* Requester Info */}
            <div className="form-row-two">
              <div className="form-group">
                <label htmlFor="req-name">Your Full Name *</label>
                <input
                  id="req-name"
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={requestFormData.name}
                  onChange={(e) =>
                    setRequestFormData((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div className="form-group">
                <label htmlFor="req-email">Enterprise Work Email *</label>
                <input
                  id="req-email"
                  type="email"
                  required
                  placeholder="e.g. r.kumar@aurigene.com"
                  value={requestFormData.email}
                  onChange={(e) =>
                    setRequestFormData((p) => ({ ...p, email: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="modal-actions-row">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleModalClose}
              >
                Cancel
              </button>
              <button type="submit" className="btn-confirm-access btn-submit-request">
                <Send size={14} /> Submit Agent Request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
