import { useMutation } from "@tanstack/react-query";
import { useReducer, useRef } from "react";

import { submitSwap } from "../api/swap";
import { getQuote } from "../lib/quote";
import { createInitialState, swapFormReducer } from "../lib/swapFormReducer";
import type { SwapField, Token } from "../types";

export function useSwapForm(tokens: Token[]) {
  const [state, dispatch] = useReducer(
    swapFormReducer,
    tokens,
    createInitialState,
  );
  const quote = getQuote(state);
  // isPending only changes on the next render, so it cannot stop two submits
  // in the same tick. This flag is set right away.
  const isSubmittingRef = useRef(false);

  const swap = useMutation({
    mutationFn: submitSwap,
    // React Query pauses mutations while offline and runs them later.
    // A swap at an old price must fail right away instead.
    networkMode: "always",
    onSuccess: () => {
      dispatch({ type: "swapSucceeded" });
    },
  });

  // A result message only describes the last attempt, so any edit clears it.
  const clearResult = () => {
    if (!swap.isIdle) swap.reset();
  };

  const changeAmount = (field: SwapField, value: string) => {
    clearResult();
    dispatch({ type: "amountChanged", field, value });
  };

  const selectToken = (field: SwapField, token: Token) => {
    clearResult();
    dispatch({ type: "tokenSelected", field, token });
  };

  const flipTokens = () => {
    clearResult();
    dispatch({ type: "tokensFlipped" });
  };

  /** Returns false when validation failed, so the caller can focus the field. */
  const submit = (): boolean => {
    if (isSubmittingRef.current) return true;
    if (quote.error || !quote.pay || !quote.receive) {
      clearResult();
      dispatch({ type: "validationFailed" });
      return false;
    }
    isSubmittingRef.current = true;
    swap.mutate(
      {
        payToken: state.payToken.symbol,
        receiveToken: state.receiveToken.symbol,
        payAmount: quote.pay.toFixed(),
        receiveAmount: quote.receive.toFixed(),
      },
      {
        onSettled: () => {
          isSubmittingRef.current = false;
        },
      },
    );
    return true;
  };

  return {
    state,
    quote,
    visibleError: state.showErrors ? quote.error : null,
    isSubmitting: swap.isPending,
    receipt: swap.data,
    submitError: swap.error,
    changeAmount,
    selectToken,
    flipTokens,
    submit,
  };
}
