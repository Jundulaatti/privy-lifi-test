import WalletSelector from "../components/WalletSelector";
import SwapInterface from "../components/SwapInterface";

export default function SwapPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Token Swap with LI.FI</h1>

      <WalletSelector />
      <SwapInterface />
    </div>
  );
}
