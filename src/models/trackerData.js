// Base pricing per 1M tokens ($)
export const MODEL_PRICING = {
  "GPT-4o": { input: 5.0, output: 15.0 },
  "GPT-4 Turbo": { input: 10.0, output: 30.0 },
  "Claude 3.5 Sonnet": { input: 3.0, output: 15.0 },
  "Claude 3 Opus": { input: 15.0, output: 75.0 },
  "GPT-3.5 Turbo": { input: 0.5, output: 1.5 },
  "Embeddings v3": { input: 0.13, output: 0.0 },
};

// ============================================================
// CANONICAL DEPARTMENTS & AGENTS — Extracted strictly from main.jsx
// ============================================================
export const CANONICAL_DEPARTMENTS = [
  "Business Development",
  "Commercial Strategy",
  "CTO Operations",
  "Digital Tech",
  "Discovery AI",
  "Enterprise Operations",
  "Global Operations",
  "Human Resources",
  "Pharma R&D",
  "PMO & Strategy",
  "Process Chemistry",
  "Quality Assurance",
  "Regulatory Affairs",
  "Supply Chain Analytics",
];

export const CANONICAL_AGENTS = [
  {
    id: "Capacitor-Application",
    name: "Capacitor Application",
    category: "Capacity and Production",
    department: "CTO Operations",
    model: "GPT-4o",
    topUser: "Rajesh Kulkarni",
    inDaily: 310000,
    outDaily: 85000,
  },
  {
    id: "Bio-Med",
    name: "Bio-Med Agent",
    category: "Knowledge & Documents",
    department: "Pharma R&D",
    model: "GPT-4o",
    topUser: "Dr. Ananya Sharma",
    inDaily: 520000,
    outDaily: 170000,
  },
  {
    id: "Teva Agent",
    name: "Teva Agent",
    category: "Analytics & Formulation",
    department: "Enterprise Operations",
    model: "GPT-4o",
    topUser: "Neha Gupta",
    inDaily: 340000,
    outDaily: 105000,
  },
  {
    id: "leadGen",
    name: "LeadGen Agent",
    category: "Business Operations",
    department: "Commercial Strategy",
    model: "GPT-4 Turbo",
    topUser: "Gaurav Joshi",
    inDaily: 480000,
    outDaily: 150000,
  },
  {
    id: "Peptide Agent",
    name: "Peptide Agent",
    category: "Business Operations",
    department: "Process Chemistry",
    model: "GPT-4o",
    topUser: "Varun Malhotra",
    inDaily: 280000,
    outDaily: 95000,
  },
  {
    id: "Employee Navigator Agent",
    name: "Employee Navigator Agent",
    category: "Enterprise Search",
    department: "Human Resources",
    model: "GPT-3.5 Turbo",
    topUser: "Bhavna Bhatt",
    inDaily: 190000,
    outDaily: 60000,
  },
  {
    id: "Transportation Agent",
    name: "Transportation Agent",
    category: "HR Operations",
    department: "Supply Chain Analytics",
    model: "GPT-3.5 Turbo",
    topUser: "Karthik Iyer",
    inDaily: 210000,
    outDaily: 68000,
  },
  {
    id: "AI-Biologics-Drug-Discovery",
    name: "AI Biologics Drug Discovery",
    category: "Scientific Discovery",
    department: "Discovery AI",
    model: "Claude 3.5 Sonnet",
    topUser: "Vikram Mehta",
    inDaily: 890000,
    outDaily: 290000,
  },
  {
    id: "documenter",
    name: "Documenter Agent",
    category: "Knowledge & Documents",
    department: "Regulatory Affairs",
    model: "GPT-4o",
    topUser: "Divya Nair",
    inDaily: 260000,
    outDaily: 80000,
  },
  {
    id: "translator",
    name: "Translator Agent",
    category: "Knowledge & Documents",
    department: "Global Operations",
    model: "GPT-4o",
    topUser: "Gayatri Nair",
    inDaily: 230000,
    outDaily: 75000,
  },
  {
    id: "rfi-rfp",
    name: "RFI / RFP Agent",
    category: "Business Operations",
    department: "Business Development",
    model: "GPT-4 Turbo",
    topUser: "Amitabh Sen",
    inDaily: 240000,
    outDaily: 110000,
  },
  {
    id: "zen-ai",
    name: "Zen AI",
    category: "Enterprise Search",
    department: "Digital Tech",
    model: "GPT-4o",
    topUser: "Arun Verma",
    inDaily: 180000,
    outDaily: 55000,
  },
  {
    id: "sembly",
    name: "Sembly Agent",
    category: "Meetings & Productivity",
    department: "PMO & Strategy",
    model: "GPT-3.5 Turbo",
    topUser: "Kavita Rao",
    inDaily: 690000,
    outDaily: 230000,
  },
  {
    id: "meeting-assistant",
    name: "Meeting Assistant",
    category: "Meetings & Productivity",
    department: "Quality Assurance",
    model: "GPT-4o",
    topUser: "Manoj Tiwari",
    inDaily: 220000,
    outDaily: 70000,
  },
];

// Helper to generate realistic timeSeries
function generateAgentTimeSeries(inD, outD, inW, outW, inM, outM) {
  return {
    daily: [
      { label: "00:00 - 04:00", inTok: Math.floor(inD * 0.05), outTok: Math.floor(outD * 0.05) },
      { label: "04:00 - 08:00", inTok: Math.floor(inD * 0.12), outTok: Math.floor(outD * 0.12) },
      { label: "08:00 - 12:00", inTok: Math.floor(inD * 0.38), outTok: Math.floor(outD * 0.38) },
      { label: "12:00 - 16:00", inTok: Math.floor(inD * 0.30), outTok: Math.floor(outD * 0.30) },
      { label: "16:00 - 20:00", inTok: Math.floor(inD * 0.11), outTok: Math.floor(outD * 0.11) },
      { label: "20:00 - 24:00", inTok: Math.floor(inD * 0.04), outTok: Math.floor(outD * 0.04) },
    ],
    weekly: [
      { label: "Mon", inTok: Math.floor(inD * 1.1), outTok: Math.floor(outD * 1.1) },
      { label: "Tue", inTok: Math.floor(inD * 1.2), outTok: Math.floor(outD * 1.2) },
      { label: "Wed", inTok: Math.floor(inD * 1.3), outTok: Math.floor(outD * 1.3) },
      { label: "Thu", inTok: Math.floor(inD * 1.2), outTok: Math.floor(outD * 1.2) },
      { label: "Fri", inTok: Math.floor(inD * 1.0), outTok: Math.floor(outD * 1.0) },
      { label: "Sat", inTok: Math.floor(inD * 0.4), outTok: Math.floor(outD * 0.4) },
      { label: "Sun", inTok: Math.floor(inD * 0.3), outTok: Math.floor(outD * 0.3) },
    ],
    monthly: [
      { label: "Week 1", inTok: Math.floor(inM * 0.23), outTok: Math.floor(outM * 0.23) },
      { label: "Week 2", inTok: Math.floor(inM * 0.27), outTok: Math.floor(outM * 0.27) },
      { label: "Week 3", inTok: Math.floor(inM * 0.28), outTok: Math.floor(outM * 0.28) },
      { label: "Week 4", inTok: Math.floor(inM * 0.22), outTok: Math.floor(outM * 0.22) },
    ],
  };
}

// 14 Agents with Daily, Weekly, and Monthly consumption & time series
export const agentDataByTimeframe = CANONICAL_AGENTS.map((ca) => {
  const inD = ca.inDaily;
  const outD = ca.outDaily;
  const inW = inD * 6.5;
  const outW = outD * 6.2;
  const inM = inD * 26.0;
  const outM = outD * 25.0;
  const pricing = MODEL_PRICING[ca.model] || { input: 5.0, output: 15.0 };

  return {
    id: ca.id,
    agentName: ca.name,
    category: ca.category,
    department: ca.department,
    model: ca.model,
    topUser: `${ca.topUser} (${ca.department})`,
    inputCostPer1M: pricing.input,
    outputCostPer1M: pricing.output,
    daily: { inputTokens: inD, outputTokens: outD },
    weekly: { inputTokens: Math.floor(inW), outputTokens: Math.floor(outW) },
    monthly: { inputTokens: Math.floor(inM), outputTokens: Math.floor(outM) },
    timeSeries: generateAgentTimeSeries(inD, outD, inW, outW, inM, outM),
  };
});

// User history mapped by Agent ID / Name
export const agentUserHistoryData = {};

// ============================================================
// Comprehensive Master User Directory — 98 Aurigene Employees
// 7 employees for each of the 14 Canonical Departments,
// consuming strictly the 14 Canonical Agents
// ============================================================
const firstNames = [
  "Dr. Vikram", "Dr. Priya", "Rohan", "Sneha", "Divya", "Manoj", "Karthik", "Neha",
  "Arun", "Aditi", "Siddharth", "Meera", "Gaurav", "Tanvi", "Naveen", "Pooja",
  "Varun", "Shalini", "Deepak", "Ankita", "Harish", "Swati", "Kunal", "Ritu",
  "Sanjay", "Nandini", "Alok", "Tarun", "Pallavi", "Sunil", "Gayatri", "Pradeep",
  "Bhavna", "Chirag", "Indira", "Farhan", "Maya", "Lalit", "Smita", "Vijay",
  "Archana", "Nitin", "Rahul", "Sunita", "Prasad", "Sowmya", "Dhruv", "Lakshmi",
  "Ajay", "Kamala", "Santosh", "Kavitha", "Madan", "Shruti", "Prashant", "Usha",
  "Gopal", "Rekha", "Mohan", "Rashmi", "Dinesh", "Chitra", "Pavan", "Nalini",
  "Ramesh", "Geeta", "Venkat", "Kaveri", "Suman", "Neeraj", "Sushma", "Vishal",
  "Anita", "Rajiv", "Leela", "Aditya", "Keerthi", "Hemant", "Padma", "Shyam",
  "Uday", "Sravani", "Balaji", "Chandana", "Narasimha", "Radha", "Seethalakshmi",
  "Ashwin", "Bharat", "Sarita", "Amol", "Rupa", "Vivek", "Seema", "Vikrant",
  "Saraswati", "Naresh", "Jaya"
];

const lastNames = [
  "Seth", "Nambiar", "Deshmukh", "Patil", "Nair", "Tiwari", "Iyer", "Gupta",
  "Verma", "Roy", "Sen", "Krishnan", "Joshi", "Saxena", "Chawla", "Hegde",
  "Malhotra", "Menon", "Choudhary", "Banerji", "Pillai", "Deshpande", "Singhania", "Kapoor",
  "Goswami", "Das", "Nanda", "Bajaj", "Ghosh", "Shenoy", "Rawat", "Bhatt",
  "Parekh", "Swaminathan", "Qureshi", "Sundaram", "Mohan", "Raghuram", "Jha", "Anand",
  "Kulkarni", "Rajan", "Sharma", "Prasad", "Bose", "Subramaniam", "Reddy", "Suresh",
  "Agarwal", "Shukla", "Krishna", "Singh", "Patel", "Venkatesh", "Kumar", "Babu",
  "Rao", "Bhatia", "Lal", "Pandey", "Srivastava", "Mehrotra", "Krishnamurthy", "Raman",
  "Devi", "Raghavan"
];

export const masterUserDirectory = Array.from({ length: 98 }, (_, idx) => {
  const deptIdx = idx % CANONICAL_DEPARTMENTS.length;
  const dept = CANONICAL_DEPARTMENTS[deptIdx];
  const agentObj = CANONICAL_AGENTS[deptIdx % CANONICAL_AGENTS.length];
  const fn = firstNames[idx % firstNames.length];
  const ln = lastNames[idx % lastNames.length];
  const fullName = fn.includes("Dr.") ? `${fn} ${ln}` : `${fn} ${ln}`;
  const cleanEmail = `${fn.replace(/[^a-zA-Z]/g, "").toLowerCase()}.${ln.toLowerCase()}@aurigene.com`;

  const baseIn = Math.max(18000, 260000 - (idx * 2100));
  const baseOut = Math.max(6000, Math.floor(baseIn * 0.32));

  return {
    name: fullName,
    email: cleanEmail,
    dept: dept,
    agent: agentObj.name,
    model: agentObj.model,
    inD: baseIn,
    outD: baseOut,
  };
});

/**
 * Returns user history for an agent with full multi-timeframe dummy data (Daily, Weekly, Monthly)
 * Every user belongs to one of the 14 Canonical Departments and uses this agent.
 */
export function getAgentUserHistory(agent, timeframe = "monthly") {
  const agentName =
    typeof agent === "string"
      ? agent
      : agent?.agentName || agent?.name || agent?.id || "LeadGen Agent";

  // Normalize lookup to find canonical agent if possible
  const matchedAgent = CANONICAL_AGENTS.find(
    (ca) =>
      ca.id.toLowerCase() === agentName.toLowerCase() ||
      ca.name.toLowerCase() === agentName.toLowerCase() ||
      agentName.toLowerCase().includes(ca.id.toLowerCase()) ||
      agentName.toLowerCase().includes(ca.name.toLowerCase())
  );

  const displayAgentName = matchedAgent ? matchedAgent.name : agentName;

  return masterUserDirectory.map((u, idx) => {
    const mult = 1 - idx * 0.007;
    const inD = Math.max(12000, Math.floor(u.inD * mult));
    const outD = Math.max(4000, Math.floor(u.outD * mult));
    const dailyTok = inD + outD;
    const weeklyTok = Math.floor(dailyTok * 6.5);
    const monthlyTok = Math.floor(dailyTok * 26.0);

    const tokens =
      timeframe === "daily"
        ? dailyTok
        : timeframe === "weekly"
        ? weeklyTok
        : monthlyTok;

    const lastActive =
      timeframe === "daily"
        ? idx === 0
          ? "Just now"
          : idx < 6
          ? `${idx * 8 + 4} min ago`
          : idx < 22
          ? `${Math.floor(idx / 2)} hrs ago`
          : "Today, 09:30"
        : timeframe === "weekly"
        ? idx < 12
          ? "Active today"
          : idx < 35
          ? "Active yesterday"
          : `${(idx % 5) + 2} days ago`
        : idx < 18
        ? "Active this week"
        : idx < 50
        ? "Active 1-2 weeks ago"
        : "Active this month";

    const monthNum = String(((idx % 4) + 6)).padStart(2, "0");
    const dayNum = String(((idx % 25) + 1)).padStart(2, "0");
    const hourNum = String(((idx * 3) % 12) + 8).padStart(2, "0");
    const minNum = String((idx * 7) % 60).padStart(2, "0");

    return {
      sNo: idx + 1,
      id: `agent-usr-${idx + 1}`,
      user: u.name,
      agentName: displayAgentName,
      userEmail: u.email,
      department: u.dept,
      totalTokens: tokens,
      lastActive: lastActive,
      createdAt: `2026-${monthNum}-${dayNum} ${hourNum}:${minNum} AM`,
    };
  });
}

/**
 * Returns user history for a department with full multi-timeframe dummy data (Daily, Weekly, Monthly)
 * Guaranteed to use strictly the 14 Canonical Agents and 14 Canonical Departments.
 */
export function getDepartmentUserHistory(deptName, timeframe = "monthly") {
  const normalizedDept = String(deptName || "").trim().toLowerCase();
  const isAll =
    !deptName ||
    normalizedDept === "department" ||
    normalizedDept === "all" ||
    normalizedDept === "all departments" ||
    normalizedDept === "";

  let candidatePool = [];

  if (isAll) {
    // Return all 98 users across all 14 Canonical Departments
    candidatePool = masterUserDirectory.map((u) => ({ ...u, dept: u.dept }));
  } else {
    // Match against CANONICAL_DEPARTMENTS
    const canonicalMatch = CANONICAL_DEPARTMENTS.find(
      (cd) =>
        cd.toLowerCase() === normalizedDept ||
        cd.toLowerCase().includes(normalizedDept) ||
        normalizedDept.includes(cd.toLowerCase())
    );

    const targetDeptTitle = canonicalMatch || deptName || "CTO Operations";

    // Provide 70 users for this specific department
    candidatePool = masterUserDirectory.slice(0, 70).map((u, idx) => {
      // Rotate top agent across CANONICAL_AGENTS
      const agentChoice = CANONICAL_AGENTS[idx % CANONICAL_AGENTS.length];
      return {
        ...u,
        dept: targetDeptTitle,
        agent: agentChoice.name,
        model: agentChoice.model,
        email: `${u.name.toLowerCase().replace(/[^a-z]/g, "")}@aurigene.com`,
      };
    });
  }

  return candidatePool.map((u, idx) => {
    const mult = 1 - idx * 0.0075;
    const inD = Math.max(14000, Math.floor(u.inD * mult));
    const outD = Math.max(4500, Math.floor(u.outD * mult));
    const dailyTok = inD + outD;
    const weeklyTok = Math.floor(dailyTok * 6.5);
    const monthlyTok = Math.floor(dailyTok * 26.0);

    const tokens =
      timeframe === "daily"
        ? dailyTok
        : timeframe === "weekly"
        ? weeklyTok
        : monthlyTok;

    const lastActive =
      timeframe === "daily"
        ? idx === 0
          ? "Just now"
          : idx < 6
          ? `${idx * 7 + 5} min ago`
          : idx < 22
          ? `${Math.floor(idx / 2)} hrs ago`
          : "Today, 10:15"
        : timeframe === "weekly"
        ? idx < 12
          ? "Active today"
          : idx < 35
          ? "Active yesterday"
          : `${(idx % 4) + 2} days ago`
        : idx < 18
        ? "Active this week"
        : idx < 50
        ? "Active 1-2 weeks ago"
        : "Active this month";

    return {
      sNo: idx + 1,
      id: `dept-user-${idx + 1}`,
      userName: u.name,
      email: u.email,
      topAgentUsed: u.agent || "LeadGen Agent",
      totalTokens: tokens,
      lastActive: lastActive,
      model: u.model || "GPT-4o",
      dept: u.dept,
    };
  });
}

// 112 Users strictly mapped to the 14 Canonical Departments and 14 Canonical Agents
export const userDataByTimeframe = Array.from({ length: 112 }, (_, idx) => {
  const dept = CANONICAL_DEPARTMENTS[idx % CANONICAL_DEPARTMENTS.length];
  const agentObj = CANONICAL_AGENTS[idx % CANONICAL_AGENTS.length];
  const fn = firstNames[idx % firstNames.length];
  const ln = lastNames[idx % lastNames.length];
  const fullName = fn.includes("Dr.") ? `${fn} ${ln}` : `${fn} ${ln}`;
  const cleanEmail = `${fn.replace(/[^a-zA-Z]/g, "").toLowerCase()}.${ln.toLowerCase()}@aurigene.com`;

  const inD = Math.max(22000, 320000 - idx * 2400);
  const outD = Math.max(7000, Math.floor(inD * 0.32));
  const inW = inD * 6.5;
  const outW = outD * 6.2;
  const inM = inD * 26.0;
  const outM = outD * 25.0;

  return {
    id: `usr-${idx + 1}`,
    userName: fullName,
    dept: dept,
    email: cleanEmail,
    topAgentUsed: agentObj.name,
    model: agentObj.model,
    daily: {
      inputTokens: inD,
      outputTokens: outD,
      lastActive: idx === 0 ? "Just now" : idx < 5 ? `${idx * 8 + 3} min ago` : `${(idx % 12) + 1} hrs ago`,
    },
    weekly: {
      inputTokens: Math.floor(inW),
      outputTokens: Math.floor(outW),
      lastActive: idx < 10 ? "Active today" : "Active this week",
    },
    monthly: {
      inputTokens: Math.floor(inM),
      outputTokens: Math.floor(outM),
      lastActive: "Active this month",
    },
    timeSeries: generateAgentTimeSeries(inD, outD, inW, outW, inM, outM),
  };
});
