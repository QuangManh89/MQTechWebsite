import type { MetadataRoute } from "next";
import { getPublishedPosts, getPublishedServices, getSiteSettings } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, services, posts] = await Promise.all([
    getSiteSettings(),
    getPublishedServices(),
    getPublishedPosts(),
  ]);

  const base =
    (process.env.NEXT_PUBLIC_SITE_URL || settings.siteUrl || "https://suamaytinhbmt.id.vn").replace(
      /\/$/,
      ""
    );

  const staticRoutes = [
    "",
    "/dich-vu",
    "/bang-gia",
    "/dat-lich",
    "/kiem-tra-may-tinh",
    "/tra-cuu",
    "/bai-viet",
    "/gioi-thieu",
    "/lien-he",
  ].map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  const serviceRoutes = services.map((s) => ({
    url: `${base}/dich-vu/${s.slug}`,
    lastModified: new Date(s.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const postRoutes = posts.map((p) => ({
    url: `${base}/bai-viet/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...serviceRoutes, ...postRoutes];
}
