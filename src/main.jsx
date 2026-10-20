/**
 * main.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * React entry point — mounts the App component into #root.
 *
 * All application logic is categorized into clean modular folders:
 *  App.jsx                                    – root orchestrator
 *  models/agents.js                           – agent data catalog
 *  models/storyCards.js                       – intro story cards data
 *  models/trackerData.js                      – tracker mock analytics data
 *  algorithms/agentFilters.js                 – filtering, sorting, rating utils
 *  algorithms/routeParser.js                  – client-side route parsing
 *  endpoints/groqEndpoints.js                 – Groq API URLs and model config
 *  generation/promptGenerators.js             – dynamic prompts & context builders
 *  services/groqService.js                    – Groq AI integration layer
 *  styles/styles.css                          – hub and tracker styling
 *  styles/intro.css                           – intro animation & stories styling
 *  ui/intro/IntroFlow.jsx                     – SVG logo animation + story cards
 *  ui/landing/LandingPage.jsx                 – agent discovery hub page
 *  ui/landing/AgentCard.jsx                   – individual agent card
 *  ui/landing/DetailsDrawer.jsx               – agent detail slide-in drawer
 *  ui/landing/FeedbackModal.jsx               – rating + launch modal
 *  ui/chatbot/Chatbot.jsx                     – floating AI advisor chatbot
 *  ui/shared/VideoModal.jsx                   – demo video modal
 *  ui/tracker/Tracker.jsx                     – /tracker analytics dashboard
 *  ui/tracker/AgentUserHistory.jsx            – /tracker/usage/:id detail view
 *  ui/tracker/DepartmentUserHistory.jsx       – /tracker/department/:name detail view
 *  ui/tracker/VisualizationPane.jsx           – usage charts & KPIs pane
 *  ui/tracker/TrackerChatbot.jsx              – tracker AI analytics chatbot
 *  ui/tracker/UsagePageChatbot.jsx            – detail usage AI chatbot
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(<App />);
