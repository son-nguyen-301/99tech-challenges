# Problem 2: Fancy Form

A currency swap form. Pick two tokens, type an amount on either side, and the other side is calculated from token prices that load when the page opens.

Built with React, TypeScript, Vite and Tailwind CSS.

## Run it

Needs Node.js 22.12 or newer and pnpm 9.

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Then open http://localhost:5173.

## Scripts

| Script           | What it does                                            |
| ---------------- | ------------------------------------------------------- |
| `pnpm dev`       | Start the dev server                                    |
| `pnpm build`     | Type-check and build for production                     |
| `pnpm preview`   | Serve the production build                              |
| `pnpm lint`      | Run ESLint                                              |
| `pnpm format`    | Format all files with Prettier                          |
| `pnpm typecheck` | Run the TypeScript compiler without output              |
| `pnpm test`      | Run unit tests                                          |
| `pnpm test:e2e`  | Run end-to-end tests                                    |
| `pnpm check`     | Format check, lint, type-check and unit tests in one go |

The end-to-end tests need a browser once: `pnpm exec playwright install chromium`.
