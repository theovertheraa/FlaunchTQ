"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import type { AgentMarketItem } from "@/lib/mock/agents";
import { agents } from "@/lib/mock/agents";

const TABS = [
  { key: "all", label: "All" },
  { key: "trending", label: "Trending" },
  { key: "new", label: "New" },
  { key: "volume", label: "High Volume" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function statusColor(status: AgentMarketItem["status"]) {
  if (status === "Live") return "text-emerald-400";
  if (status === "Bonding") return "text-amber-400";
  return "text-sky-400";
}

function AgentRow({ agent }: { agent: AgentMarketItem }) {
  return (
    <Link
      href={`/agents/${agent.slug}`}
      className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-zinc-900/60 transition rounded-2xl"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-xs font-bold text-white border border-white/8">
          {agent.avatar}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{agent.name}</p>
          <p className="text-xs text-zinc-500">${agent.token} · {agent.category}</p>
        </div>
      </div>
      <div className="flex items-center gap-6 shrink-0">
        <div className="hidden sm:block text-right">
          <p className="text-xs text-zinc-500">MCap</p>
          <p className="text-sm text-white">{agent.marketCap}</p>
        </div>
        <div className="hidden md:block text-right">
          <p className="text-xs text-zinc-500">Vol</p>
          <p className="text-sm text-white">{agent.volume}</p>
        </div>
        <span className={`text-xs font-medium ${statusColor(agent.status)}`}>
          {agent.status}
        </span>
        <span className="text-zinc-600 text-sm">›</span>
      </div>
    </Link>
  );
}

export function DiscoveryBar() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const filtered = useMemo(() => {
    let list = agents.filter((a) => {
      const q = query.toLowerCase();
      return (
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.token.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    });

    if (activeTab === "trending") list = list.filter((a) => a.trending);
    else if (activeTab === "new") list = list.filter((a) => a.isNew);
    else if (activeTab === "volume") list = list.sort((a, b) => parseInt(b.volume.replace(/\D/g, "")) - parseInt(a.volume.replace(/\D/g, "")));

    return list;
  }, [query, activeTab]);

  return (
    <section className="space-y-4">
      {/* Search + tabs */}
      <div className="rounded-3xl border border-white/8 bg-zinc-950 p-4 sm:p-5 space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search agents, tickers, categories…"
            className="w-full rounded-2xl border border-white/10 bg-black py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                activeTab === tab.key
                  ? "border-white bg-white text-black"
                  : "border-white/10 bg-black text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Agent list */}
      <div className="rounded-3xl border border-white/8 bg-zinc-950 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">
              {activeTab === "all" ? "All Agents" : activeTab === "trending" ? "Trending" : activeTab === "new" ? "New Launches" : "High Volume"}
            </h2>
          </div>
          <span className="text-xs text-zinc-600">{filtered.length} agents</span>
        </div>
        <div className="p-2">
          {filtered.length > 0 ? (
            filtered.map((agent) => <AgentRow key={agent.id} agent={agent} />)
          ) : (
            <div className="py-10 text-center text-sm text-zinc-600">No agents found</div>
          )}
        </div>
      </div>
    </section>
  );
}
