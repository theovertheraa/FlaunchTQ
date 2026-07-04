"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { use } from "react";
import { getAgentBySlug, type AgentData } from "@/lib/mock/all-agents";
import type { OnchainTokenInfo } from "@/lib/onchain/factory";

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

// Convert onchain token info to AgentData shape for rendering
function onchainToAgent(t: OnchainTokenInfo): AgentData {
  return {
    slug:            t.slug,
    name:            t.name,
    ticker:          t.symbol,
    color:           "#34d399",
    seed:            Math.abs(parseInt(t.tokenAddress.slice(2, 10), 16)) % 9999,
    cat:             "On-Chain",
    status:          "bonding",
    init:            t.symbol.slice(0, 2).toUpperCase(),
    desc:            t.description || `${t.name} (${t.symbol}) — launched via FlaunchTQ bonding curve on COTI Testnet.`,
    supply:          100_000_000_000,
    launchMC:        1,
    mcap:            0,
    price:           1.25e-10,
    vol:             0,
    cap:             "—",
    volStr:          "—",
    change:          "+0.00%",
    isNew:           true,
    contractAddress: t.tokenAddress,
    curveAddress:    t.curveAddress,
  };
}

export default function AgentPage({ params }: Props) {
  const { slug } = use(params);
  const mockAgent = getAgentBySlug(slug);

  // State for on-chain lookup when mock not found
  const [agent, setAgent] = useState<AgentData | null>(mockAgent ?? null);
  const [loading, setLoading] = useState(!mockAgent);
  const [notFoundState, setNotFoundState] = useState(false);

  // If not in mock data, try on-chain lookup
  useEffect(() => {
    if (mockAgent) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/agents/onchain/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then((data: OnchainTokenInfo | null) => {
        if (cancelled) return;
        if (data) {
          setAgent(onchainToAgent(data));
          setLoading(false);
        } else {
          setNotFoundState(true);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) { setNotFoundState(true); setLoading(false); }
      });
    return () => { cancelled = true; };
  }, [slug, mockAgent]);

  useEffect(() => {
    if (!agent) return;

    const cfgScript = document.createElement("script");
    cfgScript.id = "agent-cfg";
    const existing = document.getElementById("agent-cfg");
    if (existing) existing.remove();
    cfgScript.textContent = `window.AGENT_CFG=${JSON.stringify({
      ticker:          agent.ticker,
      color:           agent.color,
      seed:            agent.seed,
      status:          agent.status,
      supply:          agent.supply,
      launchMC:        agent.launchMC,
      name:            agent.name,
      slug:            agent.slug,
      contractAddress: agent.contractAddress || null,
      curveAddress:    agent.curveAddress    || null,
    })};`;
    document.head.appendChild(cfgScript);

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
      ["agent-cfg"].forEach(id => document.getElementById(id)?.remove());
    };
  }, [agent]);

  // Loading state
  if (loading) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 32, height: 32, border: "2px solid #27272a", borderTopColor: "#34d399", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <div style={{ fontSize: 13, color: "#52525b" }}>Loading token…</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not found
  if (notFoundState || !agent) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: "0 24px", textAlign: "center" }}>
        <div style={{ fontSize: 40 }}>🔍</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: "#f5f5f5" }}>Token not found</div>
        <div style={{ fontSize: 14, color: "#52525b", maxWidth: 400 }}>
          This token doesn&apos;t exist in our registry or on-chain. It may have been launched with a different slug.
        </div>
        <Link href="/" className="btn primary" style={{ marginTop: 8, padding: "10px 24px", borderRadius: 12, textDecoration: "none" }}>
          ← Back to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="container" style={{ paddingTop: 24, paddingBottom: 80 }}>
        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <Link href="/" style={{ fontSize: 13, color: "#52525b", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
            ← Marketplace
          </Link>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
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
              {agent.contractAddress && (
                <a
                  href={`https://testnet.cotiscan.io/address/${agent.contractAddress}`}
                  target="_blank" rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: 11, color: "#52525b", textDecoration: "none", fontFamily: "monospace" }}
                >
                  {agent.contractAddress.slice(0, 10)}…{agent.contractAddress.slice(-6)} ↗
                </a>
              )}
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

        {/* Bonding curve graduation progress bar */}
        {agent.curveAddress && (
          <div style={{
            background: "#0b0b0c", border: "1px solid rgba(255,255,255,.07)",
            borderRadius: 16, padding: "14px 18px", marginBottom: 16
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: "#71717a", fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase" }}>
                🎓 Graduation Progress
              </div>
              <div style={{ fontSize: 12, color: "#a1a1aa" }}>
                <span id="curveCollected">0</span> / 50 COTI
              </div>
            </div>
            <div style={{ background: "#18181b", borderRadius: 99, height: 8, overflow: "hidden" }}>
              <div
                id="curveProgressBar"
                style={{
                  height: "100%", borderRadius: 99, transition: "width .6s ease",
                  background: `linear-gradient(90deg, ${agent.color}, ${agent.color}99)`,
                  width: "0%"
                }}
              />
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: "#52525b" }}>
              When 50 COTI collected → token graduates to Uniswap V2 · LP burned forever
            </div>
          </div>
        )}

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
