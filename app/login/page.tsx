"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { ready, authenticated, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && authenticated) router.replace("/");
  }, [ready, authenticated, router]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16 }}>
      <p style={{ color: "#71717a", fontSize: 15, margin: 0 }}>Login to continue</p>
      <button className="btn primary" onClick={login} disabled={!ready}>
        Login
      </button>
    </div>
  );
}
