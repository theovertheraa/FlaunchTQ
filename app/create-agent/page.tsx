"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";

export default function CreateAgentPage() {
  const { ready, authenticated, login, activeWallet } = useAuth();
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // token-launch.js needs these IDs in the DOM — we let it handle the logic
  // We just provide the same HTML structure

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setAvatarSrc(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/ethers@6.13.2/dist/ethers.umd.min.js"
        strategy="afterInteractive"
      />
      <Script src="https://cdn.jsdelivr.net/npm/ethers@6.13.2/dist/ethers.umd.min.js" strategy="afterInteractive" />
      <Script src="/web3.js"           strategy="afterInteractive" />
      <Script src="/auth.js"           strategy="afterInteractive" />
      <Script src="/create-agent.js"   strategy="afterInteractive" />

      <div className="wrap">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".15em", color: "#52525b", marginBottom: 8 }}>
            Creator Console
          </div>
          <h1 style={{ margin: 0, fontSize: 36, fontWeight: 660, letterSpacing: "-.04em", color: "#fff" }}>Create Agent</h1>
          <p style={{ margin: "8px 0 0", fontSize: 14, color: "#52525b" }}>
            Deploy your AI agent token on COTI Testnet.
          </p>
        </div>

        {/* Not logged in */}
        {ready && !authenticated && (
          <div id="guestWrap" style={{ textAlign: "center", padding: "64px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
            <h2 style={{ fontSize: 20, fontWeight: 660, margin: "0 0 10px", color: "#fff" }}>
              Sign in to create an agent
            </h2>
            <p style={{ color: "#52525b", margin: "0 0 24px" }}>
              Sign in with Google, email, or connect a wallet to launch on-chain.
            </p>
            <button className="btn primary" onClick={login}>Sign In</button>
          </div>
        )}

        {/* Create form */}
        {(!ready || authenticated) && (
          <div id="createWrap" className="grid2" style={{ alignItems: "start" }}>
            {/* FORM */}
            <div style={{ background: "#0b0b0c", border: "1px solid rgba(255,255,255,.07)", borderRadius: 24, padding: 28 }}>

              {/* Avatar upload */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "#52525b", marginBottom: 8 }}>Agent Image</div>
                <input ref={fileRef} type="file" id="avatarFile" accept="image/*" style={{ display: "none" }} onChange={handleFileChange} />
                <div
                  id="avatarPreview"
                  onClick={() => fileRef.current?.click()}
                  style={{
                    width: "100%", height: 140, borderRadius: 18, background: "#0f0f10",
                    border: "2px dashed rgba(255,255,255,.1)", display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 8, cursor: "pointer",
                    overflow: "hidden", transition: "border-color .2s", position: "relative",
                  }}
                >
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", borderRadius: 16 }} />
                  ) : (
                    <div id="avatarPlaceholder" style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>🖼️</div>
                      <div style={{ fontSize: 13, color: "#52525b" }}>Tap to upload agent image</div>
                      <div style={{ fontSize: 11, color: "#3f3f46", marginTop: 2 }}>JPG, PNG, GIF — any size</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Name */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "#52525b", marginBottom: 8 }}>Agent Name</div>
                <input className="input" id="agentName" placeholder="e.g. Aether Ops" />
              </div>

              {/* Grid fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "#52525b", marginBottom: 8 }}>Ticker Symbol</div>
                  <input className="input" id="agentTicker" placeholder="e.g. AOPS" style={{ textTransform: "uppercase" }} />
                </div>
                <div>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "#52525b", marginBottom: 8 }}>Total Supply</div>
                  <input className="input" id="agentSupply" placeholder="100000000000" defaultValue="100000000000" type="number" />
                </div>
                <div>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "#52525b", marginBottom: 8 }}>Category</div>
                  <input className="input" id="agentCat" placeholder="Trading, Research, Social…" />
                </div>
                <div>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "#52525b", marginBottom: 8 }}>Website / URL</div>
                  <input className="input" id="agentUrl" placeholder="https://…" />
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "#52525b", marginBottom: 8 }}>Description</div>
                <textarea className="input" id="agentDesc" rows={3} placeholder="What does your agent do?" style={{ resize: "vertical" }} />
              </div>

              {/* Wallet info */}
              {activeWallet && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#0f0f10", border: "1px solid rgba(255,255,255,.06)", borderRadius: 14, marginBottom: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", flexShrink: 0 }} />
                  <div style={{ fontSize: 12, color: "#52525b" }}>
                    Wallet: <span style={{ color: "#a1a1aa", fontFamily: "monospace", fontSize: 11 }}>
                      {activeWallet.address.slice(0, 10)}…{activeWallet.address.slice(-6)}
                    </span>
                  </div>
                </div>
              )}

              {/* Chain info */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: "#0f0f10", border: "1px solid rgba(255,255,255,.06)", borderRadius: 14, marginBottom: 20 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399", flexShrink: 0 }} />
                <div style={{ fontSize: 12, color: "#52525b" }}>
                  Deploying to <span style={{ color: "#a1a1aa" }}>COTI Testnet</span> · Chain ID 7082400 · Gas: <span style={{ color: "#a1a1aa" }}>COTI</span>
                </div>
              </div>

              {/* Launch button */}
              <button
                className="btn primary"
                id="launchBtn"
                style={{ width: "100%", justifyContent: "center", padding: 14, fontSize: 15, fontWeight: 700, borderRadius: 14 }}
              >
                🚀 Launch Agent
              </button>

              {/* Step 2: Add Liquidity */}
              <div id="liquidityStep" style={{ display: "none", marginTop: 16, padding: 18, background: "#0a1a0e", border: "1px solid rgba(52,211,153,.2)", borderRadius: 16 }}>
                <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".12em", color: "#34d399", marginBottom: 10 }}>➕ Step 2 — Add Liquidity</div>
                <div style={{ fontSize: 12, color: "#52525b", marginBottom: 12 }}>
                  Token: <span id="liquidityTokenAddr" style={{ color: "#a1a1aa", fontFamily: "monospace", fontSize: 11 }} />
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                  <input className="input" id="liquidityCoti" type="number" placeholder="COTI amount (e.g. 0.5)" step={0.01} style={{ flex: 1 }} />
                  <span style={{ color: "#52525b", fontSize: 13, whiteSpace: "nowrap" }}>COTI</span>
                </div>
                <div style={{ fontSize: 12, color: "#52525b", marginBottom: 12 }}>
                  50% of token supply + your COTI → creates the trading pair
                </div>
                <button className="btn primary" id="liqBtn" style={{ width: "100%", justifyContent: "center", padding: 12, borderRadius: 12 }}>
                  ⊕ Add Liquidity
                </button>
              </div>

              <div id="launchToast" className="launch-toast" />
            </div>

            {/* SIDEBAR */}
            <div style={{ display: "grid", gap: 0, border: "1px solid rgba(255,255,255,.07)", borderRadius: 24, overflow: "hidden", background: "#0b0b0c" }}>
              {[
                { icon: "✦", title: "Real deployment", desc: "Token deployed on-chain via TokenFactory contract on COTI Testnet." },
                { icon: "◈", title: "AMM ready", desc: "UniswapV2 router live on COTI Testnet — buy/sell tokens after launch." },
                { icon: "⬆", title: "Supply: 100B", desc: "Default 100B supply, $20K launch MC. Editable before deploy." },
              ].map(({ icon, title, desc }, i, arr) => (
                <div key={title} style={{ padding: "20px 24px", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,.05)" : "none", display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 20, flexShrink: 0 }}>{icon}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#f5f5f5", marginBottom: 4 }}>{title}</div>
                    <div style={{ fontSize: 13, color: "#52525b", lineHeight: 1.6 }}>{desc}</div>
                  </div>
                </div>
              ))}

              {/* Wallet status */}
              <div style={{ padding: "20px 24px", borderTop: "1px solid rgba(255,255,255,.05)" }}>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".12em", color: "#52525b", marginBottom: 10 }}>
                  Wallet / Account
                </div>
                {activeWallet ? (
                  <div style={{ fontFamily: "monospace", fontSize: 12, color: "#a1a1aa", wordBreak: "break-all" }}>
                    {activeWallet.address}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: "#3f3f46" }}>
                    No wallet connected — <Link href="/profile" style={{ color: "#52525b" }}>connect →</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
