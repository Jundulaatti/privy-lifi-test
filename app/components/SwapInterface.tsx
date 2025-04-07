"use client";

import { useState } from "react";
import {
  getQuote,
  convertQuoteToRoute,
  executeRoute,
  Route,
  LiFiStep,
} from "@lifi/sdk";
import { useLiFi } from "../providers/LiFiProvider";
import { formatUnits, parseUnits } from "viem";
import toast from "react-hot-toast";

interface QuoteResult {
  fromAmount: string;
  toAmount: string;
  fromToken?: {
    symbol: string;
    decimals: number;
  };
  toToken?: {
    symbol: string;
    decimals: number;
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
  const { selectedWallet, isWalletConfigured } = useLiFi();

  const [fromChain, setFromChain] = useState<string>("1"); // Default to Ethereum
  const [toChain, setToChain] = useState<string>("10"); // Default to Optimism
  const [fromToken, setFromToken] = useState<string>(
    "0x0000000000000000000000000000000000000000"
  ); // ETH
  const [toToken, setToToken] = useState<string>(
    "0x0000000000000000000000000000000000000000"
  ); // ETH on destination
  const [amount, setAmount] = useState<string>("");
  const [humanReadableAmount, setHumanReadableAmount] = useState<string>("");
  const [tokenDecimals, setTokenDecimals] = useState<number>(18); // Default to 18 for ETH

  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  // Debug notification to show current state values
  const showDebugInfo = () => {
    let message = "";
    let isError = true;

    console.log("DEBUG - SwapInterface wallet states:", {
      selectedWallet,
      isWalletConfigured,
      usingContextHook: "useLiFi",
    });

    // Check wallet configuration
    if (!selectedWallet) {
      message =
        "No wallet selected. Please select a wallet first from the wallet selector above.";
    } else if (!isWalletConfigured) {
      message =
        "Wallet is not configured with LI.FI. This could be a connection issue.";
      // Show a helpful message about reconnecting
      toast.error(
        "Wallet not properly configured with LI.FI. Try selecting your wallet again in the wallet selector above.",
        {
          duration: 6000,
          position: "top-center",
        }
      );
      return;
    }
    // Check form fields
    else if (!fromChain) {
      message = "No source chain selected.";
    } else if (!toChain) {
      message = "No destination chain selected.";
    } else if (!fromToken) {
      message = "No source token specified.";
    } else if (!toToken) {
      message = "No destination token specified.";
    } else if (!amount || amount === "0") {
      message = "Please enter a valid amount greater than 0.";
    } else {
      message = "All fields are filled. You should be able to get a quote.";
      isError = false;
    }

    // Show message as toast
    if (isError) {
      toast.error(message, {
        duration: 4000,
        position: "top-center",
      });
    } else {
      toast.success(message, {
        duration: 4000,
        position: "top-center",
      });
    }

    // Log detailed debug info to console
    console.log({
      selectedWallet,
      isWalletConfigured,
      fromChain,
      toChain,
      fromToken,
      toToken,
      amount,
      humanReadableAmount,
    });
  };

  // Handle human-readable amount change
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setHumanReadableAmount(inputValue);

    // Convert human-readable amount to smallest unit
    if (inputValue) {
      try {
        const valueInSmallestUnit = parseUnits(
          inputValue,
          tokenDecimals
        ).toString();
        setAmount(valueInSmallestUnit);
      } catch {
        // Invalid input, don't update amount
      }
    } else {
      setAmount("");
    }
  };

  // Update token decimals from the quote result
  const updateTokenDecimals = (result: unknown) => {
    // Type guard to check if result has the structure we expect
    if (
      result &&
      typeof result === "object" &&
      result !== null &&
      "fromToken" in result &&
      result.fromToken &&
      typeof result.fromToken === "object" &&
      result.fromToken !== null &&
      "decimals" in result.fromToken &&
      typeof result.fromToken.decimals === "number"
    ) {
      setTokenDecimals(result.fromToken.decimals);
    }
  };

  const handleGetQuote = async () => {
    if (!selectedWallet || !isWalletConfigured) {
      const message = "Please select a wallet first";
      setError(message);
      toast.error(message);
      return;
    }

    if (!fromChain || !toChain || !fromToken || !toToken || !amount) {
      const message = "Please fill all fields";
      setError(message);
      toast.error(message);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setStatus("Getting quote...");
      toast.loading("Fetching quote...", { id: "quote-loading" });

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

      // Update token decimals from the quote result for better formatting
      updateTokenDecimals(result);

      setStatus("Quote received successfully");
      toast.success("Quote received successfully", { id: "quote-loading" });
      setLoading(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      const fullError = `Error getting quote: ${errorMessage}`;
      setError(fullError);
      setStatus("Failed to get quote");
      toast.error(fullError, { id: "quote-loading" });
      setLoading(false);
    }
  };

  const handleExecuteSwap = async () => {
    if (!quote || !selectedWallet) return;

    try {
      setLoading(true);
      setError("");
      setStatus("Executing swap...");
      toast.loading("Executing swap...", { id: "swap-execution" });

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
            const statusMsg = `${lastProcess.type}: ${lastProcess.status}`;
            setStatus(statusMsg);

            toast.loading(statusMsg, { id: "swap-execution" });

            if (lastProcess.txHash) {
              const statusWithTx = `${lastProcess.type}: ${lastProcess.status} - TX: ${lastProcess.txHash}`;
              setStatus(statusWithTx);
              toast.loading(statusWithTx, { id: "swap-execution" });
            }
          }
        },

        // This is a simplified version - in production, use proper typing
        acceptExchangeRateUpdateHook: () => Promise.resolve(true),
      });

      const successMsg = "Swap completed successfully!";
      setStatus(successMsg);
      toast.success(successMsg, { id: "swap-execution" });
      setLoading(false);
      setQuote(null); // Reset quote
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      const fullError = `Error executing swap: ${errorMessage}`;
      setError(fullError);
      setStatus("Swap failed");
      toast.error(fullError, { id: "swap-execution" });
      setLoading(false);
    }
  };

  // Format quote amounts for display
  const formatQuoteAmount = (amount: string, token?: { decimals?: number }) => {
    if (!token?.decimals) return amount;
    try {
      return formatUnits(BigInt(amount), token.decimals);
    } catch {
      return amount;
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
            Amount
          </label>
          <input
            type="text"
            value={humanReadableAmount}
            onChange={handleAmountChange}
            className="w-full p-2 border rounded text-gray-800 bg-white placeholder-gray-500"
            placeholder="Enter amount (e.g., 0.1 for 0.1 ETH)"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the amount in standard units (e.g., 1.5 ETH instead of wei)
          </p>
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

      <div className="flex flex-col gap-3">
        {/* Status indicator showing why button might be disabled */}
        {!selectedWallet ? (
          <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
            Please select a wallet first to enable swapping
          </div>
        ) : !isWalletConfigured ? (
          <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
            Wallet not configured with LI.FI. Try selecting your wallet again
          </div>
        ) : !amount || amount === "0" ? (
          <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
            Enter an amount to continue
          </div>
        ) : null}

        <button
          onClick={handleGetQuote}
          disabled={
            loading ||
            !selectedWallet ||
            !isWalletConfigured ||
            !amount ||
            amount === "0"
          }
          className="w-full p-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
        >
          Get Quote
        </button>

        <button
          onClick={showDebugInfo}
          className="w-full p-2 bg-gray-100 text-gray-700 rounded text-sm"
        >
          Why can&apos;t I click Get Quote?
        </button>
      </div>

      {quote && (
        <div className="mb-4 p-3 border rounded bg-gray-50 text-gray-800">
          <h3 className="font-semibold mb-2">Quote Details</h3>
          <p>
            From: {formatQuoteAmount(quote.fromAmount, quote.fromToken)}{" "}
            {quote.fromToken?.symbol}
          </p>
          <p>
            To: {formatQuoteAmount(quote.toAmount, quote.toToken)}{" "}
            {quote.toToken?.symbol}
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
