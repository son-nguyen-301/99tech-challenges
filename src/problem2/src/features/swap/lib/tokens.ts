import { env } from "../../../config/env";
import type { Token } from "../types";

interface PriceEntry {
  currency: string;
  date: string;
  price: number;
}

// The symbol comes from a remote feed and ends up in a URL and in the UI.
const SYMBOL_PATTERN = /^[A-Za-z0-9._-]{1,20}$/;

// Symbols whose icon file uses different letter casing.
const ICON_FILE_NAMES = new Map([
  ["RATOM", "rATOM"],
  ["STATOM", "stATOM"],
  ["STEVMOS", "stEVMOS"],
  ["STLUNA", "stLUNA"],
  ["STOSMO", "stOSMO"],
]);

const symbolCollator = new Intl.Collator("en", { sensitivity: "base" });

function isPriceEntry(value: unknown): value is PriceEntry {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.currency === "string" &&
    SYMBOL_PATTERN.test(entry.currency) &&
    typeof entry.date === "string" &&
    !Number.isNaN(Date.parse(entry.date)) &&
    typeof entry.price === "number" &&
    Number.isFinite(entry.price) &&
    entry.price > 0
  );
}

/**
 * Turns the raw price feed into a token list. Entries without a valid price
 * are dropped. When a currency appears more than once, the newest entry wins.
 */
export function parseTokens(data: unknown): Token[] {
  if (!Array.isArray(data)) {
    throw new Error("Price data is not a list");
  }

  const newestByCurrency = new Map<string, PriceEntry>();
  for (const entry of data) {
    if (!isPriceEntry(entry)) continue;
    const current = newestByCurrency.get(entry.currency);
    if (!current || Date.parse(entry.date) >= Date.parse(current.date)) {
      newestByCurrency.set(entry.currency, entry);
    }
  }

  if (newestByCurrency.size < 2) {
    throw new Error("Price data has fewer than two tokens");
  }

  return [...newestByCurrency.values()]
    .map(({ currency, price }) => ({ symbol: currency, price }))
    .sort((a, b) => symbolCollator.compare(a.symbol, b.symbol));
}

export function getTokenIconUrl(symbol: string): string {
  const fileName = ICON_FILE_NAMES.get(symbol) ?? symbol;
  return `${env.tokenIconsUrl}/${encodeURIComponent(fileName)}.svg`;
}

export function filterTokens(tokens: Token[], query: string): Token[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery === "") return tokens;
  return tokens.filter((token) =>
    token.symbol.toLowerCase().includes(normalizedQuery),
  );
}
