import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// Open to every crawler, AI answer engines included (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…)
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://m4milaad.tech/sitemap.xml",
    host: "https://m4milaad.tech",
  };
}
