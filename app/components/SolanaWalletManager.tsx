"use client";

import {
  useSolanaWallets,
  useSendTransaction,
  useSignTransaction,
} from "@privy-io/react-auth/solana";
import { Connection, Transaction, VersionedTransaction } from "@solana/web3.js";
import { useEffect, useState } from "react";

// Create a custom hook to expose Solana wallet functionality to other components
export function useSolanaWallet() {
  const { wallets } = useSolanaWallets();
  const { sendTransaction } = useSendTransaction();
  const { signTransaction } = useSignTransaction();
  const [connection, setConnection] = useState<Connection | null>(null);

  useEffect(() => {
    // Initialize Solana connection
    const solanaConnection = new Connection(
      "https://api.mainnet-beta.solana.com"
    );
    setConnection(solanaConnection);
  }, []);

  const signMessage = async (message: string) => {
    if (!wallets.length) {
      console.error("No Solana wallets available");
      return;
    }

    try {
      const signature = await wallets[0].signMessage(
        new TextEncoder().encode(message)
      );
      console.log("Message signed:", signature);
      return signature;
    } catch (error) {
      console.error("Error signing message:", error);
    }
  };

  const sendSolanaTransaction = async (
    transaction: Transaction | VersionedTransaction
  ) => {
    if (!connection) {
      console.error("Solana connection not initialized");
      return;
    }

    try {
      const receipt = await sendTransaction({
        transaction,
        connection,
      });
      console.log("Transaction sent with signature:", receipt.signature);
      return receipt;
    } catch (error) {
      console.error("Error sending transaction:", error);
    }
  };

  const signSolanaTransaction = async (
    transaction: Transaction | VersionedTransaction
  ) => {
    if (!connection) {
      console.error("Solana connection not initialized");
      return;
    }

    try {
      const signedTransaction = await signTransaction({
        transaction,
        connection,
      });
      console.log("Transaction signed successfully");
      return signedTransaction;
    } catch (error) {
      console.error("Error signing transaction:", error);
    }
  };

  return {
    wallets,
    connection,
    signMessage,
    sendSolanaTransaction,
    signSolanaTransaction,
  };
}

export default function SolanaWalletManager() {
  const { signMessage } = useSolanaWallet();

  return (
    <div>
      <h2>Solana Wallet Manager</h2>
      <div>
        <button onClick={() => signMessage("Hello World")}>Sign Message</button>
      </div>
      {/* Add more UI elements as needed */}
    </div>
  );
}
