"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

// COTI Testnet chain definition
const cotiTestnet = {
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
} as const;

export function AppPrivyProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;

  return (
    <PrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#ffffff",
          logo: undefined,
          landingHeader: "Sign in to FlaunchTQ",
          loginMessage: "AI Agent Marketplace on COTI",
          showWalletLoginFirst: false,
        },
        loginMethods: ["email", "google", "twitter", "wallet"],
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
          requireUserPasswordOnCreate: false,
        },
        defaultChain: cotiTestnet,
        supportedChains: [cotiTestnet],
        externalWallets: {
          coinbaseWallet: { connectionOptions: "smartWalletOnly" },
        },
      }}
      onSuccess={() => router.push("/")}
    >
      {children}
    </PrivyProvider>
  );
}
