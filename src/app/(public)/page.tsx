import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Cpu,
  Eye,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  Tag,
  Wrench,
} from "lucide-react";
import { getPublishedServices, getSiteSettings } from "@/lib/site-data";
import { FaqAccordion, type FaqItem } from "@/components/home/FaqAccordion";
import { HeroBannerSlider } from "@/components/home/HeroBannerSlider";
import { MotionReveal } from "@/components/home/MotionReveal";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";

export const dynamic = "force-dynamic";

const MARQUEE_ITEMS = [
  "Có mặt 15 - 20 phút tại P. Tân Lập, P. Tân An & trung tâm BMT",
  "Chẩn đoán miễn phí 100%",
  "Linh kiện chính hãng 100%",
  "Báo đúng giá, không phát sinh",
  "Quan sát sửa chữa trực tiếp",
  "Bảo hành điện tử 1 đổi 1",
  "Hoàn tiền nếu không hài lòng",
];

const COMMITMENTS = [
  {
    icon: Eye,
    title: "Minh bạch tuyệt đối",
    desc: "Khách hàng quan sát trực tiếp toàn bộ quá trình kiểm tra, tháo lắp và thay linh kiện tại chỗ hoặc tại tiệm.",
  },
  {
    icon: ShieldCheck,
    title: "Không tráo linh kiện",
    desc: "Ghi nhận mã serial linh kiện khi tiếp nhận. Cam kết đền bù gấp 10 lần nếu phát hiện tráo đổi linh kiện.",
  },
  {
    icon: Tag,
    title: "Báo đúng giá",
    desc: "Bảng giá niêm yết công khai. Kiểm tra báo lỗi và chi phí trước khi làm — không đồng ý không tốn phí.",
  },
  {
    icon: HeartHandshake,
    title: "Hỗ trợ tận tâm",
    desc: "Tư vấn đúng bệnh, không vẽ thêm lỗi. Hỗ trợ kỹ thuật từ xa miễn phí sau sửa chữa suốt thời gian bảo hành.",
  },
];

const PROCESS_STEPS = [
  {
    step: "01",
    icon: ClipboardCheck,
    title: "Tiếp nhận yêu cầu",
    desc: "Đặt lịch sửa tại nhà BMT hoặc mang máy đến cửa hàng, nhận ngay mã phiếu MQ theo dõi trực tuyến.",
  },
  {
    step: "02",
    icon: Cpu,
    title: "Kiểm tra miễn phí",
    desc: "Kỹ thuật viên đo đạc bằng thiết bị chuyên dụng, xác định chính xác nguyên nhân lỗi phần cứng hay phần mềm.",
  },
  {
    step: "03",
    icon: Tag,
    title: "Báo giá minh bạch",
    desc: "Thông báo phương án khắc phục tối ưu và chi phí trọn gói. Chỉ tiến hành sửa khi khách hàng đồng ý.",
  },
  {
    step: "04",
    icon: Wrench,
    title: "Sửa chữa & Bảo hành",
    desc: "Xử lý chuẩn kỹ thuật, test ổn định trước khi bàn giao và kích hoạt bảo hành điện tử theo SĐT.",
  },
];

const TESTIMONIALS = [
  {
    name: "Anh Hoàng Phúc",
    role: "Kinh doanh tự do • P. Tân Lập, BMT",
    quote:
      "Máy tính văn phòng bị tắt nguồn đột ngột, gọi MQTech chưa tới 25 phút đã có bạn kỹ thuật qua kiểm tra tại nhà. Thay nguồn mới gọn gàng, giá rõ ràng.",
  },
  {
    name: "Chị Thu Trang",
    role: "Kế toán • P. Tân Lợi, BMT",
    quote:
      "Laptop công ty chạy rất chậm, tưởng phải mua máy mới. Được MQTech tư vấn nâng SSD và vệ sinh hết chưa tới 700k, giờ mở phần mềm kế toán vèo vèo.",
  },
  {
    name: "Bạn Minh Khang",
    role: "Sinh viên ĐH Tây Nguyên",
    quote:
      "Mang Laptop Gaming đến vệ sinh tra keo tản nhiệt. Bạn kỹ thuật đo nhiệt độ trước sau cho xem luôn, máy giảm hẳn gần 18°C, quạt chạy êm ru.",
  },
  {
    name: "Anh Văn Đức",
    role: "Chủ văn phòng BĐS • TP. Buôn Ma Thuột",
    quote:
      "Bên mình ký bảo trì định kỳ 12 máy tính và mạng LAN với MQTech hơn 1 năm nay. Có sự cố gọi là hỗ trợ liền, rất yên tâm.",
  },
];

const FAQ_ITEMS: FaqItem[] = [
  {
    id: "faq-1",
    question: "MQTech có nhận sửa máy tính tại nhà ở Buôn Ma Thuột không?",
    answer:
      "Có. Chúng tôi hỗ trợ sửa máy tính tại nhà, văn phòng, cửa hàng trên toàn TP. Buôn Ma Thuột, đặc biệt ưu tiên có mặt siêu tốc chỉ 15 - 20 phút tại Phường Tân Lập, Phường Tân An và các khu vực trung tâm TP. Buôn Ma Thuột.",
  },
  {
    id: "faq-2",
    question: "Kiểm tra máy tại cửa hàng có mất phí không?",
    answer:
      "Hoàn toàn miễn phí 100% tại cửa hàng. Kỹ thuật viên kiểm tra, báo lỗi và báo giá chi tiết trước — nếu bạn chưa muốn sửa sẽ không tốn bất kỳ chi phí nào.",
  },
  {
    id: "faq-3",
    question: "Thời gian sửa chữa hoặc vệ sinh nâng cấp mất bao lâu?",
    answer:
      "Các dịch vụ vệ sinh tra keo, cài Windows, nâng cấp RAM/SSD, thay bàn phím hoặc pin thường hoàn thành ngay trong 20 - 45 phút. Các ca sửa mainboard chuyên sâu xử lý trong ngày hoặc tối đa 1 - 2 ngày.",
  },
  {
    id: "faq-4",
    question: "Chính sách bảo hành tại MQTech như thế nào?",
    answer:
      "Linh kiện thay mới (RAM, SSD, màn hình, pin, bàn phím, nguồn PSU) được bảo hành 1 đổi 1 từ 6 - 36 tháng theo hãng. Mọi phiếu sửa đều được lưu bảo hành điện tử, chỉ cần nhập SĐT tại mục Tra cứu BH.",
  },
  {
    id: "faq-5",
    question: "Dữ liệu cá nhân của tôi có được bảo mật khi sửa máy không?",
    answer:
      "MQTech cam kết tuyệt đối không truy cập, sao chép dữ liệu riêng tư của khách hàng. Khi cần cài lại hệ điều hành hoặc thay ổ cứng, kỹ thuật viên luôn hỏi ý kiến và hỗ trợ sao lưu dữ liệu an toàn.",
  },
  {
    id: "faq-6",
    question: "MQTech có nhận build PC mới và bảo trì IT cho công ty không?",
    answer:
      "Có. Chúng tôi tư vấn lắp ráp PC Gaming, Đồ họa, Văn phòng theo đúng ngân sách thực tế, đồng thời nhận hợp đồng bảo trì định kỳ cho doanh nghiệp, phòng máy và trường học tại Đắk Lắk.",
  },
];

export default async function HomePage() {
  const [settings, allServices] = await Promise.all([
    getSiteSettings(),
    getPublishedServices(),
  ]);

  const featuredService =
    allServices.find((s) => s.featured) ?? allServices[0];
  const gridServices = allServices
    .filter((s) => s.id !== featuredService?.id)
    .slice(0, 4);

  const shortArea =
    settings.address
      .split(",")
      .map((part) => part.trim())
      .find((part) => /^P\.|^Phường/i.test(part)) || "TP. Buôn Ma Thuột";

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    settings.siteUrl ||
    "https://suamaytinhbmt.id.vn"
  ).replace(/\/$/, "");
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    settings.address
  )}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LocalBusiness", "ComputerStore"],
        "@id": `${siteUrl}/#localbusiness`,
        name: settings.brandName,
        url: siteUrl,
        image: `${siteUrl}/brand/og-banner.png`,
        description: `${settings.subTagline}. ${settings.slogan} Hỗ trợ siêu tốc 15 - 20 phút tại Phường Tân Lập, Phường Tân An và TP. Buôn Ma Thuột.`,
        telephone: settings.hotlineRaw,
        email: settings.email,
        priceRange: "100.000đ - 1.500.000đ",
        address: {
          "@type": "PostalAddress",
          streetAddress: settings.address,
          addressLocality: "Buôn Ma Thuột",
          addressRegion: "Đắk Lắk",
          postalCode: "630000",
          addressCountry: "VN",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: 12.68,
          longitude: 108.0378,
        },
        hasMap: settings.googleMapsEmbedUrl || mapsSearchUrl,
        sameAs: [settings.facebookUrl, settings.zaloUrl].filter(Boolean),
        areaServed: [
          {
            "@type": "AdministrativeArea",
            name: "Phường Tân Lập, TP. Buôn Ma Thuột",
          },
          {
            "@type": "AdministrativeArea",
            name: "Phường Tân An, TP. Buôn Ma Thuột",
          },
          {
            "@type": "AdministrativeArea",
            name: "Phường Ea Tam, TP. Buôn Ma Thuột",
          },
          {
            "@type": "AdministrativeArea",
            name: "Phường Tân Lợi, TP. Buôn Ma Thuột",
          },
          {
            "@type": "AdministrativeArea",
            name: "Phường Tự An, TP. Buôn Ma Thuột",
          },
          {
            "@type": "AdministrativeArea",
            name: "Phường Thành Công, TP. Buôn Ma Thuột",
          },
          {
            "@type": "AdministrativeArea",
            name: "Phường Thắng Lợi, TP. Buôn Ma Thuột",
          },
          {
            "@type": "AdministrativeArea",
            name: "Phường Tân Tiến, TP. Buôn Ma Thuột",
          },
          {
            "@type": "City",
            name: "Thành phố Buôn Ma Thuột, Tỉnh Đắk Lắk",
          },
        ],
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
            opens: "07:30",
            closes: "20:00",
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ_ITEMS.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. HERO SECTION + PREPARED BRAND BANNERS */}
      <section className="relative overflow-hidden bg-surface-page pt-4 pb-12 sm:pt-6 lg:pt-6 lg:pb-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-0 h-[420px] w-[420px] rounded-full bg-brand-soft/60 blur-3xl opacity-70"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-7 sm:space-y-8">
          <HeroBannerSlider />

          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8 space-y-4 min-w-0">
              <div className="inline-flex max-w-full items-center gap-2.5 rounded-full border border-status-success-line bg-status-success-bg px-4 py-1.5 text-xs font-semibold text-status-success-ink">
                <span
                  aria-hidden="true"
                  className="h-2 w-2 shrink-0 rounded-full bg-status-success-solid"
                />
                <span className="truncate">
                  {settings.isOpen
                    ? `Đang mở cửa (${settings.workingHours}) • Sửa tại nhà BMT & tại tiệm`
                    : "Nhận đặt lịch online • Phản hồi sớm nhất"}
                </span>
              </div>

              <h1 className="font-heading text-3xl font-bold tracking-tight text-navy leading-[1.14] sm:text-4xl lg:text-5xl break-words">
                Sửa chữa Laptop, MacBook &amp; PC{" "}
                <span className="text-brand">tận tâm minh bạch</span> tại
                Buôn&nbsp;Ma&nbsp;Thuột.
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg break-words">
                {settings.slogan} Kiểm tra miễn phí, báo đúng giá trước khi làm,
                hỗ trợ sửa máy tính tại nhà nhanh chóng khu vực TP. Buôn Ma
                Thuột.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <Link
                  href="/dat-lich"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-cta px-6 py-3.5 text-sm font-semibold text-ink-inverse shadow-cta-glow transition-all hover:bg-cta-hover hover:-translate-y-0.5 sm:text-base"
                >
                  <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                  <span>
                    Đặt lịch ngay (Giảm {settings.bookingDiscount})
                  </span>
                </Link>
                <a
                  href={`tel:${settings.hotlineRaw}`}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-navy bg-surface px-6 py-3 text-sm font-semibold text-navy transition-all hover:bg-navy hover:text-ink-inverse sm:text-base"
                >
                  <Phone className="h-4 w-4 text-brand" aria-hidden="true" />
                  <span className="font-mono tabular-nums">
                    {settings.hotline}
                  </span>
                </a>
              </div>

              <ul
                aria-label="Ưu đãi và cam kết đặt lịch"
                className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs font-medium text-ink-muted sm:text-sm"
              >
                <li className="inline-flex items-center gap-1.5">
                  <CheckCircle2
                    className="h-4 w-4 shrink-0 text-status-success-solid"
                    aria-hidden="true"
                  />
                  <span>
                    Giảm ngay{" "}
                    <strong className="font-mono font-semibold text-navy tabular-nums">
                      {settings.bookingDiscount}
                    </strong>{" "}
                    khi đặt online
                  </span>
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <CheckCircle2
                    className="h-4 w-4 shrink-0 text-status-success-solid"
                    aria-hidden="true"
                  />
                  <span>Kiểm tra miễn phí</span>
                </li>
                <li className="inline-flex items-center gap-1.5">
                  <CheckCircle2
                    className="h-4 w-4 shrink-0 text-status-success-solid"
                    aria-hidden="true"
                  />
                  <span>Có mặt 15–20 phút tại BMT</span>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-4 min-w-0 space-y-4">
              <div className="rounded-2xl border border-navy-border bg-navy p-5 text-ink-inverse shadow-card">
                <div className="flex items-center justify-between gap-2 text-xs text-brand-glow font-semibold uppercase tracking-wider">
                  <span className="inline-flex items-center gap-1.5 min-w-0">
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 shrink-0 rounded-full bg-brand-glow"
                    />
                    <span className="truncate">Hôm nay tại MQTech BMT</span>
                  </span>
                  <span className="inline-flex items-center gap-1 shrink-0">
                    <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>{shortArea}</span>
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3 border-b border-navy-border pb-4">
                  <p className="text-sm font-medium text-ink-inverse">
                    <span className="font-mono text-2xl font-bold text-ink-inverse tabular-nums">
                      {settings.todayReceivedCount}
                    </span>{" "}
                    ca sửa đã tiếp nhận
                  </p>
                  <p className="font-mono text-xs font-semibold text-brand-glow tabular-nums">
                    Slot trống: {settings.todaySlotsLeft}
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="font-mono text-base font-bold text-ink-inverse tabular-nums">
                      30 phút
                    </p>
                    <p className="text-ink-inverse-muted mt-0.5">
                      Có mặt tận nhà BMT
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-base font-bold text-ink-inverse tabular-nums">
                      1 đổi 1
                    </p>
                    <p className="text-ink-inverse-muted mt-0.5">
                      Bảo hành điện tử
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRUST MARQUEE STRIP */}
      <section
        aria-label="Cam kết dịch vụ"
        className="overflow-hidden border-y border-line bg-surface-subtle py-4"
      >
        <div className="animate-marquee-track flex items-center gap-8">
          <ul className="flex shrink-0 flex-wrap items-center justify-center gap-8 sm:flex-nowrap">
            {MARQUEE_ITEMS.map((item) => (
              <li
                key={item}
                className="flex shrink-0 items-center gap-2.5 text-sm font-medium text-ink-body"
              >
                <CheckCircle2
                  className="h-4 w-4 text-brand shrink-0"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <ul
            aria-hidden="true"
            className="marquee-clone flex shrink-0 items-center gap-8"
          >
            {MARQUEE_ITEMS.map((item) => (
              <li
                key={`clone-${item}`}
                className="flex shrink-0 items-center gap-2.5 text-sm font-medium text-ink-body"
              >
                <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. SERVICES BENTO GRID */}
      <section className="bg-surface-page py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-10">
            <div className="max-w-2xl space-y-2.5">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-navy sm:text-3xl lg:text-4xl">
                Giải pháp toàn diện cho Laptop, MacBook &amp; PC
              </h2>
              <p className="text-base text-ink-muted">
                Từ sửa máy tính tại nhà Buôn Ma Thuột đến xử lý bo mạch chuyên
                sâu, build PC và bảo trì hệ thống IT doanh nghiệp.
              </p>
            </div>
            <Link
              href="/dich-vu"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand hover:text-brand-hover shrink-0"
            >
              <span>Xem tất cả dịch vụ</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredService && (
              <MotionReveal className="md:col-span-2 lg:col-span-3 min-w-0">
                <Link
                  href={`/dich-vu/${featuredService.slug}`}
                  className="group grid overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-card-hover lg:grid-cols-2"
                >
                  <div className="relative h-64 overflow-hidden bg-surface-muted lg:h-full">
                    <ResponsiveImage
                      src={featuredService.imageUrl}
                      alt={featuredService.title}
                      width={960}
                      height={540}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col justify-between p-6 sm:p-8 lg:p-10">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-brand-light px-3 py-1 font-mono text-xs font-semibold text-brand">
                          {settings.showExactPrices
                            ? featuredService.priceFrom
                            : "Kiểm tra báo giá"}
                        </span>
                        <span className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-ink-body">
                          Bảo hành {featuredService.warranty}
                        </span>
                      </div>
                      <h3 className="font-heading text-2xl font-bold text-navy group-hover:text-brand transition-colors break-words">
                        {featuredService.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-ink-muted sm:text-base break-words">
                        {featuredService.shortDesc}
                      </p>
                    </div>
                    <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand">
                      <span>Xem chi tiết &amp; bảng giá</span>
                      <ArrowRight
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </Link>
              </MotionReveal>
            )}

            {gridServices.map((service, idx) => (
              <MotionReveal key={service.id} delay={idx * 0.05} className="min-w-0">
                <Link
                  href={`/dich-vu/${service.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-card-hover"
                >
                  <div className="relative h-48 overflow-hidden bg-surface-muted">
                    <ResponsiveImage
                      src={service.imageUrl}
                      alt={service.title}
                      width={640}
                      height={384}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col justify-between p-6">
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="rounded-full bg-brand-light px-2.5 py-1 font-mono text-xs font-semibold text-brand">
                          {settings.showExactPrices
                            ? service.priceFrom
                            : "Kiểm tra báo giá"}
                        </span>
                        <span className="text-xs font-medium text-ink-muted">
                          {service.duration}
                        </span>
                      </div>
                      <h3 className="font-heading text-lg font-bold text-navy group-hover:text-brand transition-colors break-words">
                        {service.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-ink-muted line-clamp-3 break-words">
                        {service.shortDesc}
                      </p>
                    </div>
                    <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                      <span>Xem chi tiết</span>
                      <ArrowRight
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </Link>
              </MotionReveal>
            ))}

            <MotionReveal delay={0.2} className="min-w-0">
              <Link
                href="/dich-vu"
                className="group flex h-full min-h-[280px] flex-col justify-between rounded-2xl bg-navy p-7 text-ink-inverse shadow-card transition-all duration-300 hover:-translate-y-1 hover:bg-brand"
              >
                <div className="space-y-3">
                  <span className="inline-flex rounded-full bg-surface/10 px-3 py-1 text-xs font-semibold text-brand-glow group-hover:bg-surface/20 group-hover:text-ink-inverse">
                    + Đầy đủ dịch vụ
                  </span>
                  <h3 className="font-heading text-2xl font-bold leading-snug">
                    Nâng cấp SSD/RAM, Build PC &amp; Bảo trì IT công ty...
                  </h3>
                  <p className="text-sm text-ink-inverse-muted group-hover:text-ink-inverse">
                    Xem danh sách toàn bộ dịch vụ và bảng giá niêm yết công khai
                    tại MQTech BMT.
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-brand-glow group-hover:text-ink-inverse">
                  <span>Khám phá toàn bộ</span>
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </div>
              </Link>
            </MotionReveal>
          </div>
        </div>
      </section>

      {/* 3.5. ONLINE DIAGNOSTIC TOOL PROMO BANNER */}
      <section className="bg-surface-page pb-12 sm:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-line bg-surface-subtle p-6 shadow-card sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-brand shadow-sm">
                <span className="h-2 w-2 rounded-full bg-brand" aria-hidden="true" />
                <span>Công cụ mới • Miễn phí 100%</span>
              </div>
              <h2 className="font-heading text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                Tự kiểm tra thiết bị online trước khi sửa
              </h2>
              <p className="text-sm leading-relaxed text-ink-muted sm:text-base">
                Chẩn đoán nhanh liệt phím, màn hình điểm chết, rè loa trái/phải, micro thu âm, camera và đo nhiệt độ CPU/GPU trực tiếp trên trình duyệt — không cần cài đặt phần mềm.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/kiem-tra-may-tinh"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-ink-inverse shadow-brand-glow hover:bg-brand-hover"
              >
                <span>Vào kiểm tra ngay</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CAM KẾT VÀNG — Side-by-side architectural ledger */}
      <section className="bg-surface-subtle py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-2.5 mb-12">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-navy sm:text-3xl lg:text-4xl">
              Vì sao khách hàng Buôn Ma Thuột tin chọn MQTech?
            </h2>
            <p className="text-base text-ink-muted">
              Bốn nguyên tắc nghề nghiệp được thực hiện nhất quán trên từng ca
              tiếp nhận tại tiệm và tận nhà.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {COMMITMENTS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <MotionReveal key={item.title} delay={idx * 0.05} className="min-w-0">
                  <div className="flex h-full items-start gap-4 rounded-2xl border border-line bg-surface p-6 shadow-card transition-colors duration-200 hover:border-brand/50">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand mt-0.5">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 space-y-1.5">
                      <h3 className="font-heading text-lg font-bold text-navy">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-ink-muted">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </MotionReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. QUY TRÌNH 4 BƯỚC */}
      <section className="bg-surface-page py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-2.5 mb-12">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-navy sm:text-3xl lg:text-4xl">
              Quy trình 4 bước rõ ràng, không bất ngờ nào
            </h2>
            <p className="text-base text-ink-muted">
              Mỗi ca sửa tại nhà hoặc tại cửa hàng đều có mã phiếu điện tử theo
              dõi minh bạch từ lúc tiếp nhận tới khi hết bảo hành.
            </p>
          </div>

          <ol className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <li key={item.step} className="min-w-0">
                  <MotionReveal delay={idx * 0.06} className="h-full">
                    <div className="h-full rounded-2xl border border-line bg-surface-subtle p-6">
                      <div className="flex items-center justify-between mb-5">
                        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-ink-inverse shadow-sm">
                          <Icon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <span
                          aria-hidden="true"
                          className="font-mono text-3xl font-bold text-ink-subtle tabular-nums"
                        >
                          {item.step}
                        </span>
                      </div>
                      <h3 className="font-heading text-lg font-bold text-navy mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-ink-muted">
                        {item.desc}
                      </p>
                    </div>
                  </MotionReveal>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* 6. TESTIMONIALS (DARK OBSIDIAN) */}
      <section className="bg-navy py-16 sm:py-24 text-ink-inverse">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-2.5 mb-12">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-ink-inverse sm:text-3xl lg:text-4xl">
              Niềm tin được xây từ từng chiếc máy tại BMT
            </h2>
            <p className="text-base text-ink-inverse-muted">
              Đánh giá thực tế từ khách hàng cá nhân, sinh viên và doanh nghiệp
              tại Buôn Ma Thuột.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="flex min-w-0 flex-col justify-between rounded-2xl border border-navy-border bg-surface/5 p-6 transition-colors hover:bg-surface/10"
              >
                <div>
                  <div
                    className="mb-4 flex items-center gap-1"
                    aria-label="Đánh giá 5 trên 5 sao"
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        aria-hidden="true"
                        className="h-4 w-4 fill-status-warning-star text-status-warning-star"
                      />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-ink-inverse-muted break-words">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div className="mt-6 border-t border-navy-border pt-4">
                  <p className="font-heading text-sm font-semibold text-ink-inverse">
                    {t.name}
                  </p>
                  <p className="text-xs text-ink-inverse-muted mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ ACCORDION */}
      <section className="bg-surface-page py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2.5 mb-10">
            <h2 className="font-heading text-2xl font-bold tracking-tight text-navy sm:text-3xl lg:text-4xl">
              Câu hỏi thường gặp
            </h2>
            <p className="text-base text-ink-muted">
              Giải đáp nhanh về dịch vụ sửa tại nhà, thời gian xử lý và bảo hành
              điện tử MQTech.
            </p>
          </div>

          <FaqAccordion items={FAQ_ITEMS} />

          <div className="mt-8 text-center">
            <a
              href={settings.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand hover:text-brand-hover"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <span>Còn thắc mắc? Chat Zalo ngay với kỹ thuật viên MQTech</span>
            </a>
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA BANNER */}
      <section className="bg-surface-page pb-16 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-navy px-6 py-12 text-ink-inverse sm:px-12 sm:py-16">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand/25 blur-3xl"
            />
            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl space-y-3 min-w-0">
                <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                  Máy đang gặp sự cố? Để MQTech BMT lo!
                </h2>
                <p className="text-sm text-ink-inverse-muted sm:text-base">
                  Kiểm tra miễn phí, báo giá trước khi làm. Đặt lịch online giảm
                  ngay{" "}
                  <span className="font-mono font-bold text-brand-glow">
                    {settings.bookingDiscount}
                  </span>{" "}
                  hoặc gọi kỹ thuật đến tận nhà.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link
                  href="/dat-lich"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-ink-inverse shadow-lg shadow-black/25 transition-all hover:bg-brand-hover"
                >
                  <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                  <span>Đặt lịch ngay</span>
                </Link>
                <a
                  href={settings.zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border border-surface/20 bg-surface/10 px-5 py-3.5 text-sm font-semibold text-ink-inverse transition-colors hover:bg-surface/20"
                >
                  <MessageCircle
                    className="h-4 w-4 text-brand-glow"
                    aria-hidden="true"
                  />
                  <span>Chat Zalo</span>
                </a>
                <a
                  href={`tel:${settings.hotlineRaw}`}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border border-surface/20 px-5 py-3.5 font-mono text-sm font-semibold text-ink-inverse tabular-nums transition-colors hover:bg-surface/10"
                >
                  <Phone
                    className="h-4 w-4 text-brand-glow"
                    aria-hidden="true"
                  />
                  <span>{settings.hotline}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
