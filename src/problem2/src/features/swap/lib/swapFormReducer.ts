import type { SwapField, Token } from "../types";

export interface SwapFormState {
  payToken: Token;
  receiveToken: Token;
  /** The amount the user typed. The other side is always calculated. */
  amount: string;
  amountField: SwapField;
  showErrors: boolean;
}

export type SwapFormAction =
  | { type: "amountChanged"; field: SwapField; value: string }
  | { type: "tokenSelected"; field: SwapField; token: Token }
  | { type: "tokensFlipped" }
  | { type: "validationFailed" }
  | { type: "swapSucceeded" };

const DEFAULT_PAY_SYMBOL = "ETH";
const DEFAULT_RECEIVE_SYMBOL = "USDC";

export function createInitialState(tokens: Token[]): SwapFormState {
  const payToken =
    tokens.find((token) => token.symbol === DEFAULT_PAY_SYMBOL) ?? tokens[0];
  const otherTokens = tokens.filter(
    (token) => token.symbol !== payToken?.symbol,
  );
  const receiveToken =
    otherTokens.find((token) => token.symbol === DEFAULT_RECEIVE_SYMBOL) ??
    otherTokens[0];

  if (!payToken || !receiveToken) {
    throw new Error("At least two tokens are needed to swap");
  }

  return {
    payToken,
    receiveToken,
    amount: "",
    amountField: "pay",
    showErrors: false,
  };
}

// The typed amount stays with its token, so it moves to the other side.
function flipSides(state: SwapFormState): SwapFormState {
  return {
    ...state,
    payToken: state.receiveToken,
    receiveToken: state.payToken,
    amountField: state.amountField === "pay" ? "receive" : "pay",
  };
}

export function swapFormReducer(
  state: SwapFormState,
  action: SwapFormAction,
): SwapFormState {
  switch (action.type) {
    case "amountChanged":
      return { ...state, amount: action.value, amountField: action.field };

    case "tokenSelected": {
      const otherToken =
        action.field === "pay" ? state.receiveToken : state.payToken;
      // Picking the token that is already on the other side flips the two.
      if (action.token.symbol === otherToken.symbol) {
        return flipSides(state);
      }
      return action.field === "pay"
        ? { ...state, payToken: action.token }
        : { ...state, receiveToken: action.token };
    }

    case "tokensFlipped":
      return flipSides(state);

    case "validationFailed":
      return { ...state, showErrors: true };

    case "swapSucceeded":
      return { ...state, amount: "", amountField: "pay", showErrors: false };
  }
}
