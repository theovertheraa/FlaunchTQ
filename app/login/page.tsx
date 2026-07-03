"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Shield } from "lucide-react";

export default function LoginPage() {
  const { ready, authenticated, login } = useAuth();
  const router = useRouter();

  // Already logged in → go home
  useEffect(() => {
    if (ready && authenticated) router.replace("/");
  }, [ready, authenticated, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-white/8 bg-zinc-950 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-black text-sm font-semibold text-white">
              F
            </div>
            <div>
              <p className="text-sm font-semibold text-white">FlaunchTQ</p>
              <p className="text-xs text-zinc-500">AI Agent Marketplace</p>
            </div>
          </div>
          <Shield className="h-5 w-5 text-zinc-600" />
        </div>

        {/* Copy */}
        <div className="mb-8 space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Sign in to get started
          </h1>
          <p className="text-sm leading-6 text-zinc-400">
            Every login automatically provisions a self-custodial embedded wallet on COTI Testnet — no seed phrase needed.
          </p>
        </div>

        {/* Benefits */}
        <div className="mb-8 space-y-3 rounded-2xl border border-white/6 bg-black p-4 text-sm">
          {[
            ["🔑", "Embedded wallet created automatically"],
            ["📦", "Discover and trade 100+ AI agent tokens"],
            ["🚀", "Deploy your own agent on COTI Testnet"],
          ].map(([icon, text]) => (
            <div key={text} className="flex items-center gap-3 text-zinc-300">
              <span className="text-base">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        {!ready ? (
          <div className="h-12 animate-pulse rounded-2xl bg-zinc-800" />
        ) : (
          <button
            onClick={login}
            className="w-full rounded-2xl bg-white py-3 text-sm font-semibold text-black transition hover:bg-zinc-100"
          >
            Continue with Email, Google, or Wallet
          </button>
        )}

        <p className="mt-4 text-center text-xs text-zinc-600">
          Powered by Privy · COTI Testnet · Self-custodial
        </p>
      </div>
    </main>
  );
}
