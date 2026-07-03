export type AgentStatus = "Live" | "Bonding" | "Deploying";
export type AgentCategory = "Trading" | "Research" | "Automation" | "Social" | "Security" | "Creator";

export interface AgentMarketItem {
  id: string;
  slug: string;
  name: string;
  avatar: string;
  description: string;
  status: AgentStatus;
  token: string;
  marketCap: string;
  volume: string;
  trades: number;
  followers: string;
  category: AgentCategory;
  featured?: boolean;
  trending?: boolean;
  isNew?: boolean;
}

export const categories: AgentCategory[] = ["Trading", "Research", "Automation", "Social", "Security", "Creator"];

export const agents: AgentMarketItem[] = [
  {
    id: "1",
    slug: "aether-ops",
    name: "Aether Ops",
    avatar: "AO",
    description: "High-frequency execution copilot for tokenized treasury flows and autonomous market timing.",
    status: "Live",
    token: "AOPS",
    marketCap: "$12.8M",
    volume: "$2.1M",
    trades: 18524,
    followers: "24.8K",
    category: "Trading",
    trending: true,
    featured: true,
  },
  {
    id: "2",
    slug: "signal-forge",
    name: "Signal Forge",
    avatar: "SF",
    description: "Institutional-grade intelligence agent for onchain research, narratives, and execution briefs.",
    status: "Live",
    token: "FORGE",
    marketCap: "$8.4M",
    volume: "$984K",
    trades: 9620,
    followers: "18.2K",
    category: "Research",
    trending: true,
  },
  {
    id: "3",
    slug: "ghostflow",
    name: "Ghostflow",
    avatar: "GF",
    description: "Privacy-first automation layer for DAO ops, treasury routing, and cross-channel workflows.",
    status: "Bonding",
    token: "GHOST",
    marketCap: "$5.7M",
    volume: "$712K",
    trades: 6204,
    followers: "11.4K",
    category: "Automation",
    featured: true,
  },
  {
    id: "4",
    slug: "cinder-social",
    name: "Cinder Social",
    avatar: "CS",
    description: "Audience-native social growth agent that publishes, tests hooks, and iterates in real time.",
    status: "Deploying",
    token: "CNDR",
    marketCap: "$3.1M",
    volume: "$418K",
    trades: 4021,
    followers: "9.8K",
    category: "Social",
    isNew: true,
  },
  {
    id: "5",
    slug: "sentinel-zero",
    name: "Sentinel Zero",
    avatar: "SZ",
    description: "Continuous threat-monitoring agent for smart contracts, wallets, and protocol surface area.",
    status: "Live",
    token: "S0",
    marketCap: "$14.2M",
    volume: "$3.4M",
    trades: 26112,
    followers: "31.1K",
    category: "Security",
    trending: true,
  },
  {
    id: "6",
    slug: "luma-studio",
    name: "Luma Studio",
    avatar: "LS",
    description: "Creator economy agent for campaigns, drops, community funnels, and monetized audience flows.",
    status: "Bonding",
    token: "LUMA",
    marketCap: "$4.9M",
    volume: "$512K",
    trades: 4832,
    followers: "12.7K",
    category: "Creator",
    isNew: true,
  }
];

export const getAgentBySlug = (slug: string) => agents.find((agent) => agent.slug === slug);
