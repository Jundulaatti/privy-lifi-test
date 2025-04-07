import { formatEther, formatUnits } from "ethers";
import { Network } from "../../constants/networks";
import { Token, TokenBalance } from "../../constants/tokens";

/**
 * Fetches the native token balance for a given address on a specific network
 */
export async function fetchNativeBalance(
  address: string,
  network: Network
): Promise<string> {
  try {
    const response = await fetch(network.rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getBalance",
        params: [address, "latest"],
      }),
    });

    const data = await response.json();
    if (data.result) {
      return formatEther(data.result);
    } else {
      console.error(`Error fetching balance: ${JSON.stringify(data)}`);
      return "0";
    }
  } catch (err) {
    console.error(`Error fetching balance for ${network.name}:`, err);
    return "0";
  }
}

/**
 * Fetches token balances for a given address on a specific network
 */
export async function fetchTokenBalances(
  address: string,
  network: Network,
  tokens: Token[]
): Promise<TokenBalance[]> {
  const tokenBalances: TokenBalance[] = [];

  await Promise.all(
    tokens.map(async (token) => {
      try {
        // ERC-20 balanceOf function signature: 0x70a08231
        // The padded address parameter (32 bytes)
        const paddedAddress = address.toLowerCase().slice(2).padStart(64, "0");

        const response = await fetch(network.rpcUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "eth_call",
            params: [
              {
                to: token.address,
                data: `0x70a08231000000000000000000000000${paddedAddress}`,
              },
              "latest",
            ],
          }),
        });

        const data = await response.json();
        if (data.result) {
          const rawBalance = data.result;
          const formattedBalance = formatUnits(rawBalance, token.decimals);

          // Only add tokens with non-zero balance
          if (parseFloat(formattedBalance) > 0) {
            tokenBalances.push({
              token,
              balance: rawBalance,
              formattedBalance,
            });
          }
        }
      } catch (err) {
        console.error(
          `Error fetching ${token.symbol} balance on ${network.name}:`,
          err
        );
      }
    })
  );

  return tokenBalances;
}
