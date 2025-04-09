"use client";

import { useSolanaWallets } from "@privy-io/react-auth/solana";
import { useEffect, useState } from "react";
import { useSolanaWallet } from "../../components/SolanaWalletManager";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { getTokenPrice, formatUsdValue } from "../../lib/prices/tokenPrices";

export default function SolanaWallet() {
  const { wallets: solanaWallets, createWallet: createSolanaWallet } =
    useSolanaWallets();
  const { signMessage } = useSolanaWallet();
  const [expandedWallet, setExpandedWallet] = useState<string | null>(null);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [solBalance, setSolBalance] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [solPrice, setSolPrice] = useState<number>(0);

  // Initialize Solana connection
  useEffect(() => {
    const solanaConnection = new Connection(
      "https://api.mainnet-beta.solana.com"
    );
    setConnection(solanaConnection);
  }, []);

  // Auto-create Solana wallet if needed
  useEffect(() => {
    const ensureSolanaWalletExists = async () => {
      if (isCreatingWallet) return;

      try {
        // Only create a Solana wallet if none exist
        if (solanaWallets.length === 0) {
          setIsCreatingWallet(true);
          console.log("Automatically creating Solana wallet...");
          const newSolanaWallet = await createSolanaWallet();
          console.log("Created Solana wallet automatically:", newSolanaWallet);
        }
      } catch (error) {
        console.error("Error creating Solana wallet:", error);
      } finally {
        setIsCreatingWallet(false);
      }
    };

    ensureSolanaWalletExists();
  }, [solanaWallets.length, createSolanaWallet, isCreatingWallet]);

  // Fetch SOL balances and price
  useEffect(() => {
    const fetchSolanaBalances = async () => {
      if (!connection || solanaWallets.length === 0) return;

      setIsLoading(true);
      const balances: { [key: string]: string } = {};

      try {
        // Fetch SOL price
        const price = await getTokenPrice("SOL");
        setSolPrice(price);

        // Fetch balances
        await Promise.all(
          solanaWallets.map(async (wallet) => {
            try {
              const balance = await connection.getBalance(
                new PublicKey(wallet.address)
              );
              balances[wallet.address] = (
                balance / LAMPORTS_PER_SOL
              ).toString();
            } catch (err) {
              console.error(
                `Error fetching SOL balance for ${wallet.address}:`,
                err
              );
              balances[wallet.address] = "0";
            }
          })
        );

        setSolBalance(balances);
      } catch (error) {
        console.error("Failed to fetch Solana balances:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSolanaBalances();
  }, [connection, solanaWallets]);

  const toggleWalletExpansion = (address: string) => {
    if (expandedWallet === address) {
      setExpandedWallet(null);
    } else {
      setExpandedWallet(address);
    }
  };

  // Format SOL balance
  const formatBalance = (balance: string) => {
    const numBalance = parseFloat(balance);
    if (isNaN(numBalance) || numBalance === 0) return "0 SOL";
    if (numBalance < 0.0001) return "<0.0001 SOL";
    return `${numBalance.toFixed(4)} SOL`;
  };

  // Get total USD value of SOL holdings
  const getTotalSolUsdValue = () => {
    let total = 0;
    Object.values(solBalance).forEach((balance) => {
      const numBalance = parseFloat(balance);
      if (!isNaN(numBalance)) {
        total += numBalance * solPrice;
      }
    });
    return total;
  };

  return (
    <div>
      {isCreatingWallet && (
        <div className="text-center p-4">
          <p className="text-purple-500">Setting up wallet...</p>
        </div>
      )}

      {isLoading && (
        <div className="text-center p-4">
          <p className="text-gray-500">Loading balances...</p>
        </div>
      )}

      {!isLoading && solanaWallets.length > 0 && (
        <div className="bg-gray-900 p-2 rounded-lg mb-6">
          <div className="overflow-x-auto pb-2">
            <div className="flex space-x-2 min-w-max">
              <div className="px-4 py-3 rounded-lg bg-blue-900 text-white">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">S</span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">Solana</span>
                    <span className="text-xl font-bold">
                      {formatUsdValue(getTotalSolUsdValue())}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {solanaWallets.length > 0 ? (
        <div className="space-y-6">
          {solanaWallets.map((wallet) => (
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
                    Solana{" "}
                    {wallet.walletClientType === "privy"
                      ? "Embedded Wallet"
                      : wallet.walletClientType}
                  </p>
                  <p className="text-sm text-gray-500">
                    {wallet.address.slice(0, 10)}...{wallet.address.slice(-8)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm px-2 py-1 bg-purple-100 text-purple-800 rounded">
                    Connected
                  </div>
                  <button
                    className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      signMessage("Hello Solana!").then((sig) => {
                        console.log("Signed message:", sig);
                      });
                    }}
                  >
                    Sign Test Message
                  </button>
                  <button className="text-blue-600">
                    {expandedWallet === wallet.address ? "▲" : "▼"}
                  </button>
                </div>
              </div>

              {expandedWallet === wallet.address && (
                <div className="border-t p-4">
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-700">
                      Solana Balance
                    </h3>

                    <div className="border rounded-md p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-purple-500"></div>
                        <h4 className="font-medium">Solana</h4>
                      </div>

                      {/* SOL balance */}
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-700">SOL</span>
                        <div className="text-right">
                          <div className="font-medium">
                            {!isLoading && solBalance[wallet.address]
                              ? formatBalance(solBalance[wallet.address])
                              : "0 SOL"}
                          </div>
                          {solPrice > 0 && solBalance[wallet.address] && (
                            <div className="text-sm text-gray-500">
                              {formatUsdValue(
                                parseFloat(solBalance[wallet.address]) *
                                  solPrice
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Link to explorer */}
                      <div className="mt-3 pt-2">
                        <p className="text-sm text-gray-600">
                          View tokens in{" "}
                          <a
                            href={`https://explorer.solana.com/address/${wallet.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Solana Explorer
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No Solana wallets connected</p>
      )}
    </div>
  );
}
