"use client";

import { useState, useEffect } from "react";
import { formatEther } from "ethers";

interface Network {
  name: string;
  chainId: number;
  rpcUrl: string;
  currency: string;
  explorer: string;
}

const NETWORKS: Network[] = [
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

export default function WalletBalance({ address }: { address: string }) {
  const [balances, setBalances] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!address) return;

      setIsLoading(true);
      setError(null);

      const results: { [key: string]: string } = {};

      try {
        // Use Promise.all to fetch balances in parallel
        await Promise.all(
          NETWORKS.map(async (network) => {
            try {
              const response = await fetch(network.rpcUrl, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  jsonrpc: "2.0",
                  id: 1,
                  method: "eth_getBalance",
                  params: [address, "latest"],
                }),
              });

              const data = await response.json();
              if (data.result) {
                // Format the balance from wei to ether
                const balanceInEther = formatEther(data.result);
                results[network.name] = balanceInEther;
              } else {
                results[network.name] = "Error";
              }
            } catch (err) {
              console.error(`Error fetching balance for ${network.name}:`, err);
              results[network.name] = "Error";
            }
          })
        );

        setBalances(results);
      } catch (err) {
        console.error("Failed to fetch balances:", err);
        setError("Failed to fetch balances. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalances();
  }, [address]);

  if (isLoading) {
    return (
      <div className="p-4 border rounded-lg animate-pulse bg-gray-50">
        <h3 className="text-lg font-medium mb-3">Loading balances...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border rounded-lg bg-red-50 text-red-700">
        <h3 className="text-lg font-medium mb-1">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-medium mb-3">Wallet Balances</h3>
      <div className="space-y-2">
        {NETWORKS.map((network) => (
          <div
            key={network.chainId}
            className="flex justify-between items-center p-3 border rounded-md hover:bg-gray-50"
          >
            <div>
              <p className="font-medium">{network.name}</p>
              <a
                href={`${network.explorer}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                View on explorer
              </a>
            </div>
            <div className="flex flex-col items-end">
              <p className="font-mono">
                {balances[network.name]
                  ? parseFloat(balances[network.name]).toFixed(6)
                  : "0.000000"}{" "}
                {network.currency}
              </p>
              {parseFloat(balances[network.name] || "0") > 0 && (
                <span className="text-xs text-green-600">Available</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
