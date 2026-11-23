import Link from "next/link";
import { ArrowLeft, CalendarCheck, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-subtle px-4 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-line bg-surface p-8 text-center shadow-card sm:p-10">
        <h1 className="font-heading text-2xl font-bold text-navy sm:text-3xl">
          <span className="font-mono text-brand">404</span> — Không tìm thấy
          trang bạn yêu cầu
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted sm:text-base">
          Đường dẫn này có thể đã thay đổi hoặc không còn tồn tại. Bạn có thể
          quay về trang chủ MQTech BMT, đặt lịch sửa máy hoặc tra cứu phiếu bảo
          hành bên dưới.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-ink-inverse hover:bg-brand-hover"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Về trang chủ</span>
          </Link>
          <Link
            href="/dat-lich"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-navy hover:border-brand hover:text-brand"
          >
            <CalendarCheck className="h-4 w-4 text-brand" aria-hidden="true" />
            <span>Đặt lịch sửa</span>
          </Link>
          <Link
            href="/tra-cuu"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-navy hover:border-brand hover:text-brand"
          >
            <Search className="h-4 w-4 text-brand" aria-hidden="true" />
            <span>Tra cứu BH</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
