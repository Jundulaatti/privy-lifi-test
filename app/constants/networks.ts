export interface Network {
  name: string;
  chainId: number;
  rpcUrl: string;
  currency: string;
  explorer: string;
}

export const NETWORKS: Network[] = [
  {
    name: "Ethereum",
    chainId: 1,
    rpcUrl: "https://eth.llamarpc.com",
    currency: "ETH",
    explorer: "https://etherscan.io",
  },
  {
    name: "Base",
    chainId: 8453,
    rpcUrl: "https://base.llamarpc.com",
    currency: "ETH",
    explorer: "https://basescan.org",
  },
  {
    name: "Optimism",
    chainId: 10,
    rpcUrl: "https://optimism.llamarpc.com",
    currency: "ETH",
    explorer: "https://optimistic.etherscan.io",
  },
  {
    name: "Arbitrum One",
    chainId: 42161,
    rpcUrl: "https://arbitrum.llamarpc.com",
    currency: "ETH",
    explorer: "https://arbiscan.io",
  },
];
