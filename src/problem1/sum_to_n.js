// Largest n whose sum, n(n + 1) / 2, still fits in Number.MAX_SAFE_INTEGER
const MAX_N = 134217727;

const assertSafeResult = (n) => {
  if (n > MAX_N) {
    throw new RangeError(
      `n must be at most ${MAX_N}, or the sum goes past Number.MAX_SAFE_INTEGER`,
    );
  }
};

// Arithmetic series formula
const sum_to_n_a = function (n) {
  assertSafeResult(n);
  if (n < 1) return 0;
  return n % 2 === 0 ? (n / 2) * (n + 1) : n * ((n + 1) / 2);
};

// Iterative loop
const sum_to_n_b = function (n) {
  assertSafeResult(n);
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

// Divide and conquer recursion
const sum_to_n_c = function (n) {
  assertSafeResult(n);
  const sumRange = (from, to) => {
    if (from > to) return 0;
    if (from === to) return from;
    const middle = Math.floor((from + to) / 2);
    return sumRange(from, middle) + sumRange(middle + 1, to);
  };
  return sumRange(1, n);
};

export { sum_to_n_a, sum_to_n_b, sum_to_n_c };
