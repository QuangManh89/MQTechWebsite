import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings();
  const base =
    (process.env.NEXT_PUBLIC_SITE_URL || settings.siteUrl || "https://suamaytinhbmt.id.vn").replace(
      /\/$/,
      ""
    );

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/admin"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
