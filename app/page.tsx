"use client";

import { useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { ALL_AGENTS, filterAgents } from "@/lib/mock/all-agents";

function fmtPrice(p: number): string {
  if (!p || p === 0) return "—";
  if (p < 0.000001) return "$" + p.toExponential(2);
  if (p < 0.0001)   return "$" + p.toFixed(8);
  if (p < 0.01)     return "$" + p.toFixed(6);
  if (p < 1)        return "$" + p.toFixed(4);
  if (p < 1000)     return "$" + p.toFixed(2);
  return "$" + (p / 1000).toFixed(1) + "K";
}

function statusCls(s: string) {
  return s === "live" ? "status-live" : s === "bonding" ? "status-bonding" : "status-deploying";
}

const CATS = ["All", "Trending", "New", "Volume"] as const;
const TITLE_MAP: Record<string, string> = {
  All: "All Agents", Trending: "Trending", New: "New Launches", Volume: "High Volume",
};
const SUB_MAP: Record<string, string> = {
  All: " · Supply 100B · Launch MC $20K each",
  Trending: " · >5% gain",
  New: " · Recently launched",
  Volume: " · Sorted by 24h volume",
};

export default function HomePage() {
  const [activeCat, setActiveCat] = useState<string>("All");
  const [searchQ, setSearchQ] = useState("");

  const filtered = filterAgents(ALL_AGENTS, activeCat, searchQ);

  return (
    <>
      <Script src="/auth.js" strategy="afterInteractive" />

      <div className="wrap">
        {/* HERO */}
        <section className="hero" style={{ marginBottom: 8 }}>
          <div style={{ padding: "24px 0" }}>
            <span className="badge">Curated intelligence, tokenized upside</span>
            <h1 className="title">Discover premium AI agents built for modern markets.</h1>
            <p className="muted" style={{ maxWidth: 520 }}>
              FlaunchTQ is a matte-black marketplace for discovering, creating, and tracking the
              next generation of autonomous agents. Supply 100B · Launch MC $20K per token.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
              <Link className="btn primary" href="/create-agent">Create Agent</Link>
              <Link className="btn" href="/portfolio">Open Portfolio</Link>
            </div>
          </div>

          <div style={{
            display: "flex", flexWrap: "wrap", gap: 0,
            border: "1px solid rgba(255,255,255,.07)", borderRadius: 20,
            overflow: "hidden", background: "#0b0b0c", alignSelf: "center",
          }}>
            <div className="stat-pill" style={{ flex: 1, minWidth: 100 }}>
              <div className="metric-label">Agents</div>
              <div className="metric-val">100</div>
            </div>
            <div className="stat-pill" style={{ flex: 1, minWidth: 100 }}>
              <div className="metric-label">Daily Vol</div>
              <div className="metric-val">$48.9M</div>
            </div>
            <div className="stat-pill" style={{ flex: 1, minWidth: 100, borderRight: "none" }}>
              <div className="metric-label">Creators</div>
              <div className="metric-val">312</div>
            </div>
          </div>
        </section>

        {/* SEARCH + FILTER */}
        <section className="section">
          <div className="search-wrap">
            <input
              className="search"
              placeholder="Search agents, tickers, categories…"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
            />
            <div className="cats">
              {CATS.map(cat => (
                <span
                  key={cat}
                  className={"cat" + (activeCat === cat ? " active" : "")}
                  onClick={() => setActiveCat(cat)}
                >
                  {cat === "Volume" ? "High Volume" : cat}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* AGENT LIST */}
        <section className="section">
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "baseline",
            flexWrap: "wrap", gap: 8, marginBottom: 16,
          }}>
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 660 }}>
                {TITLE_MAP[activeCat] ?? "All Agents"}
              </h2>
              <p style={{ margin: 0, fontSize: 13, color: "#52525b" }}>
                {filtered.length} agents{SUB_MAP[activeCat] ?? ""}
              </p>
            </div>
            <div style={{ fontSize: 12, color: "#3f3f46" }}>
              Showing {filtered.length}
            </div>
          </div>

          <div className="agents">
            {filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#3f3f46", fontSize: 13 }}>
                No agents found
              </div>
            ) : filtered.map(a => {
              const isNew  = a.isNew || a.status === "bonding" || a.status === "deploying";
              const up     = !a.change.startsWith("-");
              const chgCol = isNew ? "#fcd34d" : up ? a.color : "#f87171";
              const chgTxt = isNew ? "New" : a.change;
              const capTxt = isNew ? "$20K" : a.cap;
              return (
                <a key={a.slug} className="agent" href={`/agents/${a.slug}`}>
                  <div className="avatar" style={{
                    background: `linear-gradient(135deg,${a.color}22,${a.color}11)`,
                    borderColor: `${a.color}33`, color: a.color,
                  }}>
                    {a.init}
                  </div>
                  <div className="agent-info">
                    <div>
                      <div className="agent-name">{a.name}</div>
                      <div className="agent-ticker">${a.ticker} · {a.cat}</div>
                    </div>
                    <span className={`badge ${statusCls(a.status)}`} style={{ fontSize: 10, padding: "3px 9px" }}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </span>
                  </div>
                  <div className="agent-stats">
                    <div className="agent-stat hide-mobile">
                      <div className="agent-stat-label">Price</div>
                      <div className="agent-stat-val" style={{ fontSize: 12 }}>{fmtPrice(a.price)}</div>
                    </div>
                    <div className="agent-stat hide-mobile">
                      <div className="agent-stat-label">Mkt Cap</div>
                      <div className="agent-stat-val">{capTxt}</div>
                    </div>
                    <div className="agent-stat">
                      <div className="agent-stat-label">7D</div>
                      <div className="agent-stat-val" style={{ color: chgCol }}>{chgTxt}</div>
                    </div>
                  </div>
                  <span className="agent-arrow">›</span>
                </a>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
