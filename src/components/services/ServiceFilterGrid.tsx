"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SERVICE_CATEGORIES, cn } from "@/lib/utils";
import type { Service } from "@/db/schema";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";

export function ServiceFilterGrid({
  services,
  showExactPrices,
}: {
  services: Service[];
  showExactPrices: boolean;
}) {
  const [activeCat, setActiveCat] = useState<string>("all");

  const filtered = useMemo(
    () =>
      activeCat === "all"
        ? services
        : services.filter((s) => s.category === activeCat),
    [activeCat, services]
  );

  return (
    <div>
      <div
        role="group"
        aria-label="Lọc danh mục dịch vụ"
        className="mb-10 flex flex-wrap gap-2"
      >
        {SERVICE_CATEGORIES.map((cat) => {
          const isSelected = activeCat === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setActiveCat(cat.key)}
              className={cn(
                "min-h-11 rounded-full px-4 py-2.5 text-sm font-semibold transition-all",
                isSelected
                  ? "bg-brand text-ink-inverse shadow-sm"
                  : "border border-line bg-surface text-ink-muted hover:border-brand/40 hover:text-navy"
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-2xl border border-line bg-surface-subtle p-10 text-center space-y-4"
        >
          <p className="text-sm text-ink-muted">
            Chưa có dịch vụ nào trong danh mục này.
          </p>
          <button
            type="button"
            onClick={() => setActiveCat("all")}
            className="inline-flex min-h-11 items-center rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-ink-inverse hover:bg-brand-hover"
          >
            Xem tất cả dịch vụ
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((service) => (
            <Link
              key={service.id}
              href={`/dich-vu/${service.slug}`}
              className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-card-hover"
            >
              <div className="relative h-52 overflow-hidden bg-surface-muted">
                <ResponsiveImage
                  src={service.imageUrl}
                  alt={service.title}
                  width={640}
                  height={416}
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between p-6">
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-brand-light px-3 py-1 font-mono text-xs font-semibold text-brand">
                      {showExactPrices ? service.priceFrom : "Kiểm tra báo giá"}
                    </span>
                    <span className="text-xs font-medium text-ink-muted">
                      BH: {service.warranty}
                    </span>
                  </div>
                  <h2 className="font-heading text-xl font-bold text-navy group-hover:text-brand transition-colors break-words">
                    {service.title}
                  </h2>
                  <p className="text-sm leading-relaxed text-ink-muted break-words">
                    {service.shortDesc}
                  </p>
                </div>
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                  <span>Xem chi tiết &amp; bảng giá</span>
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
