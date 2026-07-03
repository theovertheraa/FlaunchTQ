import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { AgentMarketItem } from "@/lib/mock/agents";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function AgentCard({ agent }: { agent: AgentMarketItem }) {
  return (
    <Link href={`/agents/${agent.slug}`}>
      <Card className="h-full p-4 transition-transform duration-300 hover:-translate-y-1 hover:border-white/12 hover:bg-zinc-900/80 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{agent.avatar}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-base font-medium text-white">{agent.name}</h3>
              <p className="text-xs text-zinc-500">${agent.token}</p>
            </div>
          </div>
          <Badge className={agent.status === "Live" ? "text-emerald-300" : agent.status === "Bonding" ? "text-amber-300" : "text-sky-300"}>{agent.status}</Badge>
        </div>
        <p className="mt-4 text-sm leading-6 text-zinc-400">{agent.description}</p>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <Metric label="Market Cap" value={agent.marketCap} />
          <Metric label="Volume" value={agent.volume} />
          <Metric label="Trades" value={agent.trades.toLocaleString()} />
          <Metric label="Followers" value={agent.followers} />
        </div>
        <div className="mt-5 flex items-center justify-between text-xs text-zinc-500">
          <span>{agent.category}</span>
          <span className="inline-flex items-center gap-1 text-zinc-300">Open <ArrowRight className="h-3.5 w-3.5" /></span>
        </div>
      </Card>
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/6 bg-black p-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      <p className="mt-2 font-medium text-white">{value}</p>
    </div>
  );
}
