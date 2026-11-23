import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  getPublishedServices,
  getServiceBySlug,
  getSiteSettings,
} from "@/lib/site-data";
import { getCategoryLabel } from "@/lib/utils";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

function getServicePromoBanner(
  slug: string,
  category: string
): { src: string; alt: string } {
  if (
    slug === "ve-sinh-tra-keo-tan-nhiet" ||
    slug === "nang-cap-ram-ssd-linh-kien" ||
    category === "clean-upgrade"
  ) {
    return {
      src: "/banners/nangcap.webp",
      alt: "MQTech - Chẩn đoán & nâng cấp phần cứng SSD NVMe Gen 4 siêu tốc, mở rộng RAM DDR4/DDR5, thay keo tản nhiệt và vệ sinh làm mát",
    };
  }
  if (
    slug === "sua-may-tinh-tai-nha-bmt" ||
    slug === "bao-tri-it-cong-ty-phong-may" ||
    category === "onsite-it"
  ) {
    return {
      src: "/banners/win.webp",
      alt: "MQTech - Cài đặt Windows & phần mềm bảo toàn dữ liệu 100%, diệt sạch mã độc, cập nhật đủ driver lấy liền sau 30 phút",
    };
  }
  return {
    src: "/banners/laptoppc.webp?v=2",
    alt: "MQTech - Sửa chữa Laptop & PC siêu tốc tại TP. Buôn Ma Thuột, Đắk Lắk: lấy liền 30 - 60 phút, bảo hành 6 - 12 tháng, miễn phí kiểm tra, Hotline 0987 482 573",
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Không tìm thấy dịch vụ" };
  return {
    title: service.title,
    description: service.shortDesc,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [service, settings, allServices] = await Promise.all([
    getServiceBySlug(slug),
    getSiteSettings(),
    getPublishedServices(),
  ]);

  if (!service) notFound();

  let symptoms: string[] = [];
  let priceRows: Array<{ item: string; price: string }> = [];
  try {
    const parsed = JSON.parse(service.symptomsJson);
    if (Array.isArray(parsed)) symptoms = parsed;
  } catch {
    symptoms = [];
  }
  try {
    const parsed = JSON.parse(service.servicePricesJson);
    if (Array.isArray(parsed)) priceRows = parsed;
  } catch {
    priceRows = [];
  }

  const relatedServices = allServices
    .filter((s) => s.id !== service.id)
    .slice(0, 3);
  const promoBanner = getServicePromoBanner(service.slug, service.category);

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.description,
    provider: {
      "@type": "ComputerStore",
      name: settings.brandName,
      telephone: settings.hotlineRaw,
      address: settings.address,
    },
    areaServed: "Buôn Ma Thuột, Đắk Lắk",
  };

  return (
    <div className="bg-surface">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />

      <section className="border-b border-line bg-surface-subtle py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Dịch vụ", href: "/dich-vu" },
              { label: service.title },
            ]}
          />

          <div className="grid items-center gap-10 lg:grid-cols-12 mt-2">
            <div className="lg:col-span-7 space-y-5 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-full bg-brand-light px-3.5 py-1 text-xs font-semibold text-brand">
                  {getCategoryLabel(service.category)}
                </span>
                <span className="rounded-full bg-navy px-3.5 py-1 font-mono text-xs font-semibold text-brand-glow">
                  {settings.showExactPrices
                    ? service.priceFrom
                    : "Báo giá sau kiểm tra miễn phí"}
                </span>
              </div>

              <h1 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl lg:text-5xl break-words">
                {service.title}
              </h1>

              <p className="max-w-[68ch] text-base leading-relaxed text-ink-muted sm:text-lg break-words">
                {service.description}
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-2">
                <div className="rounded-xl border border-line bg-surface p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-ink-muted">
                    <Clock className="h-4 w-4 text-brand" aria-hidden="true" />
                    <span>Thời gian xử lý</span>
                  </div>
                  <p className="mt-1 font-heading text-base font-bold text-navy">
                    {service.duration}
                  </p>
                </div>
                <div className="rounded-xl border border-line bg-surface p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-ink-muted">
                    <ShieldCheck
                      className="h-4 w-4 text-brand"
                      aria-hidden="true"
                    />
                    <span>Bảo hành</span>
                  </div>
                  <p className="mt-1 font-heading text-base font-bold text-navy">
                    {service.warranty}
                  </p>
                </div>
                <div className="rounded-xl border border-line bg-surface p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-ink-muted">
                    <Sparkles
                      className="h-4 w-4 text-brand"
                      aria-hidden="true"
                    />
                    <span>Chẩn đoán</span>
                  </div>
                  <p className="mt-1 font-heading text-base font-bold text-navy">
                    Miễn phí
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href={`/dat-lich?dich_vu=${encodeURIComponent(service.title)}`}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-ink-inverse shadow-brand-glow hover:bg-brand-hover"
                >
                  <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                  <span>Đặt lịch dịch vụ này</span>
                </Link>
                <a
                  href={`tel:${settings.hotlineRaw}`}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-navy bg-surface px-6 py-3 font-mono text-sm font-semibold text-navy tabular-nums hover:bg-navy hover:text-ink-inverse"
                >
                  <Phone className="h-4 w-4 text-brand" aria-hidden="true" />
                  <span>{settings.hotline}</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 min-w-0">
              <div className="overflow-hidden rounded-2xl border border-line bg-surface-muted shadow-card-hover">
                <ResponsiveImage
                  src={service.imageUrl}
                  alt={service.title}
                  width={800}
                  height={600}
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  priority
                  className="h-[320px] w-full object-cover sm:h-[380px]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-14">
          <Link
            href={`/dat-lich?dich_vu=${encodeURIComponent(service.title)}`}
            aria-label={`Đặt lịch ngay: ${service.title}`}
            className="group block overflow-hidden rounded-2xl border border-line bg-navy shadow-card transition-all hover:shadow-card-hover hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 aspect-[8/3]"
          >
            <ResponsiveImage
              src={promoBanner.src}
              alt={promoBanner.alt}
              width={1920}
              height={720}
              sizes="(max-width: 1280px) 100vw, 1216px"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.01]"
            />
          </Link>

          <div className="grid gap-10 lg:grid-cols-2">
            <div className="rounded-2xl border border-line bg-surface-subtle p-6 sm:p-8">
              <h2 className="font-heading text-2xl font-bold text-navy mb-5">
                Dấu hiệu máy cần xử lý ngay
              </h2>
              {symptoms.length === 0 ? (
                <p className="text-sm leading-relaxed text-ink-muted">
                  Máy có biểu hiện hoạt động bất thường, nóng máy, chậm lag hoặc
                  không lên nguồn — hãy liên hệ kỹ thuật viên MQTech BMT để kiểm
                  tra miễn phí chính xác nguyên nhân.
                </p>
              ) : (
                <ul className="space-y-3.5">
                  {symptoms.map((sym) => (
                    <li
                      key={sym}
                      className="flex items-start gap-3 text-sm text-ink-body sm:text-base break-words"
                    >
                      <CheckCircle2
                        className="h-5 w-5 shrink-0 text-brand mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{sym}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8 shadow-card">
              <h2 className="font-heading text-2xl font-bold text-navy mb-5">
                Chi phí dự kiến công khai
              </h2>
              {priceRows.length === 0 ? (
                <div className="py-2 text-sm text-ink-muted space-y-2">
                  <p>
                    Giá khởi điểm:{" "}
                    <strong className="font-mono text-brand">
                      {settings.showExactPrices
                        ? service.priceFrom
                        : "Báo giá sau kiểm tra miễn phí"}
                    </strong>
                  </p>
                  <p>
                    Xem thêm chi tiết tại{" "}
                    <Link
                      href="/bang-gia"
                      className="font-semibold text-brand hover:underline"
                    >
                      Bảng giá niêm yết đầy đủ
                    </Link>
                    .
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-line-subtle">
                  {priceRows.map((row) => (
                    <div
                      key={row.item}
                      className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    >
                      <span className="text-sm font-medium text-ink-body break-words">
                        {row.item}
                      </span>
                      <span className="font-mono text-sm font-bold text-brand shrink-0 tabular-nums">
                        {settings.showExactPrices
                          ? row.price
                          : "Báo giá sau kiểm tra"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-6 rounded-xl bg-brand-light px-4 py-3 text-xs text-ink-body">
                Đặt lịch online qua website được ưu đãi giảm ngay{" "}
                <strong className="font-mono text-brand">
                  {settings.bookingDiscount}
                </strong>{" "}
                trên hóa đơn sửa chữa.
              </p>
            </div>
          </div>

          {relatedServices.length > 0 && (
            <div className="border-t border-line pt-14">
              <div className="flex items-center justify-between gap-4 mb-8">
                <h2 className="font-heading text-2xl font-bold text-navy">
                  Các dịch vụ liên quan khác
                </h2>
                <Link
                  href="/dich-vu"
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-hover"
                >
                  <span>Xem tất cả</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {relatedServices.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/dich-vu/${rel.slug}`}
                    className="group flex min-w-0 flex-col justify-between rounded-2xl border border-line bg-surface p-6 shadow-card transition-all hover:-translate-y-1 hover:border-brand/40"
                  >
                    <div className="space-y-2">
                      <span className="inline-flex rounded-full bg-brand-light px-2.5 py-1 font-mono text-xs font-semibold text-brand">
                        {settings.showExactPrices
                          ? rel.priceFrom
                          : "Kiểm tra báo giá"}
                      </span>
                      <h3 className="font-heading text-lg font-bold text-navy group-hover:text-brand transition-colors break-words">
                        {rel.title}
                      </h3>
                      <p className="text-sm text-ink-muted line-clamp-2 break-words">
                        {rel.shortDesc}
                      </p>
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand">
                      Xem chi tiết{" "}
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
