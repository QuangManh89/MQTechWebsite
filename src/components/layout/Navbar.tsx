"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarCheck, Menu, Phone, X } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { cn } from "@/lib/utils";

interface NavbarProps {
  brandName: string;
  subTagline: string;
  hotline: string;
  hotlineRaw: string;
}

const NAV_ITEMS = [
  { href: "/", label: "Trang chủ" },
  { href: "/dich-vu", label: "Dịch vụ" },
  { href: "/kiem-tra-may-tinh", label: "Kiểm tra máy" },
  { href: "/bang-gia", label: "Bảng giá" },
  { href: "/tra-cuu", label: "Tra cứu BH" },
  { href: "/bai-viet", label: "Kiến thức" },
  { href: "/gioi-thieu", label: "Giới thiệu" },
  { href: "/lien-he", label: "Liên hệ" },
];

export function Navbar({
  brandName,
  subTagline,
  hotline,
  hotlineRaw,
}: NavbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line/80 bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 xl:h-20 xl:px-6">
        <BrandLogo
          brandName={brandName}
          subTagline={subTagline}
          variant="light"
        />

        <nav
          aria-label="Điều hướng chính"
          className="hidden xl:flex items-center gap-0.5 2xl:gap-1"
        >
          {NAV_ITEMS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "min-h-11 inline-flex items-center rounded-full px-2.5 2xl:px-3.5 py-2 text-xs 2xl:text-sm font-medium transition-colors whitespace-nowrap",
                  active
                    ? "bg-brand-light text-brand font-semibold"
                    : "text-ink-muted hover:bg-surface-muted hover:text-navy"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden xl:flex items-center gap-2 shrink-0">
          <a
            href={`tel:${hotlineRaw}`}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-surface px-3 2xl:px-4 py-2 text-xs 2xl:text-sm font-semibold text-navy shadow-sm transition-all hover:border-brand hover:text-brand whitespace-nowrap"
          >
            <Phone className="h-4 w-4 text-brand shrink-0" aria-hidden="true" />
            <span className="font-mono tabular-nums">{hotline}</span>
          </a>
          <Link
            href="/dat-lich"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-cta px-3.5 2xl:px-5 py-2 text-xs 2xl:text-sm font-semibold text-ink-inverse shadow-cta-glow transition-all hover:bg-cta-hover hover:-translate-y-0.5 whitespace-nowrap"
          >
            <CalendarCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Đặt lịch sửa</span>
          </Link>
        </div>

        <div className="flex xl:hidden items-center gap-2 shrink-0">
          <Link
            href="/dat-lich"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-cta px-3.5 py-2 text-xs font-semibold text-ink-inverse shadow-cta-glow hover:bg-cta-hover"
          >
            <CalendarCheck className="h-4 w-4" aria-hidden="true" />
            <span>Đặt lịch</span>
          </Link>

          <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
            <Dialog.Trigger asChild>
              <button
                type="button"
                aria-label={
                  mobileOpen ? "Đóng menu điều hướng" : "Mở menu điều hướng"
                }
                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-line text-navy hover:bg-surface-subtle"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
            </Dialog.Trigger>

            <Dialog.Portal>
              <Dialog.Overlay className="dialog-overlay-animate fixed inset-0 z-50 bg-navy/55 backdrop-blur-sm xl:hidden" />
              <Dialog.Content className="dialog-sheet-animate fixed inset-x-0 top-0 z-50 max-h-[100dvh] overflow-y-auto overscroll-contain border-b border-line bg-surface pb-6 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] pt-[max(0.75rem,env(safe-area-inset-top))] shadow-2xl focus:outline-none xl:hidden">
                <div className="mb-3 flex items-center justify-between gap-3 border-b border-line-subtle pb-3">
                  <BrandLogo
                    brandName={brandName}
                    subTagline={subTagline}
                    variant="light"
                  />
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      aria-label="Đóng menu điều hướng"
                      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line text-navy hover:bg-surface-subtle"
                    >
                      <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </Dialog.Close>
                </div>

                <Dialog.Title className="sr-only">
                  Menu điều hướng di động
                </Dialog.Title>
                <Dialog.Description className="sr-only">
                  Chọn trang dịch vụ, bảng giá, đặt lịch hoặc tra cứu bảo hành
                  tại MQTech BMT.
                </Dialog.Description>

                <nav aria-label="Menu di động" className="flex flex-col gap-1">
                  {NAV_ITEMS.map((item) => {
                    const active =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "min-h-11 flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                          active
                            ? "bg-brand-light text-brand font-semibold"
                            : "text-ink-body hover:bg-surface-subtle"
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-4 flex flex-col gap-2 border-t border-line-subtle pt-4">
                  <a
                    href={`tel:${hotlineRaw}`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-surface-subtle px-4 py-3 text-sm font-semibold text-navy"
                  >
                    <Phone className="h-4 w-4 text-brand" aria-hidden="true" />
                    <span className="font-mono tabular-nums">
                      Hotline: {hotline}
                    </span>
                  </a>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </header>
  );
}
