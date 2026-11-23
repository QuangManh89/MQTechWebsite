"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, Phone, RefreshCw } from "lucide-react";

export default function GlobalRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[MQTech Route Error]", error);
  }, [error]);

  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-surface-subtle px-4 py-16">
      <div
        role="alert"
        className="w-full max-w-lg rounded-2xl border border-line bg-surface p-8 text-center shadow-card sm:p-10"
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-status-danger-bg text-status-danger-ink">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-navy sm:text-3xl">
          Đã xảy ra sự cố tạm thời khi tải trang
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">
          Hệ thống đang gặp gián đoạn nhỏ. Bạn có thể bấm thử tải lại trang ngay
          bên dưới hoặc gọi trực tiếp Hotline kỹ thuật MQTech BMT để được hỗ trợ
          ngay lập tức.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-ink-inverse hover:bg-brand-hover"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span>Thử tải lại</span>
          </button>
          <a
            href="tel:0987482573"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 font-mono text-sm font-semibold text-navy tabular-nums hover:border-brand hover:text-brand"
          >
            <Phone className="h-4 w-4 text-brand" aria-hidden="true" />
            <span>0987 482 573</span>
          </a>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-navy hover:border-brand hover:text-brand"
          >
            <Home className="h-4 w-4 text-brand" aria-hidden="true" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
