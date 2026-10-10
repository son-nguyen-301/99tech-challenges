import BigNumber from "bignumber.js";

import type { Token } from "../types";

export const MAX_DECIMALS = 8;
const USD_DECIMALS = 2;
const RATE_SIGNIFICANT_DIGITS = 6;

// Plain decimals only. BigNumber alone would also accept "1e5" or "Infinity".
const DECIMAL_PATTERN = /^(\d+\.?\d*|\.\d+)$/;

/** Returns null while the text is not a number yet, like "" or ".". */
export function parseAmount(value: string): BigNumber | null {
  return DECIMAL_PATTERN.test(value) ? new BigNumber(value) : null;
}

export function convertAmount(
  amount: BigNumber,
  from: Token,
  to: Token,
): BigNumber {
  return amount.times(from.price).div(to.price);
}

export function toUsd(amount: BigNumber, token: Token): BigNumber {
  return amount.times(token.price);
}

export function toInputValue(
  amount: BigNumber,
  roundingMode: BigNumber.RoundingMode,
): string {
  return amount.decimalPlaces(MAX_DECIMALS, roundingMode).toFixed();
}

export function formatUsd(value: BigNumber): string {
  if (value.gt(0) && value.lt(0.01)) return "<$0.01";
  return `$${value.toFormat(USD_DECIMALS)}`;
}

export function formatRate(value: BigNumber): string {
  return value.precision(RATE_SIGNIFICANT_DIGITS).toFormat();
}

/** Exact amount with thousands separators, for example "1,234.5". */
export function formatAmount(value: BigNumber): string {
  return value.toFormat();
}
