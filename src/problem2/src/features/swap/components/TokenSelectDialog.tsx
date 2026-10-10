import * as Dialog from "@radix-ui/react-dialog";
import { Check, Search, X } from "lucide-react";
import { type Ref, useRef, useState } from "react";

import { filterTokens } from "../lib/tokens";
import type { Token } from "../types";
import { TokenIcon } from "./TokenIcon";

interface TokenSelectDialogProps {
  open: boolean;
  tokens: Token[];
  selectedSymbol: string;
  onSelect: (token: Token) => void;
  onOpenChange: (open: boolean) => void;
  /** Called after the dialog closes, to put focus back where it came from. */
  onCloseFocus: () => void;
}

export function TokenSelectDialog({
  open,
  tokens,
  selectedSymbol,
  onSelect,
  onOpenChange,
  onCloseFocus,
}: TokenSelectDialogProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content
          data-testid="token-dialog"
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => {
            // Radix would focus the close button. Search is more useful.
            event.preventDefault();
            searchInputRef.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            // Radix has no trigger to return to, because the dialog is
            // opened from state. Without this, focus falls back to <body>.
            event.preventDefault();
            onCloseFocus();
          }}
          className="fixed top-1/2 left-1/2 flex max-h-[min(34rem,85dvh)] w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 flex-col rounded-3xl border border-line bg-surface shadow-xl outline-none"
        >
          <div className="flex items-center justify-between px-5 pt-5">
            <Dialog.Title className="text-lg font-semibold">
              Select a token
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close"
              className="-mr-1 rounded-full p-1 text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
            >
              <X aria-hidden="true" className="size-5" />
            </Dialog.Close>
          </div>
          <TokenList
            tokens={tokens}
            selectedSymbol={selectedSymbol}
            searchInputRef={searchInputRef}
            onSelect={onSelect}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface TokenListProps {
  tokens: Token[];
  selectedSymbol: string;
  searchInputRef: Ref<HTMLInputElement>;
  onSelect: (token: Token) => void;
}

function TokenList({
  tokens,
  selectedSymbol,
  searchInputRef,
  onSelect,
}: TokenListProps) {
  const [query, setQuery] = useState("");
  const matches = filterTokens(tokens, query);

  return (
    <>
      <form
        className="px-5 py-4"
        onSubmit={(event) => {
          event.preventDefault();
          const [firstMatch] = matches;
          if (query.trim() !== "" && firstMatch) onSelect(firstMatch);
        }}
      >
        <label className="flex items-center gap-2 rounded-xl bg-panel px-3 py-2.5 -outline-offset-1 outline-accent focus-within:outline-2">
          <Search aria-hidden="true" className="size-4 shrink-0 text-muted" />
          <span className="sr-only">Search tokens</span>
          <input
            ref={searchInputRef}
            data-testid="token-search-input"
            type="search"
            autoComplete="off"
            placeholder="Search tokens"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            className="w-full min-w-0 bg-transparent outline-none placeholder:text-muted"
          />
        </label>
      </form>

      {matches.length === 0 ? (
        <p
          data-testid="token-list-empty"
          role="status"
          className="px-5 pb-8 text-center text-sm text-muted"
        >
          No token matches “{query.trim()}”.
        </p>
      ) : (
        <ul className="overflow-y-auto px-2 pb-3">
          {matches.map((token) => {
            const isSelected = token.symbol === selectedSymbol;
            return (
              <li key={token.symbol}>
                <button
                  type="button"
                  data-testid={`token-option-${token.symbol}`}
                  aria-current={isSelected ? "true" : undefined}
                  onClick={() => {
                    onSelect(token);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left -outline-offset-2 hover:bg-panel focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <TokenIcon symbol={token.symbol} className="size-8" />
                  <span className="flex-1 font-medium">{token.symbol}</span>
                  {isSelected && (
                    <Check aria-hidden="true" className="size-4 text-accent" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
