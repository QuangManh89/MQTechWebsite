import type { MetadataRoute } from "next";
import { articleRepo } from "@/lib/db/article-repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://mqcomputech.com";
  const now = new Date().toISOString();

  let articleEntries: MetadataRoute.Sitemap = [];
  try {
    const { items } = await articleRepo.listPublishedArticles({ pageSize: 100 });
    articleEntries = items.map((art) => ({
      url: `${baseUrl}/cam-nang/${art.slug}`,
      lastModified: art.updatedAt.toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // Fallback if db is unavailable during sitemap generation
  }

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/cam-nang`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...articleEntries,
    {
      url: `${baseUrl}/device-test`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/device-test/ban-phim`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/device-test/man-hinh`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/device-test/loa`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/device-test/micro`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/device-test/camera`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/device-test/benchmark`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
