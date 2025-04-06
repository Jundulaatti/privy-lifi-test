"use client";

import { PrivyProvider } from "@privy-io/react-auth";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Ensure the app ID is always available for debugging
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || "";
  console.log("Using Privy App ID:", appId);

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["email", "wallet", "google"],
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
          showWalletLoginFirst: false,
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
