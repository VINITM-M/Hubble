/**
 * models/agents.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Canonical agent data catalog for Hubble.AI Agent Hub.
 * All agent objects are defined here and imported by App.jsx and LandingPage.
 *
 * Each agent shape:
 *  id          – unique string key
 *  name        – display name
 *  type        – "agent" | "application"
 *  department  – owning department string
 *  description – full description string
 *  icon        – Lucide component OR imported image path (string)
 *  video       – imported video path (string) or ""
 *  accent      – CSS accent color token: "cyan" | "violet" | "rose" | "amber"
 *  status      – "Available" | "Coming Soon" | "Coming Soon"
 *  isTrending  – boolean
 *  lastUsed    – timestamp or null
 *  primary     – { provider, url, status }
 *  alternative – { provider, url, status } | null
 *  capabilities– string[]
 *  owner       – string
 *  version     – string
 *  updated     – string
 *  rating      – number (base)
 *  reviews     – number (base)
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Lucide icon imports ───────────────────────────────────────────────────────
import {
  FileText,
  Globe2,
  Layers,
  Search,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

// ── Image asset imports ───────────────────────────────────────────────────────
import documentIcon  from "../assets/documetor.png";
import rfiIcon       from "../assets/RFI agent.png";
import zenIcon       from "../assets/zenai-agent.png";
import semblyIcon    from "../assets/seamble-ai agent.png";

// ── Video asset imports ────────────────────────────────────────────────────────
import tevaVideo  from "../assets/Teva video recording.mp4";
import elisaVideo from "../assets/ELISA_AI.mp4";
let dummyVideo = tevaVideo; // fallback for other cards so demo video plays Teva demo


// ── Agent catalog ─────────────────────────────────────────────────────────────
export const initialAgents = [
  {
    id: "antibody-expert",
    name: "Antibody Agent",
    type: "agent",
    department: "Analytical R&D",
    description:
      "Designed for analytical R&D teams investigating therapeutic monoclonal antibodies and literature corpora. It enables scientists to query complex antibody research in natural language, retrieving verified citations and source-grounded answers. This eliminates tedious manual literature screening and accelerates candidate identification workflows across scientific research programs.",
    detailedDescription:
      "A knowledge-grounded AI assistant empowering R&D scientists to query complex antibody research in natural language. It interprets specialized scientific literature to retrieve grounded, source-backed answers—accelerating discovery workflows and eliminating hours of manual literature review.",
    icon: Search,
    video: dummyVideo,
    accent: "violet",
    status: "Available",
    isTrending: true,
    cardTags: ["Antibody Discovery", "Literature Search", "Candidate Screening"],
    lastUsed: null,
    primary:     { provider: "Microsoft", url: "https://...", status: "Available" },
    alternative: { provider: "Aurigene",  url: "https://...", status: "Available" },
    capabilities: [
      "Knowledge-grounded natural language Q&A for antibody research",
      "Retrieval & scientific interpretation from curated research sources",
      "Accelerated antibody discovery and candidate screening support",
      "MS Teams integration for seamless laboratory team collaboration",
      "Verified, source-backed responses to eliminate manual literature searching",
    ],
    owner: "Pranav Tulshyan",
    version: "1.0",
    updated: "October 2026",
    rating: 0,
    reviews: 0,
  },
  {
    id: "peptide-ai",
    name: "Peptide.AI",
    type: "agent",
    department: "PR&D",
    description:
      "Built for process R&D scientists developing therapeutic peptides and complex sequence variations. It searches specialized literature, evaluates experimental synthesis conditions, and recommends sequence optimizations to minimize aggregation and impurities. This streamlines chemical synthesis planning and eliminates trial-and-error laboratory troubleshooting cycles.",
    icon: Sparkles,
    video: dummyVideo,
    accent: "cyan",
    status: "Available",
    isTrending: false,
    lastUsed: null,
    primary:     { provider: "Microsoft", url: "https://...", status: "Available" },
    alternative: { provider: "Aurigene",  url: "https://...", status: "Available" },
    capabilities: [
      "Peptide structure & sequence optimization",
      "Synthesis troubleshooting & aggregation mitigation",
      "Specialized scientific literature & patent analysis",
      "Experimental condition evaluation & impurity reduction",
      "Laboratory synthesis planning & workflow protocol guidance",
    ],
    owner: "Sidhvi and Hibah Muhammad",
    version: "1.0",
    updated: "October 2026",
    rating: 0,
    reviews: 0,
  },
  {
    id: "carbohydrate-chemistry-expert-agent",
    name: "Carbo Agent",
    type: "agent",
    department: "PR&D",
    description:
      "Created for process chemistry teams navigating complex carbohydrate synthesis and glycobiology protocols. It interprets reaction mechanisms, compares analytical characterization methods, and diagnoses purification bottlenecks. This provides researchers with evidence-based guidance that resolves experimental failures and accelerates chemical synthesis workflows.",
    detailedDescription:
      "A centralized AI knowledge assistant for carbohydrate chemistry, glycobiology, and glycoengineering. It helps R&D scientists interpret complex concepts, compare analytical methods, and troubleshoot synthesis and purification—providing scientifically reasoned insights to optimize laboratory workflows.",
    icon: Layers,
    video: dummyVideo,
    accent: "amber",
    status: "Available",
    isTrending: false,
    cardTags: ["Carbohydrate Chemistry", "Synthesis Guidance", "Reaction Troubleshooting"],
    lastUsed: null,
    primary:     { provider: "Microsoft", url: "https://...", status: "Available" },
    alternative: { provider: "Aurigene",  url: "https://...", status: "Available" },
    capabilities: [
      "Carbohydrate chemistry, glycobiology & glycoengineering Q&A",
      "Synthesis, glycosylation & analytical method comparison",
      "Reaction troubleshooting & experimental planning guidance",
      "Purification, characterization & stability protocol insights",
      "Evidence-based reasoning with transparent uncertainty flagging",
    ],
    owner: "Tejaswi Velugapally",
    version: "1.0",
    updated: "October 2026",
    rating: 0,
    reviews: 0,
  },
  {
    id: "ELISA-Hybridoma-AI",
    name: "Hybridoma ELISA",
    type: "application",
    department: "NBE",
    description:
      "Engineered for biologics screening laboratories running high-throughput hybridoma and serum ELISA assays. It automatically ingests raw spectrophotometer optical density readings, averages duplicate wells, and fits statistical titration curves. This eliminates error-prone spreadsheet calculations and produces audit-ready analytical reports in minutes.",
    detailedDescription:
      "An intelligent laboratory automation agent that processes Hybridoma and serum ELISA screening data end-to-end. It automatically identifies viable clones, averages duplicates, generates titration curves, and outputs standardized Excel reports—saving scientists hours and eliminating manual calculation errors.",
    icon: documentIcon,
    video: elisaVideo,
    accent: "cyan",
    status: "Available",
    isTrending: false,
    cardTags: ["ELISA Automation", "Clone Screening", "Titration Curves"],
    lastUsed: null,
    primary:     { provider: "Microsoft", url: "https://...", status: "Available" },
    alternative: null,
    capabilities: [
      "Hybridoma ELISA clone screening & automatic clone selection",
      "Automated clone data population into designated secondary sheets",
      "Serum & SRA ELISA analysis with duplicate averaging and normalization",
      "Automated titration curve modeling and graphical plot generation",
      "Standardized multi-sheet Excel reports with statistical calculations",
    ],
    owner: "Tejaswi Velugapally",
    version: "1.0",
    updated: "September 2026",
    rating: 0,
    reviews: 0,
  },
  {
    id: "Teva Agent",
    name: "Teva Agent",
    type: "agent",
    department: "Quality Assurance",
    description:
      "Designed for cross-functional quality and regulatory teams harmonizing technical transfer documentation between Teva and Aurigene. It conducts automated gap analysis across analytical validation reports and formulation manufacturing practices. This identifies compliance risks early and streamlines technical transfer audits across international manufacturing sites.",
    detailedDescription:
      "An advanced gap analysis agent that compares analytical validation and formulation manufacturing practices between Teva and Dr. Reddy's/Aurigene. It pinpoints discrepancies, FT07 site differences, and compliance risks—accelerating cross-company technical transfers and regulatory harmonization.",
    icon: Layers,
    video: tevaVideo,
    accent: "violet",
    status: "Available",
    isTrending: true,
    cardTags: ["Gap Analysis", "Validation Review", "Practice Audit"],
    lastUsed: null,
    primary:     { provider: "Microsoft", url: "https://...", status: "Available" },
    alternative: { provider: "Aurigene",  url: "https://...", status: "Available" },
    capabilities: [
      "Analytical validation & method comparison gap analysis",
      "Formulation manufacturing practice cross-audit",
      "Teva vs. Dr. Reddy's/Aurigene document comparison",
      "FT07 site practice alignment & compliance verification",
      "Technical transfer risk detection & regulatory harmonization",
    ],
    owner: "Sidhvi",
    version: "0.9",
    updated: "September 2026",
    rating: 0,
    reviews: 0,
  },
  {
    id: "documenter",
    name: "Documenter AI",
    type: "agent",
    department: "Quality Assurance",
    description:
      "Built for quality assurance and compliance specialists managing technical documentation and standard operating procedures. It automatically corrects typographical and formatting discrepancies, restructures dense scientific texts, and applies corporate branding guidelines. This reduces document review turnaround and guarantees standardized regulatory compliance.",
    icon: FileText,
    video: dummyVideo,
    accent: "cyan",
    status: "Available",
    isTrending: false,
    lastUsed: null,
    primary:     { provider: "Microsoft", url: "https://...", status: "Available" },
    alternative: { provider: "Aurigene",  url: "https://...", status: "Available" },
    capabilities: [
      "Automated technical & SOP documentation compliance",
      "Scientific document formatting & restructuring",
      "Regulatory standard alignment & quality review",
      "Typographical error correction & consistency audits",
      "Scientific writing & summary generation assistance",
    ],
    owner: "Vinith Murugesan",
    version: "1.0",
    updated: "September 2026",
    rating: 0,
    reviews: 0,
  },
];

// ── Canonical department list ────────────────────────────────────────────────
export const CANONICAL_DEPARTMENTS = [
  "Analytical R&D",
  "Animal House",
  "AR&D Z2",
  "DMPK",
  "DPEx",
  "Engineering Services Department",
  "FAR&D",
  "Formulations Z2",
  "Histopathology",
  "HR&Admin",
  "Invitro",
  "IT",
  "LC Area",
  "Library",
  "NBE",
  "PR&D",
  "Process-Engineering",
  "Program Management",
  "Quality Assurance",
  "Safety Healthy And Environment",
  "Stores",
  "Supply chain Management",
  "Toxicology",
];

export const isDemoVideoEnabled = (agent) => {
  if (!agent) return false;
  const id = String(agent.id || "").toLowerCase().trim();
  const name = String(agent.name || "").toLowerCase().trim();

  // Allowed agents: Documenter AI, Teva Agent, and Hybridoma ELISA
  return (
    id === "documenter" ||
    name.includes("documenter") ||
    id === "teva agent" ||
    name.includes("teva") ||
    id === "elisa-hybridoma-ai" ||
    name.includes("hybridoma") ||
    name.includes("elisa")
  );
};
