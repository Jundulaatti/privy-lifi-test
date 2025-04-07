"use client";

import { useEffect, useState } from "react";
import { NETWORKS } from "../constants/networks";
import { COMMON_TOKENS, TokenBalance } from "../constants/tokens";
import {
  fetchNativeBalance,
  fetchTokenBalances,
} from "../lib/blockchain/balances";
import NetworkTabs from "./NetworkTabs";
import NativeBalance from "./NativeBalance";
import TokenBalanceList from "./TokenBalanceList";

export default function WalletBalance({ address }: { address: string }) {
  const [nativeBalances, setNativeBalances] = useState<{
    [key: string]: string;
  }>({});
  const [tokenBalances, setTokenBalances] = useState<{
    [key: string]: TokenBalance[];
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("Ethereum");

  useEffect(() => {
    const fetchBalances = async () => {
      if (!address) return;

      setIsLoading(true);
      setError(null);

      const nativeResults: { [key: string]: string } = {};
      const tokenResults: { [key: string]: TokenBalance[] } = {};

      try {
        // Fetch balances for all networks in parallel
        await Promise.all(
          NETWORKS.map(async (network) => {
            try {
              // Fetch native balance
              nativeResults[network.name] = await fetchNativeBalance(
                address,
                network
              );

              // Fetch token balances for this network
              const tokensForChain = COMMON_TOKENS[network.chainId] || [];
              if (tokensForChain.length > 0) {
                tokenResults[network.name] = await fetchTokenBalances(
                  address,
                  network,
                  tokensForChain
                );
              } else {
                tokenResults[network.name] = [];
              }
            } catch (err) {
              console.error(
                `Error fetching balances for ${network.name}:`,
                err
              );
              nativeResults[network.name] = "0";
              tokenResults[network.name] = [];
            }
          })
        );

        setNativeBalances(nativeResults);
        setTokenBalances(tokenResults);
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

  // Find the active network
  const activeNetwork = NETWORKS.find((network) => network.name === activeTab);
  if (!activeNetwork) return null;

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium mb-3">Wallet Balances</h3>

      {/* Network tabs */}
      <NetworkTabs
        networks={NETWORKS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Active network content */}
      <div className="space-y-4">
        {/* Native balance for active network */}
        <NativeBalance
          network={activeNetwork}
          address={address}
          balance={nativeBalances[activeNetwork.name] || "0"}
        />

        {/* Token balances for active network */}
        <TokenBalanceList
          tokenBalances={tokenBalances[activeNetwork.name] || []}
          network={activeNetwork}
          address={address}
        />
      </div>
    </div>
  );
}
