import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/dev",
  fullyParallel: true,
  workers: 2,
  use: {
    baseURL: "http://127.0.0.1:4348",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium-dev", use: { ...devices["Desktop Chrome"], channel: "chrome" } }],
  webServer: {
    command: "npx astro dev --ignore-lock --host 127.0.0.1 --port 4348",
    url: "http://127.0.0.1:4348",
    reuseExistingServer: false,
  },
});
