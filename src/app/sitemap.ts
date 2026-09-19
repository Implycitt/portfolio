import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://quentinb.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: SITE_URL, lastModified, priority: 1 },
    { url: `${SITE_URL}/projects`, lastModified, priority: 0.9 },
    { url: `${SITE_URL}/resume`, lastModified, priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified, priority: 0.7 },
  ];
}
