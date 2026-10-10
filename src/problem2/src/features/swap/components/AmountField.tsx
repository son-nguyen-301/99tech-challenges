import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";
import type { Ref } from "react";
import { NumericFormat } from "react-number-format";

import { MAX_DECIMALS } from "../lib/amount";
import type { SwapField, Token } from "../types";
import { TokenIcon } from "./TokenIcon";

const MAX_INPUT_LENGTH = 24;

interface AmountFieldProps {
  field: SwapField;
  label: string;
  value: string;
  token: Token;
  usdValue: string | null;
  error?: string | null;
  busy?: boolean;
  inputRef?: Ref<HTMLInputElement>;
  tokenButtonRef?: Ref<HTMLButtonElement>;
  onValueChange: (value: string) => void;
  onTokenClick: () => void;
}

export function AmountField({
  field,
  label,
  value,
  token,
  usdValue,
  error = null,
  busy = false,
  inputRef,
  tokenButtonRef,
  onValueChange,
  onTokenClick,
}: AmountFieldProps) {
  const inputId = `${field}-amount`;
  const errorId = `${inputId}-error`;

  return (
    <div
      className={clsx(
        "rounded-2xl border bg-panel p-4 -outline-offset-1 focus-within:outline-2",
        error
          ? "border-danger outline-danger"
          : "border-transparent outline-accent",
      )}
    >
      <label htmlFor={inputId} className="text-sm text-muted">
        {label}
      </label>

      <div className="mt-1 flex items-center gap-3">
        {/* readOnly instead of disabled while busy, so the input keeps focus. */}
        <NumericFormat
          getInputRef={inputRef}
          id={inputId}
          data-testid={`${field}-amount-input`}
          value={value}
          valueIsNumericString
          allowNegative={false}
          decimalScale={MAX_DECIMALS}
          allowedDecimalSeparators={[","]}
          inputMode="decimal"
          autoComplete="off"
          placeholder="0"
          maxLength={MAX_INPUT_LENGTH}
          readOnly={busy}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          onValueChange={(values, { event }) => {
            // No event means the value was set by the form, not typed.
            if (event) onValueChange(values.value);
          }}
          className="w-full min-w-0 truncate bg-transparent text-2xl font-medium tabular-nums outline-none placeholder:text-muted/60 sm:text-3xl"
        />

        <button
          ref={tokenButtonRef}
          type="button"
          data-testid={`${field}-token-button`}
          disabled={busy}
          aria-haspopup="dialog"
          aria-label={`${label} token: ${token.symbol}. Change token`}
          onClick={onTokenClick}
          className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface py-1.5 pr-2 pl-1.5 font-medium shadow-xs transition-colors hover:border-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
        >
          <TokenIcon symbol={token.symbol} />
          {token.symbol}
          <ChevronDown aria-hidden="true" className="size-4 text-muted" />
        </button>
      </div>

      <div className="mt-1 min-h-5 text-sm">
        {error ? (
          <p
            id={errorId}
            data-testid={`${field}-amount-error`}
            className="text-danger"
          >
            {error}
          </p>
        ) : (
          <p
            data-testid={`${field}-usd-value`}
            className="truncate text-muted tabular-nums"
          >
            {usdValue ?? "$0.00"}
          </p>
        )}
      </div>
    </div>
  );
}
