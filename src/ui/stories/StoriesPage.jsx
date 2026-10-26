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
  TrendingUp,
  DollarSign,
  Calendar,
  Users,
  Star,
} from "lucide-react";

import tevaVideo from "../../assets/Teva Agent Demo.mp4";
import elisaVideo from "../../assets/ELISA_AI.mp4";
import hubbleAiVideo from "../../assets/hubble_ai.mp4";
import rohitImage from "../../assets/Rohit-Image.jpg";
import janardhanImage from "../../assets/Janardhanan.jpg";
import hibahImage from "../../assets/Hibah.jpg";
import hubbleLogo from "../../assets/hubble-logo.png";
import aiHubbleLogo from "../../assets/ai_hubble_logo.png";
import { VideoModal } from "../shared/VideoModal.jsx";
import { ContactModal } from "../shared/ContactModal.jsx";
import "../../styles/stories.css";

// ── Why Hubble.AI ? Analytics Board Data & Live Count-Up Component ───────────
const WHY_HUBBLE_METRICS_ROW1 = [
  {
    id: "time-saved",
    label: "Time Saved",
    icon: <Clock size={20} />,
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.12)",
    borderColor: "rgba(245, 158, 11, 0.25)",
    prefix: "",
    target: 10,
    suffix: " h",
    decimals: 0,
    subtitle: "Hours Reclaimed Per Scientist, Every Week",
  },
  {
    id: "work-done",
    label: "Work Done By",
    icon: <TrendingUp size={20} />,
    color: "#0284c7",
    bgColor: "rgba(2, 132, 199, 0.12)",
    borderColor: "rgba(2, 132, 199, 0.25)",
    prefix: "",
    target: 3,
    suffix: "×",
    decimals: 0,
    subtitle: "Faster Acceleration Across Experimental Runs",
  },
  {
    id: "money-saved",
    label: "Money Saved",
    icon: <DollarSign size={20} />,
    color: "#10b981",
    bgColor: "rgba(16, 185, 129, 0.12)",
    borderColor: "rgba(16, 185, 129, 0.25)",
    prefix: "$",
    target: 200,
    suffix: "K",
    decimals: 0,
    subtitle: "Estimated Efficiency Savings Per Team, Yearly",
  },
];

const WHY_HUBBLE_METRICS_ROW2 = [
  {
    id: "agents-live",
    label: "Agents Live",
    icon: <Cpu size={20} />,
    color: "#8b5cf6",
    bgColor: "rgba(139, 92, 246, 0.12)",
    borderColor: "rgba(139, 92, 246, 0.25)",
    prefix: "",
    target: 8,
    suffix: "",
    decimals: 0,
    subtitle: "Production-Ready Agents Active Today",
  },
  {
    id: "agents-planned",
    label: "Agents Planned",
    icon: <Calendar size={20} />,
    color: "#2563eb",
    bgColor: "rgba(37, 99, 235, 0.12)",
    borderColor: "rgba(37, 99, 235, 0.25)",
    prefix: "",
    target: 40,
    suffix: "",
    decimals: 0,
    subtitle: "Roadmap Agents Scheduled For Next Release",
  },
  {
    id: "live-customers",
    label: "Live Customers",
    icon: <Users size={20} />,
    color: "#0d9488",
    bgColor: "rgba(13, 148, 136, 0.12)",
    borderColor: "rgba(13, 148, 136, 0.25)",
    prefix: "",
    target: 100,
    suffix: "+",
    decimals: 0,
    subtitle: "Active Scientists Leveraging Hubble Daily",
  },
  {
    id: "rating",
    label: "Platform Rating",
    icon: <Star size={20} fill="#f59e0b" />,
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.15)",
    borderColor: "rgba(245, 158, 11, 0.3)",
    prefix: "",
    target: 4.5,
    suffix: "",
    decimals: 1,
    subtitle: "Stars Rating From Verified Lab Researchers",
  },
];

function WhyHubbleStatCard({ item, inView, index = 0 }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!inView) {
      setDisplayValue(0);
      return;
    }

    let startTimestamp = null;
    let animationFrameId;
    // 4.2s smooth counting animation (2 seconds extra for rich, clearly visible counting)
    const duration = 4200;

    const animateCount = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease-out quart: starts dynamically and decelerates with high precision
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const current = easeOut * item.target;
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateCount);
      } else {
        setDisplayValue(item.target);
      }
    };

    animationFrameId = requestAnimationFrame(animateCount);
    return () => cancelAnimationFrame(animationFrameId);
  }, [inView, item.target]);

  const formattedNumber =
    item.decimals > 0
      ? displayValue.toFixed(item.decimals)
      : Math.round(displayValue);

  return (
    <div
      className={`why-hubble-stat-card ${inView ? "is-visible" : ""}`}
      style={{
        "--card-theme-color": item.color,
        "--card-theme-bg": item.bgColor,
        "--card-theme-border": item.borderColor,
        "--card-delay": `${index * 80}ms`,
      }}
    >
      <div className="why-hubble-card-ambient-glow" />
      <div className="why-hubble-card-header">
        <span
          className="why-hubble-card-icon-pill"
          style={{
            color: item.color,
            background: item.bgColor,
            borderColor: item.borderColor,
          }}
        >
          {item.icon}
        </span>
        <span className="why-hubble-card-label">{item.label}</span>
      </div>

      <div className="why-hubble-card-number">
        {item.prefix && (
          <span className="why-hubble-number-prefix" style={{ color: item.color }}>
            {item.prefix}
          </span>
        )}
        <span className="why-hubble-number-digit">{formattedNumber}</span>
        {item.suffix && (
          <span className="why-hubble-number-unit" style={{ color: item.color }}>
            {item.suffix}
          </span>
        )}
      </div>

      <p className="why-hubble-card-subtitle">{item.subtitle}</p>
    </div>
  );
}

// ── Real People Stories Data ──────────────────────────────────────────────────
const REAL_STORIES = [
  {
    id: "rohit",
    name: "Rohit Chintawar",
    role: "Chief Digital and Information Officer",
    department: "DPEx",
    highlight: "It helpful for generate, analysis the data and reports of information team tasks",
    videoUrl: null,
    videoPoster: rohitImage,
  },
  {
    id: "janardhan",
    name: "Janardhan Sridhara",
    role: "Principal Data Scientist",
    department: "DPEx",
    highlight: "Accelerating predictive modeling and automated analytical pipelines for research teams",
    videoUrl: null,
    videoPoster: janardhanImage,
  },
  {
    id: "hibah",
    name: "Hibah Ihsan Muhammad",
    role: "Product Manager",
    department: "DPEx",
    highlight: "Streamlining digital agent rollouts and user workflows across scientific departments",
    videoUrl: null,
    videoPoster: hibahImage,
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

export function StoriesPage({ onLaunchPortal, onNavigate, isDarkMode = false, userEmail = null }) {
  // Sound toggle state (default muted for smooth auto-play)
  const [isMuted, setIsMuted] = useState(true);
  const heroVideoRef = useRef(null);

  // Active navigation section state
  const [activeNavSection, setActiveNavSection] = useState("");
  const isManualScrollingRef = useRef(false);
  const manualScrollTimeoutRef = useRef(null);

  // Contact Us modal state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Scroll observer state for "Why Hubble.AI ?" analytics board
  const [analyticsInView, setAnalyticsInView] = useState(false);
  const analyticsSectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnalyticsInView(true);
        }
      },
      { threshold: 0.15 }
    );

    if (analyticsSectionRef.current) {
      observer.observe(analyticsSectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

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

  // Scroll spy to update active navbar link dynamically when user scrolls
  useEffect(() => {
    const handleScrollSpy = () => {
      if (isManualScrollingRef.current) return;
      const scrollPos = (window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0) + 160;

      const analyticsEl = document.getElementById("why-hubble-analytics");
      const storiesEl = document.getElementById("stories-section");
      const faqEl = document.getElementById("faq-section");

      const analyticsTop = analyticsEl ? analyticsEl.offsetTop : Infinity;
      const storiesTop = storiesEl ? storiesEl.offsetTop : Infinity;
      const faqTop = faqEl ? faqEl.offsetTop : Infinity;

      if (faqTop !== Infinity && scrollPos >= faqTop - 60) {
        setActiveNavSection("faq");
      } else if (storiesTop !== Infinity && scrollPos >= storiesTop - 60) {
        setActiveNavSection("stories");
      } else if (analyticsTop !== Infinity && scrollPos >= analyticsTop - 60) {
        setActiveNavSection("analytics");
      } else {
        setActiveNavSection("");
      }
    };

    window.addEventListener("scroll", handleScrollSpy, { passive: true });
    // Run once on mount to sync initial position
    handleScrollSpy();
    return () => window.removeEventListener("scroll", handleScrollSpy);
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
    if (!story.videoUrl) return;
    setActiveModalVideo(story.videoUrl);
    setActiveModalTitle(`${story.name}'s Story – ${story.department}`);
  };

  // Robust smooth scroll to target section with lock to prevent active indicator jump
  const scrollTo = (id, navKey) => {
    if (navKey) setActiveNavSection(navKey);
    isManualScrollingRef.current = true;
    if (manualScrollTimeoutRef.current) {
      clearTimeout(manualScrollTimeoutRef.current);
    }
    manualScrollTimeoutRef.current = setTimeout(() => {
      isManualScrollingRef.current = false;
    }, 950);

    const el = document.getElementById(id);
    if (!el) return;

    // Primary: Native smooth scrollIntoView (honors CSS scroll-margin-top: 96px)
    try {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch { }

    // Secondary / Fallback: window.scrollTo with calculated absolute offset
    const navOffset = 96;
    const bodyTop = document.body.getBoundingClientRect().top;
    const elTop = el.getBoundingClientRect().top;
    const offsetPosition = Math.max(0, elTop - bodyTop - navOffset);

    if (window.scrollTo) {
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
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
            <span className="stories-nav-logo-text">Hubble<span className="stories-brand-ai">.AI</span></span>
          </div>

          {/* Center Links: Stories, Analytics, FAQ with 1-to-1 Respective Mapping */}
          <div className="stories-nav-links">
            <button
              type="button"
              className={`stories-nav-link ${activeNavSection === "stories" ? "active" : ""}`}
              onClick={() => scrollTo("stories-section", "stories")}
            >
              Stories
            </button>
            <button
              type="button"
              className={`stories-nav-link ${activeNavSection === "analytics" ? "active" : ""}`}
              onClick={() => scrollTo("why-hubble-analytics", "analytics")}
            >
              Analytics
            </button>
            <button
              type="button"
              className={`stories-nav-link ${activeNavSection === "faq" ? "active" : ""}`}
              onClick={() => scrollTo("faq-section", "faq")}
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
            src={hubbleAiVideo}
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
            Hubble.AI for Aurigene
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
        <div className="stories-scroll-indicator" onClick={() => scrollTo("why-hubble-analytics", "analytics")}>
          <span className="stories-scroll-text">SCROLL</span>
          <div className="stories-scroll-mouse">
            <div className="stories-scroll-wheel" />
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────
          2.5 WHY HUBBLE.AI ? LIVE ANALYTICS BOARD (BEFORE FEEDBACK STORIES)
          ────────────────────────────────────────────────────────────────────── */}
      <section
        id="why-hubble-analytics"
        ref={analyticsSectionRef}
        className={`why-hubble-section ${analyticsInView ? "is-in-view" : ""}`}
      >
        <div className="why-hubble-container">
          <div className="why-hubble-header">
            <span className="why-hubble-eyebrow">
              <Sparkles size={13} className="why-hubble-sparkle" /> Enterprise Impact &amp; Value
            </span>
            <h2 className="why-hubble-title">
              Why Hubble<span className="why-hubble-title-dot">.AI ?</span>
            </h2>
            <p className="why-hubble-subtitle">
              Measurable Productivity Acceleration, Cost Efficiency, And Automated Research Workflows Across Aurigene Laboratories.
            </p>
          </div>

          <div className="why-hubble-grid-row-1">
            {WHY_HUBBLE_METRICS_ROW1.map((item, idx) => (
              <WhyHubbleStatCard key={item.id} item={item} inView={analyticsInView} index={idx} />
            ))}
          </div>

          <div className="why-hubble-grid-row-2">
            {WHY_HUBBLE_METRICS_ROW2.map((item, idx) => (
              <WhyHubbleStatCard key={item.id} item={item} inView={analyticsInView} index={idx + 3} />
            ))}
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
                {story.videoUrl && (
                  <div className="stories-play-btn-circle" title="Play Video Story">
                    <Play size={24} fill="#ffffff" className="stories-play-icon" />
                  </div>
                )}

                {/* Card Content Overlay */}
                <div className="stories-video-card-content">
                  <div className="stories-card-department-pill">
                    {story.department}
                  </div>
                  <h3 className="stories-card-name">{story.name}</h3>
                  {story.role && <p className="stories-card-role">{story.role}</p>}
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
              <img src={aiHubbleLogo} alt="Hubble Logo" className="stories-footer-logo-img" />
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
              <button
                type="button"
                onClick={() => setIsContactModalOpen(true)}
                className="stories-footer-link"
              >
                Contact Us
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

      {/* Contact Us Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        userEmail={userEmail}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
