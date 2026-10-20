/**
 * models/upcomingAgents.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Data catalog for upcoming next-generation AI agents, preview prototypes,
 * development roadmaps, and their underlying system prompts & cognitive algorithms.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const UPCOMING_AGENTS = [
  {
    id: "omnichem-synthesizer",
    name: "OmniChem RetroSynthesizer AI",
    codeName: "PROJECT-NEXUS",
    tagline: "Autonomous multi-step retro-synthesis planning and green chemistry pathway optimizer",
    department: "Pharma R&D",
    category: "Generative Chemistry",
    status: "Alpha Preview",
    statusColor: "purple",
    releaseTarget: "Q4 2026",
    progressPercent: 85,
    architecture: "Groq Qwen-32B Fast Engine + ChemBERTa RAG Graph",
    description:
      "OmniChem maps multi-step retro-synthetic disconnections for novel active pharmaceutical ingredients (APIs), factoring in commercially available precursors, atom economy, reaction yield benchmarks, and hazardous solvent minimization.",
    highlights: [
      "Generates 5+ viable retro-synthetic disconnection trees in under 3 seconds",
      "Calculates Process Mass Intensity (PMI) and green chemistry scores per route",
      "Integrated with Aurigene internal compound registry and Reaxys commercial databases",
      "Predicts byproduct profiles, protecting group strategies, and crystallization parameters",
    ],
    latestUpdates: [
      { date: "October 2026", note: "Validated retro-synthesis on 45 novel kinase inhibitor scaffolds with 94.2% chemist consensus" },
      { date: "September 2026", note: "Integrated Groq-accelerated SMILES parsing reducing path calculation latency from 45s to 1.8s" },
      { date: "August 2026", note: "Alpha container deployed to internal staging cluster for peer review" },
    ],
    upvotes: 248,
    prompts: {
      systemPrompt: `You are OmniChem RetroSynthesizer AI, an expert computational chemist and process development scientist.
Your objective is to propose viable, robust, and cost-efficient retro-synthetic disconnection pathways for user-submitted target molecules.

Guidelines:
1. Always evaluate molecular complexity, chiral centers, and functional group compatibility.
2. Prioritize commercially cataloged starting materials (Sigma-Aldrich, Enamine, eMolecules).
3. Maximize atom economy; avoid toxic solvents (DCM, benzene) in favor of sustainable alternatives (2-MeTHF, CPME).
4. For each disconnection step, provide: Reagents, Temperature/Solvent conditions, Estimated Yield (%), and Green Chemistry Score (1-10).
5. Output structured JSON detailing the step-by-step synthetic forward tree.`,
      sampleUserPrompt: `Target Molecule: 4-(4-fluorobenzyl)-N-(5-methyl-1H-pyrazol-3-yl)piperazine-1-carboxamide. Propose a scalable 3-step synthesis starting from commercially available precursors with high enantiomeric purity.`,
      expectedOutputFormat: `{
  "targetName": "Fluorobenzyl-pyrazolyl piperazine carboxamide",
  "recommendedPathways": 2,
  "steps": [
    {
      "step": 1,
      "reactionType": "Nucleophilic Substitution / Reductive Amination",
      "startingMaterials": ["4-fluorobenzaldehyde", "tert-butyl piperazine-1-carboxylate"],
      "reagents": "NaBH(OAc)3, DCE, AcOH, rt, 4h",
      "yield": "88%",
      "greenScore": "8.5/10"
    },
    {
      "step": 2,
      "reactionType": "Boc Deprotection",
      "reagents": "4M HCl in 1,4-dioxane, EtOAc, rt, 2h",
      "yield": "96%",
      "greenScore": "9.0/10"
    },
    {
      "step": 3,
      "reactionType": "Carbamate Coupling / Urea Formation",
      "reagents": "5-methyl-1H-pyrazol-3-amine, CDI, DIPEA, THF, 60°C",
      "yield": "82%",
      "greenScore": "8.8/10"
    }
  ],
  "overallYield": "69.3%",
  "pmiScore": "14.2 kg waste/kg API"
}`,
      chainOfThought:
        "1. Dissect target molecule at the central urea bond -> yields 4-(4-fluorobenzyl)piperazine and 5-methyl-1H-pyrazol-3-amine.\n2. Verify commercial availability of pyrazol-3-amine -> confirmed (available from key suppliers).\n3. Synthesize substituted piperazine via reductive amination of 4-fluorobenzaldehyde and Boc-piperazine.\n4. Form urea using CDI (carbonyl diimidazole) to avoid toxic phosgene.\n5. Optimize crystallization solvent (EtOAc/Heptane) for direct filtration.",
    },
  },
  {
    id: "reguguard-sentinel",
    name: "ReguGuard Autonomous Sentinel",
    codeName: "PROJECT-AEGIS",
    tagline: "Real-time regulatory dossier auditing against FDA 21 CFR Part 11, ICH, and EMA guidelines",
    department: "Regulatory Affairs",
    category: "Regulatory Intelligence",
    status: "Beta Enrollment",
    statusColor: "cyan",
    releaseTarget: "Q4 2026",
    progressPercent: 92,
    architecture: "Llama-3.3 70B Fast Engine + 21 CFR Vector Graph",
    description:
      "ReguGuard continuously scans IND/NDA submissions, investigator brochures, and eCTD Module 3/4 documents to identify compliance gaps, formatting non-conformities, and terminology discrepancies before official health authority filing.",
    highlights: [
      "Scans 300+ page eCTD dossiers in under 12 seconds with instant audit checklist",
      "Cross-verifies tabular values against source SAS statistical output datasets",
      "Flags ambiguous clinical endpoints, undocumented acronyms, and missing audit trails",
      "Generates pre-formatted FDA Form 483 Risk Assessment reports",
    ],
    latestUpdates: [
      { date: "October 2026", note: "Enrolled 12 regulatory specialists in closed beta testing for eCTD Module 3 validation" },
      { date: "September 2026", note: "Achieved 99.8% precision in detecting missing cross-references across multi-volume dossiers" },
      { date: "August 2026", note: "Added EMA Clinical Trial Regulation (EU CTR 536/2014) compliance rule sets" },
    ],
    upvotes: 312,
    prompts: {
      systemPrompt: `You are ReguGuard Autonomous Sentinel, a senior regulatory auditor specialized in FDA, EMA, and ICH GCP quality systems.
Your mission is to audit regulatory filings, clinical study reports (CSRs), and analytical validation protocols with zero tolerance for ambiguity.

Audit Protocol:
1. Validate terminology against standard CDISC MedDRA and CDASH taxonomies.
2. Inspect for compliance with 21 CFR Part 11 electronic records, digital signatures, and audit trails.
3. Check internal consistency: verify that numbers in CSR summary tables match the detailed statistical appendices.
4. Categorize findings into: CRITICAL (filing blocker), MAJOR (deficiency query risk), and MINOR (editorial improvement).
5. Provide actionable remediation text for each identified finding.`,
      sampleUserPrompt: `Audit the following extract from our IND Section 3.2.P.5.1 Specifications for finished oral tablet formulation. Check for ICH Q6A compliance and missing impurity threshold justifications.`,
      expectedOutputFormat: `{
  "complianceSummary": {
    "totalIssues": 2,
    "critical": 0,
    "major": 1,
    "minor": 1,
    "readinessScore": "87/100"
  },
  "findings": [
    {
      "severity": "MAJOR",
      "section": "3.2.P.5.1 - Impurity Profile",
      "issue": "Specified Degradant B listed at NMT 0.3% exceeds the ICH Q3B(R2) identification threshold (0.2%) without animal toxicological qualification reference.",
      "remediation": "Provide citation to 28-day rat toxicity study #TX-2026-089 or tighten specification limit to NMT 0.20%."
    },
    {
      "severity": "MINOR",
      "section": "3.2.P.5.1 - Dissolution",
      "issue": "Apparatus rotation speed designated as '50 rpm' without stating paddle apparatus type (USP 2).",
      "remediation": "Clarify: 'USP Apparatus 2 (Paddle) at 50 rpm in 900 mL 0.1N HCl'."
    }
  ]
}`,
      chainOfThought:
        "1. Parse input table against ICH Q6A decision trees for drug product release specifications.\n2. Compare daily dose threshold (50 mg/day) against ICH Q3B(R2) qualification limit (0.2% or 2 mg TDI).\n3. Flag 0.3% limit as an unqualified degradation product risk.\n4. Verify dissolution testing apparatus against USP <711> standards.\n5. Formulate remediation text ready for insertion into Module 3 dossier.",
    },
  },
  {
    id: "biopulse-clinical",
    name: "BioPulse Clinical Maestro",
    codeName: "PROJECT-STRATIFY",
    tagline: "Autonomous patient cohort stratification and real-time adverse event signal detector",
    department: "Clinical Operations",
    category: "Clinical AI",
    status: "Alpha Preview",
    statusColor: "emerald",
    releaseTarget: "Q1 2027",
    progressPercent: 78,
    architecture: "Groq Mixtral-8x7B + Med-PaLM Clinical Embedding",
    description:
      "BioPulse monitors real-time patient electronic data capture (EDC) streams across clinical trial sites. It detects latent safety signals, computes dropout hazard ratios, and recommends cohort re-balancing strategies to prevent trial failures.",
    highlights: [
      "Real-time safety signal detection 14 days earlier than standard pharmacovigilance batches",
      "Dynamic propensity score matching for adaptive Phase II/III basket trials",
      "Predicts protocol deviation likelihood based on historical site operational telemetry",
      "Automates CIOMS I and MedWatch 3500A pre-population for expedited adverse event reporting",
    ],
    latestUpdates: [
      { date: "October 2026", note: "Simulated 25,000 synthetic patient visits with zero false-negative safety escalation triggers" },
      { date: "September 2026", note: "Integrated SNOMED-CT clinical terminology mapping" },
    ],
    upvotes: 195,
    prompts: {
      systemPrompt: `You are BioPulse Clinical Maestro, an enterprise biostatistician and pharmacovigilance surveillance intelligence engine.
Analyze clinical study safety signals and patient cohort metrics with clinical rigor.

Responsibilities:
1. Calculate disproportionality metrics: Proportional Reporting Ratio (PRR) and Empirical Bayes Geometric Mean (EBGM).
2. Distinguish between expected disease progression vs true investigational drug adverse reactions.
3. Recommend clinical trial protocol amendments or site-level targeted monitoring visits.
4. Output concise clinical risk briefings with confidence intervals and recommended actions.`,
      sampleUserPrompt: `Analyze adverse event report stream for Protocol ONC-402 (Phase 2 Solid Tumors). We observe 6 cases of Grade 3 elevated ALT/AST in Cohort B (dose 120mg) within 21 days of administration. Assess signal validity.`,
      expectedOutputFormat: `{
  "signalStatus": "CONFIRMED CLINICAL SAFETY SIGNAL",
  "event": "Drug-Induced Liver Injury (DILI) / Hepatotoxicity Grade 3",
  "cohort": "Cohort B (120 mg BID)",
  "prr": 3.84,
  "ebgmScore": 2.91,
  "recommendations": [
    "Immediate protocol safety pause for 120mg cohort pending safety monitoring committee review",
    "Request baseline vs post-dose Hy's Law diagnostic panel (Total Bilirubin + Alk Phos)",
    "Generate MedWatch 3500A narrative drafts for regulatory submission within 7 calendar days"
  ]
}`,
      chainOfThought:
        "1. Extract total exposed patients in Cohort B (N=24) -> 6 cases represents a 25% incidence.\n2. Compare against Cohort A (60mg, N=30, 1 case = 3.3%) -> clear dose-dependent response relationship.\n3. Calculate PRR: (6/24) / (1/30) = 7.5 (statistically significant safety signal exceeding threshold PRR > 2.0).\n4. Check for confounding concomitant medications (e.g., acetaminophen or antifungals).\n5. Formulate immediate clinical remediation guidance.",
    },
  },
  {
    id: "spectravision-formulator",
    name: "SpectraVision PeakDecon AI",
    codeName: "PROJECT-RESONANCE",
    tagline: "Automated HPLC, NMR, and Mass-Spec peak deconvolution and purity optimization",
    department: "Process Chemistry",
    category: "Analytical Spectroscopy",
    status: "In Development",
    statusColor: "amber",
    releaseTarget: "Q1 2027",
    progressPercent: 65,
    architecture: "Groq Llama-3.1-8B + Deep Chemometrics CNN",
    description:
      "SpectraVision ingests raw chromatographic data files (Agilent ChemStation, Waters Empower) and automatically deconvolves overlapping peaks, calculates enantiomeric excess (ee%), and identifies trace co-eluting degradants in under 500ms.",
    highlights: [
      "Deconvolves shoulder peaks with peak resolution Rs < 0.8 with 99.1% baseline accuracy",
      "Automates peak integration parameter tuning, eliminating analyst-to-analyst variability",
      "Instant 1H-NMR multiplet splitting analysis and J-coupling constant calculation",
      "Direct integration with laboratory LIMS for automated certificate of analysis (CoA) generation",
    ],
    latestUpdates: [
      { date: "October 2026", note: "Completed benchmark on 10,000 chiral HPLC chromatograms against senior analytical chemists" },
      { date: "August 2026", note: "Added support for high-resolution Q-TOF mass spectrum isotope pattern deconvolution" },
    ],
    upvotes: 184,
    prompts: {
      systemPrompt: `You are SpectraVision PeakDecon AI, a specialist analytical chemometrician and chromatography algorithm.
Analyze raw spectroscopic and chromatographic peak profiles with sub-mAU precision.

Capabilities:
1. Apply Gaussian-Lorentzian hybrid peak deconvolution to unresolved retention times.
2. Determine peak tailing factor (T), theoretical plates (N), and resolution (Rs) according to USP <621>.
3. Calculate peak area percentages and quantify impurity thresholds with LOD/LOQ confidence levels.
4. Provide structured chromatographic diagnostic reports.`,
      sampleUserPrompt: `Analyze HPLC chromatogram for Batch #AP-2026-98: Main peak elutes at 4.52 min (Area 892,100), with a co-eluting shoulder peak detected at 4.71 min (Area 14,200). Calculate resolution Rs and assess if peak integration meets USP <621> criteria.`,
      expectedOutputFormat: `{
  "chromatographicAssessment": {
    "mainPeakRt": 4.52,
    "shoulderPeakRt": 4.71,
    "deltaRt": 0.19,
    "peakResolutionRs": 0.76,
    "uspCompliant": false,
    "status": "INCOMPLETE SEPARATION (Rs < 1.5)"
  },
  "recommendedAnalyticalAdjustment": [
    "Decrease mobile phase B flow gradient by 0.5%/min between 3.5 - 6.0 minutes",
    "Evaluate stationary phase swap from C18 to Phenyl-Hexyl for enhanced pi-pi secondary interaction",
    "Reduce column compartment temperature from 40°C to 30°C to increase retention selectivity"
  ]
}`,
      chainOfThought:
        "1. Calculate retention time difference: 4.71 - 4.52 = 0.19 min.\n2. Estimate peak width at half-height (W0.5) from chromatographic peak model.\n3. Compute resolution Rs = 0.76 -> below required baseline resolution Rs >= 1.5.\n4. Diagnose cause: Co-elution of closely related diastereomer or degradation product.\n5. Recommend targeted gradient and column selectivity adjustments.",
    },
  },
  {
    id: "supplychain-oracle",
    name: "SupplyChain Oracle Gen-4",
    codeName: "PROJECT-APEX",
    tagline: "Predictive cold-chain API inventory routing and raw material disruption hedging",
    department: "Supply Chain Analytics",
    category: "Predictive Logistics",
    status: "Beta Enrollment",
    statusColor: "blue",
    releaseTarget: "Q4 2026",
    progressPercent: 88,
    architecture: "Groq Llama-3.3 70B + Graph Neural Supply Network",
    description:
      "SupplyChain Oracle continuously models global geopolitical, weather, and supplier lead-time variables to prevent stockouts of critical starting materials (KSMs), active ingredients, and cold-chain temperature deviations.",
    highlights: [
      "Simulates 10,000 supply disruption scenarios across Tier-1, Tier-2, and Tier-3 suppliers",
      "Live cold-chain excursion risk monitoring using IoT logger telemetry",
      "Dynamic safety stock optimization reducing inventory holding costs by 18%",
      "Automated dual-sourcing purchase order dispatch upon lead-time threshold alerts",
    ],
    latestUpdates: [
      { date: "October 2026", note: "Connected live maritime tracking API and Indian customs port delay telemetry" },
      { date: "September 2026", note: "Tested on 3 commercial product lines resulting in 0 stockouts during raw material shortages" },
    ],
    upvotes: 215,
    prompts: {
      systemPrompt: `You are SupplyChain Oracle Gen-4, an enterprise supply chain architect and predictive procurement intelligence agent.
Assess pharmaceutical raw material supply networks, port choke points, cold-chain integrity, and dual-sourcing economics.

Core Directives:
1. Evaluate supplier risk scores based on geopolitical, lead-time variance, and quality audit histories.
2. Formulate immediate contingency rerouting for temperature-sensitive biologics and KSMs.
3. Optimize Economic Order Quantity (EOQ) and dynamic buffer inventories.
4. Output structured procurement risk assessments with financial impact and mitigation steps.`,
      sampleUserPrompt: `Supplier in Dalian reports a 3-week delay for Key Starting Material #KSM-884 due to environmental safety inspection. Current Aurigene warehouse buffer is 18 days. Assess supply impact and provide mitigation plan.`,
      expectedOutputFormat: `{
  "riskLevel": "HIGH - INVENTORY RUPTURE IMMINENT",
  "bufferDeficitDays": 3,
  "productionBatchRisk": "Batches #B-104 and #B-105 of Commercial API scheduled for Nov 14 will face shutdown",
  "contingencyPlan": [
    "Activate secondary qualified supplier (Ami Life Sciences, Vadodara) for emergency 250kg order",
    "Shift shipping mode from standard sea freight (22 days) to temperature-monitored air freight (4 days)",
    "Reschedule non-urgent pilot batch #P-401 to preserve existing 18-day buffer for commercial supply",
    "Net cost delta of air freight mitigation: +$14,200 vs potential plant idle penalty of $180,000"
  ]
}`,
      chainOfThought:
        "1. Calculate lead time: 3-week delay (21 days) vs available buffer (18 days) = 3 days negative inventory gap.\n2. Cross-reference production schedule -> 2 commercial batches scheduled inside the deficit window.\n3. Query ERP for qualified alternate vendors -> secondary vendor approved in Vadodara with 4-day delivery lead time.\n4. Calculate economic trade-off: Expedited air freight cost vs commercial plant idle penalty.\n5. Issue immediate procurement recommendation.",
    },
  },
  {
    id: "autodocugen-medscribe",
    name: "AutoDocuGen MedScribe",
    codeName: "PROJECT-SYNAPSE",
    tagline: "Multimodal automated protocol drafting, lab notebook synthesis, and audit log verification",
    department: "CTO Operations",
    category: "Medical NLP",
    status: "Alpha Preview",
    statusColor: "purple",
    releaseTarget: "Q4 2026",
    progressPercent: 91,
    architecture: "Groq Qwen-32B + Vision-Language Protocol Encoder",
    description:
      "AutoDocuGen converts unstructured lab notes, instrument raw data exports, and chemist voice memos into fully compliant, publication-ready Electronic Lab Notebook (ELN) entries and standard operating procedures (SOPs).",
    highlights: [
      "Converts handwritten bench notes & TLC plate photos into formatted ALCOA+ compliant ELN records",
      "Auto-generates reaction schemes, reagent stoichiometry tables, and NMR characterization sections",
      "Enforces 100% adherence to corporate EHS (Environmental Health and Safety) risk phrasing",
      "Cuts scientist documentation administrative burden by over 70%",
    ],
    latestUpdates: [
      { date: "October 2026", note: "Achieved 99.4% chemical structure recognition accuracy on photographed bench sketches" },
      { date: "September 2026", note: "Integrated directly with PerkinElmer Signals and Dotmatics ELN endpoints" },
    ],
    upvotes: 279,
    prompts: {
      systemPrompt: `You are AutoDocuGen MedScribe, an enterprise scientific documentation specialist and compliance engine.
Transform raw laboratory bench notes, chemical quantities, and analytical summaries into formal, auditable GAMP-5 and ALCOA+ compliant Electronic Lab Notebook (ELN) entries.

Formatting Rules:
1. Generate complete stoichiometry tables: Compound, MW, Equiv, Mass, Volume, Moles, Density, Purity.
2. Write clear, passive-voice experimental procedures ('To a stirred solution of... was added...').
3. Include EHS safety hazards and waste disposal guidelines for all chemicals used.
4. Output structured Markdown with standardized experimental headings.`,
      sampleUserPrompt: `Chemist note: "Charged 5g 4-bromoaniline to 100ml THF. Added 1.2 eq pinacol diboron, 5 mol% Pd(dppf)Cl2, 3 eq KOAc. Heated to 80C overnight. TLC showed complete conversion. Filtered through celite, concentrated, purified on silica (hex/EtOAc 9:1) got 5.8g white solid." Draft full formal ELN entry.`,
      expectedOutputFormat: `### Experiment: Synthesis of 4-(4,4,5,5-tetramethyl-1,3,2-dioxaborolan-2-yl)aniline
**Date:** Current System Date | **Notebook Ref:** ELN-2026-CH-0482

#### Stoichiometry Table
| Reagent | MW (g/mol) | Equiv | Amount | Moles | Safety Hazard |
|:---|:---|:---|:---|:---|:---|
| 4-Bromoaniline | 172.02 | 1.00 | 5.00 g | 29.06 mmol | Toxic, Irritant |
| Bis(pinacolato)diboron | 253.94 | 1.20 | 8.85 g | 34.87 mmol | Irritant |
| Pd(dppf)Cl2·CH2Cl2 | 816.64 | 0.05 | 1.18 g | 1.45 mmol | Carcinogen suspect |
| Potassium Acetate (KOAc) | 98.15 | 3.00 | 8.56 g | 87.18 mmol | Low hazard |
| Anhydrous THF | 72.11 | - | 100 mL | - | Highly flammable |

#### Experimental Procedure
A dry 250 mL two-necked round-bottom flask equipped with a reflux condenser and magnetic stir bar was charged with 4-bromoaniline (5.00 g, 29.06 mmol), bis(pinacolato)diboron (8.85 g, 34.87 mmol, 1.20 equiv), and potassium acetate (8.56 g, 87.18 mmol, 3.00 equiv) in anhydrous tetrahydrofuran (100 mL). The suspension was degassed with argon for 15 minutes, followed by the addition of [1,1'-bis(diphenylphosphino)ferrocene]dichloropalladium(II) complex with dichloromethane (1.18 g, 1.45 mmol, 0.05 equiv). The reaction mixture was heated to 80 °C under an inert atmosphere for 16 hours. TLC analysis (Hexanes/EtOAc 9:1) indicated complete consumption of starting material. The reaction was cooled to room temperature, filtered through a pad of Celite, and concentrated in vacuo. The crude residue was purified via flash column chromatography on silica gel (Hexanes/EtOAc 9:1) to afford the title compound as a white crystalline solid (5.80 g, 91.2% yield).`,
      chainOfThought:
        "1. Extract starting material: 4-bromoaniline (5g / 172.02 g/mol = 29.06 mmol).\n2. Calculate exact stoichiometric quantities for 1.2 eq B2pin2, 3 eq KOAc, 5 mol% Pd catalyst.\n3. Formulate GAMP-compliant experimental text in rigorous formal chemical syntax.\n4. Calculate theoretical yield (29.06 mmol * 219.09 g/mol = 6.36 g) -> 5.8g obtained = 91.2% yield.\n5. Append safety and disposal instructions for hazardous heavy metal catalyst waste.",
    },
  },
];
