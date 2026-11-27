import type { Metadata } from "next";
import { getPublishedServices, getSiteSettings } from "@/lib/site-data";
import { ServiceFilterGrid } from "@/components/services/ServiceFilterGrid";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dịch Vụ Sửa Máy Tính, Laptop, MacBook & Build PC BMT",
  description:
    "Danh mục dịch vụ sửa máy tính tại nhà Buôn Ma Thuột, sửa Laptop, MacBook, Build PC, vệ sinh nâng cấp RAM/SSD và bảo trì IT doanh nghiệp.",
  alternates: {
    canonical: "https://suamaytinhbmt.id.vn/dich-vu",
  },
  openGraph: {
    siteName: "MQTech - Sửa Máy Tính Tại Nhà BMT",
    title: "Dịch Vụ Sửa Máy Tính, Laptop, MacBook & Build PC BMT",
    description:
      "Danh mục dịch vụ sửa máy tính tại nhà Buôn Ma Thuột, sửa Laptop, MacBook, Build PC, vệ sinh nâng cấp RAM/SSD và bảo trì IT doanh nghiệp.",
    url: "https://suamaytinhbmt.id.vn/dich-vu",
    type: "website",
    locale: "vi_VN",
    images: [{ url: "/brand/og-banner.png", width: 1200, height: 630 }],
  },
};

export default async function ServicesPage() {
  const [services, settings] = await Promise.all([
    getPublishedServices(),
    getSiteSettings(),
  ]);

  return (
    <div className="bg-surface">
      <section className="border-b border-line bg-surface-subtle py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Dịch vụ" }]} />
          <h1 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl lg:text-5xl">
            Chẩn đoán đúng bệnh, sửa chuẩn từng linh kiện
          </h1>
          <p className="mt-4 max-w-2xl text-base text-ink-muted sm:text-lg">
            Chọn nhanh nhóm dịch vụ phù hợp bên dưới để xem quy trình, dấu hiệu
            nhận biết lỗi và bảng giá công khai tại MQTech BMT.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ServiceFilterGrid
            services={services}
            showExactPrices={settings.showExactPrices}
          />
        </div>
      </section>
    </div>
  );
}
