"use client";

import { useWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import WalletSelector from "../components/WalletSelector";
import WalletBalance from "../components/WalletBalance";
import ExportPrivateKeyButton from "../components/ExportPrivateKeyButton";

export default function WalletPage() {
  const { wallets, ready } = useWallets();
  const router = useRouter();
  const [expandedWallet, setExpandedWallet] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (ready && wallets.length === 0) {
      router.push("/login");
    }
  }, [ready, wallets, router]);

  const toggleWalletExpansion = (address: string) => {
    if (expandedWallet === address) {
      setExpandedWallet(null);
    } else {
      setExpandedWallet(address);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Wallet Management</h1>

      <WalletSelector />

      <div className="mt-8 p-4 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">Connected Wallets</h2>

        {wallets.length > 0 ? (
          <div className="space-y-3">
            {wallets.map((wallet) => (
              <div
                key={wallet.address}
                className="border rounded-md overflow-hidden"
              >
                <div
                  className="p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleWalletExpansion(wallet.address)}
                >
                  <div>
                    <p className="font-medium">
                      {wallet.walletClientType === "privy"
                        ? "Privy Wallet"
                        : wallet.walletClientType === "injected"
                        ? "External Wallet (MetaMask/Injected)"
                        : wallet.walletClientType}
                    </p>
                    <p className="text-sm text-gray-500">
                      {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded">
                      Connected
                    </div>
                    {wallet.walletClientType === "privy" && (
                      <ExportPrivateKeyButton address={wallet.address} />
                    )}
                    <button className="text-blue-600">
                      {expandedWallet === wallet.address ? "▲" : "▼"}
                    </button>
                  </div>
                </div>

                {expandedWallet === wallet.address && (
                  <div className="border-t p-0">
                    <WalletBalance address={wallet.address} />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No wallets connected</p>
        )}
      </div>
    </div>
  );
}
