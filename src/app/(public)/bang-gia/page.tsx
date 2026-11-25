import type { Metadata } from "next";
import { getActivePricing, getSiteSettings } from "@/lib/site-data";
import { PricingTabs } from "@/components/pricing/PricingTabs";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bảng Giá Sửa Máy Tính, Laptop, MacBook & Vệ Sinh BMT",
  description:
    "Bảng giá niêm yết công khai dịch vụ sửa Laptop, MacBook, Build PC, vệ sinh tra keo và sửa máy tính tại nhà Buôn Ma Thuột.",
  alternates: {
    canonical: "https://suamaytinhbmt.id.vn/bang-gia",
  },
  openGraph: {
    url: "https://suamaytinhbmt.id.vn/bang-gia",
    type: "website",
    locale: "vi_VN",
    siteName: "MQTech - Computer Service",
    title: "Bảng Giá Sửa Máy Tính, Laptop, MacBook & Vệ Sinh BMT",
    description:
      "Bảng giá niêm yết công khai dịch vụ sửa Laptop, MacBook, Build PC, vệ sinh tra keo và sửa máy tính tại nhà Buôn Ma Thuột.",
    images: [{ url: "/brand/og-banner.png", width: 1200, height: 630 }],
  },
};

export default async function PricingPage() {
  const [items, settings] = await Promise.all([
    getActivePricing(),
    getSiteSettings(),
  ]);

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    settings.siteUrl ||
    "https://suamaytinhbmt.id.vn"
  ).replace(/\/$/, "");

  const offerCatalogJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteUrl}/#localbusiness`,
    name: settings.brandName,
    url: siteUrl,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Bảng giá sửa máy tính, Laptop, MacBook & Vệ sinh BMT",
      description:
        "Bảng giá niêm yết công khai dịch vụ sửa Laptop, MacBook, Build PC, vệ sinh tra keo và sửa máy tính tại nhà Buôn Ma Thuột.",
      url: `${siteUrl}/bang-gia`,
      itemListElement: items.map((item) => {
        const details = [
          settings.showExactPrices ? item.priceText?.trim() : "Liên hệ báo giá",
          item.duration?.trim() ? `Thời gian: ${item.duration.trim()}` : "",
          item.warranty?.trim() ? `Bảo hành: ${item.warranty.trim()}` : "",
        ].filter(Boolean);

        return {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: item.serviceName,
          },
          ...(details.length > 0 ? { description: details.join(" • ") } : {}),
        };
      }),
    },
  };

  return (
    <div className="bg-surface">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(offerCatalogJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <section className="border-b border-line bg-surface-subtle py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Bảng giá" }]} />
          <h1 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl lg:text-5xl">
            Bảng giá niêm yết công khai
          </h1>
          <p className="mt-4 max-w-2xl text-base text-ink-muted sm:text-lg">
            Kiểm tra miễn phí tại tiệm, báo đúng giá trước khi thực hiện. Đặt
            lịch trước qua website giảm ngay{" "}
            <span className="font-mono font-bold text-brand">
              {settings.bookingDiscount}
            </span>
            .
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PricingTabs
            items={items}
            showExactPrices={settings.showExactPrices}
          />
        </div>
      </section>
    </div>
  );
}
