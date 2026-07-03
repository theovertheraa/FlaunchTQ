"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SiteShell } from "@/components/layout/site-shell";
import { Sparkles, Upload, Wallet } from "lucide-react";

export default function CreateAgentPage() {
  const { ready, authenticated, activeWallet } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");

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

  return (
    <SiteShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_0.38fr]">
        {/* Form */}
        <div className="rounded-3xl border border-white/8 bg-zinc-950 p-5 sm:p-6">
          <div className="mb-6 space-y-2">
            <p className="text-xs uppercase tracking-widest text-zinc-500">Creator Console</p>
            <h1 className="text-3xl font-semibold text-white">Create Agent</h1>
            <p className="max-w-2xl text-sm leading-6 text-zinc-400">
              Launch your AI agent token on COTI Testnet. Supply 100B · Launch MC $20K.
            </p>
          </div>

          {/* Wallet status */}
          <div className="mb-6 rounded-2xl border border-white/6 bg-black p-4">
            <p className="text-xs uppercase tracking-widest text-zinc-500 mb-2">Active Wallet</p>
            {activeWallet ? (
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="font-mono text-sm text-white">
                  {activeWallet.address.slice(0, 8)}…{activeWallet.address.slice(-6)}
                </span>
                <span className="ml-2 text-xs text-zinc-500 capitalize">
                  {activeWallet.walletClientType === "privy" ? "Embedded" : activeWallet.walletClientType}
                </span>
              </div>
            ) : (
              <p className="text-sm text-zinc-500">No wallet connected yet.</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Agent name"
              className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20"
            />
            <input
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="Ticker (e.g. FORGE)"
              maxLength={10}
              className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20"
            />
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Category (Trading, DeFi…)"
              className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20"
            />
            <input
              placeholder="Launch URL (optional)"
              className="w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20"
            />
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Agent description…"
              rows={3}
              className="col-span-full w-full rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-white/20 resize-none"
            />
          </div>

          <div className="mt-4 rounded-3xl border border-dashed border-white/10 bg-black p-8 text-center text-sm text-zinc-500">
            <Upload className="mx-auto mb-2 h-5 w-5 text-zinc-600" />
            Upload avatar, teaser media, and docs here.
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              disabled={!activeWallet || !name || !ticker}
              className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black disabled:opacity-40 hover:bg-zinc-100 transition"
            >
              Deploy to COTI Testnet
            </button>
            <button className="rounded-2xl border border-white/10 bg-black px-6 py-3 text-sm text-zinc-400 hover:text-white transition">
              Save Draft
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="grid gap-4 content-start">
          {([
            { icon: Sparkles, title: "Automated launch", text: "Token deployed to COTI Testnet with UniswapV2 liquidity in 2 steps." },
            { icon: Wallet, title: "Embedded wallet ready", text: "Your Privy wallet handles signing — no MetaMask required." },
            { icon: Upload, title: "Media pipeline", text: "Avatar and listing media support coming soon." },
          ] as const).map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-white/8 bg-zinc-950 p-5">
              <Icon className="h-5 w-5 text-zinc-400" />
              <h2 className="mt-4 text-base font-medium text-white">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-500">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
