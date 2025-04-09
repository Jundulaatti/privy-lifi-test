// Map of common token symbols to CoinGecko IDs
const TOKEN_ID_MAP: Record<string, string> = {
  ETH: "ethereum",
  WETH: "weth",
  USDC: "usd-coin",
  USDT: "tether",
  DAI: "dai",
  SOL: "solana",
  // Add more tokens as needed
};

// Cache token prices to reduce API calls
interface PriceCache {
  [tokenId: string]: {
    usdPrice: number;
    timestamp: number;
  };
}

const priceCache: PriceCache = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Fetches the current USD price for a given token symbol
 */
export async function getTokenPrice(symbol: string): Promise<number> {
  try {
    const tokenId = TOKEN_ID_MAP[symbol.toUpperCase()];
    if (!tokenId) {
      console.warn(`No CoinGecko ID found for token symbol: ${symbol}`);
      return 0;
    }

    // Check cache first
    const now = Date.now();
    if (
      priceCache[tokenId] &&
      now - priceCache[tokenId].timestamp < CACHE_DURATION
    ) {
      return priceCache[tokenId].usdPrice;
    }

    // Fetch from CoinGecko
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    if (data[tokenId]?.usd) {
      const price = parseFloat(data[tokenId].usd);

      // Update cache
      priceCache[tokenId] = {
        usdPrice: price,
        timestamp: now,
      };

      return price;
    }

    return 0;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return 0;
  }
}

/**
 * Batch fetches prices for multiple tokens at once
 */
export async function getTokenPrices(
  symbols: string[]
): Promise<Record<string, number>> {
  try {
    // Filter duplicates
    const uniqueSymbols = Array.from(new Set(symbols));
    const tokenIds: string[] = [];
    const symbolToIdMap: Record<string, string> = {};

    // Get CoinGecko IDs for the tokens
    uniqueSymbols.forEach((symbol) => {
      const tokenId = TOKEN_ID_MAP[symbol.toUpperCase()];
      if (tokenId) {
        tokenIds.push(tokenId);
        symbolToIdMap[symbol.toUpperCase()] = tokenId;
      }
    });

    if (tokenIds.length === 0) return {};

    // Check which tokens we need to fetch (not in cache or cache expired)
    const now = Date.now();
    const tokenIdsToFetch = tokenIds.filter(
      (id) =>
        !priceCache[id] || now - priceCache[id].timestamp >= CACHE_DURATION
    );

    // Fetch prices if needed
    if (tokenIdsToFetch.length > 0) {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenIdsToFetch.join(
          ","
        )}&vs_currencies=usd`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Update cache with new prices
        Object.keys(data).forEach((id) => {
          if (data[id]?.usd) {
            priceCache[id] = {
              usdPrice: parseFloat(data[id].usd),
              timestamp: now,
            };
          }
        });
      }
    }

    // Construct result from cache
    const result: Record<string, number> = {};
    uniqueSymbols.forEach((symbol) => {
      const upperSymbol = symbol.toUpperCase();
      const tokenId = symbolToIdMap[upperSymbol];
      if (tokenId && priceCache[tokenId]) {
        result[upperSymbol] = priceCache[tokenId].usdPrice;
      } else {
        result[upperSymbol] = 0;
      }
    });

    return result;
  } catch (error) {
    console.error("Error fetching token prices:", error);
    return {};
  }
}

/**
 * Calculates the USD value of a token amount
 */
export function calculateUsdValue(
  amount: string,
  tokenSymbol: string,
  prices: Record<string, number>
): number {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount === 0) return 0;

  const upperSymbol = tokenSymbol.toUpperCase();
  const price = prices[upperSymbol] || 0;

  return numAmount * price;
}

/**
 * Formats a USD value with appropriate precision
 */
export function formatUsdValue(value: number): string {
  if (value === 0) return "$0.00";
  if (value < 0.01) return "<$0.01";
  if (value < 1) return `$${value.toFixed(2)}`;
  if (value < 1000) return `$${value.toFixed(2)}`;
  if (value < 1000000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${(value / 1000000).toFixed(1)}M`;
}
