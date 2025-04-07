"use client";

import { Network } from "../constants/networks";

interface NetworkTabsProps {
  networks: Network[];
  activeTab: string;
  onTabChange: (networkName: string) => void;
}

export default function NetworkTabs({
  networks,
  activeTab,
  onTabChange,
}: NetworkTabsProps) {
  return (
    <div className="flex border-b overflow-x-auto mb-4">
      {networks.map((network) => (
        <button
          key={network.chainId}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === network.name
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
          onClick={() => onTabChange(network.name)}
        >
          {network.name}
        </button>
      ))}
    </div>
  );
}
