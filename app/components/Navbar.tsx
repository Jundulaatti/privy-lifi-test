"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path
      ? "bg-blue-100 text-blue-800"
      : "hover:bg-gray-100";
  };

  return (
    <nav className="py-4 px-6 mb-8 border-b">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="font-bold text-xl">LiFi x Privy</div>
        <div className="flex space-x-4">
          <Link
            href="/dashboard"
            className={`px-3 py-2 rounded-md text-sm font-medium ${isActive(
              "/dashboard"
            )}`}
          >
            Dashboard
          </Link>
          <Link
            href="/swap"
            className={`px-3 py-2 rounded-md text-sm font-medium ${isActive(
              "/swap"
            )}`}
          >
            Swap
          </Link>
          <Link
            href="/wallet"
            className={`px-3 py-2 rounded-md text-sm font-medium ${isActive(
              "/wallet"
            )}`}
          >
            Wallet
          </Link>
        </div>
      </div>
    </nav>
  );
}
