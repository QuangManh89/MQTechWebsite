import type { Metadata } from "next";
import { TicketLookupClient } from "@/components/booking/TicketLookupClient";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tra Cứu Tiến Độ Sửa Chữa & Bảo Hành Điện Tử",
  description:
    "Tra cứu nhanh trạng thái sửa chữa máy tính, laptop và thời hạn bảo hành điện tử tại MQTech Buôn Ma Thuột bằng Mã phiếu hoặc Số điện thoại.",
  alternates: {
    canonical: "https://suamaytinhbmt.id.vn/tra-cuu",
  },
  openGraph: {
    siteName: "MQTech - Computer Service",
    title: "Tra Cứu Tiến Độ Sửa Chữa & Bảo Hành Điện Tử",
    description:
      "Tra cứu nhanh trạng thái sửa chữa máy tính, laptop và thời hạn bảo hành điện tử tại MQTech Buôn Ma Thuột bằng Mã phiếu hoặc Số điện thoại.",
    url: "https://suamaytinhbmt.id.vn/tra-cuu",
    type: "website",
    locale: "vi_VN",
    images: [{ url: "/brand/og-banner.png", width: 1200, height: 630 }],
  },
};

export default async function LookupPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  return (
    <div className="bg-surface-subtle min-h-[70vh]">
      <section className="border-b border-line bg-surface py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Tra cứu bảo hành" }]} />
          <h1 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Tra cứu tiến độ &amp; Bảo hành điện tử
          </h1>
          <p className="mt-3 max-w-2xl text-base text-ink-muted">
            Nhập Mã phiếu (VD:{" "}
            <span className="font-mono font-semibold text-brand">
              MQ-2026-1001
            </span>
            ) hoặc Số điện thoại của bạn để xem tiến độ xử lý và hạn bảo hành
            linh kiện.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <TicketLookupClient initialCode={code} />
        </div>
      </section>
    </div>
  );
}
