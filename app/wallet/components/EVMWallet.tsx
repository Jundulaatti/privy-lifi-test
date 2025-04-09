"use client";

import { useWallets, useCreateWallet } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import ExportPrivateKeyButton from "../../components/ExportPrivateKeyButton";
import { NETWORKS } from "../../constants/networks";
import { COMMON_TOKENS, TokenBalance } from "../../constants/tokens";
import {
  fetchNativeBalance,
  fetchTokenBalances,
} from "../../lib/blockchain/balances";
import {
  getTokenPrices,
  calculateUsdValue,
  formatUsdValue,
} from "../../lib/prices/tokenPrices";
import NetworkSelector from "../../components/NetworkSelector";

// Define network colors for display
const NETWORK_COLORS: Record<string, string> = {
  Ethereum: "#627EEA",
  Base: "#0052FF",
  Optimism: "#FF0420",
  "Arbitrum One": "#28A0F0",
};

export default function EVMWallet() {
  const { wallets } = useWallets();
  const { createWallet: createEthWallet } = useCreateWallet();
  const [expandedWallet, setExpandedWallet] = useState<string | null>(null);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [nativeBalances, setNativeBalances] = useState<{
    [key: string]: { [key: string]: string };
  }>({});
  const [tokenBalances, setTokenBalances] = useState<{
    [key: string]: { [key: string]: TokenBalance[] };
  }>({});
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);

  // Auto-create EVM wallet if needed
  useEffect(() => {
    const ensureEVMWalletExists = async () => {
      if (isCreatingWallet) return;

      try {
        // Check if we need to create an EVM wallet
        if (
          wallets.filter((w) => w.walletClientType === "privy").length === 0
        ) {
          setIsCreatingWallet(true);
          console.log("Automatically creating EVM wallet...");
          const newEthWallet = await createEthWallet({
            createAdditional: true,
          });
          console.log("Created EVM wallet automatically:", newEthWallet);
        }
      } catch (error) {
        console.error("Error creating EVM wallet:", error);
      } finally {
        setIsCreatingWallet(false);
      }
    };

    ensureEVMWalletExists();
  }, [wallets, createEthWallet, isCreatingWallet]);

  // Fetch balances for all wallets and networks
  useEffect(() => {
    const fetchAllBalances = async () => {
      if (wallets.length === 0) return;

      setIsLoading(true);

      const nativeResults: { [key: string]: { [key: string]: string } } = {};
      const tokenResults: { [key: string]: { [key: string]: TokenBalance[] } } =
        {};

      try {
        // Filter for EVM wallets
        const evmWallets = wallets.filter(
          (wallet) =>
            wallet.walletClientType === "privy" ||
            wallet.walletClientType === "injected"
        );

        // For each wallet, fetch balances across all networks
        await Promise.all(
          evmWallets.map(async (wallet) => {
            nativeResults[wallet.address] = {};
            tokenResults[wallet.address] = {};

            // Fetch for all networks
            await Promise.all(
              NETWORKS.map(async (network) => {
                try {
                  // Fetch native balance
                  nativeResults[wallet.address][network.name] =
                    await fetchNativeBalance(wallet.address, network);

                  // Fetch token balances
                  const tokensForChain = COMMON_TOKENS[network.chainId] || [];
                  if (tokensForChain.length > 0) {
                    tokenResults[wallet.address][network.name] =
                      await fetchTokenBalances(
                        wallet.address,
                        network,
                        tokensForChain
                      );
                  } else {
                    tokenResults[wallet.address][network.name] = [];
                  }
                } catch (err) {
                  console.error(
                    `Error fetching balances for ${wallet.address} on ${network.name}:`,
                    err
                  );
                  nativeResults[wallet.address][network.name] = "0";
                  tokenResults[wallet.address][network.name] = [];
                }
              })
            );
          })
        );

        setNativeBalances(nativeResults);
        setTokenBalances(tokenResults);

        // Fetch token prices
        await fetchTokenPrices();
      } catch (error) {
        console.error("Failed to fetch all balances:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllBalances();
  }, [wallets]);

  // Fetch token prices
  const fetchTokenPrices = async () => {
    try {
      // Get all token symbols that need prices
      const symbols = new Set<string>();

      // Add native currencies
      NETWORKS.forEach((network) => {
        symbols.add(network.currency);
      });

      // Add ERC20 tokens
      Object.values(tokenBalances).forEach((walletBalances) => {
        Object.values(walletBalances).forEach((networkTokens) => {
          networkTokens.forEach((tokenBalance) => {
            symbols.add(tokenBalance.token.symbol);
          });
        });
      });

      // Fetch prices for all symbols
      const prices = await getTokenPrices(Array.from(symbols));
      setTokenPrices(prices);
    } catch (error) {
      console.error("Failed to fetch token prices:", error);
    }
  };

  const toggleWalletExpansion = (address: string) => {
    if (expandedWallet === address) {
      setExpandedWallet(null);
    } else {
      setExpandedWallet(address);
    }
  };

  // Format the balance with the network symbol
  const formatBalance = (balance: string, symbol: string) => {
    const numBalance = parseFloat(balance);
    if (isNaN(numBalance) || numBalance === 0) return `0 ${symbol}`;
    if (numBalance < 0.0001) return `<0.0001 ${symbol}`;
    return `${numBalance.toFixed(4)} ${symbol}`;
  };

  // Filter networks based on selection
  const filteredNetworks = selectedNetwork
    ? NETWORKS.filter((network) => network.name === selectedNetwork)
    : NETWORKS;

  // Create a combined balance map for the selected wallet for the NetworkSelector
  const getNetworkBalancesForWallet = (walletAddress: string) => {
    const balanceMap: { [networkName: string]: string } = {};

    if (nativeBalances[walletAddress]) {
      NETWORKS.forEach((network) => {
        balanceMap[network.name] =
          nativeBalances[walletAddress][network.name] || "0";
      });
    }

    return balanceMap;
  };

  return (
    <div>
      {isCreatingWallet && (
        <div className="text-center p-4">
          <p className="text-blue-500">Setting up wallet...</p>
        </div>
      )}

      {isLoading && (
        <div className="text-center p-4">
          <p className="text-gray-500">Loading balances...</p>
        </div>
      )}

      {wallets.length > 0 ? (
        <div className="space-y-6">
          {wallets
            .filter(
              (wallet) =>
                wallet.walletClientType === "privy" ||
                wallet.walletClientType === "injected"
            )
            .map((wallet) => (
              <div
                key={wallet.address}
                className="border rounded-lg overflow-hidden bg-white"
              >
                <div
                  className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
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
                  <div className="border-t p-4">
                    <div className="space-y-4">
                      {/* Network Selector */}
                      <div className="bg-gray-900 p-2 rounded-lg mb-6">
                        <NetworkSelector
                          networks={NETWORKS}
                          balances={getNetworkBalancesForWallet(wallet.address)}
                          tokenPrices={tokenPrices}
                          selectedNetwork={selectedNetwork}
                          onSelectNetwork={setSelectedNetwork}
                        />
                      </div>

                      {/* Display all networks vertically */}
                      <div className="flex flex-col space-y-3">
                        {filteredNetworks.map((network) => (
                          <div
                            key={network.chainId}
                            className="border rounded-md p-3"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div
                                className="w-6 h-6 rounded-full"
                                style={{
                                  backgroundColor:
                                    NETWORK_COLORS[network.name] || "#eee",
                                }}
                              ></div>
                              <h4 className="font-medium">{network.name}</h4>
                            </div>

                            {/* Native balance for this network */}
                            <div className="flex justify-between items-center py-2 border-b">
                              <span className="text-gray-700">
                                {network.currency}
                              </span>
                              <div className="text-right">
                                <div className="font-medium">
                                  {!isLoading && nativeBalances[wallet.address]
                                    ? formatBalance(
                                        nativeBalances[wallet.address][
                                          network.name
                                        ] || "0",
                                        network.currency
                                      )
                                    : `0 ${network.currency}`}
                                </div>
                                {tokenPrices &&
                                  nativeBalances[wallet.address] && (
                                    <div className="text-sm text-gray-500">
                                      {formatUsdValue(
                                        calculateUsdValue(
                                          nativeBalances[wallet.address][
                                            network.name
                                          ] || "0",
                                          network.currency,
                                          tokenPrices
                                        )
                                      )}
                                    </div>
                                  )}
                              </div>
                            </div>

                            {/* Token balances for this network */}
                            {!isLoading &&
                            tokenBalances[wallet.address] &&
                            tokenBalances[wallet.address][network.name] &&
                            tokenBalances[wallet.address][network.name].length >
                              0 ? (
                              <div className="mt-2 space-y-1">
                                {tokenBalances[wallet.address][network.name]
                                  .filter(
                                    (tokenBalance) =>
                                      parseFloat(tokenBalance.balance) > 0
                                  )
                                  .map((tokenBalance) => (
                                    <div
                                      key={tokenBalance.token.address}
                                      className="flex justify-between items-center py-1"
                                    >
                                      <span className="text-gray-700">
                                        {tokenBalance.token.symbol}
                                      </span>
                                      <div className="text-right">
                                        <div className="font-medium">
                                          {formatBalance(
                                            tokenBalance.balance,
                                            tokenBalance.token.symbol
                                          )}
                                        </div>
                                        {tokenPrices && (
                                          <div className="text-sm text-gray-500">
                                            {formatUsdValue(
                                              calculateUsdValue(
                                                tokenBalance.balance,
                                                tokenBalance.token.symbol,
                                                tokenPrices
                                              )
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            ) : (
                              <div className="mt-2 text-sm text-gray-500">
                                No token balances
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      ) : (
        <p className="text-gray-500">No Ethereum wallets connected</p>
      )}
    </div>
  );
}
