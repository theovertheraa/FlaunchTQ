"use client";

import { useEffect, useState, useCallback } from "react";
import Script from "next/script";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";

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

interface OnchainToken {
  name: string;
  symbol: string;
  tokenAddress: string;
  balance: number;
}

const COLORS = ["#6ee7b7","#93c5fd","#fcd34d","#f9a8d4","#a5b4fc","#6ee7f7","#86efac"];

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
  const { ready, authenticated, login, activeWallet } = useAuth();
  const [tab, setTab] = useState<"holdings" | "onchain">("holdings");
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [usdt, setUsdt] = useState(10000);

  // On-chain state
  const [onchainAddr, setOnchainAddr] = useState<string | null>(null);
  const [cotiBal, setCotiBal] = useState<string | null>(null);
  const [onchainTokens, setOnchainTokens] = useState<OnchainToken[] | null>(null);
  const [onchainLoading, setOnchainLoading] = useState(false);
  const [onchainError, setOnchainError] = useState<string | null>(null);

  // Load mock wallet holdings
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

  useEffect(() => {
    if (!ready) return;
    loadWallet();
  }, [ready]);

  // Resolve address: prefer Privy embedded wallet, fall back to MetaMask
  useEffect(() => {
    if (!ready || !authenticated) return;
    const privyAddr = activeWallet?.address ?? null;
    setOnchainAddr(privyAddr);
  }, [ready, authenticated, activeWallet]);

  // Load on-chain data when tab is switched to onchain and address is known
  const loadOnchain = useCallback(async (addr: string) => {
    setOnchainLoading(true);
    setOnchainError(null);
    setOnchainTokens(null);
    setCotiBal(null);
    try {
      const web3 = (window as any).FlaunchWeb3;
      if (!web3) throw new Error("web3.js not loaded yet");

      // COTI native balance
      const bal = await web3.getCotiBalance(addr);
      setCotiBal(parseFloat(bal).toFixed(4) + " COTI");

      // Factory tokens
      const { ethers } = (window as any);
      if (!ethers) throw new Error("ethers not loaded");

      const factoryAbi = [
        "function tokenCount() view returns (uint256)",
        "function tokens(uint256) view returns (address tokenAddress, string name, string symbol, uint256 totalSupply, address creator, string imageUrl, string description, uint256 createdAt)",
      ];
      const erc20Abi = ["function balanceOf(address) view returns (uint256)"];
      const provider = await web3.getReadProvider();
      const factory = new ethers.Contract(web3.FACTORY_ADDR, factoryAbi, provider);
      const count = Number(await factory.tokenCount());

      const rows: OnchainToken[] = [];
      for (let i = 0; i < count; i++) {
        try {
          const t = await factory.tokens(i);
          const erc = new ethers.Contract(t.tokenAddress, erc20Abi, provider);
          const raw = await erc.balanceOf(addr);
          const balance = Number(ethers.formatUnits(raw, 18));
          rows.push({ name: t.name, symbol: t.symbol, tokenAddress: t.tokenAddress, balance });
        } catch { /* skip bad token */ }
      }
      setOnchainTokens(rows);
    } catch (e: any) {
      setOnchainError(e.message?.slice(0, 100) ?? "Unknown error");
    } finally {
      setOnchainLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "onchain" && onchainAddr) {
      loadOnchain(onchainAddr);
    }
  }, [tab, onchainAddr, loadOnchain]);

  // Connect MetaMask inline (if no Privy wallet)
  async function connectMetaMask() {
    const eth = (window as any).ethereum;
    if (!eth) { alert("Install MetaMask to connect a wallet."); return; }
    try {
      const accounts = await eth.request({ method: "eth_requestAccounts" });
      const addr = accounts[0];
      try {
        await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x6C0360" }] });
      } catch (se: any) {
        if (se.code === 4902) {
          await eth.request({
            method: "wallet_addEthereumChain",
            params: [{ chainId: "0x6C0360", chainName: "COTI Testnet",
              nativeCurrency: { name: "COTI", symbol: "COTI", decimals: 18 },
              rpcUrls: ["https://testnet.coti.io/rpc"],
              blockExplorerUrls: ["https://testnet.cotiscan.io"] }],
          });
        }
      }
      setOnchainAddr(addr);
    } catch { alert("Wallet connection cancelled."); }
  }

  const totalHoldingsVal = holdings.reduce((s, h) => s + h.qty * h.avgCost, 0);
  const totalVal = usdt + totalHoldingsVal;
  const pnl = totalVal - 10000;

  return (
    <>
      <Script src="/wallet.js" strategy="afterInteractive" onLoad={loadWallet} />
      <Script src="/auth.js" strategy="afterInteractive" />
      <Script src="/web3.js" strategy="afterInteractive" />

      <div className="wrap">
        {/* Header */}
        <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 36, fontWeight: 660, letterSpacing: "-.04em", color: "#fff" }}>Portfolio</h1>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "#52525b" }}>Your agent holdings and on-chain positions.</p>
          </div>
          {/* On-chain address badge */}
          {onchainAddr && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, padding: "4px 12px", borderRadius: 999, background: "rgba(52,211,153,.08)", border: "1px solid rgba(52,211,153,.15)", color: "#34d399" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399" }} />
              COTI Testnet · {onchainAddr.slice(0, 6)}…{onchainAddr.slice(-4)}
              {cotiBal && <span style={{ color: "#6ee7b7", marginLeft: 4 }}>{cotiBal}</span>}
            </div>
          )}
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
                <div key={label} className="port-stat">
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

            {/* Holdings tab */}
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
              <div style={{ marginBottom: 80 }}>
                {/* No wallet at all */}
                {!onchainAddr && (
                  <div style={{ textAlign: "center", padding: "60px 0" }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>⛓️</div>
                    <div style={{ fontSize: 13, color: "#71717a", marginBottom: 16 }}>
                      Connect a wallet to view your on-chain COTI tokens.
                    </div>
                    <button
                      onClick={connectMetaMask}
                      style={{ background: "#18181b", border: "1px solid rgba(255,255,255,.15)", color: "#f5f5f5", padding: "10px 22px", borderRadius: 12, fontSize: 13, cursor: "pointer", fontWeight: 600 }}
                    >
                      🔗 Connect Wallet
                    </button>
                    <div style={{ marginTop: 12 }}>
                      <Link href="/profile" style={{ color: "#3f3f46", fontSize: 12 }}>
                        Or go to Profile to see linked wallets →
                      </Link>
                    </div>
                  </div>
                )}

                {/* Have address — show content */}
                {onchainAddr && (
                  <>
                    {onchainLoading && (
                      <div style={{ textAlign: "center", padding: "60px 0", color: "#52525b", fontSize: 14 }}>
                        Loading on-chain data…
                      </div>
                    )}
                    {onchainError && (
                      <div style={{ textAlign: "center", padding: "40px 0", color: "#f87171", fontSize: 13 }}>
                        Error loading on-chain data.<br />
                        <span style={{ fontSize: 11, color: "#52525b" }}>{onchainError}</span>
                      </div>
                    )}
                    {onchainTokens !== null && !onchainLoading && (() => {
                      const myTokens = onchainTokens.filter(t => t.balance > 0);
                      return myTokens.length === 0 ? (
                        <div>
                          <div style={{ textAlign: "center", padding: "40px 0", color: "#3f3f46", fontSize: 14 }}>
                            You hold no on-chain tokens yet.<br />
                            <Link href="/create-agent" style={{ color: "#52525b", fontSize: 13 }}>Launch a token →</Link>
                          </div>
                          {onchainTokens.length > 0 && (
                            <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,.05)" }}>
                              <div style={{ fontSize: 12, color: "#52525b", marginBottom: 12 }}>
                                {onchainTokens.length} token{onchainTokens.length !== 1 ? "s" : ""} deployed on COTI Testnet
                              </div>
                              {onchainTokens.map(t => (
                                <div key={t.tokenAddress} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                                  <div style={{ fontSize: 13, color: "#a1a1aa" }}>{t.name} <span style={{ color: "#3f3f46" }}>{t.symbol}</span></div>
                                  <a href={`https://testnet.cotiscan.io/address/${t.tokenAddress}`} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#52525b" }}>
                                    {t.tokenAddress.slice(0, 8)}… ↗
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          {myTokens.map(t => {
                            const color = COLORS[t.symbol.charCodeAt(0) % COLORS.length];
                            return (
                              <div key={t.tokenAddress} className="hold-row">
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <div className="token-dot" style={{ background: `${color}22`, color }}>{t.symbol.slice(0, 2)}</div>
                                  <div>
                                    <div style={{ fontSize: 14, fontWeight: 500, color: "#f5f5f5" }}>{t.name}</div>
                                    <div style={{ fontSize: 11, color: "#52525b" }}>
                                      {t.symbol} ·{" "}
                                      <a href={`https://testnet.cotiscan.io/address/${t.tokenAddress}`} target="_blank" rel="noreferrer" style={{ color: "#3f3f46" }}>
                                        {t.tokenAddress.slice(0, 8)}… ↗
                                      </a>
                                    </div>
                                  </div>
                                </div>
                                <div style={{ fontSize: 14, color: "#a1a1aa" }}>{fmtNum(t.balance)}</div>
                                <div style={{ fontSize: 12, color: "#52525b" }}>On-chain</div>
                                <div style={{ fontSize: 12, color: "#52525b" }}>—</div>
                                <div>
                                  <a href={`https://testnet.cotiscan.io/address/${t.tokenAddress}`} target="_blank" rel="noreferrer" className="btn" style={{ padding: "6px 14px", fontSize: 12, borderRadius: 10 }}>
                                    Explorer
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
