"use client";

import * as Tabs from "@radix-ui/react-tabs";
import Link from "next/link";
import { CalendarCheck, Clock, ShieldCheck } from "lucide-react";
import type { PricingItem } from "@/db/schema";

const TABS = [
  { key: "laptop-macbook", label: "Laptop & MacBook" },
  { key: "pc-build", label: "PC & Build Máy Bộ" },
  { key: "clean-upgrade", label: "Vệ Sinh & Nâng Cấp" },
  { key: "onsite-it", label: "Sửa Tại Nhà & IT BMT" },
];

function mapPricingToServiceOption(item: PricingItem): string {
  const name = item.serviceName.toLowerCase();

  if (name.includes("macbook")) {
    return "Sửa MacBook chuyên nghiệp";
  }
  if (name.includes("bảo trì it")) {
    return "Bảo trì IT công ty / phòng máy";
  }
  if (
    name.includes("windows") ||
    /\bwin\b/.test(name) ||
    name.includes("phần mềm")
  ) {
    return "Cài Win 10/11 & Phần mềm tại nhà BMT";
  }
  if (name.includes("ssd") || /\bram\b/.test(name)) {
    return "Nâng cấp RAM / SSD";
  }

  switch (item.tabCategory) {
    case "laptop-macbook":
      return "Sửa chữa Laptop Windows";
    case "pc-build":
      return "Sửa PC & Build máy bộ";
    case "clean-upgrade":
      return "Vệ sinh & Tra keo tản nhiệt";
    case "onsite-it":
      return "Sửa máy tính tại nhà BMT";
    default:
      return "Chưa rõ / Cần chẩn đoán miễn phí";
  }
}

function buildBookingHref(item: PricingItem): string {
  const mappedServiceOption = mapPricingToServiceOption(item);
  return `/dat-lich?dich_vu=${encodeURIComponent(mappedServiceOption)}&mo_ta=${encodeURIComponent(item.serviceName)}`;
}

export function PricingTabs({
  items,
  showExactPrices,
}: {
  items: PricingItem[];
  showExactPrices: boolean;
}) {
  return (
    <Tabs.Root defaultValue="laptop-macbook" className="w-full">
      <Tabs.List
        aria-label="Danh mục bảng giá"
        className="mb-8 flex flex-wrap gap-2"
      >
        {TABS.map((tab) => (
          <Tabs.Trigger
            key={tab.key}
            value={tab.key}
            className="min-h-11 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink-muted transition-all hover:border-brand/40 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 data-[state=active]:border-brand data-[state=active]:bg-brand data-[state=active]:text-ink-inverse data-[state=active]:shadow-sm"
          >
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {TABS.map((tab) => {
        const rows = items.filter((item) => item.tabCategory === tab.key);
        return (
          <Tabs.Content key={tab.key} value={tab.key} className="outline-none">
            {rows.length === 0 ? (
              <div className="rounded-2xl border border-line bg-surface-subtle p-10 text-center text-sm text-ink-muted">
                Bảng giá danh mục này đang được cập nhật. Vui lòng liên hệ
                Hotline để nhận báo giá trực tiếp.
              </div>
            ) : (
              <>
                {/* Mobile card layout — zero horizontal overflow */}
                <div className="grid gap-3 md:hidden">
                  {rows.map((row) => {
                    const bookingHref = buildBookingHref(row);
                    return (
                      <div
                        key={row.id}
                        className="rounded-2xl border border-line bg-surface p-4 shadow-card"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-base font-semibold text-navy break-words">
                            {row.serviceName}
                          </h3>
                          <span className="shrink-0 font-mono text-base font-bold text-brand tabular-nums">
                            {showExactPrices ? row.priceText : "Liên hệ báo giá"}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-ink-muted">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                            <span>Thời gian: {row.duration}</span>
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <ShieldCheck className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                            <span>Bảo hành: {row.warranty}</span>
                          </span>
                        </div>
                        <div className="mt-4">
                          <Link
                            href={bookingHref}
                            className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full bg-brand-light px-4 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-ink-inverse focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                          >
                            <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                            <span>Đặt lịch</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop table layout */}
                <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface shadow-card md:block">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-navy text-ink-inverse">
                        <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                          Hạng mục dịch vụ
                        </th>
                        <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                          Giá niêm yết
                        </th>
                        <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                          Thời gian
                        </th>
                        <th scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider">
                          Bảo hành
                        </th>
                        <th scope="col" className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">
                          Đặt lịch
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line-subtle text-sm">
                      {rows.map((row) => {
                        const bookingHref = buildBookingHref(row);
                        return (
                          <tr
                            key={row.id}
                            className="transition-colors hover:bg-surface-subtle"
                          >
                            <td className="px-6 py-4 font-medium text-navy break-words max-w-md">
                              {row.serviceName}
                            </td>
                            <td className="px-6 py-4 font-mono font-bold text-brand whitespace-nowrap tabular-nums">
                              {showExactPrices ? row.priceText : "Liên hệ báo giá"}
                            </td>
                            <td className="px-6 py-4 text-ink-muted whitespace-nowrap">
                              {row.duration}
                            </td>
                            <td className="px-6 py-4 text-ink-muted whitespace-nowrap">
                              {row.warranty}
                            </td>
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                              <Link
                                href={bookingHref}
                                className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-brand-light px-4 py-2 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-ink-inverse focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                              >
                                <CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>Đặt lịch</span>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </Tabs.Content>
        );
      })}
    </Tabs.Root>
  );
}
