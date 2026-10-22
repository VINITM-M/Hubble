/**
 * ui/chatbot/Chatbot.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Floating AI chatbot widget for the Landing Page.
 * Powered by Groq via services/groqService.js → askChatbot()
 *
 * Props:
 *  agentsList     – full agent catalog
 *  onLocateAgent  – fn(agentId) scroll-to highlight on the page
 *  onLaunchAgent  – fn(agentId) open feedback modal then launch
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useRef, useState } from "react";
import { Compass, ExternalLink, Sparkles, Send, X } from "lucide-react";
import chatbotAvatar from "../../assets/chatbot-avatar.jpg";
import { askChatbot } from "../../services/groqService.js";

const SUGGESTED_QUESTIONS = [
  "I want to perform antibody analysis & literature research",
  "How does Hybridoma ELISA automate clone screening & titration curves?",
  "Explain how Teva Agent conducts technical transfer gap analysis",
  "Which agent helps with peptide synthesis & sequence optimization?",
  "What does Documenter AI do for SOP and regulatory compliance?",
];

export function Chatbot({ agentsList = [], onLocateAgent, onLaunchAgent }) {
  const [isOpen, setIsOpen]             = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading]       = useState(false);
  const [messages, setMessages]         = useState([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Hi! I'm your HubblePilot AI Advisor. Ask me anything about our agents, which one fits your task, or why you should use a specific agent!",
      agentIds: [],
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsgId  = `user-${Date.now()}`;
    const newMessages = [...messages, { id: userMsgId, role: "user", content: text, agentIds: [] }];
    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await askChatbot(text, newMessages, agentsList);
      setMessages((prev) => [
        ...prev,
        { id: `bot-${Date.now()}`, role: "assistant", content: response.reply, agentIds: response.agentIds || [] },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `bot-${Date.now()}`, role: "assistant", content: "I encountered an issue connecting to the AI service. Please try asking again!", agentIds: [] },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* ── Floating Action Button ─────────────────────────────────────── */}
      <div className="chatbot-fab-container">
        {!isOpen && (
          <div className="chatbot-hover-hint">
            <span className="hint-sparkle">✨</span>
            <span>Hi! I'm Hubble AI Agent Advisor. I'll support and guide you to the right agent!</span>
            <span className="hint-arrow" />
          </div>
        )}

        <button
          type="button"
          className={`chatbot-fab ${isOpen ? "open" : ""}`}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Close AI Chatbot" : "Open Hubble AI Advisor"}
        >
          {isOpen ? (
            <X size={26} className="fab-close-icon" />
          ) : (
            <div className="fab-avatar-wrap">
              <img src={chatbotAvatar} alt="Hubble AI Advisor" className="fab-avatar-img" />
              <span className="fab-online-dot" />
            </div>
          )}
        </button>
      </div>

      {/* ── Chat Window ───────────────────────────────────────────────── */}
      {isOpen && (
        <div className="chatbot-window" role="dialog" aria-label="Hubble AI Advisor Chat">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <div className="chatbot-header-avatar">
                <img src={chatbotAvatar} alt="HubbleBot" />
                <span className="chatbot-status-dot" />
              </div>
              <div className="chatbot-header-info">
                <h4>HubbleBot</h4>
                <span>AI Agent Advisor • Online</span>
              </div>
            </div>
            <button type="button" className="chatbot-close-btn" onClick={() => setIsOpen(false)} aria-label="Close chat window">
              <X size={18} />
            </button>
          </div>

          {/* Conversation */}
          <div className="chatbot-body">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-bubble-row ${msg.role === "user" ? "user-row" : "bot-row"}`}>
                {msg.role === "assistant" && (
                  <div className="chat-avatar-mini">
                    <img src={chatbotAvatar} alt="HubbleBot" />
                  </div>
                )}
                <div className={`chat-bubble ${msg.role === "user" ? "user-bubble" : "bot-bubble"}`}>
                  <p>{msg.content}</p>

                  {/* Agent cards */}
                  {msg.agentIds && msg.agentIds.length > 0 && (
                    <div className="chat-agent-cards-container">
                      {msg.agentIds.map((agentId) => {
                        const agent = agentsList.find(
                          (a) =>
                            a.id.toLowerCase().trim() === String(agentId).toLowerCase().trim() ||
                            a.name.toLowerCase().trim() === String(agentId).toLowerCase().trim(),
                        );
                        if (!agent) return null;
                        const isImageIcon = typeof agent.icon === "string";
                        const Icon = !isImageIcon ? agent.icon : null;

                        return (
                          <div key={agent.id} className="chat-agent-card">
                            <div className="chat-agent-header">
                              <div className="chat-agent-icon">
                                {isImageIcon ? <img src={agent.icon} alt={agent.name} /> : <Icon size={18} />}
                              </div>
                              <div className="chat-agent-meta">
                                <div className="chat-agent-name">{agent.name}</div>
                                <div className="chat-agent-cat">{agent.category}</div>
                              </div>
                            </div>
                            <div className="chat-agent-actions">
                              <button
                                type="button"
                                className="chat-card-btn locate-btn"
                                onClick={() => onLocateAgent && onLocateAgent(agent.id)}
                                title="Scroll to and highlight this agent card"
                              >
                                <Compass size={13} /> View on Page
                              </button>
                              <a
                                className="chat-card-btn launch-btn"
                                href={agent.primary?.url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => onLaunchAgent && onLaunchAgent(agent.id)}
                                title="Directly launch this agent"
                              >
                                Launch <ExternalLink size={13} />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Suggested questions (first message only) */}
            {messages.length === 1 && (
              <div className="chat-suggestions">
                <span className="suggestions-label">
                  <Sparkles size={13} /> Popular Questions:
                </span>
                <div className="suggestions-list">
                  {SUGGESTED_QUESTIONS.map((q, idx) => (
                    <button key={idx} type="button" className="suggestion-pill" onClick={() => handleSendMessage(q)}>
                      <Sparkles size={12} className="pill-sparkle" />
                      <span>{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Typing indicator */}
            {isLoading && (
              <div className="chat-bubble-row bot-row">
                <div className="chat-avatar-mini">
                  <img src={chatbotAvatar} alt="HubbleBot" />
                </div>
                <div className="chat-bubble bot-bubble typing-bubble">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <div className="chatbot-footer">
            <div className="chatbot-input-shell">
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask about any agent or task..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
              <button
                type="button"
                className={`chatbot-send-btn ${inputMessage.trim() ? "active" : ""}`}
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </div>
            <div className="chatbot-brand-caption">Powered by Groq • HubblePilot.AI</div>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;
