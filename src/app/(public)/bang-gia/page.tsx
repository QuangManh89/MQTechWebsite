import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  CalendarCheck,
  FileCheck2,
  Phone,
  ShieldCheck,
} from "lucide-react";
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <PricingTabs
            items={items}
            showExactPrices={settings.showExactPrices}
          />

          {/* Cam kết 3 Không tại MQTech BMT */}
          <div className="rounded-2xl border border-line bg-surface-subtle p-6 sm:p-8">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-wider text-brand">
                Minh bạch từng hạng mục
              </p>
              <h2 className="mt-1.5 font-heading text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                Cam kết 3 Không tại MQTech BMT
              </h2>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand">
                  <BadgeCheck className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-heading text-base font-bold text-navy">
                  1. Không phí kiểm tra
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  Kiểm tra lỗi và tư vấn phương án xử lý hoàn toàn miễn phí tại
                  cửa hàng — không sửa không thu bất kỳ chi phí nào.
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand">
                  <FileCheck2 className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-heading text-base font-bold text-navy">
                  2. Không phát sinh chi phí ẩn
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  Báo giá trọn gói rõ ràng theo bảng niêm yết trước khi làm,
                  chỉ tiến hành sửa chữa khi khách hàng xác nhận đồng ý.
                </p>
              </div>

              <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 font-heading text-base font-bold text-navy">
                  3. Không tráo đổi linh kiện
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                  Khách hàng ký tên trực tiếp lên linh kiện nếu cần giữ máy,
                  theo dõi tiến độ và bảo hành điện tử minh bạch theo mã phiếu.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Bar */}
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-navy p-6 text-ink-inverse shadow-card sm:p-8 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <h2 className="font-heading text-xl font-bold text-ink-inverse sm:text-2xl">
                Cần báo giá nhanh theo đúng model máy?
              </h2>
              <p className="mt-2 text-sm text-ink-inverse-muted">
                Đặt lịch trước qua website để được ưu tiên tiếp nhận tại tiệm
                hoặc sửa tận nhà Buôn Ma Thuột trong 20–30 phút.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Link
                href="/dat-lich"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-cta px-6 py-3 text-sm font-semibold text-ink-inverse shadow-sm transition-colors hover:bg-cta-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-glow focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
              >
                <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                <span>Đặt lịch giảm ngay {settings.bookingDiscount}</span>
              </Link>
              <a
                href={`tel:${settings.hotlineRaw}`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-surface/25 bg-surface/10 px-6 py-3 font-mono text-sm font-bold text-ink-inverse tabular-nums transition-colors hover:bg-surface/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-glow focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                <span>Gọi {settings.hotline}</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
