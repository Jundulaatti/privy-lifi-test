"use client";

import { useState } from "react";
import {
  getQuote,
  convertQuoteToRoute,
  executeRoute,
  Route,
  LiFiStep,
} from "@lifi/sdk";
import { useLiFiWallet } from "../hooks/useLiFiWallet";

interface QuoteResult {
  fromAmount: string;
  toAmount: string;
  fromToken?: {
    symbol: string;
  };
  toToken?: {
    symbol: string;
  };
  estimatedGasUSD?: number;
  executionDuration?: number;
}

// Define this type to match LI.FI SDK's actual structure
interface ExtendedLiFiStep {
  execution?: {
    process?: Array<{
      type: string;
      status: string;
      txHash?: string;
    }>;
  };
}

export default function SwapInterface() {
  const { selectedWallet, isWalletConfigured } = useLiFiWallet();

  const [fromChain, setFromChain] = useState<string>("1"); // Default to Ethereum
  const [toChain, setToChain] = useState<string>("10"); // Default to Optimism
  const [fromToken, setFromToken] = useState<string>(
    "0x0000000000000000000000000000000000000000"
  ); // ETH
  const [toToken, setToToken] = useState<string>(
    "0x0000000000000000000000000000000000000000"
  ); // ETH on destination
  const [amount, setAmount] = useState<string>("");

  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  const handleGetQuote = async () => {
    if (!selectedWallet || !isWalletConfigured) {
      setError("Please select a wallet first");
      return;
    }

    if (!fromChain || !toChain || !fromToken || !toToken || !amount) {
      setError("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setStatus("Getting quote...");

      const quoteRequest = {
        fromChain: parseInt(fromChain),
        toChain: parseInt(toChain),
        fromToken,
        toToken,
        fromAmount: amount,
        fromAddress: selectedWallet,
      };

      const result = await getQuote(quoteRequest);
      // Use type assertion to convert SDK response to our simplified type
      setQuote(result as unknown as QuoteResult);
      setStatus("Quote received successfully");
      setLoading(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Error getting quote: ${errorMessage}`);
      setStatus("Failed to get quote");
      setLoading(false);
    }
  };

  const handleExecuteSwap = async () => {
    if (!quote || !selectedWallet) return;

    try {
      setLoading(true);
      setError("");
      setStatus("Executing swap...");

      // Convert our simplified quote back to what the SDK expects
      const route = convertQuoteToRoute(quote as unknown as LiFiStep);

      await executeRoute(route, {
        updateRouteHook: (updatedRoute: Route) => {
          console.log("Route updated:", updatedRoute);

          // Get current status
          const currentStep = updatedRoute.steps[
            updatedRoute.steps.length - 1
          ] as unknown as ExtendedLiFiStep;
          if (currentStep.execution && currentStep.execution.process?.length) {
            const process = currentStep.execution.process;
            const lastProcess = process[process.length - 1];
            setStatus(`${lastProcess.type}: ${lastProcess.status}`);

            if (lastProcess.txHash) {
              setStatus(
                `${lastProcess.type}: ${lastProcess.status} - TX: ${lastProcess.txHash}`
              );
            }
          }
        },

        // This is a simplified version - in production, use proper typing
        acceptExchangeRateUpdateHook: () => Promise.resolve(true),
      });

      setStatus("Swap completed successfully!");
      setLoading(false);
      setQuote(null); // Reset quote
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Error executing swap: ${errorMessage}`);
      setStatus("Swap failed");
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">Swap Tokens with LI.FI</h2>

      <div className="grid grid-cols-1 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            From Chain
          </label>
          <select
            value={fromChain}
            onChange={(e) => setFromChain(e.target.value)}
            className="w-full p-2 border rounded text-gray-800 bg-white"
            disabled={loading}
          >
            <option value="1">Ethereum</option>
            <option value="10">Optimism</option>
            <option value="137">Polygon</option>
            <option value="42161">Arbitrum</option>
            <option value="8453">Base</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            From Token
          </label>
          <input
            type="text"
            value={fromToken}
            onChange={(e) => setFromToken(e.target.value)}
            className="w-full p-2 border rounded text-gray-800 bg-white placeholder-gray-500"
            placeholder="Token address (0x0 for native token)"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Amount (in smallest unit)
          </label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 border rounded text-gray-800 bg-white placeholder-gray-500"
            placeholder="e.g., 1000000000000000000 for 1 ETH"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            To Chain
          </label>
          <select
            value={toChain}
            onChange={(e) => setToChain(e.target.value)}
            className="w-full p-2 border rounded text-gray-800 bg-white"
            disabled={loading}
          >
            <option value="1">Ethereum</option>
            <option value="10">Optimism</option>
            <option value="137">Polygon</option>
            <option value="42161">Arbitrum</option>
            <option value="8453">Base</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            To Token
          </label>
          <input
            type="text"
            value={toToken}
            onChange={(e) => setToToken(e.target.value)}
            className="w-full p-2 border rounded text-gray-800 bg-white placeholder-gray-500"
            placeholder="Token address (0x0 for native token)"
            disabled={loading}
          />
        </div>
      </div>

      <button
        onClick={handleGetQuote}
        disabled={loading || !selectedWallet || !isWalletConfigured}
        className="w-full p-2 bg-blue-600 text-white rounded mb-4 disabled:bg-gray-400"
      >
        Get Quote
      </button>

      {quote && (
        <div className="mb-4 p-3 border rounded bg-gray-50 text-gray-800">
          <h3 className="font-semibold mb-2">Quote Details</h3>
          <p>
            From: {quote.fromAmount} {quote.fromToken?.symbol}
          </p>
          <p>
            To: {quote.toAmount} {quote.toToken?.symbol}
          </p>
          <p>Gas Cost: ~${quote.estimatedGasUSD?.toFixed(2) || "N/A"}</p>
          <p>Execution Time: ~{quote.executionDuration}s</p>

          <button
            onClick={handleExecuteSwap}
            disabled={loading}
            className="w-full mt-3 p-2 bg-green-600 text-white rounded disabled:bg-gray-400"
          >
            Execute Swap
          </button>
        </div>
      )}

      {status && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded mb-4">
          <p className="font-medium">Status: {status}</p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-300 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
