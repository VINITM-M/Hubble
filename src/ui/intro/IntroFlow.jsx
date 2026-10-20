/**
 * ui/intro/IntroFlow.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Phase 1: Animated Hubble.AI SVG logo screen
 * Phase 2: Story cards carousel
 * Phase 3: Transition into the Landing Page
 *
 * Flow: logo → story cards → onComplete()
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useRef } from "react";
import { STORY_CARDS } from "../../models/storyCards.js";
import introLogoSvg from "../../assets/hubble-intro-animation.svg";
import "../../styles/intro.css";

// ── Animation timing constants ────────────────────────────────────────────────
const INTRO_DURATION_MS  = 3400; // How long the SVG logo plays
const TOTAL_ANIMATION_MS = 3500; // Total card animation duration
const CARD_DURATION_MS   = 3250; // Duration each card is "active"
const STAGGER_MS = (TOTAL_ANIMATION_MS - CARD_DURATION_MS) / (STORY_CARDS.length - 1);

// ── Component ─────────────────────────────────────────────────────────────────
export function IntroFlow({ onComplete }) {
  // phase: "logo" | "story" | "leaving"
  const [phase, setPhase]           = useState("logo");
  const [logoLeaving, setLogoLeaving] = useState(false);
  const [gridState, setGridState]   = useState("idle"); // "idle" | "playing" | "finished"
  const [storyVisible, setStoryVisible] = useState(false);
  const [statusText, setStatusText] = useState("Six stories · one 3.5-second animation");
  const [logoError, setLogoError]   = useState(false);

  const introTimerRef = useRef(null);
  const cardTimerRef  = useRef(null);

  // Start logo timer on mount
  useEffect(() => {
    introTimerRef.current = setTimeout(advanceToStory, INTRO_DURATION_MS);
    return () => {
      if (introTimerRef.current) clearTimeout(introTimerRef.current);
      if (cardTimerRef.current)  clearTimeout(cardTimerRef.current);
    };
  }, []);

  /** Transition from logo phase to story cards phase */
  const advanceToStory = () => {
    if (introTimerRef.current) clearTimeout(introTimerRef.current);
    setLogoLeaving(true);

    setTimeout(() => {
      setPhase("story");
      setStoryVisible(true);
      playCardSequence();
    }, 420);
  };

  /** Skip everything and go directly to the Landing Page */
  const handleSkipAll = () => {
    if (introTimerRef.current) clearTimeout(introTimerRef.current);
    if (cardTimerRef.current)  clearTimeout(cardTimerRef.current);
    setPhase("leaving");
    setTimeout(() => onComplete(), 350);
  };

  /** Kick off the 3.5s card animation sequence */
  const playCardSequence = () => {
    setGridState("playing");
    setStatusText("Playing stories · 3.5s sequence");

    cardTimerRef.current = setTimeout(() => {
      setGridState("finished");
      setStatusText("Stories complete · ready to explore Hubble");
    }, TOTAL_ANIMATION_MS);
  };

  return (
    <div className={`intro-flow-wrapper ${phase === "leaving" ? "fade-out" : ""}`}>

      {/* ── Phase 1: Logo Animation ─────────────────────────────────────── */}
      {phase === "logo" && (
        <section
          className={`intro-logo-screen ${logoLeaving ? "leaving" : ""}`}
          aria-label="Hubble.ai Logo Animation"
        >
          <button
            className="intro-skip-btn"
            type="button"
            onClick={advanceToStory}
            aria-label="Skip logo intro"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M5 5.5v13l10.2-6.5L5 5.5Z" />
              <path d="M19 5v14" />
            </svg>
            <span>Skip intro</span>
          </button>

          <div className="intro-logo-box">
            {!logoError ? (
              <img
                src={introLogoSvg}
                alt="Hubble.ai Animated Logo"
                className="intro-logo-img"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="intro-logo-fallback">
                Hubble<span>.AI</span>
              </div>
            )}
            <div className="intro-logo-caption">
              <span className="intro-logo-spinner" />
              <span>Initializing Hubble.AI Agent Platform...</span>
            </div>
          </div>
        </section>
      )}

      {/* ── Phase 2: Story Cards ────────────────────────────────────────── */}
      {(phase === "story" || phase === "leaving") && (
        <main
          className={`intro-story-screen ${storyVisible ? "is-visible" : ""}`}
          aria-label="Customer Stories"
        >
          {/* Header */}
          <div className="intro-story-topline">
            <div>
              <p className="intro-eyebrow">Customer Stories &amp; Perspectives</p>
              <h1 className="intro-story-title">How Teams Accelerate with Hubble.AI</h1>
            </div>
            <button className="intro-launch-btn" type="button" onClick={handleSkipAll}>
              <span>Launch Hubble Portal</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>

          {/* Cards Grid */}
          <section className={`intro-cards-grid ${gridState}`}>
            {STORY_CARDS.map((person, idx) => (
              <article
                key={idx}
                className="intro-card"
                style={{ "--stagger": `${idx * STAGGER_MS}ms` }}
              >
                <div className="intro-avatar" aria-label={`${person.name} profile photo`}>
                  <span className="intro-avatar-fallback">{person.initials}</span>
                  <img
                    src={person.avatar}
                    alt=""
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                </div>
                <div className="intro-card-content">
                  <div className="intro-card-identity">
                    <h2 className="intro-card-name">{person.name}</h2>
                    <p className="intro-card-role">{person.role}</p>
                  </div>
                  <p className="intro-card-comment">
                    <span className="intro-quote-mark">"</span>
                    {person.comment}
                    <span className="intro-quote-mark">"</span>
                  </p>
                </div>
              </article>
            ))}
          </section>

          {/* Status bar */}
          <div className="intro-status-bar">
            <span className="intro-status-pulse">
              <span className="intro-pulse-dot" />
              <span>{statusText}</span>
            </span>
            <span style={{ cursor: "pointer", textDecoration: "underline" }} onClick={handleSkipAll}>
              Click to skip directly into the agent directory →
            </span>
          </div>
        </main>
      )}
    </div>
  );
}
