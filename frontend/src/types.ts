export interface DebateMotion {
  id: string;
  title: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  context: string;
}

export interface FallacyLogItem {
  timestamp: string;
  snippet: string;
  fallacyType: string;
  aiAnalysis: string;
  mitigation: string;
  severity: "critical" | "warning" | "info";
  color: string;
}

export interface SyllabusItem {
  id: string;
  title: string;
  type: string;
  duration: string;
  previewUrl?: string;
  category: "web" | "coach";
}

export type ViewTab = "dashboard" | "coaching" | "individual" | "spar" | "evaluation";

export const SAMPLE_MOTIONS: DebateMotion[] = [
  {
    id: "MOT-001",
    title: "The decentralization of AI decision-making is vital for global equity",
    category: "Technology & Ethics",
    difficulty: "Hard",
    context: "Universal access to model weights and resource distribution vs centralization."
  },
  {
    id: "MOT-002",
    title: "Universal Basic Income should be implemented in developing nations to counter automation",
    category: "Economy",
    difficulty: "Medium",
    context: "Financing security nets vs structural fiscal constraints in emerging markets."
  },
  {
    id: "MOT-003",
    title: "Carbon tax should be scaled proportionally to historical emissions of corporations",
    category: "Climate & Policy",
    difficulty: "Medium",
    context: "Accountability for legacy industrial outputs vs current market competitiveness."
  },
  {
    id: "MOT-004",
    title: "Social media platforms should ban political advertising during active elections",
    category: "Politics",
    difficulty: "Easy",
    context: "Democratic preservation vs freedom of political expression on public forums."
  },
  {
    id: "MOT-005",
    title: "We should prioritize deep-sea exploration over space colonization",
    category: "Science",
    difficulty: "Hard",
    context: "Resource potential and environmental utility on Earth vs interplanetary redundancy."
  }
];

export const SYLLABUS_DATA: SyllabusItem[] = [
  {
    id: "SYL-001",
    title: "Socratic Questioning Loops",
    type: "Logic Drill",
    duration: "15 mins",
    category: "web"
  },
  {
    id: "SYL-002",
    title: "Counter-Framing Dynamics",
    type: "Strategy Drill",
    duration: "10 mins",
    category: "web"
  },
  {
    id: "SYL-003",
    title: "Comparative Policy Weighing",
    type: "Impact Drill",
    duration: "12 mins",
    category: "web"
  },
  {
    id: "SYL-004",
    title: "First Principles Dissection",
    type: "Structure Drill",
    duration: "15 mins",
    category: "coach"
  },
  {
    id: "SYL-005",
    title: "Rebuttal Strategy Matrix",
    type: "Interactive Defense",
    duration: "20 mins",
    category: "coach"
  }
];

export const FALLACY_DATA: FallacyLogItem[] = [
  {
    timestamp: "14:22",
    snippet: "...well my opponent wants us all to go back to the stone age by banning cars...",
    fallacyType: "STRAWMAN",
    aiAnalysis: "Misrepresenting opponent's call for EV subsidies as a total car ban.",
    mitigation: "Stick to the nuanced proposal; acknowledge EV benefits before addressing cost.",
    severity: "critical",
    color: "#ffb4ab"
  },
  {
    timestamp: "28:10",
    snippet: "...if we allow this small change, our entire democracy will crumble by 2030.",
    fallacyType: "SLIPPERY SLOPE",
    aiAnalysis: "Linking an administrative change directly to systemic collapse without warrants.",
    mitigation: "Provide intermediate link-chains to show how erosion happens incrementally.",
    severity: "warning",
    color: "#ffb695"
  },
  {
    timestamp: "35:45",
    snippet: "You only believe that because you're from an urban background...",
    fallacyType: "AD HOMINEM",
    aiAnalysis: "Attacking the character/origin of speaker rather than the argument content.",
    mitigation: "Focus on the data provided, not the speaker's demographic profile.",
    severity: "info",
    color: "#918fa1"
  }
];
