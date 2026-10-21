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
      "A knowledge-grounded AI assistant that enables R&D scientists to query antibody literature in natural language, retrieving verified, source-backed answers to accelerate discovery and research.",
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
    owner: "Pranav",
    version: "1.0",
    updated: "October 2026",
    rating: 4.8,
    reviews: 94,
  },
  {
    id: "peptide-ai",
    name: "Peptide.AI",
    type: "agent",
    department: "PR&D",
    description:
      "Helps scientists research and develop peptides faster. It searches scientific papers, explains experimental results, and suggests practical steps to improve peptide sequences.",
    icon: Sparkles,
    video: dummyVideo,
    accent: "cyan",
    status: "Available",
    isTrending: false,
    lastUsed: null,
    primary:     { provider: "Microsoft", url: "https://...", status: "Available" },
    alternative: { provider: "Aurigene",  url: "https://...", status: "Available" },
    capabilities: [
      "Peptide research",
      "Sequence optimization",
      "Synthesis troubleshooting",
      "Literature analysis",
    ],
    owner: "Sidhvi and hibah",
    version: "1.0",
    updated: "October 2026",
    rating: 4.7,
    reviews: 118,
  },
  {
    id: "carbohydrate-chemistry-expert-agent",
    name: "Carbo Agent",
    type: "agent",
    department: "PR&D",
    description:
      "A specialized AI assistant that helps scientists navigate carbohydrate chemistry and glycobiology, comparing synthesis methods and troubleshooting reactions to accelerate experimental research.",
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
    owner: "Tejaswi",
    version: "1.0",
    updated: "October 2026",
    rating: 4.6,
    reviews: 81,
  },
  {
    id: "ELISA-Hybridoma-AI",
    name: "Hybridoma ELISA",
    type: "application",
    department: "NBE",
    description:
      "Automates hybridoma clone screening and serum ELISA workflows, generating titration curves and Excel outputs to eliminate tedious manual calculation errors and save scientists hours of lab time.",
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
      "Eliminates tedious manual effort and minimizes laboratory processing errors",
    ],
    owner: "Tejaswi",
    version: "1.0",
    updated: "September 2026",
    rating: 4.5,
    reviews: 93,
  },
  {
    id: "Teva Agent",
    name: "Teva Agent",
    type: "agent",
    department: "General",
    description:
      "An AI agent that identifies gaps across analytical validation and formulation manufacturing practices between Teva and Dr. Reddy's/Aurigene, streamlining regulatory alignment and compliance.",
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
    rating: 4.7,
    reviews: 219,
  },
  {
    id: "documenter",
    name: "Documenter AI",
    type: "agent",
    department: "Quality Assurance",
    description:
      "An application to transform documents containing spelling mistakes, formatting errors, lengthy content to reliable smart documents with added company branding logos and AI interpreted insights.",
    icon: FileText,
    video: dummyVideo,
    accent: "cyan",
    status: "Available",
    isTrending: false,
    lastUsed: null,
    primary:     { provider: "Microsoft", url: "https://...", status: "Available" },
    alternative: { provider: "Aurigene",  url: "https://...", status: "Available" },
    capabilities: [
      "Documentation",
      "Compliance",
      "Content Generation",
      "Document generation",
      "Scientific writing assistance",
    ],
    owner: "Vinith",
    version: "1.0",
    updated: "September 2026",
    rating: 4.6,
    reviews: 142,
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
  "General",
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

