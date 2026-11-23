"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Calendar,
  Download,
  FilePlus2,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { TICKET_STATUS_MAP, cn } from "@/lib/utils";
import { formatVnd, getLineItemTotal, parseTicketItems } from "@/lib/ticket-items";
import type {
  CustomerProfileItem,
  EnrichedTicket,
} from "@/app/api/admin/customers/route";

function formatDateVN(raw: string | null | undefined): string {
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString("vi-VN");
}

type FilterMode = "ALL" | "ACTIVE_WARRANTY" | "REPEAT";

interface CustomerStats {
  totalCustomers: number;
  activeWarrantyCustomers: number;
  repeatCustomers: number;
  expiringSoonCustomers: number;
}

function escapeCsvCell(value: unknown): string {
  const str = String(value ?? "").replace(/\r?\n/g, " ");
  if (/[",]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function renderWarrantyBadge(t: EnrichedTicket) {
  const { status, label } = t.warranty;
  if (status === "ACTIVE") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-status-success-bg px-2.5 py-0.5 text-[11px] font-bold text-status-success-ink border border-status-success-line">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{label}</span>
      </span>
    );
  }
  if (status === "EXPIRING_SOON") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-status-warning-bg px-2.5 py-0.5 text-[11px] font-bold text-status-warning-ink border border-status-warning-line">
        <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{label}</span>
      </span>
    );
  }
  if (status === "EXPIRED") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-status-danger-bg px-2.5 py-0.5 text-[11px] font-semibold text-status-danger-ink border border-status-danger-line">
        <ShieldOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>{label}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-0.5 text-[11px] font-medium text-ink-muted">
      <span>{label}</span>
    </span>
  );
}

export default function AdminCustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerProfileItem[]>([]);
  const [stats, setStats] = useState<CustomerStats>({
    totalCustomers: 0,
    activeWarrantyCustomers: 0,
    repeatCustomers: 0,
    expiringSoonCustomers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("ALL");

  // Detail modal state
  const [selected, setSelected] = useState<CustomerProfileItem | null>(null);
  const [editProfile, setEditProfile] = useState({
    name: "",
    email: "",
    address: "",
    notes: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Create customer modal state
  const [creating, setCreating] = useState(false);
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    phone: "",
    name: "",
    email: "",
    address: "",
    notes: "",
  });

  const loadCustomers = useCallback(
    async (qVal: string, fVal: FilterMode) => {
      setLoadError(null);
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (qVal.trim()) params.set("q", qVal.trim());
        if (fVal !== "ALL") params.set("filter", fVal);

        const res = await fetch(`/api/admin/customers?${params.toString()}`);
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        if (res.status === 403) {
          router.replace("/admin/bai-viet");
          return;
        }
        if (!res.ok) {
          setLoadError("Không thể tải danh sách khách hàng.");
          return;
        }
        const data = await res.json();
        const list: CustomerProfileItem[] = data.customers || [];
        setCustomers(list);
        if (data.stats) setStats(data.stats);

        // Sync open detail modal if currently viewing a customer
        setSelected((prev) => {
          if (!prev) return null;
          const updated = list.find((c) => c.phone === prev.phone);
          return updated || prev;
        });
      } catch {
        setLoadError("Mất kết nối máy chủ khi tải dữ liệu khách hàng.");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCustomers(searchQuery, filterMode);
    }, 220);
    return () => window.clearTimeout(timer);
  }, [searchQuery, filterMode, loadCustomers]);

  function openCustomerDetail(item: CustomerProfileItem) {
    setSelected(item);
    setEditProfile({
      name: item.name || "",
      email: item.email || "",
      address: item.address || "",
      notes: item.notes || "",
    });
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    if (editProfile.name.trim().length < 2) {
      toast.error("Tên khách hàng cần ít nhất 2 ký tự.");
      return;
    }
    setSavingProfile(true);
    try {
      const res = await fetch("/api/admin/customers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: selected.phone,
          name: editProfile.name.trim(),
          email: editProfile.email.trim(),
          address: editProfile.address.trim(),
          notes: editProfile.notes.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Không thể lưu hồ sơ khách hàng.");
        return;
      }
      toast.success("Đã cập nhật thông tin & ghi chú khách hàng!");
      await loadCustomers(searchQuery, filterMode);
    } catch {
      toast.error("Lỗi kết nối khi lưu hồ sơ.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleCreateCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (!createForm.phone.trim() || createForm.name.trim().length < 2) {
      toast.error("Vui lòng nhập đầy đủ Số điện thoại và Họ tên khách hàng.");
      return;
    }
    setSubmittingCreate(true);
    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Không thể tạo khách hàng mới.");
        return;
      }
      toast.success(`Đã thêm khách hàng ${data.customer.name} (${data.customer.phone})`);
      setCreating(false);
      setCreateForm({ phone: "", name: "", email: "", address: "", notes: "" });
      await loadCustomers(searchQuery, filterMode);
    } catch {
      toast.error("Lỗi mạng khi tạo khách hàng.");
    } finally {
      setSubmittingCreate(false);
    }
  }

  function handleExportCsv() {
    if (customers.length === 0) {
      toast.error("Chưa có dữ liệu khách hàng để xuất file.");
      return;
    }

    const headers = [
      "Họ tên khách hàng",
      "Số điện thoại",
      "Email",
      "Địa chỉ",
      "Ghi chú khách hàng",
      "Tổng lần sửa",
      "Mã phiếu",
      "Ngày tiếp nhận",
      "Thiết bị",
      "Model / Serial",
      "Dịch vụ / Lỗi sửa",
      "Ghi chú kỹ thuật",
      "Chi phí",
      "Thông tin bảo hành",
      "Hạn bảo hành",
      "Trạng thái bảo hành",
    ];

    const rows: string[][] = [];
    for (const c of customers) {
      if (c.tickets.length === 0) {
        rows.push([
          c.name,
          `'${c.phone}`,
          c.email || "",
          c.address || "",
          c.notes || "",
          String(c.totalTickets),
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "Chưa có phiếu sửa",
        ]);
      } else {
        for (const t of c.tickets) {
          const lineItems = parseTicketItems(t.itemsJson);
          const itemsSummary =
            lineItems.length > 0
              ? lineItems.map((it) => `${it.name}: ${formatVnd(it.price)}`).join(" | ")
              : `${t.serviceCategory}: ${t.issueDescription}`;
          rows.push([
            c.name,
            `'${c.phone}`,
            c.email || "",
            c.address || t.onsiteAddress || "",
            c.notes || "",
            String(c.totalTickets),
            t.ticketCode,
            t.appointmentDate || formatDateVN(t.createdAt),
            t.deviceType,
            [t.deviceModel, t.serialNumber].filter(Boolean).join(" / "),
            itemsSummary,
            t.technicianNote || "",
            t.estimatedCost || "",
            t.warrantyText || "",
            t.warrantyUntil || "",
            t.warranty.label,
          ]);
        }
      }
    }

    const csvContent =
      "\uFEFF" +
      [headers, ...rows]
        .map((line) => line.map(escapeCsvCell).join(","))
        .join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const todayStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `mqtech-khach-hang-bao-hanh-${todayStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Đã xuất file dự phòng (${customers.length} khách hàng)!`);
  }

  function handleQuickCreateTicket(c: CustomerProfileItem) {
    const params = new URLSearchParams({
      create: "1",
      phone: c.phone,
      name: c.name,
    });
    if (c.address) params.set("address", c.address);
    router.push(`/admin/phieu-sua?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy">
            Quản lý Khách hàng &amp; Tra cứu Bảo hành
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Tra cứu nhanh theo Số điện thoại để xem toàn bộ lịch sử máy đã sửa, ngày sửa và thời hạn bảo hành còn lại.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-navy shadow-sm hover:border-brand hover:text-brand"
          >
            <Download className="h-4 w-4 text-brand" aria-hidden="true" />
            <span>Xuất Excel / CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 py-2 text-xs font-semibold text-ink-inverse shadow-sm hover:bg-brand-hover"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Thêm khách hàng</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
            <Users className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-muted">Tổng khách hàng</p>
            <p className="font-mono text-2xl font-bold text-navy tabular-nums">
              {stats.totalCustomers}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-status-success-bg text-status-success-ink">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-muted">Khách đang còn BH</p>
            <p className="font-mono text-2xl font-bold text-navy tabular-nums">
              {stats.activeWarrantyCustomers}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-status-warning-bg text-status-warning-ink">
            <UserCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-medium text-ink-muted">Khách quay lại (≥ 2 lần)</p>
            <p className="font-mono text-2xl font-bold text-navy tabular-nums">
              {stats.repeatCustomers}
            </p>
          </div>
        </div>
      </div>

      {/* Search & Quick Filters */}
      <div className="rounded-2xl border border-line bg-surface p-4 shadow-card space-y-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nhập Số điện thoại (VD: 0987482573), Tên khách, Mã phiếu MQ-..., Tên máy hoặc Số Serial..."
            className="min-h-12 w-full rounded-xl border border-line bg-surface-subtle pl-11 pr-4 py-2.5 text-sm text-navy placeholder:text-ink-subtle focus:border-brand focus:bg-surface focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { id: "ALL", label: `Tất cả (${stats.totalCustomers})` },
              {
                id: "ACTIVE_WARRANTY",
                label: `Đang còn bảo hành (${stats.activeWarrantyCustomers})`,
              },
              {
                id: "REPEAT",
                label: `Khách quay lại ≥ 2 lần (${stats.repeatCustomers})`,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterMode(tab.id)}
              className={cn(
                "min-h-10 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                filterMode === tab.id
                  ? "bg-navy text-ink-inverse"
                  : "border border-line bg-surface text-ink-muted hover:border-brand hover:text-navy"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {loadError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-status-danger-line bg-status-danger-bg p-5 text-sm text-status-danger-ink"
        >
          <span className="inline-flex items-center gap-2">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            {loadError}
          </span>
          <button
            type="button"
            onClick={() => void loadCustomers(searchQuery, filterMode)}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-status-danger-solid px-4 py-1.5 text-xs font-semibold text-ink-inverse"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Thử lại</span>
          </button>
        </div>
      )}

      {/* Customer List */}
      {loading ? (
        <p className="text-sm text-ink-muted">Đang tải danh sách khách hàng...</p>
      ) : customers.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-10 text-center text-sm text-ink-muted">
          Không tìm thấy khách hàng nào khớp với từ khóa tìm kiếm.
        </div>
      ) : (
        <div className="grid gap-3">
          {customers.map((c) => {
            const latestTicket = c.tickets[0];
            return (
              <div
                key={c.phone}
                onClick={() => openCustomerDetail(c)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openCustomerDetail(c);
                  }
                }}
                className="group flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card transition-all hover:border-brand/50 hover:shadow-card-hover sm:flex-row sm:items-center sm:justify-between cursor-pointer"
              >
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-heading text-base font-bold text-navy group-hover:text-brand transition-colors">
                      {c.name}
                    </h2>
                    <span className="rounded-lg bg-brand-light px-2.5 py-0.5 font-mono text-xs font-bold text-brand tabular-nums">
                      {c.phone}
                    </span>
                    {c.activeWarrantyCount > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-status-success-bg px-2.5 py-0.5 text-[11px] font-bold text-status-success-ink border border-status-success-line">
                        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Còn BH ({c.activeWarrantyCount} phiếu)</span>
                      </span>
                    ) : c.totalTickets > 0 ? (
                      <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-[11px] font-medium text-ink-muted">
                        Hết / Chưa có BH
                      </span>
                    ) : null}
                    {c.expiringSoonCount > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-status-warning-bg px-2.5 py-0.5 text-[11px] font-bold text-status-warning-ink border border-status-warning-line">
                        <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Sắp hết BH</span>
                      </span>
                    )}
                  </div>

                  {c.address && (
                    <p className="flex items-center gap-1.5 text-xs text-ink-muted truncate">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-ink-subtle" aria-hidden="true" />
                      <span className="truncate">{c.address}</span>
                    </p>
                  )}

                  {latestTicket && (
                    <p className="text-xs text-ink-body truncate">
                      <span className="font-semibold text-navy">Gần nhất:</span>{" "}
                      {latestTicket.deviceType}
                      {latestTicket.deviceModel ? ` (${latestTicket.deviceModel})` : ""} —{" "}
                      {latestTicket.serviceCategory} •{" "}
                      <span className="text-ink-muted">
                        {latestTicket.appointmentDate || formatDateVN(latestTicket.createdAt)}
                      </span>
                    </p>
                  )}

                  {c.notes && (
                    <p className="text-xs italic text-brand truncate">
                      Ghi chú: {c.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0 border-t border-line-subtle pt-3 sm:border-0 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className="font-mono text-sm font-bold text-navy tabular-nums">
                      {c.totalTickets} lần sửa
                    </p>
                    <p className="text-[11px] text-ink-muted">
                      {c.lastVisitAt
                        ? `Cập nhật ${formatDateVN(c.lastVisitAt)}`
                        : "Chưa có phiếu"}
                    </p>
                  </div>
                  <span className="inline-flex min-h-10 items-center rounded-full border border-line px-3.5 py-1.5 text-xs font-semibold text-brand group-hover:border-brand group-hover:bg-brand group-hover:text-ink-inverse transition-colors">
                    Xem chi tiết
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Customer Detail & Warranty Timeline Modal */}
      <ModalDialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        title={selected ? `Hồ sơ khách hàng: ${selected.name}` : "Hồ sơ khách hàng"}
        description={
          selected
            ? `SĐT: ${selected.phone} • Tổng ${selected.totalTickets} phiếu sửa • ${selected.activeWarrantyCount} phiếu đang còn bảo hành`
            : ""
        }
        maxWidthClass="max-w-3xl"
      >
        {selected && (
          <div className="space-y-6">
            {/* Quick Contact & Action Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={`tel:${selected.phone}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-ink-inverse hover:bg-brand-hover"
              >
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="font-mono">{selected.phone}</span>
              </a>
              <a
                href={`https://zalo.me/${selected.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-brand/30 bg-brand-light px-4 py-2 text-xs font-semibold text-brand hover:bg-brand hover:text-ink-inverse transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Chat Zalo</span>
              </a>
              <button
                type="button"
                onClick={() => handleQuickCreateTicket(selected)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-navy px-4 py-2 text-xs font-semibold text-ink-inverse hover:bg-brand transition-colors ml-auto"
              >
                <FilePlus2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Tạo phiếu sửa mới cho khách này</span>
              </button>
            </div>

            {/* Editable Customer Profile Form */}
            <form
              onSubmit={handleSaveProfile}
              className="rounded-xl border border-line bg-surface-subtle p-4 space-y-3 text-xs"
            >
              <p className="font-heading text-sm font-bold text-navy">
                Thông tin &amp; Ghi chú nội bộ
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-ink-muted mb-1">
                    Họ tên khách hàng *
                  </label>
                  <input
                    type="text"
                    required
                    value={editProfile.name}
                    onChange={(e) =>
                      setEditProfile({ ...editProfile, name: e.target.value })
                    }
                    className="min-h-10 w-full rounded-lg border border-line bg-surface px-3 py-2 text-xs text-navy"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-ink-muted mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editProfile.email}
                    onChange={(e) =>
                      setEditProfile({ ...editProfile, email: e.target.value })
                    }
                    placeholder="khachhang@gmail.com"
                    className="min-h-10 w-full rounded-lg border border-line bg-surface px-3 py-2 text-xs text-navy"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-ink-muted mb-1">
                    Địa chỉ quen thuộc (BMT)
                  </label>
                  <input
                    type="text"
                    value={editProfile.address}
                    onChange={(e) =>
                      setEditProfile({ ...editProfile, address: e.target.value })
                    }
                    placeholder="Số nhà, đường, P. Tân Lập / P. Tân An, BMT..."
                    className="min-h-10 w-full rounded-lg border border-line bg-surface px-3 py-2 text-xs text-navy"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-ink-muted mb-1">
                    Ghi chú riêng về khách hàng (Khách VIP, công ty, máy thường dùng...)
                  </label>
                  <textarea
                    rows={2}
                    value={editProfile.notes}
                    onChange={(e) =>
                      setEditProfile({ ...editProfile, notes: e.target.value })
                    }
                    placeholder="VD: Khách quen P. Tân Lập, dùng Dell Latitude 5420, ưu tiên hỗ trợ nhanh..."
                    className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-xs text-navy"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-ink-inverse hover:bg-brand-hover disabled:opacity-60"
                >
                  <Save className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{savingProfile ? "Đang lưu..." : "Lưu thông tin khách"}</span>
                </button>
              </div>
            </form>

            {/* Repair & Warranty Timeline */}
            <div className="space-y-3">
              <h3 className="font-heading text-sm font-bold text-navy flex items-center gap-2">
                <Wrench className="h-4 w-4 text-brand" aria-hidden="true" />
                <span>Lịch sử sửa chữa &amp; Bảo hành ({selected.tickets.length} phiếu)</span>
              </h3>

              {selected.tickets.length === 0 ? (
                <p className="rounded-xl border border-line bg-surface-subtle p-4 text-xs text-ink-muted">
                  Khách hàng này chưa có phiếu sửa chữa nào. Bấm &quot;Tạo phiếu sửa mới cho khách này&quot; để tiếp nhận ngay.
                </p>
              ) : (
                <div className="space-y-3">
                  {selected.tickets.map((t) => {
                    const statusInfo =
                      TICKET_STATUS_MAP[t.status] || TICKET_STATUS_MAP.PENDING;
                    return (
                      <div
                        key={t.id}
                        className="rounded-xl border border-line bg-surface p-4 space-y-2.5 text-xs shadow-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line-subtle pb-2.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-brand">
                              {t.ticketCode}
                            </span>
                            <span
                              className={cn(
                                "rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                                statusInfo.badgeClass
                              )}
                            >
                              {statusInfo.label}
                            </span>
                            {renderWarrantyBadge(t)}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-muted">
                              <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>
                                {t.appointmentDate || formatDateVN(t.createdAt)}
                              </span>
                            </span>
                            <a
                              href={`/admin/in-hoa-don/${t.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1 text-[11px] font-semibold text-navy hover:border-brand hover:text-brand"
                            >
                              <Printer className="h-3 w-3" aria-hidden="true" />
                              <span>In HĐ</span>
                            </a>
                          </div>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                          <div>
                            <p className="text-[11px] font-semibold text-ink-muted">
                              Thiết bị &amp; Serial
                            </p>
                            <p className="font-semibold text-navy">
                              {t.deviceType}
                              {t.deviceModel ? ` • ${t.deviceModel}` : ""}
                              {t.serialNumber ? ` (SN: ${t.serialNumber})` : ""}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] font-semibold text-ink-muted">
                              Dịch vụ &amp; Chi phí
                            </p>
                            <p className="font-semibold text-navy">
                              {t.serviceCategory}
                              {t.estimatedCost ? (
                                <span className="ml-1.5 font-mono text-brand">
                                  • {t.estimatedCost}
                                </span>
                              ) : null}
                            </p>
                          </div>
                        </div>

                        <div>
                          <p className="text-[11px] font-semibold text-ink-muted">
                            Tình trạng lỗi / Đã sửa:
                          </p>
                          <p className="text-ink-body leading-relaxed">
                            {t.issueDescription}
                          </p>
                        </div>

                        {parseTicketItems(t.itemsJson).length > 0 && (
                          <div className="rounded-lg border border-line-subtle bg-surface-subtle p-3 space-y-1.5">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-navy">
                              Chi tiết hạng mục &amp; linh kiện
                            </p>
                            <ul className="divide-y divide-line-subtle">
                              {parseTicketItems(t.itemsJson).map((item, i) => {
                                const qty = Math.max(1, Number(item.quantity) || 1);
                                return (
                                  <li
                                    key={i}
                                    className="flex items-center justify-between gap-2 py-1 text-xs"
                                  >
                                    <div className="min-w-0">
                                      <p className="text-ink-body font-medium">
                                        {item.name}
                                        {qty > 1 && (
                                          <span className="ml-1 font-mono text-ink-muted">
                                            (x{qty})
                                          </span>
                                        )}
                                      </p>
                                      {item.warranty && (
                                        <p className="text-[11px] font-semibold text-brand">
                                          • BH: {item.warranty}
                                        </p>
                                      )}
                                    </div>
                                    <span className="font-mono font-bold text-navy tabular-nums shrink-0">
                                      {formatVnd(getLineItemTotal(item))}
                                    </span>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}

                        {t.technicianNote && (
                          <div className="rounded-lg bg-surface-subtle px-3 py-2 text-ink-body">
                            <span className="font-semibold text-navy">
                              Ghi chú kỹ thuật:{" "}
                            </span>
                            {t.technicianNote}
                          </div>
                        )}

                        {(t.warrantyText || t.warrantyUntil) && (
                          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line-subtle bg-brand-light/20 px-3 py-2">
                            <span className="font-medium text-navy">
                              🛡️ {t.warrantyText || "Bảo hành điện tử"}
                            </span>
                            {t.warrantyUntil && (
                              <span className="font-mono font-bold text-brand">
                                Hạn đến: {t.warrantyUntil}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </ModalDialog>

      {/* Create New Customer Modal */}
      <ModalDialog
        open={creating}
        onOpenChange={(open) => {
          if (!open) setCreating(false);
        }}
        title="Thêm khách hàng mới"
        description="Lưu hồ sơ khách hàng vào cơ sở dữ liệu Neon PostgreSQL để tra cứu nhanh theo SĐT."
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                Số điện thoại *
              </label>
              <input
                type="tel"
                required
                placeholder="0987482573"
                value={createForm.phone}
                onChange={(e) =>
                  setCreateForm({ ...createForm, phone: e.target.value })
                }
                className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                Họ tên khách hàng *
              </label>
              <input
                type="text"
                required
                placeholder="VD: Anh Minh Tuấn"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm({ ...createForm, name: e.target.value })
                }
                className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                Email (nếu có)
              </label>
              <input
                type="email"
                placeholder="email@gmail.com"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm({ ...createForm, email: e.target.value })
                }
                className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                Địa chỉ tại BMT
              </label>
              <input
                type="text"
                placeholder="VD: Võ Thị Sáu, P. Tân Lập, BMT"
                value={createForm.address}
                onChange={(e) =>
                  setCreateForm({ ...createForm, address: e.target.value })
                }
                className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2 text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-ink-muted mb-1">
                Ghi chú nội bộ
              </label>
              <textarea
                rows={2}
                placeholder="VD: Khách quen, văn phòng công ty..."
                value={createForm.notes}
                onChange={(e) =>
                  setCreateForm({ ...createForm, notes: e.target.value })
                }
                className="w-full rounded-xl border border-line px-3.5 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreating(false)}
              className="min-h-11 rounded-full border border-line px-5 py-2 text-xs font-semibold text-ink-muted hover:text-navy"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submittingCreate}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-6 py-2 text-xs font-semibold text-ink-inverse hover:bg-brand-hover disabled:opacity-60"
            >
              <Save className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{submittingCreate ? "Đang lưu..." : "Lưu khách hàng"}</span>
            </button>
          </div>
        </form>
      </ModalDialog>
    </div>
  );
}
