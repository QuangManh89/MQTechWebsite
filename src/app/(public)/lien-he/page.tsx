import type { Metadata } from "next";
import {
  Clock,
  ExternalLink,
  Facebook,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { getSiteSettings } from "@/lib/site-data";
import { ContactFormClient } from "@/components/contact/ContactFormClient";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Liên Hệ & Chỉ Đường - MQTech Computer Service BMT",
  description:
    "Liên hệ MQTech - Computer Service tại Đường Võ Thị Sáu, P. Tân Lập, TP. Buôn Ma Thuột, Đắk Lắk. Hỗ trợ siêu tốc 15 - 20 phút tại P. Tân Lập, P. Tân An & trung tâm BMT. Hotline/Zalo 0987 482 573.",
  alternates: {
    canonical: "https://suamaytinhbmt.id.vn/lien-he",
  },
  openGraph: {
    siteName: "MQTech - Computer Service",
    title: "Liên Hệ & Chỉ Đường - MQTech Computer Service BMT",
    description:
      "Liên hệ MQTech - Computer Service tại Đường Võ Thị Sáu, P. Tân Lập, TP. Buôn Ma Thuột, Đắk Lắk. Hỗ trợ siêu tốc 15 - 20 phút tại P. Tân Lập, P. Tân An & trung tâm BMT. Hotline/Zalo 0987 482 573.",
    url: "https://suamaytinhbmt.id.vn/lien-he",
    type: "website",
    locale: "vi_VN",
    images: [{ url: "/brand/og-banner.png", width: 1200, height: 630 }],
  },
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    settings.address
  )}`;
  const fanpageDisplay = settings.facebookUrl
    .replace(/^https?:\/\/(www\.)?/, "")
    .replace(/\/$/, "");

  return (
    <div className="bg-surface-subtle">
      <section className="border-b border-line bg-surface py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Liên hệ" }]} />
          <h1 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl lg:text-5xl">
            Liên hệ hỗ trợ &amp; chỉ đường tại BMT
          </h1>
          <p className="mt-3 max-w-2xl text-base text-ink-muted">
            Gọi trực tiếp, nhắn Zalo hoặc để lại câu hỏi — kỹ thuật viên{" "}
            {settings.brandName} sẽ phản hồi nhanh nhất.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid gap-6 md:grid-cols-3">
            <a
              href={`tel:${settings.hotlineRaw}`}
              className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-6 shadow-card transition-all hover:-translate-y-1 hover:border-brand min-w-0"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand mt-0.5">
                <Phone className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="font-heading text-lg font-bold text-navy">
                  Gọi Hotline
                </h2>
                <p className="font-mono text-base font-bold text-brand mt-1 tabular-nums">
                  {settings.hotline}
                </p>
              </div>
            </a>

            <a
              href={settings.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-6 shadow-card transition-all hover:-translate-y-1 hover:border-brand min-w-0"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand mt-0.5">
                <MessageCircle className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="font-heading text-lg font-bold text-navy">
                  Chat Zalo
                </h2>
                <p className="text-sm text-ink-muted mt-1">
                  Gửi ảnh lỗi máy, nhận tư vấn &amp; báo giá nhanh
                </p>
              </div>
            </a>

            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-6 shadow-card transition-all hover:-translate-y-1 hover:border-brand min-w-0"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand mt-0.5">
                <Facebook className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="font-heading text-lg font-bold text-navy">
                  Fanpage Facebook
                </h2>
                <p className="text-sm text-ink-muted mt-1 break-all">
                  {fanpageDisplay}
                </p>
              </div>
            </a>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5 space-y-5 min-w-0">
              <div className="rounded-2xl border border-line bg-surface p-6 shadow-card space-y-4">
                <h2 className="font-heading text-xl font-bold text-navy">
                  Thông tin trung tâm
                </h2>
                <div className="space-y-3 text-sm text-ink-muted">
                  <p className="flex items-start gap-3">
                    <MapPin
                      className="h-5 w-5 shrink-0 text-brand mt-0.5"
                      aria-hidden="true"
                    />
                    <span className="break-words">{settings.address}</span>
                  </p>
                  <p className="flex items-center gap-3 min-w-0">
                    <Mail
                      className="h-5 w-5 shrink-0 text-brand"
                      aria-hidden="true"
                    />
                    <span className="break-all">{settings.email}</span>
                  </p>
                  <p className="flex items-start gap-3">
                    <Clock
                      className="h-5 w-5 shrink-0 text-brand mt-0.5"
                      aria-hidden="true"
                    />
                    <span className="break-words">{settings.workingHours}</span>
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-navy p-6 text-ink-inverse shadow-card space-y-4">
                <h2 className="font-heading text-lg font-bold text-ink-inverse">
                  Khu vực phục vụ siêu tốc tại Buôn Ma Thuột
                </h2>
                <p className="text-sm text-ink-inverse-muted leading-relaxed">
                  Ưu tiên có mặt tận nhà chỉ 15 - 20 phút tại{" "}
                  <strong className="text-ink-inverse">Phường Tân Lập</strong>,{" "}
                  <strong className="text-ink-inverse">Phường Tân An</strong> và
                  các phường trung tâm{" "}
                  <strong className="text-ink-inverse">TP. Buôn Ma Thuột</strong>.
                </p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-ink-inverse shadow-lg shadow-black/25 hover:bg-brand-hover"
                >
                  <span>Mở Google Maps chỉ đường</span>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>

              {settings.googleMapsEmbedUrl && (
                <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
                  <iframe
                    src={settings.googleMapsEmbedUrl}
                    title={`Bản đồ ${settings.brandName}`}
                    className="h-64 w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            <div className="lg:col-span-7 min-w-0">
              <ContactFormClient />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
