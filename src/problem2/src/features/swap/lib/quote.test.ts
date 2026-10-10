import { describe, expect, it } from "vitest";

import { getQuote, type QuoteInput } from "./quote";

const eth = { symbol: "ETH", price: 2000 };
const usdc = { symbol: "USDC", price: 1 };
const atom = { symbol: "ATOM", price: 3 };

const quoteFor = (input: Partial<QuoteInput>) =>
  getQuote({
    amount: "",
    amountField: "pay",
    payToken: eth,
    receiveToken: usdc,
    ...input,
  });

describe("getQuote", () => {
  it("calculates the receive amount from the pay amount", () => {
    const quote = quoteFor({ amount: "1.5" });

    expect(quote.payAmount).toBe("1.5");
    expect(quote.receiveAmount).toBe("3000");
    expect(quote.payUsd?.toFixed()).toBe("3000");
    expect(quote.receiveUsd?.toFixed()).toBe("3000");
    expect(quote.error).toBeNull();
  });

  it("calculates the pay amount from the receive amount", () => {
    const quote = quoteFor({ amount: "3000", amountField: "receive" });

    expect(quote.payAmount).toBe("1.5");
    expect(quote.receiveAmount).toBe("3000");
    expect(quote.error).toBeNull();
  });

  it("rounds receive down and pay up", () => {
    const receive = quoteFor({
      amount: "1",
      payToken: usdc,
      receiveToken: atom,
    });
    const pay = quoteFor({
      amount: "1",
      amountField: "receive",
      payToken: atom,
      receiveToken: usdc,
    });

    expect(receive.receiveAmount).toBe("0.33333333");
    expect(pay.payAmount).toBe("0.33333334");
  });

  it("gives the rate for one pay token", () => {
    expect(quoteFor({}).rate.toFixed()).toBe("2000");
  });

  it("leaves the other side empty when nothing is typed", () => {
    const quote = quoteFor({ amount: "" });

    expect(quote.receiveAmount).toBe("");
    expect(quote.payUsd).toBeNull();
  });

  it.each([
    ["", "Enter an amount"],
    [".", "Enter an amount"],
    ["0", "Enter an amount greater than 0"],
    ["0.000", "Enter an amount greater than 0"],
  ])("rejects the amount %j", (amount, error) => {
    expect(quoteFor({ amount }).error).toBe(error);
  });

  it("rejects an amount that converts to nothing", () => {
    const quote = quoteFor({
      amount: "0.00000001",
      payToken: usdc,
      receiveToken: eth,
    });

    expect(quote.receiveAmount).toBe("0");
    expect(quote.error).toBe("This amount is too small to swap");
  });

  it("accepts the smallest receive amount because pay is rounded up", () => {
    const quote = quoteFor({
      amount: "0.00000001",
      amountField: "receive",
      payToken: eth,
      receiveToken: usdc,
    });

    expect(quote.payAmount).toBe("0.00000001");
    expect(quote.error).toBeNull();
  });
});
