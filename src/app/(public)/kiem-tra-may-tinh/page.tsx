import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-data";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { DeviceTestApp } from "@/components/device-test/DeviceTestApp";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Kiểm Tra Máy Tính Online - Test Bàn Phím, Màn Hình, Loa, Mic, Camera | MQTech BMT",
  description:
    "Bộ công cụ kiểm tra phần cứng máy tính online miễn phí 100% trên trình duyệt: test bàn phím, màn hình điểm chết, loa Stereo, micro, webcam và đo hiệu năng CPU/GPU không cần cài đặt phần mềm.",
  keywords: [
    "kiểm tra máy tính online",
    "test bàn phím online",
    "test màn hình điểm chết",
    "test loa trái phải",
    "test micro online",
    "test webcam",
    "benchmark cpu online",
    "MQTech BMT",
  ],
  alternates: {
    canonical: "https://suamaytinhbmt.id.vn/kiem-tra-may-tinh",
  },
  openGraph: {
    siteName: "MQTech - Computer Service",
    title: "Kiểm Tra Máy Tính Online - Test Bàn Phím, Màn Hình, Loa, Mic, Camera | MQTech BMT",
    description:
      "Bộ công cụ kiểm tra phần cứng máy tính online miễn phí 100% trên trình duyệt: test bàn phím, màn hình điểm chết, loa Stereo, micro, webcam và đo hiệu năng CPU/GPU không cần cài đặt phần mềm.",
    url: "https://suamaytinhbmt.id.vn/kiem-tra-may-tinh",
    type: "website",
    locale: "vi_VN",
    images: [{ url: "/brand/og-banner.png", width: 1200, height: 630 }],
  },
};

export default async function DeviceTestPage() {
  const settings = await getSiteSettings();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Bộ công cụ kiểm tra thiết bị phần cứng online MQTech",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Windows, macOS, Linux, Android, iOS",
    description:
      "Chẩn đoán nhanh bàn phím, màn hình điểm chết, loa Stereo trái phải, micro, camera và hiệu năng CPU/GPU trực tiếp trên trình duyệt web.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "VND",
    },
    provider: {
      "@type": "ComputerStore",
      name: settings.brandName,
      telephone: settings.hotlineRaw,
      address: settings.address,
    },
  };

  return (
    <div className="bg-surface">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Header Section */}
      <section className="border-b border-line bg-surface-subtle py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Kiểm tra máy tính" }]} />

          <div className="mt-2 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1 text-xs font-semibold text-brand shadow-sm">
              <span className="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
              <span>MQTech Diagnostic Bench • Chạy trực tiếp trên trình duyệt</span>
            </div>

            <h1 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl lg:text-5xl">
              Kiểm tra thiết bị phần cứng online miễn phí
            </h1>

            <p className="max-w-[58ch] text-base text-ink-muted leading-relaxed sm:text-lg">
              Bộ công cụ chẩn đoán nhanh bàn phím, màn hình, loa, microphone, webcam và
              hiệu năng tản nhiệt — 100% chạy trên trình duyệt của bạn, không cần cài
              đặt phần mềm, tuyệt đối an toàn và bảo mật dữ liệu.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Testing Center */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <DeviceTestApp hotlineRaw={settings.hotlineRaw} />
        </div>
      </section>
    </div>
  );
}
