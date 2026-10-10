# Problem 3: Messy React

- [`WalletPage.tsx`](./WalletPage.tsx): the original code, unchanged.
- [`RefactoredWalletPage.tsx`](./RefactoredWalletPage.tsx): the refactored version.
- This file: the computational inefficiencies and anti-patterns found, and how to fix each one.

Imports are assumed to exist in both files, as in the original snippet.

## Computational inefficiencies

### 1. `useMemo` depends on `prices`, which it does not use

<!-- prettier-ignore -->
```ts
const sortedBalances = useMemo(() => {
  ...
}, [balances, prices]);
```

The filter and sort only read `balances`. Prices change often, and every price update throws away the memo and runs the filter and sort again. The memo saves almost nothing.

**Fix:** depend on `[balances]` only.

### 2. `getPriority` is created again on every render

`getPriority` is defined inside the component but uses no props and no state. Each render builds a new function. It is also used inside `useMemo` without being a dependency. If it were added, as the `react-hooks/exhaustive-deps` rule asks, the memo would break on every render.

**Fix:** move it out of the component. The refactor also turns the `switch` into a `Map` lookup.

### 3. `getPriority` runs many times for the same balance

<!-- prettier-ignore -->
```ts
.sort((lhs: WalletBalance, rhs: WalletBalance) => {
  const leftPriority = getPriority(lhs.blockchain);
  const rightPriority = getPriority(rhs.blockchain);
```

The filter calls it once per balance. The sort calls it twice per comparison, which is about `2 * n * log(n)` more calls. The priority of a balance never changes during the sort.

**Fix:** compute the priority once per balance, then filter and sort on that value.

### 4. `formattedBalances` is built on every render and never used

<!-- prettier-ignore -->
```ts
const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
  return {
    ...balance,
    formatted: balance.amount.toFixed()
  }
})
```

This loops over the whole list and creates a new object for every balance on every render. It sits outside the memo. Then `rows` is built from `sortedBalances`, so the result is thrown away.

**Fix:** remove it. Format the amount in the same pass that renders the row.

### 5. Every row is rendered again on every update

`rows` is rebuilt on each render, and every `WalletRow` renders again even when its own values did not change. With index keys, React also cannot match old rows to new rows after the order changes, so it updates more DOM than needed.

**Fix:** use stable keys. With stable keys, `WalletRow` can be wrapped in `React.memo`, and then only the rows whose price changed render again.

## Anti-patterns

### 6. Array index as `key`

<!-- prettier-ignore -->
```tsx
key={index}
```

The list is filtered and sorted, so the same index can mean a different balance after an update. React then reuses the wrong row. This costs extra work and can mix up state inside rows.

**Fix:** a stable and unique key. The refactor uses `blockchain` plus `currency`.

### 7. Derived data kept in a second list

`formatted` is derived from `amount`. The code builds a second list to hold it, then reads from the first list:

<!-- prettier-ignore -->
```tsx
const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
  ...
  formattedAmount={balance.formatted}
```

`sortedBalances` has no `formatted` field, so every row gets `undefined`. The type annotation on the callback is wrong and hides the mistake from the reader.

**Fix:** do not store derived values. Compute `formattedAmount` where it is used.

### 8. A pure helper and constants inside the component

`getPriority` and the priority values do not belong to a render. Keeping them inside the component mixes business rules with rendering and causes issue 2. The value `-99` is a magic number used in two places.

**Fix:** module-level `BLOCKCHAIN_PRIORITY`, `UNSUPPORTED_PRIORITY` and `getPriority`.

### 9. `any` and types that do not match the data

- `getPriority(blockchain: any)` turns off type checking for the argument.
- `WalletBalance` has no `blockchain` field, but the code reads `balance.blockchain`.
- `FormattedWalletBalance` repeats the fields of `WalletBalance`. It should extend it. After the refactor it is not needed.

**Fix:** add `blockchain: string` to `WalletBalance` and type the parameter as `string`.

### 10. Props typed twice, and an empty interface

<!-- prettier-ignore -->
```tsx
interface Props extends BoxProps {

}
const WalletPage: React.FC<Props> = (props: Props) => {
```

`React.FC<Props>` and `(props: Props)` say the same thing. The empty interface adds nothing over `BoxProps`.

**Fix:** a type alias and one annotation.

### 11. `children` is taken out and never rendered

<!-- prettier-ignore -->
```ts
const { children, ...rest } = props;
```

A caller can pass children and nothing shows up, with no warning.

**Fix:** remove `children` from the props type with `Omit<BoxProps, "children">`, so passing it is a compile error.

### 12. The sort comparator does not return a value for equal priorities

<!-- prettier-ignore -->
```ts
if (leftPriority > rightPriority) {
  return -1;
} else if (rightPriority > leftPriority) {
  return 1;
}
```

For equal priorities (Zilliqa and Neo are both 20) it returns `undefined`. JavaScript treats that as 0, so it works by accident.

**Fix:** `right.priority - left.priority`.

### 13. Values are not guarded before they are shown

- `prices[balance.currency] * balance.amount` is `NaN` when a currency has no price.
- `balance.amount.toFixed()` rounds to 0 decimals, so `0.4` shows as `0`.

**Fix:** fall back with `prices[balance.currency] ?? 0`, and format with an explicit number of decimals.

## Bugs fixed on the way

These are not about performance or patterns, but the component cannot work without fixing them.

- **`lhsPriority` is not defined.** The filter computes `balancePriority` and then reads `lhsPriority`. This throws a `ReferenceError`.
- **The filter is inverted.** It keeps balances with `amount <= 0` and drops the ones with funds. The refactor keeps balances with `amount > 0` on supported blockchains. This is an assumption about the intent.

## Before and after

| Before | After |
| --- | --- |
| Filter and sort run again on every price update | Run only when balances change |
| `getPriority` called about `n + 2n·log(n)` times | Called `n` times |
| 2 passes over the list outside the memo, one unused | 1 pass |
| `key={index}` | `key` from `blockchain` and `currency` |
| Helper re-created on every render | Defined once at module level |
