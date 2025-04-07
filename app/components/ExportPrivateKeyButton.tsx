"use client";

import { usePrivy } from "@privy-io/react-auth";

export default function ExportPrivateKeyButton({
  address,
}: {
  address: string;
}) {
  const { ready, authenticated, user, exportWallet } = usePrivy();

  // Check that the user is authenticated
  const isAuthenticated = ready && authenticated;

  // Check that the user has an embedded wallet
  const hasEmbeddedWallet = user?.linkedAccounts?.find(
    (account) =>
      account.type === "wallet" &&
      account.walletClientType === "privy" &&
      account.address?.toLowerCase() === address?.toLowerCase()
  );

  return (
    <button
      onClick={exportWallet}
      disabled={!isAuthenticated || !hasEmbeddedWallet}
      className={`text-sm px-3 py-1 rounded transition-colors ${
        isAuthenticated && hasEmbeddedWallet
          ? "bg-blue-500 text-white hover:bg-blue-600"
          : "bg-gray-200 text-gray-500 cursor-not-allowed"
      }`}
    >
      Export Private Key
    </button>
  );
}
