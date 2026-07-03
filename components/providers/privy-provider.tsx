"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import type { Chain } from "viem";

// COTI Testnet chain (viem Chain-compatible)
const cotiTestnet: Chain = {
  id: 7082400,
  name: "COTI Testnet",
  nativeCurrency: { name: "COTI", symbol: "COTI", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet.coti.io/rpc"] },
  },
  blockExplorers: {
    default: { name: "CotiScan", url: "https://testnet.cotiscan.io" },
  },
  testnet: true,
};

const PRIVY_APP_ID =
  process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "cmqdk2v9000mv0dl45vty4gj9";

export function AppPrivyProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#ffffff",
          showWalletLoginFirst: false,
        },
        loginMethods: ["email", "google", "twitter", "wallet"],
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        defaultChain: cotiTestnet,
        supportedChains: [cotiTestnet],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
