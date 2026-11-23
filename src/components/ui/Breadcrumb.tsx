import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const siteBase = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://suamaytinhbmt.id.vn"
  ).replace(/\/$/, "");

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: siteBase,
      },
      ...items.map((item, idx) => ({
        "@type": "ListItem",
        position: idx + 2,
        name: item.label,
        ...(item.href ? { item: `${siteBase}${item.href}` } : {}),
      })),
    ],
  };

  return (
    <nav aria-label="Đường dẫn điều hướng" className="mb-2">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-ink-muted">
        <li>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-lg px-1.5 hover:text-brand transition-colors"
          >
            Trang chủ
          </Link>
        </li>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={item.label} className="inline-flex items-center gap-1.5 min-w-0">
              <ChevronRight
                className="h-3.5 w-3.5 shrink-0 text-ink-subtle"
                aria-hidden="true"
              />
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center rounded-lg px-1.5 hover:text-brand transition-colors truncate"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current="page"
                  className="inline-flex min-h-11 items-center font-semibold text-ink truncate max-w-[240px] sm:max-w-md"
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
