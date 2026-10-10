import { defineConfig, devices } from "@playwright/test";

import { TEST_ENV } from "./e2e/testEnv";

const PORT = 4273;
const OUT_DIR = "dist-e2e";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${String(PORT)}`,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm exec vite build --outDir ${OUT_DIR} && pnpm exec vite preview --outDir ${OUT_DIR} --port ${String(PORT)} --strictPort`,
    url: `http://localhost:${String(PORT)}`,
    env: TEST_ENV,
    reuseExistingServer: !process.env.CI,
  },
});
