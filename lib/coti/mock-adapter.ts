import type { CotiMarketplaceAdapter } from "@/lib/coti/types";
import { agents } from "@/lib/mock/agents";

export const mockCotiAdapter: CotiMarketplaceAdapter = {
  getNetwork() {
    return {
      chainId: 0,
      rpcUrl: "",
      explorerUrl: "",
    };
  },
  async getAgentAsset(slug) {
    const agent = agents.find((item) => item.slug === slug);

    if (!agent) {
      return null;
    }

    return {
      tokenSymbol: agent.token,
      treasuryAddress: "0x0000000000000000000000000000000000000000",
      marketCap: agent.marketCap,
      volume24h: agent.volume,
    };
  },
};
