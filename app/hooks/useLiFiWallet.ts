"use client";

import { useEffect, useState } from "react";
import { EVM, config } from "@lifi/sdk";
import { useWallets } from "@privy-io/react-auth";
import { createWalletClient, custom } from "viem";

export function useLiFiWallet() {
  const { wallets, ready } = useWallets();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [isWalletConfigured, setIsWalletConfigured] = useState(false);

  // Configure LI.FI with the selected wallet
  useEffect(() => {
    if (!ready || !selectedWallet) return;

    const setupWallet = async () => {
      try {
        const wallet = wallets.find(
          (w) => w.address.toLowerCase() === selectedWallet?.toLowerCase()
        );

        if (!wallet) {
          console.error("Selected wallet not found");
          return;
        }

        // Get the provider from the wallet
        const provider = await wallet.getEthereumProvider();

        if (!provider) {
          console.error("Failed to get Ethereum provider from wallet");
          return;
        }

        // Create a viem wallet client
        const walletClient = createWalletClient({
          account: wallet.address as `0x${string}`,
          transport: custom(provider),
        });

        // Configure LI.FI with the wallet
        config.setProviders([
          EVM({
            getWalletClient: async () => walletClient,
            switchChain: async (chainId) => {
              try {
                // Request chain switch
                await provider.request({
                  method: "wallet_switchEthereumChain",
                  params: [{ chainId: `0x${chainId.toString(16)}` }],
                });
                return walletClient;
              } catch (error) {
                console.error("Error switching chain:", error);
                return walletClient;
              }
            },
          }),
        ]);

        setIsWalletConfigured(true);
      } catch (error) {
        console.error("Error setting up wallet with LI.FI:", error);
        setIsWalletConfigured(false);
      }
    };

    setupWallet();
  }, [ready, selectedWallet, wallets]);

  // Function to set the selected wallet
  const selectWallet = (address: string) => {
    setSelectedWallet(address);
  };

  return {
    wallets,
    ready,
    selectedWallet,
    selectWallet,
    isWalletConfigured,
  };
}
