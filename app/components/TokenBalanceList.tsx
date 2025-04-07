"use client";

import { Network } from "../constants/networks";
import { TokenBalance } from "../constants/tokens";

interface TokenBalanceListProps {
  tokenBalances: TokenBalance[];
  network: Network;
  address: string;
}

export default function TokenBalanceList({
  tokenBalances,
  network,
  address,
}: TokenBalanceListProps) {
  if (!tokenBalances || tokenBalances.length === 0) {
    return (
      <div className="text-sm text-gray-500 mt-2">No ERC-20 tokens found</div>
    );
  }

  return (
    <div>
      <h4 className="text-sm font-medium text-gray-500 mb-2">ERC-20 Tokens</h4>
      <div className="space-y-2">
        {tokenBalances.map((tokenBalance) => (
          <div
            key={tokenBalance.token.address}
            className="p-3 border rounded-md hover:bg-gray-50"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{tokenBalance.token.symbol}</p>
                <a
                  href={`${network.explorer}/token/${tokenBalance.token.address}?a=${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline"
                >
                  View on explorer
                </a>
              </div>
              <div className="flex flex-col items-end">
                <p className="font-mono">
                  {parseFloat(tokenBalance.formattedBalance).toFixed(6)}{" "}
                  {tokenBalance.token.symbol}
                </p>
                <span className="text-xs text-green-600">Available</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
