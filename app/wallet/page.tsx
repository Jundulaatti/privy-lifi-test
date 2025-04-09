"use client";

import { useWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EVMWallet from "./components/EVMWallet";
import SolanaWallet from "./components/SolanaWallet";

export default function WalletPage() {
  const { wallets, ready } = useWallets();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"EVM" | "Solana">("EVM");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (ready && wallets.length === 0) {
      router.push("/login");
    }
  }, [ready, wallets, router]);

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Wallet Management</h1>

      {/* Wallet Selection Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            activeTab === "EVM"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-blue-300"
          }`}
          onClick={() => setActiveTab("EVM")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 text-blue-600"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="22" y1="9" x2="16" y2="15"></line>
                <line x1="16" y1="9" x2="22" y2="15"></line>
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-lg">EVM</h2>
              <p className="text-sm text-gray-600">Ethereum, Polygon, etc.</p>
            </div>
          </div>
          <div className="mt-2 text-sm font-medium text-blue-600">0.1 ETH</div>
        </div>

        <div
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            activeTab === "Solana"
              ? "border-purple-500 bg-purple-50"
              : "border-gray-200 hover:border-purple-300"
          }`}
          onClick={() => setActiveTab("Solana")}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 text-purple-600"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="14.31" y1="8" x2="20.05" y2="17.94"></line>
                <line x1="9.69" y1="8" x2="21.17" y2="8"></line>
                <line x1="7.38" y1="12" x2="13.12" y2="2.06"></line>
                <line x1="9.69" y1="16" x2="3.95" y2="6.06"></line>
                <line x1="14.31" y1="16" x2="2.83" y2="16"></line>
                <line x1="16.62" y1="12" x2="10.88" y2="21.94"></line>
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-lg">Solana</h2>
              <p className="text-sm text-gray-600">SOL</p>
            </div>
          </div>
          <div className="mt-2 text-sm font-medium text-purple-600">
            0.5 SOL
          </div>
        </div>
      </div>

      {/* Wallet Content */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {/* Wallet Tabs */}
        <div className="flex border-b">
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "EVM"
                ? "text-blue-600 border-b-2 border-blue-500"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("EVM")}
          >
            EVM Wallet
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "Solana"
                ? "text-purple-600 border-b-2 border-purple-500"
                : "text-gray-600 hover:text-gray-800"
            }`}
            onClick={() => setActiveTab("Solana")}
          >
            Solana Wallet
          </button>
        </div>

        {/* Tab content */}
        <div className="p-4">
          {activeTab === "EVM" ? <EVMWallet /> : <SolanaWallet />}
        </div>
      </div>
    </div>
  );
}
