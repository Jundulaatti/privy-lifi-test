"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import WalletManager from "@/components/wallet/WalletManager";

export default function Dashboard() {
  const { user, ready, authenticated, logout } = usePrivy();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/login");
    }
  }, [ready, authenticated, router]);

  if (!ready || !authenticated) {
    return <div>Loading...</div>;
  }

  // Get user display name or email as string
  const userDisplayName = user?.email?.address || user?.google?.email || "User";

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-black">Terminal App</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/swap"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Token Swap
              </Link>
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-black">
                Welcome, {userDisplayName}
              </h2>
              <p className="text-gray-600">
                This is your personal dashboard for crypto research and
                transactions.
              </p>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3 text-black">
                  Getting Started
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  <li>
                    Connect your wallet to interact with blockchain networks
                  </li>
                  <li>View your transaction history and portfolio</li>
                  <li>
                    <Link
                      href="/swap"
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      Swap tokens across different chains
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <WalletManager />
          </div>
        </div>
      </main>
    </div>
  );
}
