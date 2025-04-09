"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { LiFiProvider } from "./providers/LiFiProvider";
import LiFiInitializer from "./components/LiFiInitializer";
import { Toaster } from "react-hot-toast";

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
          showWalletLoginFirst: true,
        },
        embeddedWallets: {
          createOnLogin: "all-users",
        },
      }}
    >
      <LiFiProvider>
        <LiFiInitializer />
        {children}
        <Toaster position="top-right" />
      </LiFiProvider>
    </PrivyProvider>
  );
}
