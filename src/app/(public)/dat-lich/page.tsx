import type { Metadata } from "next";
import { BadgePercent, Phone, ShieldCheck, Zap } from "lucide-react";
import { getSiteSettings } from "@/lib/site-data";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Đặt Lịch Sửa Máy Tính Tại Nhà BMT & Tại Tiệm",
  description:
    "Đặt lịch sửa chữa Laptop, MacBook, PC tại nhà Buôn Ma Thuột hoặc mang máy đến MQTech chỉ trong 60 giây. Giảm ngay 50.000đ khi đặt online.",
};

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ dich_vu?: string; mo_ta?: string }>;
}) {
  const [{ dich_vu, mo_ta }, settings] = await Promise.all([
    searchParams,
    getSiteSettings(),
  ]);

  return (
    <div className="bg-surface-subtle">
      <section className="border-b border-line bg-surface py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Đặt lịch sửa chữa" }]} />
          <h1 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl lg:text-5xl">
            Đặt lịch sửa chữa trong 60 giây
          </h1>
          <p className="mt-3 max-w-2xl text-base text-ink-muted break-words">
            3 bước đơn giản — chọn sửa tận nhà tại BMT hoặc mang đến{" "}
            {settings.address}. Kỹ thuật viên gọi xác nhận trong 15 phút.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8 min-w-0">
              <BookingWizard
                initialService={dich_vu}
                initialIssue={mo_ta}
                storeAddress={settings.address}
              />
            </div>

            <div className="lg:col-span-4 space-y-4 min-w-0">
              <div className="rounded-2xl border border-line bg-surface p-5 shadow-card flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                  <BadgePercent className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-heading text-base font-bold text-navy">
                    Giảm ngay {settings.bookingDiscount}
                  </h2>
                  <p className="text-xs text-ink-muted mt-1">
                    Áp dụng trực tiếp khi đặt lịch trước qua website MQTech.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-surface p-5 shadow-card flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                  <Zap className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-heading text-base font-bold text-navy">
                    Ưu tiên tiếp nhận
                  </h2>
                  <p className="text-xs text-ink-muted mt-1">
                    Hỗ trợ tận nhà BMT trong 30 phút hoặc xử lý ngay khi đến
                    tiệm.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-line bg-surface p-5 shadow-card flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-heading text-base font-bold text-navy">
                    Mã tra cứu &amp; Bảo hành điện tử
                  </h2>
                  <p className="text-xs text-ink-muted mt-1">
                    Nhận mã MQ theo dõi tiến độ sửa chữa và hạn bảo hành mọi
                    lúc.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-navy p-6 text-ink-inverse shadow-card">
                <h2 className="font-heading text-base font-bold text-ink-inverse mb-1.5">
                  Cần hỗ trợ khẩn cấp tại BMT?
                </h2>
                <p className="text-sm text-ink-inverse-muted mb-5">
                  Máy hỏng đột ngột cần xử lý ngay trong ngày? Gọi Hotline để kỹ
                  thuật viên hỗ trợ trực tiếp:
                </p>
                <a
                  href={`tel:${settings.hotlineRaw}`}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 font-mono text-base font-bold text-ink-inverse tabular-nums shadow-lg shadow-black/25 hover:bg-brand-hover"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  <span>{settings.hotline}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
