"use client";

import { useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { use } from "react";
import { getAgentBySlug } from "@/lib/mock/all-agents";

interface Props {
  params: Promise<{ slug: string }>;
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-src="${src}"]`);
    if (existing) { existing.remove(); }
    const s = document.createElement("script");
    s.src = src;
    s.setAttribute("data-src", src);
    s.onload = () => resolve();
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

export default function AgentPage({ params }: Props) {
  const { slug } = use(params);
  const agent = getAgentBySlug(slug);
  if (!agent) notFound();

  useEffect(() => {
    // Inject AGENT_CFG
    const cfgScript = document.createElement("script");
    cfgScript.id = "agent-cfg";
    const existing = document.getElementById("agent-cfg");
    if (existing) existing.remove();
    cfgScript.textContent = `window.AGENT_CFG=${JSON.stringify({
      ticker:   agent.ticker,
      color:    agent.color,
      seed:     agent.seed,
      status:   agent.status,
      supply:   agent.supply,
      launchMC: agent.launchMC,
      name:     agent.name,
      slug:     agent.slug,
    })};`;
    document.head.appendChild(cfgScript);

    // Load scripts sequentially — order matters
    async function boot() {
      try {
        await loadScript("https://cdn.jsdelivr.net/npm/ethers@6.13.2/dist/ethers.umd.min.js");
        await loadScript("/web3.js");
        await loadScript("/token-engine.js");
        await loadScript("/wallet.js");
        await loadScript("/token-page.js");
        await loadScript("/auth.js");
      } catch (e) {
        console.error("Script load error:", e);
      }
    }
    boot();

    return () => {
      // Cleanup scripts on unmount
      ["/web3.js", "/token-engine.js", "/wallet.js", "/token-page.js", "/auth.js"].forEach(src => {
        const el = document.querySelector(`script[data-src="${src}"]`);
        if (el) el.remove();
      });
    };
  }, [slug]); // re-run when slug changes

  return (
    <>
      <div className="wrap">
        <a href="/" style={{ fontSize: 13, color: "#52525b", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 28 }}>
          ← Back
        </a>

        {/* Header */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 24, marginBottom: 28 }}>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            <div
              className="avatar"
              style={{
                width: 68, height: 68, borderRadius: 24, fontSize: 20, flexShrink: 0,
                background: `linear-gradient(135deg,${agent.color}22,${agent.color}11)`,
                borderColor: `${agent.color}33`, color: agent.color,
              }}
            >
              {agent.init}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontSize: 28, fontWeight: 660, letterSpacing: "-.04em", color: "#fff" }}>
                  {agent.name}
                </h1>
                <span
                  className={`badge ${agent.status === "live" ? "status-live" : agent.status === "bonding" ? "status-bonding" : "status-deploying"}`}
                  style={{ fontSize: 10 }}
                >
                  {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                </span>
              </div>
              <div style={{ marginTop: 5, fontSize: 13, color: "#52525b" }}>
                {agent.cat} · ${agent.ticker} · <span style={{ color: agent.color }}>
                  {agent.isNew ? "New Launch" : "Live"}
                </span>
              </div>
              <p style={{ margin: "8px 0 0", fontSize: 13, color: "#71717a", maxWidth: 520, lineHeight: 1.7 }}>
                {agent.desc}
              </p>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 0,
          border: "1px solid rgba(255,255,255,.07)", borderRadius: 20,
          overflow: "hidden", marginBottom: 20, background: "#0b0b0c",
        }}>
          {[
            { label: "Price", id: "livePrice", val: `$${agent.price.toExponential(2)}`, style: { fontSize: 13 } },
            { label: "Mkt Cap", id: "liveMC", val: agent.cap, style: {} },
            { label: "7D", id: "liveChange", val: agent.isNew ? "New" : agent.change, style: { color: "#52525b" } },
            { label: "Supply", id: "", val: "100B", style: {} },
            { label: "Time", id: "simTime", val: "0s", style: { color: "#71717a", borderRight: "none" } },
          ].map(({ label, id, val, style }, i, arr) => (
            <div
              key={label}
              className="stat-pill"
              style={{ flex: 1, minWidth: 80, borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,.07)" : "none" }}
            >
              <div className="metric-label">{label}</div>
              <div className="metric-val" id={id || undefined} style={{ fontSize: 16, marginTop: 5, ...style }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="chart-card" style={{ marginBottom: 16 }}>
          <div className="chart-header" style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#f5f5f5" }}>${agent.ticker} / USD</div>
              <span className="live-dot">Live</span>
            </div>
            <div className="tf-btns">
              <button className="tf-btn" data-tf="1m">1m</button>
              <button className="tf-btn" data-tf="5m">5m</button>
              <button className="tf-btn" data-tf="15m">15m</button>
              <button className="tf-btn" data-tf="1H">1H</button>
            </div>
          </div>
          <div className="chart-wrap" style={{ height: 340 }}>
            <canvas id="tokenCanvas" />
          </div>
        </div>

        {/* Trade feed */}
        <div className="trade-feed" style={{ marginBottom: 80 }}>
          <div className="trade-feed-header">
            <div className="trade-feed-title">Trade Activity</div>
            <span className="live-dot">Live</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="trade-table">
              <thead>
                <tr>
                  <th>Type</th><th>Price</th><th>Amount</th>
                  <th>USD</th><th>Wallet</th><th>Time</th>
                </tr>
              </thead>
              <tbody id="tradeFeedBody" />
            </table>
          </div>
        </div>
      </div>

      {/* Floating buy/sell bar */}
      <div className="trade-float-bar">
        <button id="floatBuyBtn" className="trade-float-buy">▲ Buy</button>
        <button id="floatSellBtn" className="trade-float-sell">▼ Sell</button>
      </div>

      {/* Bottom sheet overlay */}
      <div id="sheetOverlay" className="trade-sheet-overlay" />

      {/* Bottom sheet */}
      <div id="tradeSheet" className="trade-sheet">
        <div className="trade-sheet-handle" />
        <div className="trade-sheet-tabs">
          <div id="tabBuy" className="trade-tab buy active">Buy</div>
          <div id="tabSell" className="trade-tab sell">Sell</div>
        </div>
        <div className="trade-sheet-body">
          <div className="trade-wallet-row" id="sheetBalance">
            Balance: <span>10,000 COTI</span>
          </div>
          <div style={{ fontSize: 11, color: "#52525b", marginBottom: 10 }} id="sheetPnl">
            No position
          </div>
          <div style={{ fontSize: 11, color: "#71717a", marginBottom: 6 }} id="sheetLabel">
            Amount (COTI)
          </div>
          <div className="trade-pct-row">
            <button className="trade-pct" data-pct="25">25%</button>
            <button className="trade-pct" data-pct="50">50%</button>
            <button className="trade-pct" data-pct="75">75%</button>
            <button className="trade-pct" data-pct="100">Max</button>
          </div>
          <input id="sheetAmt" type="number" className="trade-input" placeholder="COTI to spend" min="0" />
          <div id="sheetEst" className="trade-est" />
          <button id="sheetExecBtn" className="trade-exec-btn buy">
            Buy {agent.ticker}
          </button>
        </div>
      </div>
    </>
  );
}
