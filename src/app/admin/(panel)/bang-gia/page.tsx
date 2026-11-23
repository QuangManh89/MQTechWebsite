"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { PricingItem } from "@/db/schema";
import { ConfirmDialog } from "@/components/ui/ModalDialog";

const TABS = [
  { key: "laptop-macbook", label: "Laptop & MacBook" },
  { key: "pc-build", label: "PC & Build Máy Bộ" },
  { key: "clean-upgrade", label: "Vệ Sinh & Nâng Cấp" },
  { key: "onsite-it", label: "Sửa Tại Nhà & IT BMT" },
];

export default function AdminPricingPage() {
  const router = useRouter();
  const [items, setItems] = useState<PricingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [deletingTarget, setDeletingTarget] = useState<PricingItem | null>(
    null
  );

  const [form, setForm] = useState({
    tabCategory: "laptop-macbook",
    serviceName: "",
    priceText: "",
    duration: "30 - 45 phút",
    warranty: "6 tháng",
  });

  const load = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pricing");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) {
        setLoadError("Không thể tải dữ liệu bảng giá.");
        return;
      }
      const data = await res.json();
      setItems(data.items || []);
    } catch {
      setLoadError("Mất kết nối máy chủ khi tải bảng giá.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success("Đã thêm hạng mục bảng giá");
        setForm({ ...form, serviceName: "", priceText: "" });
        await load();
      } else {
        toast.error("Không thể thêm dòng bảng giá");
      }
    } catch {
      toast.error("Lỗi kết nối mạng");
    } finally {
      setAdding(false);
    }
  }

  async function handleUpdateRow(item: PricingItem) {
    setSavingId(item.id);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        toast.success("Đã lưu dòng bảng giá");
      } else {
        toast.error("Không thể lưu dòng bảng giá");
      }
    } catch {
      toast.error("Lỗi kết nối mạng");
    } finally {
      setSavingId(null);
    }
  }

  async function confirmDelete() {
    if (!deletingTarget) return;
    setSavingId(deletingTarget.id);
    try {
      const res = await fetch(`/api/admin/pricing?id=${deletingTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Đã xóa dòng bảng giá");
        setDeletingTarget(null);
        await load();
      } else {
        toast.error("Không thể xóa dòng bảng giá");
      }
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-navy">
          Quản lý Bảng giá niêm yết
        </h1>
        <p className="text-sm text-ink-muted mt-0.5">
          Chỉnh sửa trực tiếp giá từng hạng mục hoặc thêm dòng mới.
        </p>
      </div>

      <form
        onSubmit={handleAdd}
        className="rounded-2xl border border-line bg-surface p-5 shadow-card grid gap-3 sm:grid-cols-6 items-end"
      >
        <div className="sm:col-span-1">
          <label
            htmlFor="addPricingTab"
            className="block text-xs font-semibold text-ink-muted mb-1"
          >
            Nhóm Tab
          </label>
          <select
            id="addPricingTab"
            value={form.tabCategory}
            onChange={(e) => setForm({ ...form, tabCategory: e.target.value })}
            className="min-h-11 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-xs text-navy"
          >
            {TABS.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="addPricingName"
            className="block text-xs font-semibold text-ink-muted mb-1"
          >
            Tên hạng mục *
          </label>
          <input
            id="addPricingName"
            required
            maxLength={180}
            value={form.serviceName}
            onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
            placeholder="VD: Cài Win tại nhà BMT"
            className="min-h-11 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-xs text-navy"
          />
        </div>
        <div>
          <label
            htmlFor="addPricingPrice"
            className="block text-xs font-semibold text-ink-muted mb-1"
          >
            Giá hiển thị *
          </label>
          <input
            id="addPricingPrice"
            required
            maxLength={80}
            value={form.priceText}
            onChange={(e) => setForm({ ...form, priceText: e.target.value })}
            placeholder="150.000đ"
            className="min-h-11 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-xs text-navy"
          />
        </div>
        <div>
          <label
            htmlFor="addPricingWarranty"
            className="block text-xs font-semibold text-ink-muted mb-1"
          >
            Bảo hành *
          </label>
          <input
            id="addPricingWarranty"
            required
            maxLength={80}
            value={form.warranty}
            onChange={(e) => setForm({ ...form, warranty: e.target.value })}
            className="min-h-11 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-xs text-navy"
          />
        </div>
        <button
          type="submit"
          disabled={adding}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-2.5 text-xs font-semibold text-ink-inverse hover:bg-brand-hover disabled:opacity-60"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>{adding ? "Đang thêm..." : "Thêm"}</span>
        </button>
      </form>

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
          Đang tải bảng giá...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-10 text-center text-sm text-ink-muted">
          Bảng giá hiện chưa có hạng mục nào. Hãy điền biểu mẫu phía trên để thêm
          dòng giá đầu tiên.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-card">
          <table className="w-full min-w-[780px] text-left text-xs">
            <thead className="bg-surface-subtle uppercase text-ink-muted">
              <tr>
                <th scope="col" className="px-4 py-3">Nhóm</th>
                <th scope="col" className="px-4 py-3">Hạng mục</th>
                <th scope="col" className="px-4 py-3">Giá</th>
                <th scope="col" className="px-4 py-3">Thời gian</th>
                <th scope="col" className="px-4 py-3">Bảo hành</th>
                <th scope="col" className="px-4 py-3 text-right">Lưu / Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-subtle">
              {items.map((item, idx) => (
                <tr key={item.id}>
                  <td className="px-4 py-2.5 font-semibold text-navy whitespace-nowrap">
                    {TABS.find((t) => t.key === item.tabCategory)?.label}
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      aria-label={`Tên hạng mục dòng ${idx + 1}`}
                      value={item.serviceName}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx] = { ...item, serviceName: e.target.value };
                        setItems(copy);
                      }}
                      className="min-h-11 w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-navy"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      aria-label={`Giá hạng mục ${item.serviceName}`}
                      value={item.priceText}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx] = { ...item, priceText: e.target.value };
                        setItems(copy);
                      }}
                      className="min-h-11 w-36 rounded-lg border border-line bg-surface px-2.5 py-1.5 font-mono text-brand font-bold tabular-nums"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      aria-label={`Thời gian xử lý ${item.serviceName}`}
                      value={item.duration}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx] = { ...item, duration: e.target.value };
                        setItems(copy);
                      }}
                      className="min-h-11 w-28 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-navy"
                    />
                  </td>
                  <td className="px-4 py-2.5">
                    <input
                      aria-label={`Bảo hành ${item.serviceName}`}
                      value={item.warranty}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx] = { ...item, warranty: e.target.value };
                        setItems(copy);
                      }}
                      className="min-h-11 w-28 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-navy"
                    />
                  </td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        disabled={savingId === item.id}
                        onClick={() => void handleUpdateRow(item)}
                        className="inline-flex min-h-11 items-center gap-1 rounded-lg bg-brand-light px-3 py-1.5 font-semibold text-brand hover:bg-brand hover:text-ink-inverse disabled:opacity-60"
                      >
                        <Save className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Lưu</span>
                      </button>
                      <button
                        type="button"
                        aria-label={`Xóa dòng giá ${item.serviceName}`}
                        onClick={() => setDeletingTarget(item)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink-subtle hover:bg-status-danger-bg hover:text-status-danger-ink"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deletingTarget)}
        onOpenChange={(open) => {
          if (!open) setDeletingTarget(null);
        }}
        title="Xóa dòng bảng giá?"
        description={`Hạng mục "${deletingTarget?.serviceName ?? ""}" sẽ bị xóa khỏi bảng giá công khai.`}
        loading={savingId !== null}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
