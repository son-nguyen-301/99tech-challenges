interface WalletBalance {
  blockchain: string;
  currency: string;
  amount: number;
}

type Props = Omit<BoxProps, "children">;

const UNSUPPORTED_PRIORITY = -99;

const BLOCKCHAIN_PRIORITY = new Map<string, number>([
  ["Osmosis", 100],
  ["Ethereum", 50],
  ["Arbitrum", 30],
  ["Zilliqa", 20],
  ["Neo", 20],
]);

const getPriority = (blockchain: string): number =>
  BLOCKCHAIN_PRIORITY.get(blockchain) ?? UNSUPPORTED_PRIORITY;

const amountFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 6,
});

const WalletPage = (props: Props) => {
  const balances: WalletBalance[] = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo(
    () =>
      balances
        .map((balance) => ({
          balance,
          priority: getPriority(balance.blockchain),
        }))
        .filter(
          ({ balance, priority }) =>
            priority > UNSUPPORTED_PRIORITY && balance.amount > 0,
        )
        .sort((left, right) => right.priority - left.priority)
        .map(({ balance }) => balance),
    [balances],
  );

  return (
    <div {...props}>
      {sortedBalances.map((balance) => (
        <WalletRow
          className={classes.row}
          key={`${balance.blockchain}-${balance.currency}`}
          amount={balance.amount}
          usdValue={(prices[balance.currency] ?? 0) * balance.amount}
          formattedAmount={amountFormatter.format(balance.amount)}
        />
      ))}
    </div>
  );
};
