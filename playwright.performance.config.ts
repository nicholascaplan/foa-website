import { defineConfig } from "@playwright/test";
import config from "./playwright.config";

export default defineConfig({
  ...config,
  testDir: "./tests/diagnostics",
  projects: config.projects?.filter((project) => project.name === "chromium"),
  workers: 1,
  retries: 0,
});
