import { useTokens } from "../hooks/useTokens";
import { SwapForm } from "./SwapForm";

export function SwapCard() {
  const { data: tokens, isPending, isError, isFetching, refetch } = useTokens();

  return (
    <section
      aria-labelledby="swap-title"
      className="w-full max-w-md rounded-3xl border border-line bg-surface p-4 shadow-sm sm:p-5"
    >
      <h1 id="swap-title" className="mb-4 px-1 text-xl font-semibold">
        Swap
      </h1>

      {isPending && <SwapFormSkeleton />}

      {isError && (
        <div
          data-testid="prices-error"
          role="alert"
          className="px-1 py-8 text-center"
        >
          <p className="font-medium">Token prices did not load</p>
          <p className="mt-1 text-sm text-muted">
            Check your connection and try again.
          </p>
          <button
            type="button"
            data-testid="prices-retry-button"
            disabled={isFetching}
            onClick={() => void refetch()}
            className="mt-4 rounded-full border border-line px-4 py-2 font-medium hover:border-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60"
          >
            {isFetching ? "Loading…" : "Try again"}
          </button>
        </div>
      )}

      {tokens && <SwapForm tokens={tokens} />}
    </section>
  );
}

function SwapFormSkeleton() {
  return (
    <div
      data-testid="swap-form-skeleton"
      role="status"
      aria-label="Loading token prices"
    >
      <div className="flex animate-pulse flex-col gap-1.5 motion-reduce:animate-none">
        <div className="h-31 rounded-2xl bg-panel" />
        <div className="h-31 rounded-2xl bg-panel" />
        <div className="mt-12 mb-8 h-14 rounded-2xl bg-panel" />
      </div>
    </div>
  );
}
