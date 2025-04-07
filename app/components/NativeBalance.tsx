"use client";

import { Network } from "../constants/networks";

interface NativeBalanceProps {
  network: Network;
  address: string;
  balance: string;
}

export default function NativeBalance({
  network,
  address,
  balance,
}: NativeBalanceProps) {
  return (
    <div className="mb-4 p-3 border rounded-md hover:bg-gray-50">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium">{network.currency} (Native)</p>
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
            {balance ? parseFloat(balance).toFixed(6) : "0.000000"}{" "}
            {network.currency}
          </p>
          {parseFloat(balance || "0") > 0 && (
            <span className="text-xs text-green-600">Available</span>
          )}
        </div>
      </div>
    </div>
  );
}
