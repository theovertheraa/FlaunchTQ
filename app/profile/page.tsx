"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SiteShell } from "@/components/layout/site-shell";
import { useWallets } from "@privy-io/react-auth";

export default function ProfilePage() {
  const { ready, authenticated, user, logout, displayName, initials, embeddedWallet, externalWallet, activeWallet } = useAuth();
  const { wallets } = useWallets();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) router.replace("/login");
  }, [ready, authenticated, router]);

  if (!ready || !authenticated || !user) {
    return (
      <SiteShell>
        <div className="flex h-40 items-center justify-center">
          <div className="h-6 w-32 animate-pulse rounded-xl bg-zinc-800" />
        </div>
      </SiteShell>
    );
  }

  const loginMethod = user.google
    ? "Google"
    : user.twitter
      ? "X / Twitter"
      : user.email
        ? "Email"
        : "Wallet";

  return (
    <SiteShell>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Avatar + name */}
        <div className="flex items-center gap-5 rounded-3xl border border-white/8 bg-zinc-950 p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-xl font-bold text-black">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-white truncate">{displayName}</h1>
            <p className="mt-1 text-sm text-zinc-500">Signed in via {loginMethod}</p>
          </div>
          <button
            onClick={logout}
            className="shrink-0 rounded-xl border border-white/8 bg-black px-4 py-2 text-xs text-zinc-400 hover:text-white transition"
          >
            Sign out
          </button>
        </div>

        {/* Wallets */}
        <div className="rounded-3xl border border-white/8 bg-zinc-950 p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Wallets</h2>

          {embeddedWallet && (
            <div className="rounded-2xl border border-white/6 bg-black p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs uppercase tracking-widest text-zinc-500">Embedded Wallet</span>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                  Auto-created · Privy
                </span>
              </div>
              <p className="mt-2 font-mono text-sm text-white break-all">{embeddedWallet.address}</p>
              <p className="mt-1 text-xs text-zinc-600">COTI Testnet · Self-custodial</p>
            </div>
          )}

          {externalWallet && (
            <div className="rounded-2xl border border-white/6 bg-black p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs uppercase tracking-widest text-zinc-500">External Wallet</span>
                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400 border border-blue-500/20">
                  {externalWallet.walletClientType}
                </span>
              </div>
              <p className="mt-2 font-mono text-sm text-white break-all">{externalWallet.address}</p>
            </div>
          )}

          {wallets.length === 0 && (
            <div className="rounded-2xl border border-white/6 bg-black p-4 text-sm text-zinc-500">
              No wallets linked yet. Try re-logging to trigger wallet creation.
            </div>
          )}
        </div>

        {/* Linked accounts */}
        <div className="rounded-3xl border border-white/8 bg-zinc-950 p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">Linked Accounts</h2>
          <div className="space-y-3">
            {user.linkedAccounts.map((account, i) => (
              <div key={i} className="flex items-center justify-between rounded-2xl border border-white/6 bg-black px-4 py-3">
                <span className="text-sm text-zinc-300 capitalize">{account.type.replace(/_/g, " ")}</span>
                <span className="text-xs text-zinc-600 font-mono truncate max-w-[200px]">
                  {"address" in account ? account.address : "verified" in account ? "verified" : "linked"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SiteShell>
  );
}
