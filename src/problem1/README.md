# Problem 1: Three ways to sum to n

The three functions are in [`sum_to_n.js`](./sum_to_n.js).

## Run it

Needs Node.js 18 or newer. There is nothing to install.

Run all three functions with a few sample inputs:

```bash
node run.js
```

Run them with your own inputs:

```bash
node run.js 5 100
```

```
n = 5
  sum_to_n_a: 15
  sum_to_n_b: 15
  sum_to_n_c: 15
n = 100
  sum_to_n_a: 5050
  sum_to_n_b: 5050
  sum_to_n_c: 5050
```

`pnpm start` and `pnpm start 5 100` do the same.

The largest input is `134217727`. Above that the sum goes past `Number.MAX_SAFE_INTEGER` and would no longer be exact, so the functions throw a `RangeError`.
