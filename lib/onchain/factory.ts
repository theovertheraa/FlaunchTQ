// lib/onchain/factory.ts
// Read token data from FlaunchFactory on COTI Testnet using viem

import { createPublicClient, http, parseAbi } from "viem";

const COTI_TESTNET = {
  id: 7082400,
  name: "COTI Testnet",
  nativeCurrency: { name: "COTI", symbol: "COTI", decimals: 18 },
  rpcUrls: { default: { http: ["https://testnet.coti.io/rpc"] } },
} as const;

export const FACTORY_ADDR = "0x50a8904A42845fAe7Cdb31FA86eB080cA44EA635";

// JSON ABI required for tuple return type — parseAbi doesn't support inline tuple strings
export const FACTORY_ABI = [
  {
    name: "tokenCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getToken",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "idx", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "tokenAddress", type: "address" },
          { name: "curveAddress", type: "address" },
          { name: "creator",      type: "address" },
          { name: "name",         type: "string" },
          { name: "symbol",       type: "string" },
          { name: "imageUrl",     type: "string" },
          { name: "description",  type: "string" },
          { name: "createdAt",    type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "tokenToCurve",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

export const CURVE_ABI = parseAbi([
  "function currentPrice() view returns (uint256)",
  "function progress() view returns (uint256)",
  "function cotiCollected() view returns (uint256)",
  "function graduated() view returns (bool)",
  "function GRADUATION_THRESHOLD() view returns (uint256)",
]);

export function getClient() {
  return createPublicClient({
    chain: COTI_TESTNET,
    transport: http("https://testnet.coti.io/rpc"),
  });
}

export interface OnchainTokenInfo {
  tokenAddress: string;
  curveAddress: string;
  creator: string;
  name: string;
  symbol: string;
  imageUrl: string;
  description: string;
  createdAt: number;
  slug: string;
}

export async function getFactoryTokenCount(): Promise<number> {
  const client = getClient();
  const count = await client.readContract({
    address: FACTORY_ADDR as `0x${string}`,
    abi: FACTORY_ABI,
    functionName: "tokenCount",
  });
  return Number(count);
}

export async function getFactoryToken(idx: number): Promise<OnchainTokenInfo | null> {
  try {
    const client = getClient();
    const t = await client.readContract({
      address: FACTORY_ADDR as `0x${string}`,
      abi: FACTORY_ABI,
      functionName: "getToken",
      args: [BigInt(idx)],
    }) as { tokenAddress: string; curveAddress: string; creator: string; name: string; symbol: string; imageUrl: string; description: string; createdAt: bigint };

    const slug = t.symbol.toLowerCase() + "-" + t.tokenAddress.slice(2, 8).toLowerCase();
    return {
      tokenAddress: t.tokenAddress,
      curveAddress: t.curveAddress,
      creator:      t.creator,
      name:         t.name,
      symbol:       t.symbol,
      imageUrl:     t.imageUrl,
      description:  t.description,
      createdAt:    Number(t.createdAt),
      slug,
    };
  } catch {
    return null;
  }
}

export async function findTokenBySlug(slug: string): Promise<OnchainTokenInfo | null> {
  try {
    const count = await getFactoryTokenCount();
    // Search newest first (most likely match)
    for (let i = count - 1; i >= 0; i--) {
      const t = await getFactoryToken(i);
      if (t?.slug === slug) return t;
    }
  } catch {}
  return null;
}

export async function getCurveState(curveAddress: string) {
  try {
    const client = getClient();
    const [price, progress, collected, graduated, threshold] = await Promise.all([
      client.readContract({ address: curveAddress as `0x${string}`, abi: CURVE_ABI, functionName: "currentPrice" }),
      client.readContract({ address: curveAddress as `0x${string}`, abi: CURVE_ABI, functionName: "progress" }),
      client.readContract({ address: curveAddress as `0x${string}`, abi: CURVE_ABI, functionName: "cotiCollected" }),
      client.readContract({ address: curveAddress as `0x${string}`, abi: CURVE_ABI, functionName: "graduated" }),
      client.readContract({ address: curveAddress as `0x${string}`, abi: CURVE_ABI, functionName: "GRADUATION_THRESHOLD" }),
    ]);
    return {
      price:     Number(price as bigint) / 1e18,
      progress:  Number(progress as bigint),
      collected: Number(collected as bigint) / 1e18,
      threshold: Number(threshold as bigint) / 1e18,
      graduated: graduated as boolean,
    };
  } catch {
    return null;
  }
}
