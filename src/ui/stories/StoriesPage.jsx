/**
 * ui/stories/StoriesPage.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Redesigned Stories & Overview Page inspired by the modern August.ai aesthetic.
 *
 * Features:
 *  1. Floating dark frosted-glass navbar:
 *     - Left: "hubble" branding
 *     - Center: "Stories", "FAQ"
 *     - Right: "Launch Agent Portal" CTA pill
 *  2. Hero section with fullscreen looping background video (Teva video)
 *     - Working Sound On / Off toggle button in bottom-left corner
 *     - Hubble.ai headline, subtitle, and trust badges
 *     - Scroll indicator
 *  3. "Real stories from real people" section with 4 tall video portrait cards
 *     - Video preview thumbnail, frosted circular play button
 *     - Plays sample video in full VideoModal on click
 *  4. "Platform designed around research, not the other way around"
 *     - 3 rich cards (Blue history card, Clean metric card, Bronze proactive card)
 *  5. "The questions you actually want to ask"
 *     - Flowing comments & feedback cards with infinite left-to-right animation
 *  6. "Questions you might have" (Accordion FAQ)
 *  7. Modern Footer with sample video showcase slot and portal launch links
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  FlaskConical,
  Dna,
  Microscope,
  Cpu,
  Layers,
  Database,
  CheckCircle2,
  FileText,
  Activity,
} from "lucide-react";

import tevaVideo from "../../assets/Teva video recording.mp4";
import elisaVideo from "../../assets/ELISA_AI.mp4";
import hubbleLogo from "../../assets/hubble-logo.png";
import aiHubbleLogo from "../../assets/ai_hubble_logo.png";
import { VideoModal } from "../shared/VideoModal.jsx";
import "../../styles/stories.css";

// ── Real People Stories Data ──────────────────────────────────────────────────
const REAL_STORIES = [
  {
    id: "rupali",
    name: "Rupali",
    role: "Senior Research Scientist",
    department: "Analytical R&D",
    highlight: "Understood her assay protocols & antibody screening for the first time",
    videoUrl: elisaVideo,
    videoPoster: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=720&q=85",
  },
  {
    id: "deepu",
    name: "Dr. Deepu",
    role: "Formulation Scientist",
    department: "Formulations Z2",
    highlight: "Caught critical parameter deviations across batch runs in seconds",
    videoUrl: tevaVideo,
    videoPoster: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=720&q=85",
  },
  {
    id: "shilpa",
    name: "Dr. Shilpa",
    role: "Lead Biochemist",
    department: "PR&D & FAR&D",
    highlight: "Finally got automated clarity across multi-site peptide synthesis runs",
    videoUrl: elisaVideo,
    videoPoster: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=720&q=85",
  },
  {
    id: "abhijeet",
    name: "Abhijeet",
    role: "Principal Bioprocess Engineer",
    department: "Process-Engineering",
    highlight: "Monitors bioprocess pipeline telemetry and HPLC runs remotely",
    videoUrl: tevaVideo,
    videoPoster: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=720&q=85",
  },
];

// ── Flowing Feedback & Questions Cards Data ──────────────────────────────────
const FEEDBACK_CARDS_ROW1 = [
  {
    id: "q1",
    tag: "Analytical R&D",
    icon: <FlaskConical size={14} />,
    color: "#0284c7",
    question: "Can Hubble automate peak identification and integration for our complex HPLC chromatograms?",
    author: "R&D Analytical Lead",
  },
  {
    id: "q2",
    tag: "Formulations Z2",
    icon: <Dna size={14} />,
    color: "#059669",
    question: "How do I predict polymer dissolution curves and excipient compatibility before wet lab trials?",
    author: "Formulation Scientist",
  },
  {
    id: "q3",
    tag: "FAR&D",
    icon: <Activity size={14} />,
    color: "#8b5cf6",
    question: "Is it possible to cross-reference multiple batch certificates with our internal QA limits instantly?",
    author: "Quality Analyst",
  },
  {
    id: "q4",
    tag: "PR&D",
    icon: <Layers size={14} />,
    color: "#ea580c",
    question: "What are the earliest indicators of reaction thermal runaway in 500L pilot reactors?",
    author: "Scale-up Engineer",
  },
  {
    id: "q5",
    tag: "Quality Assurance",
    icon: <ShieldCheck size={14} />,
    color: "#10b981",
    question: "Can Hubble generate automated audit-ready batch traceability logs compliant with 21 CFR Part 11?",
    author: "Regulatory QA Manager",
  },
];

const FEEDBACK_CARDS_ROW2 = [
  {
    id: "q6",
    tag: "DMPK & Toxicology",
    icon: <Microscope size={14} />,
    color: "#ec4899",
    question: "Saved our pharmacokinetic screening team 14 hours this week on clearance curve calculations!",
    author: "DMPK Lead Investigator",
  },
  {
    id: "q7",
    tag: "Process-Engineering",
    icon: <Cpu size={14} />,
    color: "#2563eb",
    question: "How does Hubble predict pump cavitation and filter fouling during continuous perfusion runs?",
    author: "Process Automation Lead",
  },
  {
    id: "q8",
    tag: "Stores & Inventory",
    icon: <Database size={14} />,
    color: "#d97706",
    question: "Real-time chemical inventory alerts flagged our critical reagent shortage 3 days ahead of time.",
    author: "Inventory Controller",
  },
  {
    id: "q9",
    tag: "Safety & Health (SHE)",
    icon: <ShieldCheck size={14} />,
    color: "#dc2626",
    question: "Instantly retrieved MSDS toxicity handling guidelines for a novel fluorinated intermediate.",
    author: "EHS Officer",
  },
  {
    id: "q10",
    tag: "Histopathology",
    icon: <FileText size={14} />,
    color: "#7c3aed",
    question: "Automated scoring of tissue necrosis saved 2 days of manual slide microscope reviews.",
    author: "Pathology Specialist",
  },
];

// ── FAQ Items ─────────────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: "Is Hubble free to use across our R&D departments?",
    a: "Yes. Hubble is Aurigene's centralized enterprise AI platform. Every internal department—from Formulations Z2 and Analytical R&D to PR&D, Quality Assurance, and Stores—has instant, unrestricted access to the entire agent catalog without per-seat licensing.",
  },
  {
    q: "Is our proprietary scientific data and IP safe and secure?",
    a: "Absolutely. Hubble operates under strict enterprise data isolation protocols. All prompts, assay telemetry, and laboratory datasets are processed within private VPC infrastructure with zero external training retention and enterprise end-to-end encryption.",
  },
  {
    q: "Can Hubble AI agents replace specialized laboratory personnel?",
    a: "No. Hubble agents are purposefully built to assist, augment, and empower human scientists. They eliminate repetitive data wrangling, manual protocol cross-referencing, and tedious documentation, freeing scientists to focus on breakthrough discovery.",
  },
  {
    q: "How accurate and reliable are Hubble agents for assay analysis?",
    a: "All agents are calibrated against validated laboratory SOPs and benchmark datasets. Every response features Chain-of-Thought reasoning, explicit confidence metrics, and source verification links so results can be independently audited.",
  },
  {
    q: "What kind of questions and tasks can I delegate to Hubble?",
    a: "You can ask anything from molecular weight and buffer calculations, HPLC peak identification, and formulation solubility predictions, to batch record audits, regulatory compliance checks, and chemical inventory forecasts.",
  },
  {
    q: "How do I request a new custom agent for my department?",
    a: "You can propose new agents directly through the Hubble Agent Portal or submit requests to the Hubble core team. Department-specific agents are prioritized and visible in the Upcoming Agents roadmap.",
  },
];

export function StoriesPage({ onLaunchPortal, onNavigate, isDarkMode = false }) {
  // Sound toggle state (default muted for smooth auto-play)
  const [isMuted, setIsMuted] = useState(true);
  const heroVideoRef = useRef(null);

  // Scroll observer state for cards popup animation
  const [cardsInView, setCardsInView] = useState(false);
  const storiesSectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCardsInView(true);
        }
      },
      { threshold: 0.12 }
    );

    if (storiesSectionRef.current) {
      observer.observe(storiesSectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Video modal state
  const [activeModalVideo, setActiveModalVideo] = useState(null);
  const [activeModalTitle, setActiveModalTitle] = useState("");

  // FAQ open state
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // Toggle hero video sound
  const toggleSound = () => {
    if (heroVideoRef.current) {
      const nextMuted = !isMuted;
      heroVideoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
      if (!nextMuted) {
        heroVideoRef.current.play().catch(() => { });
      }
    }
  };

  // Open video modal
  const handlePlayStory = (story) => {
    setActiveModalVideo(story.videoUrl);
    setActiveModalTitle(`${story.name}'s Story – ${story.department}`);
  };

  // Smooth scroll to element
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLaunch = () => {
    if (onLaunchPortal) {
      onLaunchPortal();
    } else if (onNavigate) {
      onNavigate("/");
    }
  };

  return (
    <div className={`stories-page-wrapper${isDarkMode ? " dark" : ""}`}>
      {/* ──────────────────────────────────────────────────────────────────────
          1. FLOATING AUGUST-STYLE NAVBAR
          ────────────────────────────────────────────────────────────────────── */}
      <header className="stories-floating-nav-container">
        <nav className="stories-floating-nav" aria-label="Stories Navigation">
          {/* Left: Brand Wordmark (No Logo) */}
          <div className="stories-nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <span className="stories-nav-logo-text">Hubble<span className="stories-brand-ai">.ai</span></span>
          </div>

          {/* Center Links */}
          <div className="stories-nav-links">
            <button
              type="button"
              className="stories-nav-link active"
              onClick={() => scrollTo("stories-section")}
            >
              Stories
            </button>
            <button
              type="button"
              className="stories-nav-link"
              onClick={() => scrollTo("faq-section")}
            >
              FAQ
            </button>
          </div>

          {/* Right Action: Launch Agent Portal */}
          <div className="stories-nav-cta-wrap">
            <button
              type="button"
              className="stories-launch-portal-btn"
              onClick={handleLaunch}
            >
              <span>Launch Agent Portal</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </nav>
      </header>

      {/* ──────────────────────────────────────────────────────────────────────
          2. HERO SECTION WITH BACKGROUND VIDEO
          ────────────────────────────────────────────────────────────────────── */}
      <section className="stories-hero-section">
        {/* Fullscreen Video Background */}
        <div className="stories-hero-video-bg">
          <video
            ref={heroVideoRef}
            src={tevaVideo}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            className="stories-bg-video-element"
          />
          <div className="stories-hero-video-overlay" />
        </div>

        {/* Hero Overlay Content */}
        <div className="stories-hero-content">
          <h1 className="stories-hero-headline">
            Hubble.ai for Aurigene
          </h1>
          <p className="stories-hero-subtitle">
            Reshape the future along with AI Integration
            <br />
            Available when you need it.
          </p>
        </div>

        {/* Bottom Left: Sound On/Off Button */}
        <div className="stories-sound-toggle-wrap">
          <button
            type="button"
            className="stories-sound-toggle-btn"
            onClick={toggleSound}
            title={isMuted ? "Turn Sound On" : "Turn Sound Off"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            <span>SOUND: {isMuted ? "OFF" : "ON"}</span>
          </button>
        </div>

        {/* Bottom Center: Scroll Indicator */}
        <div className="stories-scroll-indicator" onClick={() => scrollTo("stories-section")}>
          <span className="stories-scroll-text">SCROLL</span>
          <div className="stories-scroll-mouse">
            <div className="stories-scroll-wheel" />
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────
          3. REAL STORIES FROM REAL PEOPLE (VIDEO CARDS WITH POPUP ANIMATION)
          ────────────────────────────────────────────────────────────────────── */}
      <section
        id="stories-section"
        ref={storiesSectionRef}
        className={`stories-real-people-section ${cardsInView ? "is-in-view" : ""}`}
      >
        <div className="stories-container">
          <div className="stories-section-header">
            <h2 className="stories-section-title">
              Real stories from <span className="stories-title-highlight">real people</span>
            </h2>
            <p className="stories-section-desc">
              Empowering scientists, lab researchers, and clinical teams across R&amp;D.
              Here&apos;s what they have to say.
            </p>
          </div>

          <div className="stories-video-cards-grid">
            {REAL_STORIES.map((story, idx) => (
              <div
                key={story.id}
                className={`stories-video-card ${cardsInView ? "is-in-view" : ""}`}
                style={{ "--card-index": idx }}
                onClick={() => handlePlayStory(story)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handlePlayStory(story); }}
              >
                {/* Background Image / Video Poster */}
                <div className="stories-video-card-bg">
                  <img
                    src={story.videoPoster}
                    alt={story.name}
                    className="stories-video-card-img"
                    loading="lazy"
                  />
                  <div className="stories-video-card-scrim" />
                </div>

                {/* Floating Play Button */}
                <div className="stories-play-btn-circle" title="Play Video Story">
                  <Play size={24} fill="#ffffff" className="stories-play-icon" />
                </div>

                {/* Card Content Overlay */}
                <div className="stories-video-card-content">
                  <div className="stories-card-department-pill">
                    {story.department}
                  </div>
                  <h3 className="stories-card-name">{story.name}</h3>
                  <p className="stories-card-highlight">{story.highlight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ──────────────────────────────────────────────────────────────────────
          5. FLOWING COMMENTS & FEEDBACK CARDS (LEFT-TO-RIGHT MARQUEE)
          ────────────────────────────────────────────────────────────────────── */}
      <section className="stories-feedback-marquee-section">
        <div className="stories-container">
          <div className="stories-section-header">
            <h2 className="stories-section-title">
              The <span className="stories-title-highlight">questions</span> you actually want to ask
            </h2>
            <p className="stories-section-desc">
              No bottlenecks. No wait times. Just honest, evidence-based agent workflows.
            </p>
          </div>
        </div>

        {/* Marquee Row 1 (Flowing left to right) */}
        <div className="stories-marquee-track-wrap">
          <div className="stories-marquee-track stories-marquee-track--left">
            {[...FEEDBACK_CARDS_ROW1, ...FEEDBACK_CARDS_ROW1].map((card, idx) => (
              <div key={`${card.id}-${idx}`} className="stories-feedback-card">
                <div className="stories-feedback-tag" style={{ color: card.color }}>
                  {card.icon}
                  <span>{card.tag}</span>
                </div>
                <p className="stories-feedback-question">{card.question}</p>
                <div className="stories-feedback-footer">
                  <span className="stories-feedback-author">{card.author}</span>
                  <button type="button" className="stories-feedback-link" onClick={handleLaunch}>
                    <span>Ask Hubble</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Marquee Row 2 (Flowing right to left or staggered) */}
        <div className="stories-marquee-track-wrap" style={{ marginTop: "20px" }}>
          <div className="stories-marquee-track stories-marquee-track--right">
            {[...FEEDBACK_CARDS_ROW2, ...FEEDBACK_CARDS_ROW2].map((card, idx) => (
              <div key={`${card.id}-${idx}`} className="stories-feedback-card">
                <div className="stories-feedback-tag" style={{ color: card.color }}>
                  {card.icon}
                  <span>{card.tag}</span>
                </div>
                <p className="stories-feedback-question">{card.question}</p>
                <div className="stories-feedback-footer">
                  <span className="stories-feedback-author">{card.author}</span>
                  <button type="button" className="stories-feedback-link" onClick={handleLaunch}>
                    <span>Ask Hubble</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────
          6. FAQ SECTION (QUESTIONS YOU MIGHT HAVE)
          ────────────────────────────────────────────────────────────────────── */}
      <section id="faq-section" className="stories-faq-section">
        <div className="stories-container stories-faq-container">
          <h2 className="stories-faq-main-title">Questions you might have</h2>

          <div className="stories-faq-accordion-list">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className={`stories-faq-item${isOpen ? " is-open" : ""}`}
                >
                  <button
                    type="button"
                    className="stories-faq-question-btn"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                    aria-expanded={isOpen}
                  >
                    <span className="stories-faq-question-text">{item.q}</span>
                    <span className="stories-faq-chevron-wrap">
                      <ChevronDown
                        size={20}
                        className={`stories-faq-chevron${isOpen ? " rotated" : ""}`}
                      />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="stories-faq-answer-pane">
                      <p className="stories-faq-answer-text">{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────
          7. FOOTER SECTION WITH VIDEO SHOWCASE
          ────────────────────────────────────────────────────────────────────── */}
      <footer className="stories-footer">
        <div className="stories-container">
          {/* Video Showcase Card in Footer */}
          <div className="stories-footer-video-card">
            <div className="stories-footer-video-info">
              <span className="stories-footer-pill">DEMO PREVIEW</span>
              <h3 className="stories-footer-video-title">See Hubble in Action</h3>
              <p className="stories-footer-video-desc">
                Watch how our intelligent agent ecosystem accelerates complex R&amp;D workflows,
                automates documentation, and transforms laboratory efficiency.
              </p>
              <button
                type="button"
                className="stories-footer-launch-btn"
                onClick={handleLaunch}
              >
                <span>Launch Agent Portal</span>
                <ArrowRight size={16} />
              </button>
            </div>
            <div
              className="stories-footer-video-player-box"
              onClick={() => {
                setActiveModalVideo(tevaVideo);
                setActiveModalTitle("Hubble Platform Overview");
              }}
            >
              <video
                src={tevaVideo}
                muted
                loop
                autoPlay
                playsInline
                className="stories-footer-mini-video"
              />
              <div className="stories-footer-play-overlay">
                <div className="stories-footer-play-circle">
                  <Play size={22} fill="#ffffff" />
                </div>
                <span>Play Full Video</span>
              </div>
            </div>
          </div>

          {/* Footer Bottom Bar */}
          <div className="stories-footer-bottom">
            <div className="stories-footer-brand">
              <img src={hubbleLogo} alt="Hubble Logo" className="stories-footer-logo-img" />
              <span className="stories-footer-brand-name">HUBBLE<span className="brand-dot">.AI</span></span>
              <span className="stories-footer-copy">© 2026 Aurigene Pharmaceutical Services Ltd. All rights reserved.</span>
            </div>

            <div className="stories-footer-links">
              <button type="button" onClick={handleLaunch} className="stories-footer-link">
                Agent Catalog Hub
              </button>
              <button
                type="button"
                onClick={() => onNavigate ? onNavigate("/upcoming") : handleLaunch()}
                className="stories-footer-link"
              >
                Upcoming Agents
              </button>
              <button
                type="button"
                onClick={() => onNavigate ? onNavigate("/tracker") : handleLaunch()}
                className="stories-footer-link"
              >
                Usage Analytics
              </button>
              <button type="button" onClick={() => scrollTo("faq-section")} className="stories-footer-link">
                FAQ
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Reusable Video Modal */}
      <VideoModal
        isOpen={Boolean(activeModalVideo)}
        videoUrl={activeModalVideo}
        title={activeModalTitle}
        onClose={() => setActiveModalVideo(null)}
      />
    </div>
  );
}
