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
import introLogoSvg from "../../assets/hubble-intro-animation.svg";
import { StoriesPage } from "../stories/StoriesPage.jsx";
import "../../styles/intro.css";

// ── Animation timing constants ────────────────────────────────────────────────
const INTRO_DURATION_MS  = 3400; // How long the SVG logo plays

// ── Component ─────────────────────────────────────────────────────────────────
export function IntroFlow({ onComplete, onNavigate }) {
  // phase: "logo" | "story" | "leaving"
  const [phase, setPhase]             = useState("logo");
  const [logoLeaving, setLogoLeaving] = useState(false);
  const [logoError, setLogoError]     = useState(false);

  const introTimerRef = useRef(null);

  // Start logo timer on mount
  useEffect(() => {
    introTimerRef.current = setTimeout(advanceToStory, INTRO_DURATION_MS);
    return () => {
      if (introTimerRef.current) clearTimeout(introTimerRef.current);
    };
  }, []);

  /** Transition from logo phase to story cards phase */
  const advanceToStory = () => {
    if (introTimerRef.current) clearTimeout(introTimerRef.current);
    setLogoLeaving(true);

    setTimeout(() => {
      setPhase("story");
    }, 420);
  };

  /** Skip everything and go directly to the Landing Page */
  const handleSkipAll = () => {
    if (introTimerRef.current) clearTimeout(introTimerRef.current);
    setPhase("leaving");
    setTimeout(() => onComplete(), 350);
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

      {/* ── Phase 2: Restructured August-Style Stories Screen ─────────── */}
      {(phase === "story" || phase === "leaving") && (
        <StoriesPage
          onLaunchPortal={handleSkipAll}
          onNavigate={(to) => {
            handleSkipAll();
            if (onNavigate) onNavigate(to);
          }}
          isDarkMode={false}
        />
      )}
    </div>
  );
}
