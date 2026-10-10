import { describe, expect, it } from "vitest";

import {
  createInitialState,
  swapFormReducer,
  type SwapFormState,
} from "./swapFormReducer";

const atom = { symbol: "ATOM", price: 8 };
const eth = { symbol: "ETH", price: 2000 };
const usdc = { symbol: "USDC", price: 1 };
const wbtc = { symbol: "WBTC", price: 40000 };

const state: SwapFormState = {
  payToken: eth,
  receiveToken: usdc,
  amount: "1.5",
  amountField: "pay",
  showErrors: false,
};

describe("createInitialState", () => {
  it("starts with ETH to USDC when both exist", () => {
    const initial = createInitialState([atom, eth, usdc, wbtc]);

    expect(initial.payToken).toBe(eth);
    expect(initial.receiveToken).toBe(usdc);
    expect(initial.amount).toBe("");
  });

  it("falls back to the first two tokens", () => {
    const initial = createInitialState([atom, wbtc]);

    expect(initial.payToken).toBe(atom);
    expect(initial.receiveToken).toBe(wbtc);
  });

  it("throws when there are fewer than two tokens", () => {
    expect(() => createInitialState([eth])).toThrow();
  });
});

describe("swapFormReducer", () => {
  it("stores the typed amount and which side it was typed in", () => {
    const next = swapFormReducer(state, {
      type: "amountChanged",
      field: "receive",
      value: "42",
    });

    expect(next.amount).toBe("42");
    expect(next.amountField).toBe("receive");
  });

  it("changes the token on the selected side", () => {
    const next = swapFormReducer(state, {
      type: "tokenSelected",
      field: "receive",
      token: wbtc,
    });

    expect(next.payToken).toBe(eth);
    expect(next.receiveToken).toBe(wbtc);
  });

  it("flips the sides when the other side's token is selected", () => {
    const next = swapFormReducer(state, {
      type: "tokenSelected",
      field: "pay",
      token: usdc,
    });

    expect(next).toEqual(swapFormReducer(state, { type: "tokensFlipped" }));
  });

  it("flips the tokens and moves the typed amount with its token", () => {
    const next = swapFormReducer(state, { type: "tokensFlipped" });

    expect(next.payToken).toBe(usdc);
    expect(next.receiveToken).toBe(eth);
    expect(next.amount).toBe("1.5");
    expect(next.amountField).toBe("receive");
  });

  it("shows errors after a failed validation and clears the form after a swap", () => {
    const failed = swapFormReducer(state, { type: "validationFailed" });
    expect(failed.showErrors).toBe(true);

    const done = swapFormReducer(failed, { type: "swapSucceeded" });
    expect(done).toMatchObject({
      amount: "",
      amountField: "pay",
      showErrors: false,
    });
    expect(done.payToken).toBe(eth);
  });
});
