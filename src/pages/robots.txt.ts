import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL("https://example.com");
  const sitemapPath = `${import.meta.env.BASE_URL}sitemap-index.xml`.replace(/\/+/g, "/");
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL(sitemapPath, base).href}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
