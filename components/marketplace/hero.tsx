import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
      <div className="rounded-3xl border border-white/8 bg-zinc-950 p-6 shadow-soft sm:p-8">
        <span className="mb-4 inline-block rounded-full border border-white/10 bg-black px-3 py-1 text-xs text-zinc-400">
          Curated intelligence, tokenized upside
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Discover premium AI agents built for modern markets.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400">
          FlaunchTQ is a matte-black marketplace for discovering, creating, and tracking
          the next generation of autonomous agents. Supply 100B · Launch MC $20K per token.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/create-agent"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-zinc-100 transition"
          >
            Create Agent
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/portfolio"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-black px-6 py-3 text-sm text-zinc-300 hover:bg-zinc-950 transition"
          >
            Open Portfolio
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="rounded-3xl border border-white/8 bg-zinc-950 p-6 flex flex-col justify-between">
        <p className="text-xs uppercase tracking-widest text-zinc-500">Marketplace Pulse</p>
        <div className="mt-6 grid gap-3">
          {[
            ["Agents", "100"],
            ["Daily Vol", "$48.9M"],
            ["Creators", "312"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/6 bg-black p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
