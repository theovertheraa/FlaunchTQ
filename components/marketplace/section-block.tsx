import type { AgentMarketItem } from "@/lib/mock/agents";
import { AgentCard } from "@/components/marketplace/agent-card";

export function SectionBlock({ title, subtitle, items }: { title: string; subtitle: string; items: AgentMarketItem[] }) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">{title}</h2>
          <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </section>
  );
}
