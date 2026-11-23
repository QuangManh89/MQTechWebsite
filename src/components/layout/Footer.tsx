import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import type { SiteSetting } from "@/db/schema";

export function Footer({ settings }: { settings: SiteSetting }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy text-ink-inverse-muted border-t border-navy-border pb-[calc(5rem+env(safe-area-inset-bottom))] sm:pb-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4 min-w-0">
            <BrandLogo
              brandName={settings.brandName}
              subTagline={settings.subTagline}
              variant="dark"
            />
            <p className="text-sm leading-relaxed text-ink-inverse-muted break-words">
              {settings.slogan} Chẩn đoán miễn phí, báo giá trước khi sửa, hỗ trợ
              tận nhà nhanh chóng tại TP. Buôn Ma Thuột.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <a
                href={settings.zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat Zalo MQTech"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface/10 px-4 text-xs font-semibold text-ink-inverse transition-colors hover:bg-brand"
              >
                <MessageCircle
                  className="h-4 w-4 text-brand-glow"
                  aria-hidden="true"
                />
                <span>Zalo</span>
              </a>
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Fanpage Facebook MQTech BMT"
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface/10 px-4 text-xs font-semibold text-ink-inverse transition-colors hover:bg-brand"
              >
                <span>Fanpage</span>
              </a>
            </div>
          </div>

          <div className="min-w-0">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-ink-inverse mb-4">
              Dịch vụ chính
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/dich-vu/sua-may-tinh-tai-nha-bmt"
                  className="inline-block py-1.5 hover:text-brand-glow hover:underline transition-colors"
                >
                  Sửa máy tính tại nhà BMT
                </Link>
              </li>
              <li>
                <Link
                  href="/dich-vu/sua-laptop-windows"
                  className="inline-block py-1.5 hover:text-brand-glow hover:underline transition-colors"
                >
                  Sửa chữa Laptop Windows
                </Link>
              </li>
              <li>
                <Link
                  href="/dich-vu/sua-macbook-chuyen-nghiep"
                  className="inline-block py-1.5 hover:text-brand-glow hover:underline transition-colors"
                >
                  Sửa MacBook chuyên sâu
                </Link>
              </li>
              <li>
                <Link
                  href="/dich-vu/sua-pc-va-build-may-bo"
                  className="inline-block py-1.5 hover:text-brand-glow hover:underline transition-colors"
                >
                  Sửa PC &amp; Build máy bộ
                </Link>
              </li>
              <li>
                <Link
                  href="/dich-vu/ve-sinh-tra-keo-tan-nhiet"
                  className="inline-block py-1.5 hover:text-brand-glow hover:underline transition-colors"
                >
                  Vệ sinh &amp; Nâng cấp RAM/SSD
                </Link>
              </li>
              <li>
                <Link
                  href="/dich-vu/bao-tri-it-cong-ty-phong-may"
                  className="inline-block py-1.5 hover:text-brand-glow hover:underline transition-colors"
                >
                  Bảo trì IT công ty &amp; phòng máy
                </Link>
              </li>
            </ul>
          </div>

          <div className="min-w-0">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-ink-inverse mb-4">
              Khám phá
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  href="/kiem-tra-may-tinh"
                  className="inline-block py-1.5 hover:text-brand-glow hover:underline transition-colors"
                >
                  Kiểm tra thiết bị online
                </Link>
              </li>
              <li>
                <Link
                  href="/bang-gia"
                  className="inline-block py-1.5 hover:text-brand-glow hover:underline transition-colors"
                >
                  Bảng giá niêm yết
                </Link>
              </li>
              <li>
                <Link
                  href="/dat-lich"
                  className="inline-block py-1.5 hover:text-brand-glow hover:underline transition-colors"
                >
                  Đặt lịch sửa chữa
                </Link>
              </li>
              <li>
                <Link
                  href="/tra-cuu"
                  className="inline-block py-1.5 hover:text-brand-glow hover:underline transition-colors"
                >
                  Tra cứu tiến độ &amp; Bảo hành
                </Link>
              </li>
              <li>
                <Link
                  href="/bai-viet"
                  className="inline-block py-1.5 hover:text-brand-glow hover:underline transition-colors"
                >
                  Kiến thức công nghệ
                </Link>
              </li>
              <li>
                <Link
                  href="/gioi-thieu"
                  className="inline-block py-1.5 hover:text-brand-glow hover:underline transition-colors"
                >
                  Về MQTech BMT
                </Link>
              </li>
              <li>
                <Link
                  href="/lien-he"
                  className="inline-block py-1.5 hover:text-brand-glow hover:underline transition-colors"
                >
                  Liên hệ &amp; Chỉ đường
                </Link>
              </li>
            </ul>
          </div>

          <div className="min-w-0">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-ink-inverse mb-4">
              Liên hệ trực tiếp
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin
                  className="h-4 w-4 shrink-0 text-brand-glow mt-0.5"
                  aria-hidden="true"
                />
                <span className="break-words">{settings.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone
                  className="h-4 w-4 shrink-0 text-brand-glow"
                  aria-hidden="true"
                />
                <a
                  href={`tel:${settings.hotlineRaw}`}
                  className="font-mono font-semibold text-ink-inverse tabular-nums hover:text-brand-glow"
                >
                  {settings.hotline}
                </a>
              </li>
              <li className="flex items-center gap-2.5 min-w-0">
                <Mail
                  className="h-4 w-4 shrink-0 text-brand-glow"
                  aria-hidden="true"
                />
                <a
                  href={`mailto:${settings.email}`}
                  className="hover:text-brand-glow break-all"
                >
                  {settings.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock
                  className="h-4 w-4 shrink-0 text-brand-glow mt-0.5"
                  aria-hidden="true"
                />
                <span className="break-words">{settings.workingHours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-navy-border pt-6 text-xs text-ink-inverse-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {currentYear} {settings.brandName}. Bảo lưu mọi quyền.
          </p>
          <p>
            Kiểm tra miễn phí • Báo giá minh bạch • Bảo hành điện tử 1 đổi 1
          </p>
        </div>
      </div>
    </footer>
  );
}
