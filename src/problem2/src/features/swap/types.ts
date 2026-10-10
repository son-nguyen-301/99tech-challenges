export interface Token {
  symbol: string;
  /** Price of one token in USD. */
  price: number;
}

export type SwapField = "pay" | "receive";
