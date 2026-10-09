import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from "./sum_to_n.js";

const DEFAULT_INPUTS = [5, 100, 1, 0, -3];

const implementations = { sum_to_n_a, sum_to_n_b, sum_to_n_c };

const args = process.argv.slice(2);
const inputs = args.length > 0 ? args : DEFAULT_INPUTS;

for (const input of inputs) {
  const n = Number(input);
  if (!Number.isInteger(n)) {
    console.error(`Skipped "${input}": n must be an integer`);
    continue;
  }
  console.log(`n = ${n}`);
  for (const [name, sumToN] of Object.entries(implementations)) {
    try {
      console.log(`  ${name}: ${sumToN(n)}`);
    } catch (error) {
      console.log(`  ${name}: ${error.name}: ${error.message}`);
    }
  }
}
