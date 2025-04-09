"use client";

import { useMemo } from "react";
import { Network } from "../constants/networks";
import { calculateUsdValue, formatUsdValue } from "../lib/prices/tokenPrices";

interface NetworkSummary {
  network: Network;
  nativeBalance: string;
  usdValue: number;
}

interface NetworkSelectorProps {
  networks: Network[];
  balances: { [networkName: string]: string };
  tokenPrices: Record<string, number>;
  selectedNetwork: string | null;
  onSelectNetwork: (networkName: string | null) => void;
}

export default function NetworkSelector({
  networks,
  balances,
  tokenPrices,
  selectedNetwork,
  onSelectNetwork,
}: NetworkSelectorProps) {
  const networkSummaries = useMemo((): NetworkSummary[] => {
    return networks.map((network) => {
      const nativeBalance = balances[network.name] || "0";
      const usdValue = calculateUsdValue(
        nativeBalance,
        network.currency,
        tokenPrices
      );

      return {
        network,
        nativeBalance,
        usdValue,
      };
    });
  }, [networks, balances, tokenPrices]);

  // Calculate total USD value across all networks
  const totalUsdValue = useMemo(() => {
    return networkSummaries.reduce((sum, item) => sum + item.usdValue, 0);
  }, [networkSummaries]);

  // Get network icon based on name
  const getNetworkIcon = (networkName: string) => {
    switch (networkName) {
      case "Ethereum":
        return (
          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">Ξ</span>
          </div>
        );
      case "Base":
        return (
          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">B</span>
          </div>
        );
      case "Polygon":
        return (
          <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">P</span>
          </div>
        );
      case "Optimism":
        return (
          <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">OP</span>
          </div>
        );
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center">
            <span className="text-white text-xs font-bold">?</span>
          </div>
        );
    }
  };

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex space-x-2 min-w-max">
        {/* All Networks Button */}
        <button
          onClick={() => onSelectNetwork(null)}
          className={`relative px-4 py-3 rounded-lg transition-all ${
            selectedNetwork === null
              ? "bg-blue-900 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700"
          }`}
        >
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white text-xs">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-3 h-3"
                >
                  <path d="M21 6.375c0 2.692-4.03 4.875-9 4.875S3 9.067 3 6.375 7.03 1.5 12 1.5s9 2.183 9 4.875z" />
                  <path d="M12 12.75c2.685 0 5.19-.586 7.078-1.609a8.283 8.283 0 001.897-1.384c.016.121.025.244.025.368C21 12.817 16.97 15 12 15s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.285 8.285 0 001.897 1.384C6.809 12.164 9.315 12.75 12 12.75z" />
                  <path d="M12 16.5c2.685 0 5.19-.586 7.078-1.609a8.282 8.282 0 001.897-1.384c.016.121.025.244.025.368 0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 001.897 1.384C6.809 15.914 9.315 16.5 12 16.5z" />
                  <path d="M12 20.25c2.685 0 5.19-.586 7.078-1.609a8.282 8.282 0 001.897-1.384c.016.121.025.244.025.368 0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 001.897 1.384C6.809 19.664 9.315 20.25 12 20.25z" />
                </svg>
              </span>
            </div>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">All networks</span>
              <span className="text-xl font-bold">
                {formatUsdValue(totalUsdValue)}
              </span>
            </div>
          </div>
        </button>

        {/* Network Buttons */}
        {networkSummaries.map((item) => (
          <button
            key={item.network.chainId}
            onClick={() => onSelectNetwork(item.network.name)}
            className={`relative px-4 py-3 rounded-lg transition-all ${
              selectedNetwork === item.network.name
                ? "bg-blue-900 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            <div className="flex items-center space-x-2">
              {getNetworkIcon(item.network.name)}
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{item.network.name}</span>
                <span className="text-xl font-bold">
                  {formatUsdValue(item.usdValue)}
                </span>
              </div>
            </div>
          </button>
        ))}

        {/* Show more button */}
        <button className="px-4 py-3 rounded-lg bg-gray-800 text-blue-400 hover:bg-gray-700 transition-all">
          <div className="flex flex-col items-center justify-center h-full">
            <span className="text-sm">Show more</span>
          </div>
        </button>
      </div>
    </div>
  );
}
