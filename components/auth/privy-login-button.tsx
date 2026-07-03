"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrivyLoginButton() {
  const router = useRouter();

  return (
    <Button size="lg" onClick={() => router.push("/")}>
      Continue to marketplace
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
}
