"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const privy = usePrivy();
  const { login, authenticated, ready } = privy;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  // Debug logging
  useEffect(() => {
    console.log("Privy state:", {
      ready,
      authenticated,
      appId: process.env.NEXT_PUBLIC_PRIVY_APP_ID,
      // Log all available privy properties for debugging
      privyProps: Object.keys(privy),
    });

    setDebugInfo(
      `Ready: ${ready}, Authenticated: ${authenticated}, App ID: ${process.env.NEXT_PUBLIC_PRIVY_APP_ID?.substring(
        0,
        8
      )}...`
    );
  }, [ready, authenticated, privy]);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (ready && authenticated) {
      router.push("/dashboard");
    }
  }, [ready, authenticated, router]);

  const handleLogin = () => {
    console.log("Login button clicked");
    setError(null);

    try {
      login();
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Failed to login");
    }
  };

  // Show loading state when Privy is not ready
  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        <div className="w-full max-w-md p-8 space-y-8 bg-white text-black rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="text-xl font-medium">
              Initializing authentication...
            </h2>
            <p className="mt-3 text-sm text-gray-500">{debugInfo}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="w-full max-w-md p-8 space-y-8 bg-white text-black rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold">Terminal App</h1>
          <p className="mt-2 text-gray-600">Your crypto research platform</p>
          <p className="mt-2 text-xs text-gray-400">{debugInfo}</p>
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md mb-4">
            Error: {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Sign in with Privy
        </button>
      </div>
    </div>
  );
}
