import type { Metadata } from "next";
import "./globals.css";
import { AppPrivyProvider } from "@/components/providers/privy-provider";
import { Nav } from "@/components/layout/nav";
import { DocsSearch } from "@/components/docs/docs-search";

export const metadata: Metadata = {
  title: "FlaunchTQ — AI Agent Marketplace",
  description: "Discover, create, and trade AI agents on COTI. Matte-black marketplace for the next generation of autonomous agents.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppPrivyProvider>
          <Nav />
          {children}
          <DocsSearch />
        </AppPrivyProvider>
      </body>
    </html>
  );
}
