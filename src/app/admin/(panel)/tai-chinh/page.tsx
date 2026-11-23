"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Download,
  ExternalLink,
  ImagePlus,
  Loader2,
  Package,
  Plus,
  Printer,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog, ModalDialog } from "@/components/ui/ModalDialog";
import { formatVnd } from "@/lib/ticket-items";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  getCategoryLabel,
} from "@/lib/inventory-constants";
import { cn } from "@/lib/utils";

interface FinanceTx {
  id: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  amount: number;
  title: string;
  transactionDate: string;
  paymentMethod: string;
  receiptImageUrl: string | null;
  stockMovementId: number | null;
  note: string | null;
  createdAt: string;
}

interface CompletedTicketRow {
  id: number;
  ticketCode: string;
  customerName: string;
  customerPhone: string;
  deviceModel: string;
  date: string;
  revenue: number;
  cogs: number;
  grossProfit: number;
  itemsCount: number;
}

interface FinanceSummary {
  repairRevenue: number;
  repairCogs: number;
  otherIncome: number;
  totalRevenue: number;
  operatingExpenses: number;
  stockPurchaseCashOut: number;
  totalCashOut: number;
  businessProfit: number;
  cashflow: number;
  inventoryValue: number;
  completedTicketCount: number;
}

function escapeCsvCell(value: unknown): string {
  const str = String(value ?? "");
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export default function AdminFinancePage() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [monthFilter, setMonthFilter] = useState(currentMonth);
  const [allTime, setAllTime] = useState(false);

  const [transactions, setTransactions] = useState<FinanceTx[]>([]);
  const [completedTickets, setCompletedTickets] = useState<CompletedTicketRow[]>([]);
  const [summary, setSummary] = useState<FinanceSummary>({
    repairRevenue: 0,
    repairCogs: 0,
    otherIncome: 0,
    totalRevenue: 0,
    operatingExpenses: 0,
    stockPurchaseCashOut: 0,
    totalCashOut: 0,
    businessProfit: 0,
    cashflow: 0,
    inventoryValue: 0,
    completedTicketCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ledger" | "tickets">("ledger");

  // Modal Create Transaction
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingTx, setDeletingTx] = useState<FinanceTx | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    type: "EXPENSE" as "INCOME" | "EXPENSE",
    category: "MAT_BANG",
    title: "",
    amount: 0,
    transactionDate: new Date().toISOString().slice(0, 10),
    paymentMethod: "CASH" as "CASH" | "BANK",
    receiptImageUrl: "",
    note: "",
  });

  async function loadFinance(targetMonth: string, isAll: boolean) {
    setLoading(true);
    try {
      const qs = isAll ? "month=ALL" : `month=${encodeURIComponent(targetMonth)}`;
      const res = await fetch(`/api/admin/finance?${qs}`);
      if (!res.ok) throw new Error("Không thể tải dữ liệu tài chính");
      const data = await res.json();
      setTransactions(data.transactions || []);
      setCompletedTickets(data.completedTickets || []);
      if (data.summary) setSummary(data.summary);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi tải báo cáo tài chính");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFinance(monthFilter, allTime);
  }, [monthFilter, allTime]);

  function openNewTx(type: "INCOME" | "EXPENSE") {
    setForm({
      type,
      category: type === "EXPENSE" ? "MAT_BANG" : "BAN_LE",
      title: "",
      amount: 0,
      transactionDate: new Date().toISOString().slice(0, 10),
      paymentMethod: "CASH",
      receiptImageUrl: "",
      note: "",
    });
    setModalOpen(true);
  }

  async function handleReceiptUpload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload ảnh thất bại");
      setForm((p) => ({ ...p, receiptImageUrl: data.url }));
      toast.success("Đã tải ảnh chứng từ lên Cloudflare R2");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi upload ảnh");
    } finally {
      setUploading(false);
    }
  }

  async function handleSaveTx(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || form.amount <= 0) {
      toast.error("Vui lòng nhập nội dung và số tiền hợp lệ");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/finance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể lưu giao dịch");
      toast.success(
        form.type === "EXPENSE"
          ? "Đã ghi khoản chi mới"
          : "Đã ghi khoản thu mới"
      );
      setModalOpen(false);
      await loadFinance(monthFilter, allTime);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi lưu giao dịch");
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDeleteTx() {
    if (!deletingTx) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/finance/${deletingTx.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Không thể xóa giao dịch");
      toast.success("Đã xóa giao dịch");
      setDeletingTx(null);
      await loadFinance(monthFilter, allTime);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi xóa giao dịch");
    } finally {
      setDeleting(false);
    }
  }

  function handleExportCsv() {
    const tag = allTime ? "tat-ca" : monthFilter;
    const headers = [
      "Ngày",
      "Loại",
      "Danh mục",
      "Nội dung",
      "Số tiền (VNĐ)",
      "Thanh toán",
      "Ghi chú",
      "Ảnh chứng từ",
    ];
    const rows = transactions.map((t) => [
      t.transactionDate,
      t.type === "INCOME" ? "THU" : "CHI",
      getCategoryLabel(t.category),
      t.title,
      t.type === "INCOME" ? t.amount : -t.amount,
      t.paymentMethod === "BANK" ? "Chuyển khoản" : "Tiền mặt",
      t.note || "",
      t.receiptImageUrl || "",
    ]);

    const summaryRows = [
      [],
      ["TỔNG HỢP KỲ", tag],
      ["Doanh thu sửa chữa (Phiếu COMPLETED)", summary.repairRevenue],
      ["Giá vốn linh kiện đã xuất", summary.repairCogs],
      ["Thu khác / Bán lẻ", summary.otherIncome],
      ["Chi phí vận hành", summary.operatingExpenses],
      ["Tiền nhập hàng vào kho", summary.stockPurchaseCashOut],
      ["LÃI KINH DOANH (P&L)", summary.businessProfit],
      ["DÒNG TIỀN THỰC TẾ (CASHFLOW)", summary.cashflow],
      ["Giá trị tồn kho hiện tại", summary.inventoryValue],
    ];

    const csv =
      "\uFEFF" +
      [headers, ...rows, ...summaryRows]
        .map((r) => r.map(escapeCsvCell).join(","))
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mqtech-thu-chi-${tag}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Đã xuất báo cáo Thu/Chi Excel/CSV");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy">
            Thu chi &amp; Báo cáo Lãi lỗ
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Tự động tổng hợp doanh thu &amp; giá vốn từ phiếu sửa Hoàn thành, hiển thị song song Lãi kinh doanh (P&amp;L) và Dòng tiền thực tế.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-xs font-semibold text-navy hover:border-brand hover:text-brand"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>Xuất Excel / CSV</span>
          </button>
          <button
            type="button"
            onClick={() => openNewTx("INCOME")}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-status-success-solid px-4 text-xs font-semibold text-ink-inverse transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Ghi khoản Thu</span>
          </button>
          <button
            type="button"
            onClick={() => openNewTx("EXPENSE")}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-brand px-4 text-xs font-semibold text-ink-inverse hover:bg-brand-hover"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Ghi khoản Chi</span>
          </button>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-card">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-navy">
          <Calendar className="h-4 w-4 text-brand" aria-hidden="true" />
          <span>Kỳ báo cáo:</span>
        </div>
        <input
          type="month"
          disabled={allTime}
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="min-h-10 rounded-xl border border-line bg-surface-subtle px-3 text-base sm:text-xs font-semibold text-navy disabled:opacity-50 focus:border-brand focus:outline-none"
        />
        <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-navy">
          <input
            type="checkbox"
            checked={allTime}
            onChange={(e) => setAllTime(e.target.checked)}
            className="h-4 w-4 accent-brand"
          />
          <span>Xem tất cả thời gian</span>
        </label>
      </div>

      {/* Dual KPI Cards: P&L vs Cashflow */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: Lãi kinh doanh P&L */}
        <div
          className={cn(
            "rounded-2xl border p-5 shadow-card",
            summary.businessProfit >= 0
              ? "border-status-success-line bg-status-success-bg"
              : "border-status-danger-line bg-status-danger-bg"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Lãi kinh doanh (P&amp;L)
            </span>
            {summary.businessProfit >= 0 ? (
              <TrendingUp className="h-5 w-5 text-status-success-ink" aria-hidden="true" />
            ) : (
              <TrendingDown className="h-5 w-5 text-status-danger-ink" aria-hidden="true" />
            )}
          </div>
          <p
            className={cn(
              "mt-2 font-mono text-2xl font-extrabold",
              summary.businessProfit >= 0 ? "text-status-success-ink" : "text-status-danger-ink"
            )}
          >
            {summary.businessProfit >= 0 ? "+" : ""}
            {formatVnd(summary.businessProfit)}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            = Tổng Thu − Giá vốn LK − Chi phí vận hành
          </p>
        </div>

        {/* Card 2: Dòng tiền thực tế Cashflow */}
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Dòng tiền thực tế
            </span>
            <Wallet className="h-5 w-5 text-brand" aria-hidden="true" />
          </div>
          <p
            className={cn(
              "mt-2 font-mono text-2xl font-extrabold",
              summary.cashflow >= 0 ? "text-navy" : "text-status-warning-ink"
            )}
          >
            {summary.cashflow >= 0 ? "+" : ""}
            {formatVnd(summary.cashflow)}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            = Tổng Thu − (Chi vận hành + Nhập hàng{" "}
            {formatVnd(summary.stockPurchaseCashOut)})
          </p>
        </div>

        {/* Card 3: Doanh thu sửa chữa & Thu khác */}
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Tổng doanh thu ({summary.completedTicketCount} phiếu)
            </span>
            <ArrowDownLeft className="h-5 w-5 text-status-success-ink" aria-hidden="true" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-navy">
            {formatVnd(summary.totalRevenue)}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Sửa chữa: {formatVnd(summary.repairRevenue)} • Giá vốn LK:{" "}
            {formatVnd(summary.repairCogs)}
          </p>
        </div>

        {/* Card 4: Chi vận hành & Tồn kho */}
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Chi vận hành &amp; Tồn kho
            </span>
            <Package className="h-5 w-5 text-navy" aria-hidden="true" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-status-danger-ink">
            {formatVnd(summary.operatingExpenses)}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Giá trị tồn kho hiện tại:{" "}
            <strong className="font-mono text-navy">
              {formatVnd(summary.inventoryValue)}
            </strong>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex rounded-full border border-line bg-surface p-1">
        <button
          type="button"
          onClick={() => setActiveTab("ledger")}
          className={cn(
            "min-h-10 rounded-full px-4 text-xs font-semibold transition-colors",
            activeTab === "ledger"
              ? "bg-navy text-ink-inverse"
              : "text-ink-muted hover:text-navy"
          )}
        >
          Sổ Thu / Chi ({transactions.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("tickets")}
          className={cn(
            "min-h-10 rounded-full px-4 text-xs font-semibold transition-colors",
            activeTab === "tickets"
              ? "bg-navy text-ink-inverse"
              : "text-ink-muted hover:text-navy"
          )}
        >
          Doanh thu Phiếu sửa Hoàn thành ({completedTickets.length})
        </button>
      </div>

      {/* Tables */}
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-line bg-surface py-16 text-sm text-ink-muted">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-brand" aria-hidden="true" />
          Đang tổng hợp số liệu...
        </div>
      ) : activeTab === "ledger" ? (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-card">
          <table className="w-full min-w-[780px] text-left text-xs">
            <thead className="border-b border-line bg-surface-subtle text-xs font-bold uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-4 py-3">Ngày</th>
                <th className="px-4 py-3">Loại / Danh mục</th>
                <th className="px-4 py-3">Nội dung</th>
                <th className="px-4 py-3">Thanh toán</th>
                <th className="px-4 py-3 text-right">Số tiền</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm text-ink-muted"
                  >
                    Chưa có giao dịch thu/chi nào trong kỳ này.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface-subtle/50">
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                      {tx.transactionDate}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          tx.type === "INCOME"
                            ? "bg-status-success-bg text-status-success-ink"
                            : tx.category === "NHAP_HANG"
                            ? "bg-brand-light text-brand"
                            : "bg-status-danger-bg text-status-danger-ink"
                        )}
                      >
                        {tx.type === "INCOME" ? (
                          <ArrowDownLeft className="h-3 w-3" aria-hidden="true" />
                        ) : (
                          <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                        )}
                        {getCategoryLabel(tx.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-navy">{tx.title}</div>
                      {tx.note && (
                        <div className="mt-0.5 text-xs text-ink-muted">
                          {tx.note}
                        </div>
                      )}
                      {tx.receiptImageUrl && (
                        <a
                          href={tx.receiptImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          <span>Xem ảnh hóa đơn R2</span>
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-muted">
                      {tx.paymentMethod === "BANK" ? "Chuyển khoản" : "Tiền mặt"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold">
                      <span
                        className={
                          tx.type === "INCOME"
                            ? "text-status-success-ink"
                            : "text-status-danger-ink"
                        }
                      >
                        {tx.type === "INCOME" ? "+" : "-"}
                        {formatVnd(tx.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setDeletingTx(tx)}
                        title="Xóa giao dịch"
                        aria-label={`Xóa giao dịch ${tx.title}`}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink-muted transition-colors hover:border-status-danger-line hover:bg-status-danger-bg hover:text-status-danger-ink"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-card">
          <table className="w-full min-w-[780px] text-left text-xs">
            <thead className="border-b border-line bg-surface-subtle text-xs font-bold uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-4 py-3">Ngày / Mã phiếu</th>
                <th className="px-4 py-3">Khách hàng &amp; Thiết bị</th>
                <th className="px-4 py-3 text-right">Doanh thu</th>
                <th className="px-4 py-3 text-right">Giá vốn LK</th>
                <th className="px-4 py-3 text-right">Lãi gộp</th>
                <th className="px-4 py-3 text-right">Hóa đơn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {completedTickets.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm text-ink-muted"
                  >
                    Chưa có phiếu sửa Hoàn thành (COMPLETED) nào trong kỳ này.
                  </td>
                </tr>
              ) : (
                completedTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-subtle/50">
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-brand">
                        {t.ticketCode}
                      </div>
                      <div className="font-mono text-xs text-ink-muted">
                        {t.date}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-navy">
                        {t.customerName} • {t.customerPhone}
                      </div>
                      <div className="text-xs text-ink-muted">
                        {t.deviceModel} ({t.itemsCount} hạng mục)
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-navy">
                      {formatVnd(t.revenue)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-ink-muted">
                      {formatVnd(t.cogs)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-status-success-ink">
                      +{formatVnd(t.grossProfit)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/in-hoa-don/${t.id}`}
                        target="_blank"
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-navy hover:border-brand hover:text-brand"
                      >
                        <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>In HĐ</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Create Transaction */}
      <ModalDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={form.type === "EXPENSE" ? "Ghi khoản Chi mới" : "Ghi khoản Thu mới"}
        description="Lưu trên Neon PostgreSQL và có thể đính kèm ảnh chụp hóa đơn lên Cloudflare R2."
      >
        <form onSubmit={handleSaveTx} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-navy">
                Danh mục
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((p) => ({ ...p, category: e.target.value }))
                }
                className="min-h-10 w-full rounded-xl border border-line bg-surface-subtle px-3 text-base sm:text-xs text-navy focus:border-brand focus:bg-surface focus:outline-none"
              >
                {(form.type === "EXPENSE"
                  ? EXPENSE_CATEGORIES
                  : INCOME_CATEGORIES
                ).map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-navy">
                Số tiền (VNĐ) *
              </label>
              <input
                type="number"
                min={1}
                step={1}
                required
                value={form.amount || ""}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    amount: Math.max(0, Number(e.target.value) || 0),
                  }))
                }
                placeholder="VD: 500000"
                className="min-h-10 w-full rounded-xl border border-line bg-surface-subtle px-3 font-mono text-base sm:text-xs text-navy focus:border-brand focus:bg-surface focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-navy">
                Nội dung giao dịch *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder={
                  form.type === "EXPENSE"
                    ? "VD: Tiền điện tháng 11, Ship linh kiện, Chạy quảng cáo..."
                    : "VD: Bán lẻ dây nguồn, chuột không dây..."
                }
                className="min-h-10 w-full rounded-xl border border-line bg-surface-subtle px-3 text-base sm:text-xs text-navy focus:border-brand focus:bg-surface focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-navy">
                Ngày giao dịch
              </label>
              <input
                type="date"
                value={form.transactionDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, transactionDate: e.target.value }))
                }
                className="min-h-10 w-full rounded-xl border border-line bg-surface-subtle px-3 text-base sm:text-xs text-navy focus:border-brand focus:bg-surface focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-navy">
                Hình thức thanh toán
              </label>
              <select
                value={form.paymentMethod}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    paymentMethod: e.target.value as "CASH" | "BANK",
                  }))
                }
                className="min-h-10 w-full rounded-xl border border-line bg-surface-subtle px-3 text-base sm:text-xs text-navy focus:border-brand focus:bg-surface focus:outline-none"
              >
                <option value="CASH">Tiền mặt</option>
                <option value="BANK">Chuyển khoản</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl border border-line bg-surface-subtle px-3 py-2 text-xs font-semibold text-navy hover:border-brand">
              <ImagePlus className="h-4 w-4 text-brand" aria-hidden="true" />
              <span>
                {uploading
                  ? "Đang tải lên R2..."
                  : "Đính kèm ảnh hóa đơn / biên lai (R2)"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleReceiptUpload(e.target.files?.[0])}
              />
            </label>
            {form.receiptImageUrl && (
              <a
                href={form.receiptImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-brand underline"
              >
                Xem ảnh đã tải
              </a>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-navy">
              Ghi chú thêm
            </label>
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
              placeholder="Ghi chú tùy chọn..."
              className="min-h-10 w-full rounded-xl border border-line bg-surface-subtle px-3 text-base sm:text-xs text-navy focus:border-brand focus:bg-surface focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="min-h-10 rounded-full border border-line px-4 text-xs font-semibold text-navy hover:bg-surface-subtle"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-brand px-5 text-xs font-semibold text-ink-inverse hover:bg-brand-hover disabled:opacity-60"
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
              <span>Lưu giao dịch</span>
            </button>
          </div>
        </form>
      </ModalDialog>

      <ConfirmDialog
        open={deletingTx !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeletingTx(null);
        }}
        title="Xóa giao dịch thu/chi?"
        description={
          deletingTx
            ? `Xóa giao dịch "${deletingTx.title}" (${formatVnd(deletingTx.amount)})? Thao tác này không thể hoàn tác.`
            : ""
        }
        confirmLabel="Xóa giao dịch"
        loading={deleting}
        onConfirm={handleConfirmDeleteTx}
      />
    </div>
  );
}
