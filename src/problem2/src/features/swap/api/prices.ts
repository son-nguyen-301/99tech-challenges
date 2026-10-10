import { env } from "../../../config/env";
import { parseTokens } from "../lib/tokens";
import type { Token } from "../types";

export async function fetchTokens(signal?: AbortSignal): Promise<Token[]> {
  const response = await fetch(env.pricesUrl, { signal });
  if (!response.ok) {
    throw new Error(
      `Price request failed with status ${String(response.status)}`,
    );
  }
  const data: unknown = await response.json();
  return parseTokens(data);
}
