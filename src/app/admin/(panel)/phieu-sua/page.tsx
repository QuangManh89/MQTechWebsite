"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Plus, Printer, RefreshCw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { TICKET_STATUS_MAP, cn } from "@/lib/utils";
import type { RepairTicket } from "@/db/schema";
import { ConfirmDialog, ModalDialog } from "@/components/ui/ModalDialog";
import { TicketItemsEditor } from "@/components/admin/TicketItemsEditor";
import {
  calculateItemsTotal,
  formatVnd,
  parseTicketItems,
  type RepairLineItem,
} from "@/lib/ticket-items";

const STATUS_KEYS = Object.keys(TICKET_STATUS_MAP);

export default function AdminTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<RepairTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [editing, setEditing] = useState<RepairTicket | null>(null);
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingTarget, setDeletingTarget] = useState<RepairTicket | null>(
    null
  );

  const [newForm, setNewForm] = useState({
    customerName: "",
    customerPhone: "",
    serviceMode: "STORE",
    onsiteAddress: "",
    deviceType: "Laptop Windows",
    deviceModel: "",
    serialNumber: "",
    serviceCategory: "Sửa chữa phần cứng",
    issueDescription: "",
    estimatedCost: "",
    warrantyText: "Bảo hành 6 tháng (1 đổi 1)",
    warrantyUntil: "",
    technicianNote: "",
  });
  const [newItems, setNewItems] = useState<RepairLineItem[]>([]);

  const loadTickets = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tickets");
      if (res.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
        router.push("/admin/login");
        return;
      }
      if (!res.ok) {
        setLoadError("Không thể tải danh sách phiếu sửa chữa.");
        return;
      }
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch {
      setLoadError("Mất kết nối tới máy chủ. Vui lòng thử tải lại.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("create") === "1") {
      const phone = params.get("phone") || "";
      const name = params.get("name") || "";
      const address = params.get("address") || "";
      setNewForm((prev) => ({
        ...prev,
        customerPhone: phone || prev.customerPhone,
        customerName: name || prev.customerName,
        onsiteAddress: address || prev.onsiteAddress,
        serviceMode: address ? "ONSITE" : prev.serviceMode,
      }));
      setCreating(true);
    }
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newForm,
          itemsJson: JSON.stringify(newItems),
        }),
      });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (res.ok) {
        toast.success("Đã tạo phiếu tiếp nhận mới!");
        setCreating(false);
        setNewItems([]);
        setNewForm({
          customerName: "",
          customerPhone: "",
          serviceMode: "STORE",
          onsiteAddress: "",
          deviceType: "Laptop Windows",
          deviceModel: "",
          serialNumber: "",
          serviceCategory: "Sửa chữa phần cứng",
          issueDescription: "",
          estimatedCost: "",
          warrantyText: "Bảo hành 6 tháng (1 đổi 1)",
          warrantyUntil: "",
          technicianNote: "",
        });
        await loadTickets();
      } else {
        toast.error("Không thể tạo phiếu. Vui lòng kiểm tra thông tin nhập.");
      }
    } catch {
      toast.error("Lỗi kết nối mạng khi tạo phiếu.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/tickets/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (res.ok) {
        toast.success(`Đã cập nhật phiếu ${editing.ticketCode}`);
        setEditing(null);
        await loadTickets();
      } else {
        toast.error("Lỗi cập nhật phiếu");
      }
    } catch {
      toast.error("Lỗi kết nối mạng khi lưu phiếu.");
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmDelete() {
    if (!deletingTarget) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/tickets/${deletingTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(`Đã xóa phiếu ${deletingTarget.ticketCode}`);
        setDeletingTarget(null);
        await loadTickets();
      } else {
        toast.error("Không thể xóa phiếu lúc này.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const filtered =
    filterStatus === "ALL"
      ? tickets
      : tickets.filter((t) => t.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy">
            Phiếu sửa chữa &amp; Lịch hẹn BMT
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Quản lý lịch hẹn đặt online và tạo phiếu tiếp nhận khách tại quầy.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-ink-inverse shadow-sm hover:bg-brand-hover"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Tạo phiếu tại quầy</span>
        </button>
      </div>

      <div
        role="group"
        aria-label="Lọc theo trạng thái phiếu"
        className="flex flex-wrap gap-2"
      >
        <button
          type="button"
          aria-pressed={filterStatus === "ALL"}
          onClick={() => setFilterStatus("ALL")}
          className={cn(
            "min-h-11 rounded-full px-4 py-2 text-xs font-semibold transition-colors",
            filterStatus === "ALL"
              ? "bg-navy text-ink-inverse"
              : "border border-line bg-surface text-ink-muted hover:border-brand/40"
          )}
        >
          Tất cả ({tickets.length})
        </button>
        {STATUS_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={filterStatus === key}
            onClick={() => setFilterStatus(key)}
            className={cn(
              "min-h-11 rounded-full px-4 py-2 text-xs font-semibold transition-colors",
              filterStatus === key
                ? "bg-brand text-ink-inverse"
                : "border border-line bg-surface text-ink-muted hover:border-brand/40"
            )}
          >
            {TICKET_STATUS_MAP[key].label}
          </button>
        ))}
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
            onClick={() => void loadTickets()}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-status-danger-solid px-4 py-2 text-xs font-semibold text-ink-inverse hover:bg-status-danger-hover"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Thử tải lại</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-line bg-surface p-10 text-center text-sm text-ink-muted">
          Đang tải danh sách phiếu sửa chữa...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-10 text-center space-y-3">
          <p className="text-sm text-ink-muted">
            Chưa có phiếu sửa chữa nào khớp bộ lọc hiện tại.
          </p>
          {filterStatus !== "ALL" && (
            <button
              type="button"
              onClick={() => setFilterStatus("ALL")}
              className="inline-flex min-h-11 items-center rounded-full border border-line px-4 py-2 text-xs font-semibold text-navy hover:bg-surface-subtle"
            >
              Xem toàn bộ phiếu
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-card">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead className="bg-surface-subtle text-xs uppercase text-ink-muted">
              <tr>
                <th scope="col" className="px-5 py-3.5">Mã phiếu</th>
                <th scope="col" className="px-5 py-3.5">Khách hàng</th>
                <th scope="col" className="px-5 py-3.5">Thiết bị / Lỗi</th>
                <th scope="col" className="px-5 py-3.5">Chi phí &amp; BH</th>
                <th scope="col" className="px-5 py-3.5">Trạng thái</th>
                <th scope="col" className="px-5 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-subtle">
              {filtered.map((t) => {
                const st = TICKET_STATUS_MAP[t.status] ?? {
                  label: t.status,
                  badgeClass: "bg-surface-muted text-ink-body",
                };
                return (
                  <tr key={t.id} className="hover:bg-surface-subtle">
                    <td className="px-5 py-4 align-top">
                      <p className="font-mono font-bold text-brand tabular-nums">
                        {t.ticketCode}
                      </p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {t.source === "COUNTER" ? "Tại quầy" : "Đặt Online"} •{" "}
                        {t.serviceMode === "ONSITE" ? "Tại nhà" : "Tại tiệm"}
                      </p>
                    </td>
                    <td className="px-5 py-4 align-top max-w-[220px]">
                      <p className="font-semibold text-navy break-words">
                        {t.customerName}
                      </p>
                      <p className="font-mono text-xs text-ink-muted tabular-nums">
                        {t.customerPhone}
                      </p>
                      {t.onsiteAddress && (
                        <p className="text-xs text-ink-muted mt-1 break-words">
                          {t.onsiteAddress}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 align-top max-w-xs">
                      <p className="font-medium text-navy break-words">
                        {t.deviceType}{" "}
                        {t.deviceModel ? `(${t.deviceModel})` : ""}
                      </p>
                      <p className="text-xs text-ink-muted mt-0.5 line-clamp-2 break-words">
                        {t.issueDescription}
                      </p>
                      {parseTicketItems(t.itemsJson).length > 0 && (
                        <ul className="mt-1.5 space-y-0.5 text-[11px] text-ink-body">
                          {parseTicketItems(t.itemsJson).map((item, i) => (
                            <li key={i} className="flex items-center justify-between gap-2">
                              <span className="truncate">
                                • {item.name}
                                {item.warranty ? ` [${item.warranty}]` : ""}
                              </span>
                              <span className="font-mono font-semibold text-navy shrink-0">
                                {formatVnd(item.price)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="px-5 py-4 align-top text-xs">
                      <p className="font-mono font-bold text-navy break-words">
                        {t.estimatedCost || "Chưa báo giá"}
                      </p>
                      {t.warrantyUntil && (
                        <p className="text-status-success-ink mt-1 tabular-nums">
                          BH đến: {t.warrantyUntil}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
                          st.badgeClass
                        )}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-top text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <a
                          href={`/admin/in-hoa-don/${t.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`In hóa đơn ${t.ticketCode}`}
                          aria-label={`In hóa đơn ${t.ticketCode}`}
                          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-xs font-semibold text-navy hover:border-brand hover:text-brand"
                        >
                          <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>In HĐ</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => setEditing(t)}
                          className="min-h-11 rounded-lg bg-brand-light px-3.5 py-2 text-xs font-semibold text-brand hover:bg-brand hover:text-ink-inverse"
                        >
                          Cập nhật
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingTarget(t)}
                          aria-label={`Xóa phiếu ${t.ticketCode}`}
                          className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink-subtle hover:bg-status-danger-bg hover:text-status-danger-ink"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal tạo phiếu tại quầy */}
      <ModalDialog
        open={creating}
        onOpenChange={setCreating}
        title="Tạo phiếu tiếp nhận tại quầy"
        description="Nhập thông tin khách mang máy đến cửa hàng để sinh mã bảo hành điện tử MQ."
        maxWidthClass="max-w-xl"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="newTicketName"
                className="block text-xs font-semibold text-ink-muted mb-1"
              >
                Tên khách hàng *
              </label>
              <input
                id="newTicketName"
                required
                maxLength={120}
                placeholder="VD: Anh Minh Tuấn"
                value={newForm.customerName}
                onChange={(e) =>
                  setNewForm({ ...newForm, customerName: e.target.value })
                }
                className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 text-base sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="newTicketPhone"
                className="block text-xs font-semibold text-ink-muted mb-1"
              >
                Số điện thoại *
              </label>
              <input
                id="newTicketPhone"
                type="tel"
                required
                maxLength={20}
                placeholder="09xx xxx xxx"
                value={newForm.customerPhone}
                onChange={(e) =>
                  setNewForm({ ...newForm, customerPhone: e.target.value })
                }
                className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 text-base sm:text-sm"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="newTicketDevice"
                className="block text-xs font-semibold text-ink-muted mb-1"
              >
                Loại thiết bị
              </label>
              <select
                id="newTicketDevice"
                value={newForm.deviceType}
                onChange={(e) =>
                  setNewForm({ ...newForm, deviceType: e.target.value })
                }
                className="min-h-11 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-base sm:text-sm"
              >
                <option value="Laptop Windows">Laptop Windows</option>
                <option value="MacBook">MacBook</option>
                <option value="PC / Máy tính bàn">PC / Máy tính bàn</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="newTicketModel"
                className="block text-xs font-semibold text-ink-muted mb-1"
              >
                Model máy &amp; Serial
              </label>
              <input
                id="newTicketModel"
                maxLength={150}
                placeholder="VD: Dell 5515 - SN 882A"
                value={newForm.deviceModel}
                onChange={(e) =>
                  setNewForm({ ...newForm, deviceModel: e.target.value })
                }
                className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 text-base sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="newTicketIssue"
              className="block text-xs font-semibold text-ink-muted mb-1"
            >
              Mô tả lỗi / Hạng mục sửa chữa *
            </label>
            <textarea
              id="newTicketIssue"
              required
              rows={2}
              maxLength={2000}
              placeholder="Ghi rõ tình trạng tiếp nhận máy và yêu cầu của khách..."
              value={newForm.issueDescription}
              onChange={(e) =>
                setNewForm({ ...newForm, issueDescription: e.target.value })
              }
              className="w-full rounded-xl border border-line px-3.5 py-2.5 text-base sm:text-sm"
            />
          </div>

          <TicketItemsEditor
            items={newItems}
            onChange={(nextItems) => {
              setNewItems(nextItems);
              const total = calculateItemsTotal(nextItems);
              if (nextItems.length > 0) {
                setNewForm((prev) => ({
                  ...prev,
                  estimatedCost: formatVnd(total),
                }));
              }
            }}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="newTicketCost"
                className="block text-xs font-semibold text-ink-muted mb-1"
              >
                Chi phí dự kiến
              </label>
              <input
                id="newTicketCost"
                maxLength={80}
                placeholder="VD: 550.000đ"
                value={newForm.estimatedCost}
                onChange={(e) =>
                  setNewForm({ ...newForm, estimatedCost: e.target.value })
                }
                className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 text-base sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="newTicketWarrantyUntil"
                className="block text-xs font-semibold text-ink-muted mb-1"
              >
                Hạn bảo hành đến ngày
              </label>
              <input
                id="newTicketWarrantyUntil"
                type="date"
                value={newForm.warrantyUntil}
                onChange={(e) =>
                  setNewForm({ ...newForm, warrantyUntil: e.target.value })
                }
                className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 text-base sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="newTicketWarrantyText"
              className="block text-xs font-semibold text-ink-muted mb-1"
            >
              Nội dung bảo hành
            </label>
            <input
              id="newTicketWarrantyText"
              maxLength={200}
              placeholder="VD: Bảo hành SSD 36 tháng (1 đổi 1)"
              value={newForm.warrantyText}
              onChange={(e) =>
                setNewForm({ ...newForm, warrantyText: e.target.value })
              }
              className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 text-base sm:text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="min-h-12 w-full rounded-full bg-brand py-3 font-semibold text-ink-inverse hover:bg-brand-hover disabled:opacity-60"
          >
            {submitting ? "Đang tạo phiếu..." : "Tạo phiếu & Sinh mã MQ"}
          </button>
        </form>
      </ModalDialog>

      {/* Modal cập nhật phiếu */}
      <ModalDialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        title={
          <>
            Cập nhật phiếu{" "}
            <span className="font-mono text-brand">{editing?.ticketCode}</span>
          </>
        }
        description="Thay đổi trạng thái xử lý, ghi chú kỹ thuật và thời hạn bảo hành hiển thị trên trang Tra cứu."
        maxWidthClass="max-w-xl"
      >
        {editing && (
          <form onSubmit={handleSaveEdit} className="space-y-4 text-sm">
            <div>
              <label
                htmlFor="editTicketStatus"
                className="block text-xs font-semibold text-ink-muted mb-1"
              >
                Trạng thái xử lý
              </label>
              <select
                id="editTicketStatus"
                value={editing.status}
                onChange={(e) =>
                  setEditing({ ...editing, status: e.target.value })
                }
                className="min-h-11 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-base sm:text-sm"
              >
                {STATUS_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {TICKET_STATUS_MAP[k].label}
                  </option>
                ))}
              </select>
            </div>

            <TicketItemsEditor
              items={parseTicketItems(editing.itemsJson)}
              onChange={(nextItems) => {
                const total = calculateItemsTotal(nextItems);
                setEditing({
                  ...editing,
                  itemsJson: JSON.stringify(nextItems),
                  ...(nextItems.length > 0
                    ? { estimatedCost: formatVnd(total) }
                    : {}),
                });
              }}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="editTicketCost"
                  className="block text-xs font-semibold text-ink-muted mb-1"
                >
                  Chi phí thực tế (Tổng cộng)
                </label>
                <input
                  id="editTicketCost"
                  maxLength={80}
                  value={editing.estimatedCost || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, estimatedCost: e.target.value })
                  }
                  placeholder="VD: 650.000đ"
                  className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 text-base sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="editTicketWarrantyDate"
                  className="block text-xs font-semibold text-ink-muted mb-1"
                >
                  Hạn bảo hành đến ngày
                </label>
                <input
                  id="editTicketWarrantyDate"
                  type="date"
                  value={editing.warrantyUntil || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, warrantyUntil: e.target.value })
                  }
                  className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 text-base sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="editTicketWarrantyText"
                className="block text-xs font-semibold text-ink-muted mb-1"
              >
                Thông tin bảo hành hiển thị cho khách
              </label>
              <input
                id="editTicketWarrantyText"
                maxLength={200}
                value={editing.warrantyText || ""}
                onChange={(e) =>
                  setEditing({ ...editing, warrantyText: e.target.value })
                }
                placeholder="VD: Bảo hành pin 12 tháng 1 đổi 1"
                className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 text-base sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="editTicketNote"
                className="block text-xs font-semibold text-ink-muted mb-1"
              >
                Ghi chú kỹ thuật (khách tra cứu sẽ thấy)
              </label>
              <textarea
                id="editTicketNote"
                rows={3}
                maxLength={1500}
                value={editing.technicianNote || ""}
                onChange={(e) =>
                  setEditing({ ...editing, technicianNote: e.target.value })
                }
                className="w-full rounded-xl border border-line px-3.5 py-2.5 text-base sm:text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand py-3 font-semibold text-ink-inverse hover:bg-brand-hover disabled:opacity-60"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              <span>{submitting ? "Đang lưu..." : "Lưu cập nhật"}</span>
            </button>
          </form>
        )}
      </ModalDialog>

      <ConfirmDialog
        open={Boolean(deletingTarget)}
        onOpenChange={(open) => {
          if (!open) setDeletingTarget(null);
        }}
        title={`Xóa phiếu ${deletingTarget?.ticketCode ?? ""}?`}
        description={`Phiếu sửa chữa của khách hàng "${deletingTarget?.customerName ?? ""}" sẽ bị xóa vĩnh viễn và không thể tra cứu bảo hành nữa.`}
        loading={submitting}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
