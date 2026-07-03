"use client";

import { Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PrivyLoginButton } from "@/components/auth/privy-login-button";

export function AuthGate() {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  return (
    <Card className="mx-auto flex w-full max-w-md flex-col gap-6 p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <Badge>Private Beta</Badge>
        <Shield className="h-5 w-5 text-zinc-400" />
      </div>
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-white">FlaunchTQ</h1>
        <p className="text-sm leading-6 text-zinc-400">
          AI Agent Marketplace on COTI — discover, create, and trade autonomous agents.
        </p>
      </div>
      <div className="space-y-3 rounded-2xl border border-white/8 bg-black p-4 text-sm text-zinc-300">
        <p>Sign in with Email, X, or WalletConnect via Privy.</p>
        <p className="text-zinc-500">If `NEXT_PUBLIC_PRIVY_APP_ID` is not set, this foundation stays in preview mode.</p>
      </div>
      {appId ? <PrivyLoginButton /> : <Button size="lg" disabled>Add Privy App ID to enable login</Button>}
    </Card>
  );
}
