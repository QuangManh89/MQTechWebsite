import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, Cpu, Microscope, Wrench } from "lucide-react";
import { getSiteSettings } from "@/lib/site-data";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Về Chúng Tôi - MQTech Computer Service BMT",
  description:
    "Tìm hiểu về MQTech - Computer Service tại Buôn Ma Thuột, Đắk Lắk: trang thiết bị kỹ thuật, đội ngũ tận tâm và phương châm phục vụ.",
  alternates: {
    canonical: "https://suamaytinhbmt.id.vn/gioi-thieu",
  },
  openGraph: {
    siteName: "MQTech - Computer Service",
    title: "Về Chúng Tôi - MQTech Computer Service BMT",
    description:
      "Tìm hiểu về MQTech - Computer Service tại Buôn Ma Thuột, Đắk Lắk: trang thiết bị kỹ thuật, đội ngũ tận tâm và phương châm phục vụ.",
    url: "https://suamaytinhbmt.id.vn/gioi-thieu",
    type: "website",
    locale: "vi_VN",
    images: [{ url: "/brand/og-banner.png", width: 1200, height: 630 }],
  },
};

const LAB_TOOLS = [
  {
    icon: Cpu,
    title: "Thiết bị đo & hàn mạch chuyên dụng",
    desc: "Máy khò hàn nhiệt độ chuẩn xác, máy cấp nguồn dòng đa kênh giúp chẩn đoán lỗi chạm chập mainboard nhanh chóng.",
  },
  {
    icon: Microscope,
    title: "Kính hiển vi kỹ thuật điện tử",
    desc: "Quan sát chi tiết chân chip, đường mạch siêu nhỏ bị oxi hóa hoặc đứt ngầm do ẩm mốc, vào nước.",
  },
  {
    icon: Wrench,
    title: "Bộ nạp BIOS & test linh kiện chuẩn",
    desc: "Nạp lại firmware BIOS, test RAM/SSD/nguồn PSU ổn định trước khi bàn giao máy cho khách hàng.",
  },
];

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <div className="bg-surface">
      <section className="border-b border-line bg-surface-subtle py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: "Giới thiệu" }]} />

          <div className="grid items-center gap-12 lg:grid-cols-12 mt-2">
            <div className="lg:col-span-7 space-y-5 min-w-0">
              <h1 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl lg:text-5xl">
                Sửa máy tính tận tâm, minh bạch giữa lòng Buôn Ma Thuột
              </h1>
              <p className="max-w-[68ch] text-base leading-relaxed text-ink-muted sm:text-lg break-words">
                &ldquo;{settings.slogan}&rdquo; — Tại {settings.brandName} (
                {settings.address}), chúng tôi xây dựng quy trình sửa chữa rõ
                ràng để mọi khách hàng cá nhân và doanh nghiệp tại Đắk Lắk hoàn
                toàn an tâm khi gửi gắm thiết bị công nghệ.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2 sm:grid-cols-4">
                <div className="rounded-xl border border-line bg-surface p-4">
                  <p className="font-mono text-xl font-bold text-brand tabular-nums">
                    30 phút
                  </p>
                  <p className="text-xs font-medium text-ink-muted mt-1">
                    Có mặt tại BMT
                  </p>
                </div>
                <div className="rounded-xl border border-line bg-surface p-4">
                  <p className="font-mono text-xl font-bold text-brand tabular-nums">
                    100%
                  </p>
                  <p className="text-xs font-medium text-ink-muted mt-1">
                    Báo giá trước
                  </p>
                </div>
                <div className="rounded-xl border border-line bg-surface p-4">
                  <p className="font-mono text-xl font-bold text-brand tabular-nums">
                    1 đổi 1
                  </p>
                  <p className="text-xs font-medium text-ink-muted mt-1">
                    Bảo hành chuẩn
                  </p>
                </div>
                <div className="rounded-xl border border-line bg-surface p-4">
                  <p className="font-heading text-xl font-bold text-brand">
                    Tận tâm
                  </p>
                  <p className="text-xs font-medium text-ink-muted mt-1">
                    Hỗ trợ sau sửa
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 min-w-0">
              <div className="overflow-hidden rounded-2xl border border-line bg-surface-muted shadow-card-hover">
                <ResponsiveImage
                  src="https://images.unsplash.com/photo-1721333089073-215a56fd710c?auto=format&fit=crop&w=1000&q=85"
                  alt="Không gian kỹ thuật MQTech Buôn Ma Thuột"
                  width={800}
                  height={540}
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  priority
                  className="h-[340px] w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl space-y-2.5 mb-10">
            <h2 className="font-heading text-2xl font-bold text-navy sm:text-3xl">
              Trang thiết bị kỹ thuật xử lý đúng bệnh từ gốc
            </h2>
            <p className="text-base text-ink-muted">
              Đầu tư đồng bộ máy đo đạc và dụng cụ chuyên dụng phục vụ chẩn đoán
              phần cứng chính xác.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {LAB_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.title}
                  className="flex items-start gap-4 rounded-2xl border border-line bg-surface p-6 shadow-card"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand mt-0.5">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 space-y-1.5">
                    <h3 className="font-heading text-lg font-bold text-navy">
                      {tool.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-ink-muted">
                      {tool.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-14 rounded-2xl bg-navy p-8 text-ink-inverse shadow-lg flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h2 className="font-heading text-2xl font-bold">
                Trải nghiệm dịch vụ sửa máy tính tận tâm tại BMT
              </h2>
              <p className="text-sm text-ink-inverse-muted mt-1 break-words">
                {settings.address} • {settings.workingHours}
              </p>
            </div>
            <Link
              href="/dat-lich"
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-ink-inverse shrink-0 shadow-lg shadow-black/25 hover:bg-brand-hover"
            >
              <CalendarCheck className="h-4 w-4" aria-hidden="true" />
              <span>Đặt lịch ngay</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
