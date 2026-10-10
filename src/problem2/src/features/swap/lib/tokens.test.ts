import { describe, expect, it } from "vitest";

import { filterTokens, getTokenIconUrl, parseTokens } from "./tokens";

const entry = (
  currency: string,
  price: unknown,
  date = "2023-08-29T07:10:40.000Z",
) => ({
  currency,
  date,
  price,
});

describe("parseTokens", () => {
  it("returns tokens sorted by symbol, ignoring letter case", () => {
    const tokens = parseTokens([
      entry("USDC", 1),
      entry("bNEO", 7),
      entry("ETH", 2000),
    ]);

    expect(tokens).toEqual([
      { symbol: "bNEO", price: 7 },
      { symbol: "ETH", price: 2000 },
      { symbol: "USDC", price: 1 },
    ]);
  });

  it("keeps the newest price when a currency appears more than once", () => {
    const tokens = parseTokens([
      entry("USDC", 1.01, "2023-08-29T07:10:50.000Z"),
      entry("USDC", 0.99, "2023-08-29T07:10:30.000Z"),
      entry("ETH", 2000),
    ]);

    expect(tokens).toContainEqual({ symbol: "USDC", price: 1.01 });
  });

  it("keeps the last entry when two share the same date", () => {
    const tokens = parseTokens([
      entry("USDC", 0.98),
      entry("USDC", 1),
      entry("ETH", 2000),
    ]);

    expect(tokens).toContainEqual({ symbol: "USDC", price: 1 });
  });

  it("drops entries without a usable price", () => {
    const tokens = parseTokens([
      entry("ETH", 2000),
      entry("USDC", 1),
      entry("ZERO", 0),
      entry("TEXT", "12"),
      { currency: "NOPRICE", date: "2023-08-29T07:10:40.000Z" },
      null,
    ]);

    expect(tokens.map((token) => token.symbol)).toEqual(["ETH", "USDC"]);
  });

  it("throws when the data is not a list", () => {
    expect(() => parseTokens({ error: "nope" })).toThrow("not a list");
  });

  it("throws when fewer than two tokens are usable", () => {
    expect(() => parseTokens([entry("ETH", 2000)])).toThrow("fewer than two");
  });
});

describe("getTokenIconUrl", () => {
  it("uses the symbol as the file name", () => {
    expect(getTokenIconUrl("ETH")).toMatch(/\/tokens\/ETH\.svg$/);
  });

  it("maps symbols whose icon file uses different casing", () => {
    expect(getTokenIconUrl("STATOM")).toMatch(/\/tokens\/stATOM\.svg$/);
  });
});

describe("filterTokens", () => {
  const tokens = [
    { symbol: "ETH", price: 2000 },
    { symbol: "wstETH", price: 2200 },
    { symbol: "USDC", price: 1 },
  ];

  it("matches part of the symbol in any letter case", () => {
    expect(filterTokens(tokens, " eth ").map((token) => token.symbol)).toEqual([
      "ETH",
      "wstETH",
    ]);
  });

  it("returns every token for an empty search", () => {
    expect(filterTokens(tokens, "  ")).toEqual(tokens);
  });
});
