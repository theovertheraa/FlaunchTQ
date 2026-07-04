// app/api/agents/onchain/[slug]/route.ts
// Fetch on-chain token info from FlaunchFactory by slug

import { NextResponse } from "next/server";
import { findTokenBySlug } from "@/lib/onchain/factory";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const token = await findTokenBySlug(slug);
    if (!token) {
      return NextResponse.json({ error: "Token not found" }, { status: 404 });
    }
    return NextResponse.json(token);
  } catch (err) {
    return NextResponse.json({ error: "Chain read failed" }, { status: 500 });
  }
}
