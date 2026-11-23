import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: "https://m4milaad.tech/", lastModified, changeFrequency: "monthly", priority: 1 },
    { url: "https://m4milaad.tech/llms.txt", lastModified, changeFrequency: "monthly", priority: 0.5 },
    { url: "https://m4milaad.tech/Images/Milad%20Ajaz%20Bhat%20Resume.pdf", lastModified, changeFrequency: "monthly", priority: 0.6 },
  ];
}
