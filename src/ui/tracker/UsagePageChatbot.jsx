import React, { useEffect, useRef, useState, useMemo } from "react";
import { Sparkles, Send, X, BarChart3, Layers, Users } from "lucide-react";
import chatbotAvatar from "../../assets/ai-chatbot-loo.jpg";

// Usage page chatbot endpoint removed
async function askUsagePageChatbot() {
  return { reply: "Analytics chatbot is currently unavailable." };
}

/**
 * UsagePageChatbot
 * Floating analytics chatbot for /tracker/usage/agent-wise and department-wise pages.
 * Same UI as TrackerChatbot, completely separate data context.
 */
export function UsagePageChatbot({
  pageType = "agent",
  entityName = "",
  timeframe = "monthly",
  totalTokens = 0,
  userCount = 0,
  rows = [],
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isAgent = pageType === "agent";

  const tfLabel = useMemo(() => {
    if (timeframe === "daily") return "Daily (24h)";
    if (timeframe === "weekly") return "Weekly (7d)";
    return "Monthly (30d)";
  }, [timeframe]);

  const fullTfLabel = useMemo(() => {
    if (timeframe === "daily") return "Daily (Past 24 Hours)";
    if (timeframe === "weekly") return "Weekly (Past 7 Days)";
    return "Monthly (Past 30 Days)";
  }, [timeframe]);

  const suggestedQuestions = useMemo(() => {
    if (isAgent) {
      if (timeframe === "daily") return [
        `Who consumed the most tokens from ${entityName} today?`,
        "Which department is using this agent the most right now?",
        "What is the total 24h token consumption for this agent?",
        "List the top 3 users by daily usage.",
      ];
      if (timeframe === "weekly") return [
        `Who is the top user of ${entityName} this week?`,
        "Which department leads in 7-day consumption?",
        "What is the weekly average tokens per user?",
        "Show me the least active users this week.",
      ];
      return [
        `Who is the highest consumer of ${entityName} this month?`,
        "Which department uses this agent the most?",
        "What is the total monthly token consumption?",
        "How many unique users are consuming this agent?",
      ];
    } else {
      if (timeframe === "daily") return [
        `Who is the top token consumer in ${entityName} today?`,
        "Which agent is most used in this department today?",
        "What is the department's total 24h token usage?",
        "List top 3 members by daily usage.",
      ];
      if (timeframe === "weekly") return [
        `Who leads token consumption in ${entityName} this week?`,
        "Which agent is most popular in this department?",
        "What is the weekly total for this department?",
        "Who has the lowest usage this week?",
      ];
      return [
        `Who is the highest consumer in ${entityName} this month?`,
        "Which agent is used most by this department?",
        "What is the monthly total for this department?",
        "How many active members does this department have?",
      ];
    }
  }, [isAgent, entityName, timeframe]);

  const welcomeMessage = useMemo(() => {
    const totalFmt = totalTokens ? totalTokens.toLocaleString() : "N/A";
    if (isAgent) {
      return `Hi! I'm HubbleBot Analytics. I've loaded the ${fullTfLabel} usage data for ${entityName} (${totalFmt} total tokens, ${userCount} users). Ask me anything about consumption patterns, top users, or department breakdowns!`;
    }
    return `Hi! I'm HubbleBot Analytics. I've loaded the ${fullTfLabel} data for the ${entityName} department (${totalFmt} total tokens, ${userCount} members). Ask me about top consumers, agent usage, or any member-level details!`;
  }, [isAgent, entityName, fullTfLabel, totalTokens, userCount]);

  const [messages, setMessages] = useState([
    { id: "usage-welcome-1", role: "assistant", content: welcomeMessage },
  ]);

  const prevTimeframeRef = useRef(timeframe);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (prevTimeframeRef.current !== timeframe) {
      prevTimeframeRef.current = timeframe;
      const totalFmt = totalTokens ? totalTokens.toLocaleString() : "updated";
      setMessages((prev) => [
        ...prev,
        {
          id: `usage-tf-${Date.now()}`,
          role: "assistant",
          isSystemNotice: true,
          content: `Switched to ${fullTfLabel} (${totalFmt} tokens). Queries now reflect this timeframe.`,
        },
      ]);
    }
  }, [timeframe, fullTfLabel, totalTokens]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const newMessages = [...messages, { id: `usage-u-${Date.now()}`, role: "user", content: text }];
    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      const usageContext = { pageType, timeframe, entityName, totalTokens, userCount, rows };
      const response = await askUsagePageChatbot(text, newMessages, usageContext);
      setMessages((prev) => [
        ...prev,
        { id: `usage-b-${Date.now()}`, role: "assistant", content: response.reply },
      ]);
    } catch (_) {
      setMessages((prev) => [
        ...prev,
        {
          id: `usage-b-${Date.now()}`,
          role: "assistant",
          content: "I encountered an issue connecting to the AI. Please try again!",
        },
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

  const nonNoticeCount = messages.filter((m) => !m.isSystemNotice).length;

  return (
    <>
      <div className="trk-chatbot-fab-container">
        {!isOpen && (
          <div className="trk-chatbot-hover-hint">
            <span className="trk-hint-sparkle">&#10024;</span>
            <span>
              Hi! I am HubbleBot Analytics. Ask me about{" "}
              {isAgent ? `who is consuming ${entityName}` : `the ${entityName} department usage`}!
            </span>
            <span className="trk-hint-arrow" />
          </div>
        )}
        <button
          type="button"
          className={`trk-chatbot-fab ${isOpen ? "open" : ""}`}
          onClick={() => setIsOpen((p) => !p)}
          aria-label={isOpen ? "Close Analytics Chatbot" : "Open HubbleBot Analytics"}
        >
          {isOpen ? (
            <X size={26} className="trk-fab-close-icon" />
          ) : (
            <div className="trk-fab-avatar-wrap">
              <img src={chatbotAvatar} alt="HubbleBot Analytics" className="trk-fab-avatar-img" />
              <span className="trk-fab-online-dot" />
            </div>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="trk-chatbot-window" role="dialog" aria-label="HubbleBot Usage Analytics">
          <div className="trk-chatbot-header">
            <div className="trk-chatbot-header-left">
              <div className="trk-chatbot-header-avatar">
                <img src={chatbotAvatar} alt="HubbleBot" />
                <span className="trk-chatbot-status-dot" />
              </div>
              <div className="trk-chatbot-header-info">
                <div className="trk-chatbot-title-row">
                  <h4>HubbleBot Analytics</h4>
                  <span className="trk-chatbot-timeframe-badge">{tfLabel}</span>
                </div>
                <span>{isAgent ? "Agent Usage" : "Department Usage"} &bull; AI Analyst</span>
              </div>
            </div>
            <button
              type="button"
              className="trk-chatbot-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          <div className="trk-context-banner">
            <div className="trk-context-banner-item">
              <BarChart3 size={12} className="trk-context-icon" />
              <span>{isAgent ? "Agent" : "Dept"}: <strong>{entityName || "—"}</strong></span>
            </div>
            <div className="trk-context-banner-item">
              <Layers size={12} className="trk-context-icon" />
              <span>Tokens: <strong>{totalTokens ? totalTokens.toLocaleString() : "0"}</strong></span>
            </div>
            <div className="trk-context-banner-item">
              <Users size={12} className="trk-context-icon" />
              <span>Users: <strong>{userCount}</strong></span>
            </div>
          </div>

          <div className="trk-chatbot-body">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`trk-chat-bubble-row ${msg.role === "user" ? "trk-user-row" : "trk-bot-row"}`}
              >
                {msg.role === "assistant" && (
                  <div className="trk-chat-avatar-mini">
                    <img src={chatbotAvatar} alt="HubbleBot" />
                  </div>
                )}
                <div
                  className={`trk-chat-bubble ${
                    msg.role === "user"
                      ? "trk-user-bubble"
                      : msg.isSystemNotice
                      ? "trk-notice-bubble"
                      : "trk-bot-bubble"
                  }`}
                >
                  <p>{msg.content}</p>
                </div>
              </div>
            ))}

            {nonNoticeCount === 1 && (
              <div className="trk-chat-suggestions">
                <span className="trk-suggestions-label">
                  <Sparkles size={13} /> {tfLabel} Questions:
                </span>
                <div className="trk-suggestions-list">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      type="button"
                      className="trk-suggestion-pill"
                      onClick={() => handleSendMessage(q)}
                    >
                      <Sparkles size={12} className="trk-pill-sparkle" />
                      <span>{q}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoading && (
              <div className="trk-chat-bubble-row trk-bot-row">
                <div className="trk-chat-avatar-mini">
                  <img src={chatbotAvatar} alt="HubbleBot" />
                </div>
                <div className="trk-chat-bubble trk-bot-bubble trk-typing-bubble">
                  <span className="trk-typing-dot" />
                  <span className="trk-typing-dot" />
                  <span className="trk-typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="trk-chatbot-footer">
            <div className="trk-chatbot-input-shell">
              <input
                ref={inputRef}
                type="text"
                placeholder={`Ask about ${isAgent ? entityName : entityName + " dept"} ${tfLabel.toLowerCase()} usage...`}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
              <button
                type="button"
                className={`trk-chatbot-send-btn ${inputMessage.trim() ? "active" : ""}`}
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </div>
            <div className="trk-chatbot-brand-caption">
              Powered by Groq &bull; Usage Detail Intelligence
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UsagePageChatbot;
