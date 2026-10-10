import BigNumber from "bignumber.js";
import { describe, expect, it } from "vitest";

import {
  convertAmount,
  formatAmount,
  formatRate,
  formatUsd,
  parseAmount,
  toInputValue,
} from "./amount";

describe("parseAmount", () => {
  it("parses a decimal string", () => {
    expect(parseAmount("0.5")?.toFixed()).toBe("0.5");
    expect(parseAmount(".5")?.toFixed()).toBe("0.5");
    expect(parseAmount("5.")?.toFixed()).toBe("5");
  });

  it("returns null when there is no number yet", () => {
    expect(parseAmount("")).toBeNull();
    expect(parseAmount(".")).toBeNull();
  });
});

describe("convertAmount", () => {
  const eth = { symbol: "ETH", price: 2000 };
  const usdc = { symbol: "USDC", price: 1 };

  it("converts through the USD price of both tokens", () => {
    expect(convertAmount(new BigNumber("1.5"), eth, usdc).toFixed()).toBe(
      "3000",
    );
    expect(convertAmount(new BigNumber("3000"), usdc, eth).toFixed()).toBe(
      "1.5",
    );
  });

  it("has no floating point drift", () => {
    const a = { symbol: "A", price: 0.1 };
    const b = { symbol: "B", price: 0.3 };

    expect(convertAmount(new BigNumber("3"), a, b).toFixed()).toBe("1");
  });
});

describe("toInputValue", () => {
  it("cuts to 8 decimals in the given direction", () => {
    const third = new BigNumber(1).div(3);

    expect(toInputValue(third, BigNumber.ROUND_DOWN)).toBe("0.33333333");
    expect(toInputValue(third, BigNumber.ROUND_UP)).toBe("0.33333334");
  });

  it("never uses exponent notation", () => {
    expect(
      toInputValue(new BigNumber("0.00000012"), BigNumber.ROUND_DOWN),
    ).toBe("0.00000012");
    expect(toInputValue(new BigNumber("1e21"), BigNumber.ROUND_DOWN)).toBe(
      "1000000000000000000000",
    );
  });
});

describe("formatters", () => {
  it("formats USD values", () => {
    expect(formatUsd(new BigNumber("1234.5"))).toBe("$1,234.50");
    expect(formatUsd(new BigNumber("0.004"))).toBe("<$0.01");
    expect(formatUsd(new BigNumber(0))).toBe("$0.00");
  });

  it("formats a rate to 6 significant digits", () => {
    expect(formatRate(new BigNumber("26002.82202"))).toBe("26,002.8");
    expect(formatRate(new BigNumber("0.000601234567"))).toBe("0.000601235");
  });

  it("groups thousands and keeps every decimal of an amount", () => {
    expect(formatAmount(new BigNumber("1234567.12345678"))).toBe(
      "1,234,567.12345678",
    );
    expect(formatAmount(new BigNumber("3000"))).toBe("3,000");
  });
});
