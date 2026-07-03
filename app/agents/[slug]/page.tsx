import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteShell } from "@/components/layout/site-shell";
import { getAgentBySlug } from "@/lib/mock/agents";

export default async function AgentProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agent = getAgentBySlug(slug);

  if (!agent) notFound();

  const statusColor =
    agent.status === "Live"
      ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/8"
      : agent.status === "Bonding"
        ? "text-amber-400 border-amber-500/20 bg-amber-500/8"
        : "text-sky-400 border-sky-500/20 bg-sky-500/8";

  return (
    <SiteShell>
      <div className="space-y-6">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to marketplace
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Agent info */}
          <div className="rounded-3xl border border-white/8 bg-zinc-950 p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-white/10 bg-black text-xl font-bold text-white">
                  {agent.avatar}
                </div>
                <div>
                  <h1 className="text-3xl font-semibold text-white">{agent.name}</h1>
                  <p className="mt-1 text-sm text-zinc-500">
                    {agent.category} · ${agent.token}
                  </p>
                </div>
              </div>
              <span
                className={`inline-flex items-center self-start rounded-full border px-3 py-1 text-xs font-medium ${statusColor}`}
              >
                {agent.status}
              </span>
            </div>

            <p className="mt-6 max-w-2xl text-sm leading-7 text-zinc-400">
              {agent.description}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                ["Market Cap", agent.marketCap],
                ["24h Volume", agent.volume],
                ["Total Trades", agent.trades.toLocaleString()],
                ["Followers", agent.followers],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/6 bg-black p-4"
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    {label}
                  </p>
                  <p className="mt-2 text-base font-medium text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Trade panel placeholder */}
          <div className="rounded-3xl border border-white/8 bg-zinc-950 p-6 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                Token Price
              </p>
              <p className="mt-2 text-4xl font-semibold text-white">$0.000274</p>
              <p className="mt-1 text-xs text-emerald-400">+8.42% (7D)</p>
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                Quick Trade
              </p>
              <div className="flex gap-2">
                <button className="flex-1 rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-black hover:bg-emerald-400 transition">
                  Buy
                </button>
                <button className="flex-1 rounded-2xl border border-white/10 bg-black py-3 text-sm text-zinc-300 hover:bg-zinc-900 transition">
                  Sell
                </button>
              </div>
              <p className="text-xs text-zinc-600 text-center">
                Connect wallet to trade on COTI Testnet
              </p>
            </div>

            <div className="rounded-2xl border border-white/6 bg-black p-4 space-y-2">
              <p className="text-xs uppercase tracking-widest text-zinc-500">
                Token Info
              </p>
              {[
                ["Supply", "100,000,000,000"],
                ["Launch MC", "$20,000"],
                ["Network", "COTI Testnet"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-zinc-500">{label}</span>
                  <span className="text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
