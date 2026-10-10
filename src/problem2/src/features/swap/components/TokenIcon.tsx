import { clsx } from "clsx";
import { useState } from "react";

import { getTokenIconUrl } from "../lib/tokens";

interface TokenIconProps {
  symbol: string;
  className?: string;
}

export function TokenIcon({ symbol, className = "size-6" }: TokenIconProps) {
  const [failedSymbol, setFailedSymbol] = useState<string | null>(null);

  if (failedSymbol === symbol) {
    return (
      <span
        role="img"
        aria-label={`${symbol} icon`}
        className={clsx(
          className,
          "inline-flex shrink-0 items-center justify-center rounded-full bg-line text-[0.625rem] font-semibold text-muted",
        )}
      >
        {symbol.slice(0, 1).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={getTokenIconUrl(symbol)}
      alt={`${symbol} icon`}
      loading="lazy"
      className={clsx(className, "shrink-0 rounded-full")}
      onError={() => {
        setFailedSymbol(symbol);
      }}
    />
  );
}
