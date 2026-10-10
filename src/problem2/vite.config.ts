import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    include: ["src/**/*.test.ts"],
    env: {
      VITE_PRICES_URL: "https://prices.test/prices.json",
      VITE_TOKEN_ICONS_URL: "https://icons.test/tokens",
    },
  },
});
