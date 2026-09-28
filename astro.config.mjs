import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  output: "static",
  site: process.env.SITE_URL || "https://example.com",
  base: process.env.BASE_PATH || "/",
  publicDir: "./assets",
  integrations: [sitemap()],
});
