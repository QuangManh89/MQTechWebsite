"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AdminPanelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[MQTech Admin Error]", error);
  }, [error]);

  return (
    <div
      role="alert"
      className="mx-auto my-12 max-w-lg rounded-2xl border border-status-danger-line bg-surface p-8 text-center shadow-card space-y-4"
    >
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-status-danger-bg text-status-danger-ink">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      </div>
      <h2 className="font-heading text-xl font-bold text-navy">
        Không thể hiển thị bảng quản trị lúc này
      </h2>
      <p className="text-sm text-ink-muted">
        Phát sinh lỗi kết nối dữ liệu tạm thời. Vui lòng bấm tải lại để tiếp tục
        thao tác quản trị.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-ink-inverse hover:bg-brand-hover"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        <span>Tải lại trang quản trị</span>
      </button>
    </div>
  );
}
