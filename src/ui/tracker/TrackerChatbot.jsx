import React, { useEffect, useRef, useState, useMemo } from "react";
import { Sparkles, Send, X, BarChart3, TrendingUp, Layers } from "lucide-react";
import chatbotAvatar from "../../assets/chatbot-avatar.jpg";

// Tracker chatbot endpoint removed
async function askTrackerChatbot() {
  return { reply: "Analytics chatbot is currently unavailable." };
}

export function TrackerChatbot({
  timeframe = "monthly",
  activeView = "agent",
  globalKPIs = { totalTokens: 0, topAgent: null },
  agentRows = [],
  deptRows = [],
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  // Suggested questions based on the active timeframe
  const suggestedQuestions = useMemo(() => {
    if (timeframe === "daily") {
      return [
        "Which agent consumed the most tokens today?",
        "Show me top 3 departments by daily token usage",
        "What is our total 24h consumption across all agents?",
        "Which department is currently the most active?",
      ];
    }
    if (timeframe === "weekly") {
      return [
        "What is our total weekly token consumption?",
        "Which agent is leading in usage over the last 7 days?",
        "Provide department-wise breakdown for the past week",
        "Which agent has the highest output token volume?",
      ];
    }
    return [
      "Top 5 agents by monthly token consumption?",
      "Which department consumed the most tokens this month?",
      "What is the total monthly token usage across Aurigene?",
      "Which agents are used by the Research department?",
    ];
  }, [timeframe]);

  const initialWelcomeMessage = useMemo(() => {
    const totalFmt = globalKPIs.totalTokens ? globalKPIs.totalTokens.toLocaleString() : "loaded";
    const topName = globalKPIs.topAgent?.agentName || "Bio-Med Catalyst";
    return `Hi! I'm HubbleBot Analytics. I have loaded your ${fullTfLabel} data (${totalFmt} tokens total, top agent: ${topName}). Ask me any analytical questions about agent consumption, department breakdown, or token trends!`;
  }, [timeframe, fullTfLabel, globalKPIs.totalTokens, globalKPIs.topAgent?.agentName]);

  const [messages, setMessages] = useState([
    {
      id: "trk-welcome-1",
      role: "assistant",
      content: initialWelcomeMessage,
    },
  ]);

  const prevTimeframeRef = useRef(timeframe);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // When user switches timeframe in the Tracker, inform user in chat if conversation is started
  useEffect(() => {
    if (prevTimeframeRef.current !== timeframe) {
      prevTimeframeRef.current = timeframe;
      const totalFmt = globalKPIs.totalTokens ? globalKPIs.totalTokens.toLocaleString() : "updated";
      const noticeMsg = {
        id: `trk-tf-switch-${Date.now()}`,
        role: "assistant",
        isSystemNotice: true,
        content: `🔄 Switched context to **${fullTfLabel}** (${totalFmt} tokens). All new queries will analyze this timeframe.`,
      };
      setMessages((prev) => [...prev, noticeMsg]);
    }
  }, [timeframe, fullTfLabel, globalKPIs.totalTokens]);

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

    const userMsgId = `trk-user-${Date.now()}`;
    const newMessages = [...messages, { id: userMsgId, role: "user", content: text }];
    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      const trackerContext = {
        timeframe,
        activeView,
        totalTokens: globalKPIs.totalTokens,
        topAgent: globalKPIs.topAgent,
        agentRows,
        deptRows,
      };

      const response = await askTrackerChatbot(text, newMessages, trackerContext);
      setMessages((prev) => [
        ...prev,
        {
          id: `trk-bot-${Date.now()}`,
          role: "assistant",
          content: response.reply,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `trk-bot-${Date.now()}`,
          role: "assistant",
          content:
            "I encountered an issue connecting to the AI analytics engine. Please try asking again!",
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

  return (
    <>
      {/* Floating Chat Trigger Button (Bottom-Right) with Horizontal Hover Hint */}
      <div className="trk-chatbot-fab-container">
        {!isOpen && (
          <div className="trk-chatbot-hover-hint">
            <span className="trk-hint-sparkle">✨</span>
            <span>Hi! I'm Hubble Analytics AI. Ask me about token consumption, agent trends, or department usage!</span>
            <span className="trk-hint-arrow" />
          </div>
        )}

        <button
          type="button"
          className={`trk-chatbot-fab ${isOpen ? "open" : ""}`}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Close AI Analytics Chatbot" : "Open Hubble Analytics AI"}
        >
          {isOpen ? (
            <X size={26} className="trk-fab-close-icon" />
          ) : (
            <div className="trk-fab-avatar-wrap">
              <img
                src={chatbotAvatar}
                alt="Hubble Analytics AI"
                className="trk-fab-avatar-img"
              />
              <span className="trk-fab-online-dot" />
            </div>
          )}
        </button>
      </div>

      {/* Floating Popout Chatbot Window */}
      {isOpen && (
        <div
          className="trk-chatbot-window"
          role="dialog"
          aria-label="Hubble Analytics AI Chat"
        >
          {/* Header */}
          <div className="trk-chatbot-header">
            <div className="trk-chatbot-header-left">
              <div className="trk-chatbot-header-avatar">
                <img src={chatbotAvatar} alt="HubbleBot" />
                <span className="trk-chatbot-status-dot" />
              </div>
              <div className="trk-chatbot-header-info">
                <div className="trk-chatbot-title-row">
                  <h4>HubbleBot Analytics</h4>
                  <span className="trk-chatbot-timeframe-badge">
                    {tfLabel}
                  </span>
                </div>
                <span>LLM Token Tracker • AI Analyst</span>
              </div>
            </div>
            <button
              type="button"
              className="trk-chatbot-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat window"
            >
              <X size={18} />
            </button>
          </div>

          {/* Active Data Context Pill Banner */}
          <div className="trk-context-banner">
            <div className="trk-context-banner-item">
              <BarChart3 size={12} className="trk-context-icon" />
              <span>Context: <strong>{fullTfLabel}</strong></span>
            </div>
            <div className="trk-context-banner-item">
              <Layers size={12} className="trk-context-icon" />
              <span>Total: <strong>{globalKPIs.totalTokens ? globalKPIs.totalTokens.toLocaleString() : "0"}</strong> tok</span>
            </div>
          </div>

          {/* Conversation Body */}
          <div className="trk-chatbot-body">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`trk-chat-bubble-row ${
                  msg.role === "user" ? "trk-user-row" : "trk-bot-row"
                }`}
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

            {/* Quick Suggestion Pills */}
            {messages.filter((m) => !m.isSystemNotice).length === 1 && (
              <div className="trk-chat-suggestions">
                <span className="trk-suggestions-label">
                  <Sparkles size={13} /> {tfLabel} Questions:
                </span>
                <div className="trk-suggestions-list">
                  {suggestedQuestions.map((question, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="trk-suggestion-pill"
                      onClick={() => handleSendMessage(question)}
                    >
                      <Sparkles size={12} className="trk-pill-sparkle" />
                      <span>{question}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading / Typing indicator */}
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

          {/* Footer Input Box */}
          <div className="trk-chatbot-footer">
            <div className="trk-chatbot-input-shell">
              <input
                ref={inputRef}
                type="text"
                placeholder={`Ask about ${tfLabel.toLowerCase()} consumption, agents, depts...`}
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
              Powered by Groq • LLM Consumption Intelligence
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TrackerChatbot;
