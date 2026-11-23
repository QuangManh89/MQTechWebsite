"use client";

import * as Tabs from "@radix-ui/react-tabs";
import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import type { PricingItem } from "@/db/schema";

const TABS = [
  { key: "laptop-macbook", label: "Laptop & MacBook" },
  { key: "pc-build", label: "PC & Build Máy Bộ" },
  { key: "clean-upgrade", label: "Vệ Sinh & Nâng Cấp" },
  { key: "onsite-it", label: "Sửa Tại Nhà & IT BMT" },
];

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
            className="min-h-11 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink-muted transition-all hover:border-brand/40 hover:text-navy data-[state=active]:border-brand data-[state=active]:bg-brand data-[state=active]:text-ink-inverse data-[state=active]:shadow-sm"
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
              <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-card">
                <table className="w-full min-w-[680px] text-left border-collapse">
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
                    {rows.map((row) => (
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
                            href={`/dat-lich?dich_vu=${encodeURIComponent(row.serviceName)}`}
                            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-brand-light px-4 py-2 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-ink-inverse"
                          >
                            <CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Đặt lịch</span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Tabs.Content>
        );
      })}
    </Tabs.Root>
  );
}
