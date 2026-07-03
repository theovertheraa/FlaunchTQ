"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";

interface Holding {
  key: string;
  ticker: string;
  name: string;
  color: string;
  slug: string;
  qty: number;
  avgCost: number;
}

interface Trade {
  type: "buy" | "sell";
  ticker: string;
  usd: number;
  qty: number;
  price: number;
  ts: number;
}

function fmtUSD(n: number) {
  return "$" + parseFloat(String(n || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtNum(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toFixed(2);
}
function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return s + "s ago";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  return Math.floor(s / 3600) + "h ago";
}

export default function PortfolioPage() {
  const { ready, authenticated, login } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"holdings" | "onchain">("holdings");
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [usdt, setUsdt] = useState(10000);

  useEffect(() => {
    if (!ready) return;
    // Load from NovusWallet if available
    function loadWallet() {
      const w = (window as any).NovusWallet;
      if (!w) return;
      setUsdt(w.getUSDTO());
      const all = w.getAllHoldings() as Record<string, any>;
      const list: Holding[] = Object.entries(all).map(([key, h]: [string, any]) => ({
        key, ticker: h.ticker, name: h.name || h.ticker,
        color: h.color || "#6ee7b7", slug: h.slug || h.ticker.toLowerCase(),
        qty: h.qty, avgCost: h.avgCost,
      }));
      setHoldings(list);
      setTrades(w.getTrades() as Trade[]);
    }
    loadWallet();
  }, [ready]);

  const totalHoldingsVal = holdings.reduce((s, h) => s + h.qty * h.avgCost, 0);
  const totalVal = usdt + totalHoldingsVal;
  const pnl = totalVal - 10000;

  return (
    <>
      <Script src="/wallet.js" strategy="afterInteractive" onLoad={() => {
        const w = (window as any).NovusWallet;
        if (!w) return;
        setUsdt(w.getUSDTO());
        const all = w.getAllHoldings() as Record<string, any>;
        const list: Holding[] = Object.entries(all).map(([key, h]: [string, any]) => ({
          key, ticker: h.ticker, name: h.name || h.ticker,
          color: h.color || "#6ee7b7", slug: h.slug || h.ticker.toLowerCase(),
          qty: h.qty, avgCost: h.avgCost,
        }));
        setHoldings(list);
        setTrades(w.getTrades() as Trade[]);
      }} />
      <Script src="/auth.js" strategy="afterInteractive" />

      <div className="wrap">
        {/* Header */}
        <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 36, fontWeight: 660, letterSpacing: "-.04em", color: "#fff" }}>Portfolio</h1>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "#52525b" }}>Your agent holdings and on-chain positions.</p>
          </div>
        </div>

        {/* Not logged in */}
        {ready && !authenticated && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>💼</div>
            <h2 style={{ fontSize: 20, fontWeight: 660, margin: "0 0 8px", color: "#fff" }}>No portfolio yet</h2>
            <p style={{ color: "#52525b", margin: "0 0 24px" }}>Login to see your holdings and P&amp;L.</p>
            <button className="btn primary" onClick={login}>Login</button>
          </div>
        )}

        {/* Portfolio content */}
        {(!ready || authenticated) && (
          <>
            {/* Stats row */}
            <div style={{
              display: "flex", flexWrap: "wrap",
              border: "1px solid rgba(255,255,255,.07)", borderRadius: 20,
              overflow: "hidden", marginBottom: 24, background: "#0b0b0c",
            }}>
              {[
                { label: "Total Value", val: fmtUSD(totalVal) },
                { label: "P&L", val: fmtUSD(pnl), color: pnl >= 0 ? "#34d399" : "#f87171" },
                { label: "USDT Balance", val: fmtUSD(usdt) },
                { label: "Positions", val: String(holdings.length) },
              ].map(({ label, val, color }) => (
                <div key={label} className="port-stat" style={{ flex: 1, minWidth: 140, padding: "18px 22px", borderRight: "1px solid rgba(255,255,255,.06)" }}>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "#52525b", marginBottom: 6 }}>{label}</div>
                  <div style={{ fontSize: 22, fontWeight: 660, letterSpacing: "-.03em", color: color || "#f5f5f5" }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {(["holdings", "onchain"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: "8px 18px", borderRadius: 999, fontSize: 13, fontWeight: 500,
                    cursor: "pointer", border: "1px solid rgba(255,255,255,.08)",
                    background: tab === t ? "rgba(255,255,255,.08)" : "transparent",
                    color: tab === t ? "#f5f5f5" : "#52525b",
                  }}
                >
                  {t === "holdings" ? "Holdings" : "On-chain"}
                </button>
              ))}
            </div>

            {/* Holdings */}
            {tab === "holdings" && (
              <>
                <div className="agents" style={{ marginBottom: 28 }}>
                  {holdings.length === 0 ? (
                    <div style={{ padding: 40, textAlign: "center", color: "#3f3f46", fontSize: 14 }}>
                      No holdings yet — <Link href="/" style={{ color: "#52525b" }}>browse agents →</Link>
                    </div>
                  ) : holdings.map(h => (
                    <a key={h.key} className="agent" href={`/agents/${h.slug}`}>
                      <div className="avatar" style={{ background: `linear-gradient(135deg,${h.color}22,${h.color}11)`, borderColor: `${h.color}33`, color: h.color }}>
                        {h.ticker.slice(0, 2)}
                      </div>
                      <div className="agent-info">
                        <div>
                          <div className="agent-name">{h.name}</div>
                          <div className="agent-ticker">${h.ticker}</div>
                        </div>
                      </div>
                      <div className="agent-stats">
                        <div className="agent-stat">
                          <div className="agent-stat-label">Qty</div>
                          <div className="agent-stat-val">{fmtNum(h.qty)}</div>
                        </div>
                        <div className="agent-stat">
                          <div className="agent-stat-label">Value</div>
                          <div className="agent-stat-val">{fmtUSD(h.qty * h.avgCost)}</div>
                        </div>
                      </div>
                      <span className="agent-arrow">›</span>
                    </a>
                  ))}
                </div>

                {/* Trade history */}
                <div style={{ marginBottom: 10, fontSize: 13, fontWeight: 600, color: "#71717a", textTransform: "uppercase", letterSpacing: ".12em" }}>
                  Trade History
                </div>
                <div className="trade-feed" style={{ marginBottom: 80 }}>
                  <div style={{ overflowX: "auto" }}>
                    <table className="trade-table">
                      <thead>
                        <tr><th>Type</th><th>Token</th><th>Amount</th><th>USD</th><th>Time</th></tr>
                      </thead>
                      <tbody>
                        {trades.length === 0 ? (
                          <tr><td colSpan={5} style={{ textAlign: "center", color: "#3f3f46", padding: 24 }}>No trades yet</td></tr>
                        ) : trades.slice(0, 30).map((t, i) => (
                          <tr key={i}>
                            <td><span className={t.type === "buy" ? "buy-tag" : "sell-tag"}>{t.type === "buy" ? "Buy" : "Sell"}</span></td>
                            <td style={{ color: "#a1a1aa" }}>${t.ticker}</td>
                            <td>{fmtNum(t.qty)} {t.ticker}</td>
                            <td>{fmtUSD(t.usd)}</td>
                            <td style={{ color: "#52525b" }}>{timeAgo(t.ts)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* On-chain tab */}
            {tab === "onchain" && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#3f3f46", fontSize: 14 }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>⛓️</div>
                Connect wallet to view on-chain positions on COTI Testnet.
                <br />
                <Link href="/profile" style={{ color: "#52525b", marginTop: 16, display: "inline-block" }}>
                  Go to Profile →
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
