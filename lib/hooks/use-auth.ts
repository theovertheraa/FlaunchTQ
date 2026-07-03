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

  const displayName = useMemo(() => {
    if (!user) return null;
    if (user.google) return user.google.name ?? user.google.email;
    if (user.twitter) return `@${user.twitter.username}`;
    if (user.email) return user.email.address;
    if (activeWallet) {
      const addr = activeWallet.address;
      return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
    }
    return "Anon";
  }, [user, activeWallet]);

  const initials = useMemo(() => {
    if (!displayName) return "?";
    return displayName
      .replace("@", "")
      .split(" ")
      .map((s) => s[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
