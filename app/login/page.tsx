"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Script from "next/script";

export default function LoginPage() {
  const { ready, authenticated, login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (ready && authenticated) router.replace("/");
  }, [ready, authenticated, router]);

  async function handleLogin(method?: string) {
    setLoading(method ?? "privy");
    try {
      await login();
    } finally {
      setLoading(null);
    }
  }

  return (
    <>
      <Script src="/auth.js" strategy="afterInteractive" />
      <div className="login-wrap">
        <div className="login-card">
          <div className="login-logo">F</div>
          <h1 className="login-title">Welcome to FlaunchTQ</h1>
          <p className="login-sub">
            AI Agent Marketplace. Trade, create, and grow with autonomous agents.
          </p>

          {/* Google */}
          <button
            className="social-btn"
            disabled={!ready || loading !== null}
            onClick={() => handleLogin("google")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>{loading === "google" ? "Opening…" : "Continue with Google"}</span>
          </button>

          {/* X / Twitter */}
          <button
            className="social-btn"
            disabled={!ready || loading !== null}
            onClick={() => handleLogin("twitter")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#a1a1aa">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span>{loading === "twitter" ? "Opening…" : "Continue with X"}</span>
          </button>

          {/* Wallet */}
          <button
            className="social-btn"
            disabled={!ready || loading !== null}
            onClick={() => handleLogin("wallet")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="6" width="20" height="14" rx="3" stroke="#a1a1aa" strokeWidth="1.5"/>
              <path d="M16 13a1 1 0 1 0 2 0 1 1 0 0 0-2 0Z" fill="#a1a1aa"/>
              <path d="M2 10h20" stroke="#a1a1aa" strokeWidth="1.5"/>
            </svg>
            <span>{loading === "wallet" ? "Opening…" : "Connect Wallet"}</span>
          </button>

          <div className="login-divider">or email</div>

          {/* Email — triggers Privy modal which handles OTP */}
          <button
            className="social-btn"
            disabled={!ready || loading !== null}
            onClick={() => handleLogin("email")}
            style={{ marginBottom: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="4" width="20" height="16" rx="3" stroke="#a1a1aa" strokeWidth="1.5"/>
              <path d="m2 7 10 7 10-7" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>{loading === "email" ? "Opening…" : "Continue with Email"}</span>
          </button>

          {!ready && (
            <div className="toast-msg info" style={{ display: "block", marginTop: 16 }}>
              Loading…
            </div>
          )}

          <p className="login-terms">
            By continuing you agree to FlaunchTQ{" "}
            <a href="#">Terms</a> and <a href="#">Privacy Policy</a>
          </p>
        </div>
      </div>
    </>
  );
}
