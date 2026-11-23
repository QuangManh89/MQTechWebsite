"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ContactInquiry } from "@/db/schema";
import { ConfirmDialog } from "@/components/ui/ModalDialog";

export default function AdminInquiriesPage() {
  const router = useRouter();
  const [items, setItems] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [deletingTarget, setDeletingTarget] = useState<ContactInquiry | null>(
    null
  );

  const load = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inquiries");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) {
        setLoadError("Không thể tải danh sách câu hỏi liên hệ.");
        return;
      }
      const data = await res.json();
      setItems(data.inquiries || []);
    } catch {
      setLoadError("Mất kết nối máy chủ khi tải câu hỏi.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function markReplied(id: number) {
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "REPLIED" }),
      });
      if (res.ok) {
        toast.success("Đã đánh dấu đã phản hồi");
        await load();
      } else {
        toast.error("Không thể cập nhật trạng thái");
      }
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!deletingTarget) return;
    setBusyId(deletingTarget.id);
    try {
      const res = await fetch(`/api/admin/inquiries?id=${deletingTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Đã xóa câu hỏi liên hệ");
        setDeletingTarget(null);
        await load();
      } else {
        toast.error("Không thể xóa câu hỏi");
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">
          Câu hỏi &amp; Yêu cầu liên hệ
        </h1>
        <p className="text-sm text-ink-muted mt-0.5">
          Danh sách khách hàng gửi câu hỏi từ trang Liên hệ.
        </p>
      </div>

      {loadError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-status-danger-line bg-status-danger-bg p-4 text-sm text-status-danger-ink"
        >
          <span className="inline-flex items-center gap-2">
            <AlertCircle
              className="h-4 w-4 text-status-danger-ink"
              aria-hidden="true"
            />
            {loadError}
          </span>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-status-danger-solid px-4 py-2 text-xs font-semibold text-ink-inverse hover:bg-status-danger-hover"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Thử lại</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-line bg-surface p-10 text-center text-sm text-ink-muted">
          Đang tải danh sách câu hỏi...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-10 text-center text-sm text-ink-muted">
          Chưa có câu hỏi liên hệ nào từ khách hàng.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-line bg-surface p-5 shadow-card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-heading font-bold text-navy break-words">
                    {item.fullName}
                  </span>
                  <a
                    href={`tel:${item.phone}`}
                    className="font-mono text-xs font-semibold text-brand tabular-nums hover:underline"
                  >
                    {item.phone}
                  </a>
                  <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-ink-body">
                    {item.topic}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      item.status === "NEW"
                        ? "border-status-warning-line bg-status-warning-bg text-status-warning-ink"
                        : "border-status-success-line bg-status-success-bg text-status-success-ink"
                    }`}
                  >
                    {item.status === "NEW" ? "Chưa xử lý" : "Đã phản hồi"}
                  </span>
                </div>
                <p className="text-sm text-ink-body break-words">
                  {item.message}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.status === "NEW" && (
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => void markReplied(item.id)}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-status-success-line bg-status-success-bg px-4 py-2 text-xs font-semibold text-status-success-ink hover:bg-status-success-solid hover:text-ink-inverse disabled:opacity-60"
                  >
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Đã gọi tư vấn</span>
                  </button>
                )}
                <button
                  type="button"
                  aria-label={`Xóa câu hỏi của ${item.fullName}`}
                  onClick={() => setDeletingTarget(item)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink-subtle hover:bg-status-danger-bg hover:text-status-danger-ink"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deletingTarget)}
        onOpenChange={(open) => {
          if (!open) setDeletingTarget(null);
        }}
        title="Xóa câu hỏi liên hệ?"
        description={`Tin nhắn từ khách hàng "${deletingTarget?.fullName ?? ""}" sẽ bị xóa vĩnh viễn.`}
        loading={busyId !== null}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
