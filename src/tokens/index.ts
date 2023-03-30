import { Token, TokenState, TokenType, validateTokenState } from "./token";
import type { EvalStateResult } from "warp-contracts";
import type { Gateway } from "~applications/gateway";
import { useStorage } from "@plasmohq/storage/hook";
import { ExtensionStorage } from "~utils/storage";
import { getActiveAddress } from "~wallets";
import { clearCache } from "./cache";

/**
 * Get stored tokens
 */
export async function getTokens() {
  const tokens = await ExtensionStorage.get<Token[]>("tokens");

  return tokens || [];
}

/**
 * Add a token to the stored tokens
 *
 * @param id ID of the token contract
 */
export async function addToken(
  id: string,
  type: TokenType,
  state: TokenState,
  gateway?: Gateway
) {
  const tokens = await getTokens();

  // check state
  if (!state) {
    throw new Error("No state returned");
  }

  validateTokenState(state);

  // add token
  const activeAddress = await getActiveAddress();

  if (!activeAddress) {
    throw new Error("No active address set");
  }

  tokens.push({
    id,
    name: state.name,
    ticker: state.ticker,
    type,
    gateway
  });
  await ExtensionStorage.set("tokens", tokens);
}

/**
 * Remove a token from stored tokens
 *
 * @param id ID of the token contract
 */
export async function removeToken(id: string) {
  const tokens = await getTokens();

  await ExtensionStorage.set(
    "tokens",
    tokens.filter((token) => token.id !== id)
  );
  clearCache(id);
}

/**
 * Hook for stored tokens
 */
export const useTokens = () =>
  useStorage<Token[]>(
    {
      key: "tokens",
      instance: ExtensionStorage
    },
    []
  );

/**
 * Token contract state evaluation result
 */
export type ContractResult = EvalStateResult<TokenState>;
