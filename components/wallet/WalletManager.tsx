"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";

export default function WalletManager() {
  const { user, authenticated, unlinkWallet, connectWallet } = usePrivy();
  const [isConnecting, setIsConnecting] = useState(false);

  if (!authenticated || !user) {
    return null;
  }

  // Get all connected wallets
  const connectedWallets =
    user.linkedAccounts?.filter((account) => account.type === "wallet") || [];

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-black">Wallet Management</h2>

      <div className="space-y-6">
        {/* Wallets List */}
        {connectedWallets.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black">
              Connected Wallets
            </h3>
            {connectedWallets.map((wallet) => (
              <div
                key={wallet.address}
                className="flex flex-col border rounded-lg p-3"
              >
                <div className="flex flex-col items-center justify-between">
                  <div>
                    <p className="font-medium text-black">
                      {wallet.walletClientType === "metamask"
                        ? "MetaMask"
                        : wallet.walletClientType === "privy"
                        ? "Privy Wallet"
                        : wallet.walletClientType || "Wallet"}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {wallet.address}
                    </p>
                  </div>
                  <button
                    onClick={() => unlinkWallet(wallet.address)}
                    className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                    disabled={isConnecting}
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Connect Wallet Button */}
        <button
          onClick={handleConnectWallet}
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-300"
          disabled={isConnecting}
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
      </div>
    </div>
  );
}
