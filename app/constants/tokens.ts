export interface Token {
  symbol: string;
  address: string;
  decimals: number;
  logoURI?: string;
}

export interface TokenBalance {
  token: Token;
  balance: string;
  formattedBalance: string;
}

// Common ERC-20 tokens by network
export const COMMON_TOKENS: { [chainId: number]: Token[] } = {
  1: [
    // Ethereum
    {
      symbol: "USDC",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      decimals: 6,
    },
    {
      symbol: "USDT",
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      decimals: 6,
    },
    {
      symbol: "DAI",
      address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      decimals: 18,
    },
    {
      symbol: "WETH",
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      decimals: 18,
    },
  ],
  8453: [
    // Base
    {
      symbol: "USDC",
      address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      decimals: 6,
    },
    {
      symbol: "DAI",
      address: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
      decimals: 18,
    },
    {
      symbol: "WETH",
      address: "0x4200000000000000000000000000000000000006",
      decimals: 18,
    },
  ],
  10: [
    // Optimism
    {
      symbol: "USDC",
      address: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
      decimals: 6,
    },
    {
      symbol: "USDT",
      address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
      decimals: 6,
    },
    {
      symbol: "DAI",
      address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      decimals: 18,
    },
    {
      symbol: "WETH",
      address: "0x4200000000000000000000000000000000000006",
      decimals: 18,
    },
  ],
  42161: [
    // Arbitrum
    {
      symbol: "USDC",
      address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
      decimals: 6,
    },
    {
      symbol: "USDT",
      address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
      decimals: 6,
    },
    {
      symbol: "DAI",
      address: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
      decimals: 18,
    },
    {
      symbol: "WETH",
      address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
      decimals: 18,
    },
  ],
};
