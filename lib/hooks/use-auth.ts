"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useMemo } from "react";

export function useAuth() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { wallets } = useWallets();

  const embeddedWallet = useMemo(
    () => wallets.find((w) => w.walletClientType === "privy"),
    [wallets],
  );

  const externalWallet = useMemo(
    () => wallets.find((w) => w.walletClientType !== "privy"),
    [wallets],
  );

  // Prefer external (MetaMask) wallet, fall back to Privy embedded
  const activeWallet = externalWallet ?? embeddedWallet;

  const displayName = useMemo((): string => {
    if (!user) return "Anon";
    const google = user.google;
    if (google) return (google.name ?? google.email) || "Google User";
    const twitter = user.twitter;
    if (twitter) return `@${twitter.username ?? "user"}`;
    const email = user.email;
    if (email) return email.address;
    if (activeWallet) {
      const addr = activeWallet.address;
      return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
    }
    return "Anon";
  }, [user, activeWallet]);

  const initials = useMemo((): string => {
    return displayName
      .replace("@", "")
      .split(" ")
      .map((s) => s[0] ?? "")
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";
  }, [displayName]);

  return {
    ready,
    authenticated,
    user,
    login,
    logout,
    embeddedWallet,
    externalWallet,
    activeWallet,
    displayName,
    initials,
  };
}
