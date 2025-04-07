"use client";

import { useWallets } from "@privy-io/react-auth";
import { useLiFi } from "../providers/LiFiProvider";

export default function WalletSelector() {
  const { wallets } = useWallets();
  const { selectedWallet, selectWallet, isWalletConfigured } = useLiFi();

  // Log wallet state for debugging
  console.log("DEBUG - WalletSelector states:", {
    selectedWallet,
    isWalletConfigured,
    availableWallets: wallets.length,
    walletTypes: wallets.map((w) => w.walletClientType),
    usingContextHook: "useLiFi",
  });

  // Filter for Privy and MetaMask wallets
  const privyWallet = wallets.find((w) => w.walletClientType === "privy");

  // For MetaMask detection, we check if it's an injected wallet
  const metaMaskWallet = wallets.find((w) => w.walletClientType === "injected");

  return (
    <div className="mb-8 p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Select a Wallet for Swapping</h2>

      <div className="flex flex-col gap-2">
        {privyWallet && (
          <button
            onClick={() => selectWallet(privyWallet.address)}
            className={`p-3 border rounded-md flex items-center justify-between ${
              selectedWallet === privyWallet.address
                ? "bg-blue-100 border-blue-500 text-black"
                : ""
            }`}
          >
            <span>Privy Wallet</span>
            <span className="text-sm opacity-70">
              {privyWallet.address.slice(0, 6)}...
              {privyWallet.address.slice(-4)}
            </span>
          </button>
        )}

        {metaMaskWallet && (
          <button
            onClick={() => selectWallet(metaMaskWallet.address)}
            className={`p-3 border rounded-md flex items-center justify-between ${
              selectedWallet === metaMaskWallet.address
                ? "bg-blue-100 border-blue-500"
                : ""
            }`}
          >
            <span>External Wallet</span>
            <span className="text-sm opacity-70">
              {metaMaskWallet.address.slice(0, 6)}...
              {metaMaskWallet.address.slice(-4)}
            </span>
          </button>
        )}
      </div>

      {isWalletConfigured && (
        <div className="mt-4 p-2 bg-green-100 text-green-800 rounded">
          Wallet configured with LI.FI SDK ✓
        </div>
      )}

      {!selectedWallet && wallets.length > 0 && (
        <div className="mt-4 p-2 bg-yellow-100 text-yellow-800 rounded">
          Please select a wallet to continue with swaps
        </div>
      )}

      {wallets.length === 0 && (
        <div className="mt-4 p-2 bg-red-100 text-red-800 rounded">
          No wallets connected. Please connect a wallet first.
        </div>
      )}
    </div>
  );
}
