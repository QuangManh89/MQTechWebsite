"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  CloudUpload,
  Database,
  Download,
  Loader2,
  RefreshCw,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ModalDialog";

interface BackupStatus {
  r2Configured: boolean;
  backupPostgresConfigured: boolean;
  counts: Record<string, number>;
  exportedAt: string;
}

export function BackupManagerSection() {
  const [status, setStatus] = useState<BackupStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<
    null | "r2" | "postgres" | "restore"
  >(null);
  const [lastResult, setLastResult] = useState<string>("");
  const [pendingRestoreFile, setPendingRestoreFile] = useState<File | null>(
    null
  );

  async function loadStatus() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/backup");
      if (res.ok) {
        setStatus(await res.json());
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  async function handleBackupToR2() {
    setBusyAction("r2");
    try {
      const res = await fetch("/api/admin/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "r2" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sao lưu R2 thất bại");
      const kb = (Number(data.sizeBytes || 0) / 1024).toFixed(1);
      const msg =
        data.provider === "r2"
          ? `Đã sao lưu lên Cloudflare R2: ${data.key} (${kb} KB)`
          : `Đã lưu bản sao lưu local: ${data.key} (${kb} KB)`;
      setLastResult(msg);
      toast.success(msg);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi sao lưu R2");
    } finally {
      setBusyAction(null);
    }
  }

  async function handleSyncPostgres() {
    setBusyAction("postgres");
    try {
      const res = await fetch("/api/admin/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "postgres" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Đồng bộ PostgreSQL thất bại");
      const msg = `Đã đồng bộ toàn bộ 11 bảng sang PostgreSQL dự phòng lúc ${new Date(
        data.syncedAt
      ).toLocaleString("vi-VN")}`;
      setLastResult(msg);
      toast.success(msg);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Lỗi đồng bộ PostgreSQL dự phòng"
      );
    } finally {
      setBusyAction(null);
    }
  }

  function handleRestoreFile(file: File | undefined) {
    if (!file) return;
    setPendingRestoreFile(file);
  }

  async function handleConfirmRestoreFile() {
    if (!pendingRestoreFile) return;
    const file = pendingRestoreFile;
    setBusyAction("restore");
    try {
      const text = await file.text();
      const snapshot = JSON.parse(text);
      const res = await fetch("/api/admin/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", snapshot }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Khôi phục dữ liệu thất bại");
      toast.success("Đã khôi phục toàn bộ dữ liệu từ file backup thành công!");
      setPendingRestoreFile(null);
      await loadStatus();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "File backup không hợp lệ"
      );
    } finally {
      setBusyAction(null);
    }
  }

  const totalRows = status
    ? Object.values(status.counts).reduce((sum, n) => sum + Number(n || 0), 0)
    : 0;

  return (
    <div className="rounded-2xl border border-line bg-surface p-6 shadow-card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Database className="h-5 w-5 text-brand" aria-hidden="true" />
          <div>
            <h2 className="font-heading text-base font-bold text-navy">
              6. Sao lưu &amp; Dự phòng dữ liệu (Backup R2 + PostgreSQL thứ 2)
            </h2>
            <p className="text-xs text-ink-muted">
              Sao lưu chéo toàn bộ 11 bảng (Khách hàng, Phiếu sửa, Kho, Thu chi, Bài viết, Dịch vụ, Cài đặt) sang Cloudflare R2, máy cá nhân hoặc PostgreSQL dự phòng.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={loadStatus}
          disabled={loading}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line px-4 text-xs font-semibold text-navy hover:border-brand hover:text-brand"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          <span>Kiểm tra</span>
        </button>
      </div>

      {/* Status Badges */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
        <div className="rounded-xl border border-line bg-surface-subtle p-3">
          <p className="font-semibold text-ink-muted">Dữ liệu hiện tại</p>
          <p className="mt-1 font-mono text-sm font-bold text-navy">
            11 bảng • {totalRows} bản ghi
          </p>
        </div>
        <div className="rounded-xl border border-line bg-surface-subtle p-3">
          <p className="font-semibold text-ink-muted">Cloudflare R2 Backup</p>
          <p className="mt-1 font-semibold text-navy">
            {status?.r2Configured ? (
              <span className="text-status-success-ink">Đã kết nối sẵn sàng</span>
            ) : (
              <span className="text-status-warning-ink">Chế độ local (.backups/)</span>
            )}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-surface-subtle p-3">
          <p className="font-semibold text-ink-muted">
            PostgreSQL thứ 2 (BACKUP_DATABASE_URL)
          </p>
          <p className="mt-1 font-semibold text-navy">
            {status?.backupPostgresConfigured ? (
              <span className="text-status-success-ink">Đã cấu hình sẵn sàng</span>
            ) : (
              <span className="text-ink-muted">
                Chưa gắn (thêm qua Fly secrets khi cần)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        <a
          href="/api/admin/backup?download=1"
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-xs font-semibold text-navy hover:border-brand hover:text-brand transition-colors"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          <span>Tải file Backup (.json)</span>
        </a>

        <button
          type="button"
          disabled={busyAction !== null}
          onClick={handleBackupToR2}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-brand px-4 text-xs font-semibold text-ink-inverse hover:bg-brand-hover disabled:opacity-60 transition-colors"
        >
          {busyAction === "r2" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <CloudUpload className="h-4 w-4" aria-hidden="true" />
          )}
          <span>Sao lưu lên Cloudflare R2</span>
        </button>

        <button
          type="button"
          disabled={busyAction !== null || !status?.backupPostgresConfigured}
          onClick={handleSyncPostgres}
          title={
            status?.backupPostgresConfigured
              ? "Chép bản sao sạch toàn bộ 11 bảng sang PostgreSQL dự phòng"
              : "Cần thêm biến BACKUP_DATABASE_URL trên Fly.io trước"
          }
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-navy px-4 text-xs font-semibold text-ink-inverse hover:bg-navy/90 disabled:opacity-45 transition-colors"
        >
          {busyAction === "postgres" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Database className="h-4 w-4" aria-hidden="true" />
          )}
          <span>Đồng bộ sang PostgreSQL dự phòng</span>
        </button>

        <label className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border border-status-danger-line bg-status-danger-bg px-4 text-xs font-semibold text-status-danger-ink hover:opacity-90 transition-opacity">
          {busyAction === "restore" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Upload className="h-4 w-4" aria-hidden="true" />
          )}
          <span>Khôi phục từ file (.json)</span>
          <input
            type="file"
            accept="application/json,.json"
            disabled={busyAction !== null}
            className="hidden"
            onChange={(e) => {
              handleRestoreFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {lastResult && (
        <div className="flex items-center gap-2 rounded-xl border border-status-success-line bg-status-success-bg px-3.5 py-2.5 text-xs font-medium text-status-success-ink">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-status-success-ink" aria-hidden="true" />
          <span>{lastResult}</span>
        </div>
      )}

      <ConfirmDialog
        open={pendingRestoreFile !== null}
        onOpenChange={(open) => {
          if (!open && busyAction !== "restore") setPendingRestoreFile(null);
        }}
        title="Khôi phục dữ liệu từ file backup?"
        description={
          pendingRestoreFile
            ? `CẢNH BÁO: Khôi phục từ file "${pendingRestoreFile.name}" sẽ ghi đè toàn bộ dữ liệu hiện tại trong database chính. Bạn có chắc chắn muốn tiếp tục?`
            : ""
        }
        confirmLabel="Xác nhận khôi phục"
        loading={busyAction === "restore"}
        onConfirm={handleConfirmRestoreFile}
      />
    </div>
  );
}
