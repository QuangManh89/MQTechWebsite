"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Plus, RefreshCw, Save, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import type { Service } from "@/db/schema";
import { SERVICE_CATEGORIES } from "@/lib/utils";
import { ConfirmDialog, ModalDialog } from "@/components/ui/ModalDialog";
import { useAdminRole } from "@/components/admin/AdminShell";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export default function AdminServicesPage() {
  const router = useRouter();
  const userRole = useAdminRole();
  const [items, setItems] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Service> | null>(null);
  const [deletingTarget, setDeletingTarget] = useState<Service | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/services");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) {
        setLoadError("Không thể tải danh sách dịch vụ.");
        return;
      }
      const data = await res.json();
      setItems(data.services || []);
    } catch {
      setLoadError("Lỗi kết nối máy chủ khi tải dịch vụ.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("Ảnh vượt quá giới hạn 5MB. Vui lòng chọn ảnh nhỏ hơn.");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        setEditing({ ...editing, imageUrl: data.url });
        toast.success(`Đã tải ảnh lên (${data.provider})`);
      } else {
        toast.error(data.error || "Upload ảnh thất bại");
      }
    } catch {
      toast.error("Lỗi mạng khi tải ảnh lên.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const isNew = !editing.id;
      const res = await fetch("/api/admin/services", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (res.ok) {
        toast.success(isNew ? "Đã thêm dịch vụ mới" : "Đã cập nhật dịch vụ");
        setEditing(null);
        await load();
      } else {
        toast.error("Không thể lưu dịch vụ. Kiểm tra lại Slug không bị trùng.");
      }
    } catch {
      toast.error("Lỗi kết nối mạng khi lưu dịch vụ.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deletingTarget) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/services?id=${deletingTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Đã xóa dịch vụ");
        setDeletingTarget(null);
        await load();
      } else {
        toast.error("Không thể xóa dịch vụ.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy">
            Quản lý Dịch vụ
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Chỉnh sửa nội dung, giá khởi điểm và hình ảnh (lưu Cloudflare R2).
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setEditing({
              title: "",
              slug: "",
              category: "onsite-it",
              shortDesc: "",
              description: "",
              priceFrom: "Chỉ từ 150.000đ",
              warranty: "3 - 12 tháng",
              duration: "30 - 60 phút",
              imageUrl:
                "https://images.unsplash.com/photo-1721332154191-ba5f1534266e?auto=format&fit=crop&w=1000&q=80",
              featured: false,
              sortOrder: 10,
              isPublished: true,
            })
          }
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-ink-inverse hover:bg-brand-hover"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Thêm dịch vụ</span>
        </button>
      </div>

      {loadError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-status-danger-line bg-status-danger-bg p-4 text-sm text-status-danger-ink"
        >
          <span className="inline-flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-status-danger-ink" aria-hidden="true" />
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
          Đang tải danh sách dịch vụ...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-10 text-center space-y-3">
          <p className="text-sm text-ink-muted">
            Chưa có dịch vụ nào trong danh sách. Hãy thêm dịch vụ đầu tiên để hiển
            thị trên website.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface shadow-card"
            >
              <div>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  width={480}
                  height={240}
                  loading="lazy"
                  decoding="async"
                  className="h-40 w-full object-cover bg-surface-muted"
                />
                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono font-bold text-brand">
                      {item.priceFrom}
                    </span>
                    <span className="text-ink-muted">
                      {item.isPublished ? "Đang hiện" : "Đang ẩn"}
                    </span>
                  </div>
                  <h2 className="font-heading text-base font-bold text-navy break-words">
                    {item.title}
                  </h2>
                  <p className="text-xs text-ink-muted line-clamp-2 break-words">
                    {item.shortDesc}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-line-subtle px-5 py-2.5">
                <button
                  type="button"
                  onClick={() => setEditing(item)}
                  className="min-h-11 rounded-lg px-2 text-xs font-semibold text-brand hover:underline"
                >
                  Chỉnh sửa
                </button>
                {userRole === "ADMIN" && (
                  <button
                    type="button"
                    aria-label={`Xóa dịch vụ ${item.title}`}
                    onClick={() => setDeletingTarget(item)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink-subtle hover:bg-status-danger-bg hover:text-status-danger-ink"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalDialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        title={editing?.id ? "Cập nhật dịch vụ" : "Thêm dịch vụ mới"}
        description="Điền đầy đủ tiêu đề, đường dẫn slug và bảng giá khởi điểm của dịch vụ."
      >
        {editing && (
          <form onSubmit={handleSave} className="space-y-4 text-sm">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="serviceTitle"
                  className="block text-xs font-semibold text-ink-muted mb-1"
                >
                  Tên dịch vụ *
                </label>
                <input
                  id="serviceTitle"
                  required
                  maxLength={150}
                  placeholder="VD: Sửa Laptop Windows chuyên sâu"
                  value={editing.title || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, title: e.target.value })
                  }
                  className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 text-base sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="serviceSlug"
                  className="block text-xs font-semibold text-ink-muted mb-1"
                >
                  Slug URL *
                </label>
                <input
                  id="serviceSlug"
                  required
                  maxLength={150}
                  placeholder="sua-laptop-bmt"
                  value={editing.slug || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, slug: e.target.value })
                  }
                  className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 font-mono text-xs"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="serviceCatSelect"
                  className="block text-xs font-semibold text-ink-muted mb-1"
                >
                  Danh mục
                </label>
                <select
                  id="serviceCatSelect"
                  value={editing.category || "onsite-it"}
                  onChange={(e) =>
                    setEditing({ ...editing, category: e.target.value })
                  }
                  className="min-h-11 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-base sm:text-sm"
                >
                  {SERVICE_CATEGORIES.filter((c) => c.key !== "all").map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="servicePriceFrom"
                  className="block text-xs font-semibold text-ink-muted mb-1"
                >
                  Giá khởi điểm *
                </label>
                <input
                  id="servicePriceFrom"
                  required
                  maxLength={80}
                  placeholder="Chỉ từ 150.000đ"
                  value={editing.priceFrom || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, priceFrom: e.target.value })
                  }
                  className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 text-base sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="serviceWarranty"
                  className="block text-xs font-semibold text-ink-muted mb-1"
                >
                  Bảo hành *
                </label>
                <input
                  id="serviceWarranty"
                  required
                  maxLength={80}
                  placeholder="6 - 12 tháng"
                  value={editing.warranty || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, warranty: e.target.value })
                  }
                  className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 text-base sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="serviceImageUrl"
                className="block text-xs font-semibold text-ink-muted mb-1"
              >
                Hình ảnh đại diện (tối đa 5MB) *
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  id="serviceImageUrl"
                  required
                  placeholder="https://..."
                  value={editing.imageUrl || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, imageUrl: e.target.value })
                  }
                  className="min-h-11 flex-1 rounded-xl border border-line px-3.5 py-2.5 text-xs"
                />
                <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface-subtle px-4 py-2.5 text-xs font-semibold text-navy hover:bg-surface-muted">
                  <Upload className="h-4 w-4 text-brand" aria-hidden="true" />
                  <span>{uploading ? "Đang tải..." : "Upload ảnh R2"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleUpload}
                  />
                </label>
              </div>
            </div>

            <div>
              <label
                htmlFor="serviceShortDesc"
                className="block text-xs font-semibold text-ink-muted mb-1"
              >
                Mô tả ngắn *
              </label>
              <textarea
                id="serviceShortDesc"
                required
                rows={2}
                maxLength={500}
                value={editing.shortDesc || ""}
                onChange={(e) =>
                  setEditing({ ...editing, shortDesc: e.target.value })
                }
                className="w-full rounded-xl border border-line px-3.5 py-2.5 text-base sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="serviceFullDesc"
                className="block text-xs font-semibold text-ink-muted mb-1"
              >
                Mô tả chi tiết *
              </label>
              <textarea
                id="serviceFullDesc"
                required
                rows={4}
                maxLength={4000}
                value={editing.description || ""}
                onChange={(e) =>
                  setEditing({ ...editing, description: e.target.value })
                }
                className="w-full rounded-xl border border-line px-3.5 py-2.5 text-base sm:text-sm"
              />
            </div>

            <label className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-navy">
              <input
                type="checkbox"
                checked={editing.isPublished !== false}
                onChange={(e) =>
                  setEditing({ ...editing, isPublished: e.target.checked })
                }
              />
              <span>Hiển thị công khai trên website</span>
            </label>

            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand py-3 font-semibold text-ink-inverse hover:bg-brand-hover disabled:opacity-60"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              <span>{saving ? "Đang lưu..." : "Lưu dịch vụ"}</span>
            </button>
          </form>
        )}
      </ModalDialog>

      <ConfirmDialog
        open={Boolean(deletingTarget)}
        onOpenChange={(open) => {
          if (!open) setDeletingTarget(null);
        }}
        title="Xóa dịch vụ này?"
        description={`Dịch vụ "${deletingTarget?.title ?? ""}" sẽ bị gỡ khỏi danh sách dịch vụ trên website.`}
        loading={saving}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
