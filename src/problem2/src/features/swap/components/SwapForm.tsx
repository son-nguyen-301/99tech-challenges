import { ArrowDownUp, CircleCheck, LoaderCircle } from "lucide-react";
import { type SubmitEvent, useRef, useState } from "react";

import { useSwapForm } from "../hooks/useSwapForm";
import {
  formatAmount,
  formatRate,
  formatUsd,
  parseAmount,
} from "../lib/amount";
import type { SwapField, Token } from "../types";
import { AmountField } from "./AmountField";
import { TokenSelectDialog } from "./TokenSelectDialog";

interface SwapFormProps {
  tokens: Token[];
}

export function SwapForm({ tokens }: SwapFormProps) {
  const form = useSwapForm(tokens);
  const { state, quote, receipt } = form;
  const [selectingField, setSelectingField] = useState<SwapField | null>(null);
  const payInputRef = useRef<HTMLInputElement>(null);
  const receiveInputRef = useRef<HTMLInputElement>(null);
  const payTokenButtonRef = useRef<HTMLButtonElement>(null);
  const receiveTokenButtonRef = useRef<HTMLButtonElement>(null);
  const lastSelectingFieldRef = useRef<SwapField>("pay");

  const openTokenDialog = (field: SwapField) => {
    lastSelectingFieldRef.current = field;
    setSelectingField(field);
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.submit()) {
      const invalidInput =
        state.amountField === "pay" ? payInputRef : receiveInputRef;
      invalidInput.current?.focus();
    }
  };

  const errorFor = (field: SwapField) =>
    state.amountField === field ? form.visibleError : null;

  return (
    <>
      <form data-testid="swap-form" noValidate onSubmit={handleSubmit}>
        <div className="isolate flex flex-col gap-1.5">
          <AmountField
            field="pay"
            label="You pay"
            inputRef={payInputRef}
            tokenButtonRef={payTokenButtonRef}
            value={quote.payAmount}
            token={state.payToken}
            usdValue={quote.payUsd && formatUsd(quote.payUsd)}
            error={errorFor("pay")}
            busy={form.isSubmitting}
            onValueChange={(value) => {
              form.changeAmount("pay", value);
            }}
            onTokenClick={() => {
              openTokenDialog("pay");
            }}
          />

          <div className="relative z-10 -my-5 flex justify-center">
            <button
              type="button"
              data-testid="switch-tokens-button"
              aria-label="Switch pay and receive tokens"
              disabled={form.isSubmitting}
              onClick={form.flipTokens}
              className="rounded-xl border-4 border-surface bg-surface p-2 text-muted transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-60"
            >
              <ArrowDownUp aria-hidden="true" className="size-4" />
            </button>
          </div>

          <AmountField
            field="receive"
            label="You receive"
            inputRef={receiveInputRef}
            tokenButtonRef={receiveTokenButtonRef}
            value={quote.receiveAmount}
            token={state.receiveToken}
            usdValue={quote.receiveUsd && formatUsd(quote.receiveUsd)}
            error={errorFor("receive")}
            busy={form.isSubmitting}
            onValueChange={(value) => {
              form.changeAmount("receive", value);
            }}
            onTokenClick={() => {
              openTokenDialog("receive");
            }}
          />
        </div>

        <p
          data-testid="exchange-rate"
          className="mt-3 px-1 text-sm text-muted tabular-nums"
        >
          1 {state.payToken.symbol} = {formatRate(quote.rate)}{" "}
          {state.receiveToken.symbol}
        </p>

        {/* aria-disabled instead of disabled, so the button keeps focus. */}
        <button
          type="submit"
          data-testid="submit-button"
          aria-disabled={form.isSubmitting}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3.5 text-lg font-semibold text-on-accent transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-disabled:cursor-progress aria-disabled:opacity-80"
        >
          {form.isSubmitting ? (
            <>
              <LoaderCircle
                aria-hidden="true"
                className="size-5 animate-spin motion-reduce:hidden"
              />
              Swapping…
            </>
          ) : (
            "Swap"
          )}
        </button>

        {/* Always rendered with a fixed height: screen readers only announce
            a status region that exists before its text, and the card does
            not change size when a message shows. */}
        <div className="mt-3 min-h-5 px-1 text-sm">
          <div role="status">
            {receipt && (
              <p
                data-testid="swap-success"
                className="flex items-start gap-2 text-accent"
              >
                <CircleCheck
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0"
                />
                <span>
                  Swapped {formatReceiptAmount(receipt.payAmount)}{" "}
                  {receipt.payToken} for{" "}
                  {formatReceiptAmount(receipt.receiveAmount)}{" "}
                  {receipt.receiveToken}.
                </span>
              </p>
            )}
          </div>
          {form.submitError && (
            <p data-testid="swap-error" role="alert" className="text-danger">
              The swap did not go through. Nothing was sent. Try again.
            </p>
          )}
        </div>
      </form>

      <TokenSelectDialog
        open={selectingField !== null}
        tokens={tokens}
        selectedSymbol={
          selectingField === "receive"
            ? state.receiveToken.symbol
            : state.payToken.symbol
        }
        onSelect={(token) => {
          if (selectingField) form.selectToken(selectingField, token);
          setSelectingField(null);
        }}
        onOpenChange={(open) => {
          if (!open) setSelectingField(null);
        }}
        onCloseFocus={() => {
          const tokenButton =
            lastSelectingFieldRef.current === "pay"
              ? payTokenButtonRef
              : receiveTokenButtonRef;
          tokenButton.current?.focus();
        }}
      />
    </>
  );
}

function formatReceiptAmount(amount: string): string {
  const parsed = parseAmount(amount);
  return parsed ? formatAmount(parsed) : amount;
}
