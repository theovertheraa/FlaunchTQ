"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SiteShell } from "@/components/layout/site-shell";

const mockHoldings = [
  { name: "Forge Sys", ticker: "FOSYS", qty: 1_200_000, price: 0.000274, color: "#34d399" },
  { name: "Glint Base", ticker: "GLBAS", qty: 850_000, price: 0.000466, color: "#fb923c" },
  { name: "Proto Mind", ticker: "PRMIN", qty: 440_000, price: 0.0005, color: "#fb7185" },
];

function fmtUSD(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

export default function PortfolioPage() {
  const { ready, authenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) router.replace("/login");
  }, [ready, authenticated, router]);

  if (!ready || !authenticated) {
    return (
      <SiteShell>
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-32 animate-pulse rounded-xl bg-zinc-800" />
        </div>
      </SiteShell>
    );
  }

  const totalValue = mockHoldings.reduce((acc, h) => acc + h.qty * h.price, 0);

  return (
    <SiteShell>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ["Total Value", fmtUSD(totalValue + 10000)],
            ["USDT Balance", "$10,000"],
            ["Agents Held", mockHoldings.length.toString()],
            ["P&L (mock)", "+14.2%"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/8 bg-zinc-950 p-4">
              <p className="text-xs uppercase tracking-widest text-zinc-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Holdings table */}
        <div className="rounded-3xl border border-white/8 bg-zinc-950 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/6">
            <h2 className="text-sm font-semibold text-white">Holdings</h2>
          </div>
          <div className="divide-y divide-white/6">
            {mockHoldings.map((h) => {
              const value = h.qty * h.price;
              return (
                <div key={h.ticker} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold text-black"
                      style={{ background: h.color }}
                    >
                      {h.ticker.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{h.name}</p>
                      <p className="text-xs text-zinc-500">${h.ticker}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{fmtUSD(value)}</p>
                    <p className="text-xs text-zinc-500">{(h.qty / 1_000_000).toFixed(2)}M tokens</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
