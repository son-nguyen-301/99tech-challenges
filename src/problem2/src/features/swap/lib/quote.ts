import BigNumber from "bignumber.js";

import type { SwapField, Token } from "../types";
import { convertAmount, parseAmount, toInputValue, toUsd } from "./amount";

export interface QuoteInput {
  amount: string;
  amountField: SwapField;
  payToken: Token;
  receiveToken: Token;
}

export interface Quote {
  /** Values for the two inputs. */
  payAmount: string;
  receiveAmount: string;
  pay: BigNumber | null;
  receive: BigNumber | null;
  payUsd: BigNumber | null;
  receiveUsd: BigNumber | null;
  /** Amount of receive token for one pay token. */
  rate: BigNumber;
  error: string | null;
}

/**
 * Works out both sides of the swap from the one amount the user typed.
 * The other side is rounded in the user's disfavour, the way an exchange
 * would: receive is rounded down, pay is rounded up.
 */
export function getQuote({
  amount,
  amountField,
  payToken,
  receiveToken,
}: QuoteInput): Quote {
  const rate = convertAmount(new BigNumber(1), payToken, receiveToken);
  const typed = parseAmount(amount);

  let otherAmount = "";
  if (typed) {
    otherAmount =
      amountField === "pay"
        ? toInputValue(
            convertAmount(typed, payToken, receiveToken),
            BigNumber.ROUND_DOWN,
          )
        : toInputValue(
            convertAmount(typed, receiveToken, payToken),
            BigNumber.ROUND_UP,
          );
  }

  const payAmount = amountField === "pay" ? amount : otherAmount;
  const receiveAmount = amountField === "receive" ? amount : otherAmount;
  const pay = parseAmount(payAmount);
  const receive = parseAmount(receiveAmount);

  return {
    payAmount,
    receiveAmount,
    pay,
    receive,
    payUsd: pay && toUsd(pay, payToken),
    receiveUsd: receive && toUsd(receive, receiveToken),
    rate,
    error: getAmountError(typed, pay, receive),
  };
}

function getAmountError(
  typed: BigNumber | null,
  pay: BigNumber | null,
  receive: BigNumber | null,
): string | null {
  if (!typed) return "Enter an amount";
  if (typed.lte(0)) return "Enter an amount greater than 0";
  if (!pay?.gt(0) || !receive?.gt(0)) return "This amount is too small to swap";
  return null;
}
