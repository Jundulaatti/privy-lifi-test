"use client";

import { usePrivy } from "@privy-io/react-auth";

export default function WalletManager() {
  const { user, authenticated, unlinkWallet, connectWallet } = usePrivy();

  if (!authenticated || !user) {
    return null;
  }

  // Check if the user has any linked wallets
  const connectedWallet = user.linkedAccounts?.find(
    (account) => account.type === "wallet"
  );

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-black">Wallet Management</h2>

      <div className="space-y-4">
        {connectedWallet ? (
          <div className="flex flex-col items-center justify-between">
            <div>
              <p className="font-medium text-black">Connected Wallet</p>
              <p className="text-sm text-gray-500 truncate">
                {connectedWallet.address}
              </p>
            </div>
            <button
              onClick={() => unlinkWallet(connectedWallet.address)}
              className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50 mr-auto mt-4"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className="w-full py-2 px-4 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}
