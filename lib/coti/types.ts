export interface CotiNetworkConfig {
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
}

export interface CotiAgentAsset {
  tokenSymbol: string;
  treasuryAddress: string;
  marketCap?: string;
  volume24h?: string;
}

export interface CotiMarketplaceAdapter {
  getNetwork(): CotiNetworkConfig;
  getAgentAsset(slug: string): Promise<CotiAgentAsset | null>;
}
