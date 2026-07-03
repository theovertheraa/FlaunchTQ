"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import { useWallets } from "@privy-io/react-auth";

function fmtNum(n: number) {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toFixed(2);
}

export default function ProfilePage() {
  const { ready, authenticated, login, user, logout, displayName, initials, embeddedWallet, externalWallet } = useAuth();
  const { wallets } = useWallets();
  const [tradeCount, setTradeCount] = useState(0);
  const [coti, setCoti] = useState(10000);
  const [holdingCount, setHoldingCount] = useState(0);

  const loginType = user?.google ? "Google" : user?.twitter ? "X / Twitter" : user?.email ? "Email" : "Wallet";

  return (
    <>
      <Script src="/wallet.js" strategy="afterInteractive" onLoad={() => {
        const w = (window as any).NovusWallet;
        if (!w) return;
        setCoti(w.getCOTI() ?? w.getUSDTO());
        setTradeCount(w.getTrades().length);
        setHoldingCount(Object.keys(w.getAllHoldings()).length);
      }} />
      <Script src="/auth.js" strategy="afterInteractive" />

      {/* Not logged in */}
      {ready && !authenticated && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
          <p style={{ color: "#71717a", fontSize: 15, margin: 0 }}>Login to continue</p>
          <button className="btn primary" onClick={login}>Login</button>
        </div>
      )}

      {(!ready || (ready && authenticated && user)) && (
        <div id="pageWrap" className="wrap">

          {/* PROFILE HEADER */}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: 24, marginBottom: 32 }}>
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
              <div
                className="avatar"
                style={{ width: 72, height: 72, borderRadius: 26, fontSize: 22, flexShrink: 0, background: "#6ee7b7", color: "#000" }}
              >
                {initials}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <h1 style={{ margin: 0, fontSize: 32, fontWeight: 660, letterSpacing: "-.04em", color: "#fff" }}>
                    {displayName}
                  </h1>
                  <span className="badge">Trader</span>
                </div>
                <div style={{ marginTop: 6, fontSize: 13, color: "#52525b" }}>
                  via {loginType}
                </div>

                {/* Embedded wallet row */}
                {embeddedWallet && (
                  <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 3 }}>
                    <div style={{ fontSize: 11, color: "#3f3f46", textTransform: "uppercase", letterSpacing: ".1em" }}>Embedded Wallet</div>
                    <div style={{ fontFamily: "monospace", fontSize: 12, color: "#a1a1aa", wordBreak: "break-all", maxWidth: 360 }}>
                      {embeddedWallet.address}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <button
                    className="btn"
                    onClick={logout}
                    style={{ fontSize: 13, padding: "8px 16px", color: "#f87171", borderColor: "rgba(248,113,113,.2)" }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* STATS ROW */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 0,
            border: "1px solid rgba(255,255,255,.07)", borderRadius: 20,
            overflow: "hidden", marginBottom: 28, background: "#0b0b0c",
          }}>
            <div className="stat-pill">
              <div className="metric-label">Positions</div>
              <div className="metric-val">{holdingCount}</div>
            </div>
            <div className="stat-pill">
              <div className="metric-label">COTI Balance</div>
              <div className="metric-val">{coti.toLocaleString(undefined, { maximumFractionDigits: 2 })} COTI</div>
            </div>
            <div className="stat-pill">
              <div className="metric-label">Total Trades</div>
              <div className="metric-val">{tradeCount}</div>
            </div>
            <div className="stat-pill" style={{ borderRight: "none" }}>
              <div className="metric-label">Login Type</div>
              <div className="metric-val">{loginType}</div>
            </div>
          </div>

          {/* WALLETS */}
          <div style={{ marginBottom: 10, fontSize: 13, fontWeight: 600, color: "#71717a", textTransform: "uppercase", letterSpacing: ".12em" }}>
            Wallets
          </div>
          <div className="agents" style={{ marginBottom: 28 }}>
            {embeddedWallet && (
              <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em", color: "#52525b" }}>Embedded Wallet</span>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "rgba(52,211,153,.1)", border: "1px solid rgba(52,211,153,.2)", color: "#34d399" }}>
                    Auto-created · Privy
                  </span>
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 13, color: "#f5f5f5", wordBreak: "break-all" }}>
                  {embeddedWallet.address}
                </div>
                <div style={{ marginTop: 4, fontSize: 11, color: "#3f3f46" }}>COTI Testnet · Self-custodial</div>
              </div>
            )}
            {externalWallet && (
              <div style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".1em", color: "#52525b" }}>External Wallet</span>
                  <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 999, background: "rgba(147,197,253,.1)", border: "1px solid rgba(147,197,253,.2)", color: "#93c5fd" }}>
                    {externalWallet.walletClientType}
                  </span>
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 13, color: "#f5f5f5", wordBreak: "break-all" }}>
                  {externalWallet.address}
                </div>
              </div>
            )}
            {wallets.length === 0 && (
              <div style={{ padding: 32, textAlign: "center", color: "#3f3f46", fontSize: 14 }}>
                No wallets linked — login creates one automatically
              </div>
            )}
          </div>

          {/* LINKED ACCOUNTS */}
          <div style={{ marginBottom: 10, fontSize: 13, fontWeight: 600, color: "#71717a", textTransform: "uppercase", letterSpacing: ".12em" }}>
            Linked Accounts
          </div>
          <div className="agents" style={{ marginBottom: 28 }}>
            {user?.linkedAccounts.map((account, i) => {
              const label =
                "address" in account && typeof account.address === "string"
                  ? account.address
                  : "email" in account && typeof account.email === "string"
                    ? account.email
                    : "verified";
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                  <span style={{ fontSize: 14, color: "#d4d4d8", textTransform: "capitalize" }}>
                    {account.type.replace(/_/g, " ")}
                  </span>
                  <span style={{ fontSize: 12, color: "#52525b", fontFamily: "monospace", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* DEPLOYED TOKENS */}
          <div style={{ marginBottom: 10, fontSize: 13, fontWeight: 600, color: "#71717a", textTransform: "uppercase", letterSpacing: ".12em" }}>
            My Deployed Tokens
          </div>
          <div className="agents" style={{ marginBottom: 80 }}>
            <div style={{ padding: 32, textAlign: "center", color: "#3f3f46", fontSize: 14 }}>
              No deployed tokens yet — <Link href="/create-agent" style={{ color: "#52525b" }}>launch one →</Link>
            </div>
          </div>

        </div>
      )}
    </>
  );
}
