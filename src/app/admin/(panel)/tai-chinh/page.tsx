"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
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
} from "lucide-react";
import { toast } from "sonner";
import {
  FinanceRevenueChart,
  type CompletedTicketRow,
  type FinancePeriodMode,
  type FinanceTx,
} from "@/components/admin/FinanceRevenueChart";
import { ConfirmDialog, ModalDialog } from "@/components/ui/ModalDialog";
import { formatVnd } from "@/lib/ticket-items";
import {
  EXPENSE_CATEGORIES,
  getCategoryLabel,
} from "@/lib/inventory-constants";
import { cn } from "@/lib/utils";

interface FinanceSummary {
  repairRevenue: number;
  repairCogs: number;
  totalRevenue: number;
  operatingExpenses: number;
  stockPurchaseCashOut: number;
  totalExpense: number;
  businessProfit: number;
  cashflow: number;
  inventoryValue: number;
  completedTicketCount: number;
}

const OPERATING_EXPENSE_CATEGORIES = EXPENSE_CATEGORIES.filter(
  (c) => c.key !== "NHAP_HANG"
);

const PERIOD_MODES: { key: FinancePeriodMode; label: string }[] = [
  { key: "week", label: "Tuần" },
  { key: "month", label: "Tháng" },
  { key: "quarter", label: "Quý" },
  { key: "year", label: "Năm" },
  { key: "all", label: "Toàn bộ" },
];

const QUARTER_OPTIONS = [
  { value: 1, label: "Quý 1 (T1–T3)" },
  { value: 2, label: "Quý 2 (T4–T6)" },
  { value: 3, label: "Quý 3 (T7–T9)" },
  { value: 4, label: "Quý 4 (T10–T12)" },
] as const;

const YEAR_OPTIONS = [2024, 2025, 2026, 2027];

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function getTodayVnYmd(): string {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    const now = new Date();
    return `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
  }
}

function parseYmdLocal(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y || 2026, (m || 1) - 1, d || 1);
}

function formatYmdLocal(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function getMondayOfWeekYmd(ymd: string): string {
  const d = parseYmdLocal(ymd);
  const day = d.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return formatYmdLocal(d);
}

function addDaysLocal(ymd: string, days: number): string {
  const d = parseYmdLocal(ymd);
  d.setDate(d.getDate() + days);
  return formatYmdLocal(d);
}

function formatDdMmYyyy(ymd: string): string {
  const parts = ymd.split("-");
  if (parts.length !== 3) return ymd;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function getQuarterRange(year: number, quarter: number): { from: string; to: string } {
  const startMonth = (quarter - 1) * 3 + 1;
  const endMonth = startMonth + 2;
  const lastDay = new Date(year, endMonth, 0).getDate();
  return {
    from: `${year}-${pad2(startMonth)}-01`,
    to: `${year}-${pad2(endMonth)}-${pad2(lastDay)}`,
  };
}

function getMonthRange(ym: string): { from: string; to: string } {
  const [yStr, mStr] = ym.split("-");
  const y = Number(yStr) || new Date().getFullYear();
  const m = Number(mStr) || new Date().getMonth() + 1;
  const lastDay = new Date(y, m, 0).getDate();
  return {
    from: `${y}-${pad2(m)}-01`,
    to: `${y}-${pad2(m)}-${pad2(lastDay)}`,
  };
}

function escapeCsvCell(value: unknown): string {
  const str = String(value ?? "");
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const EMPTY_SUMMARY: FinanceSummary = {
  repairRevenue: 0,
  repairCogs: 0,
  totalRevenue: 0,
  operatingExpenses: 0,
  stockPurchaseCashOut: 0,
  totalExpense: 0,
  businessProfit: 0,
  cashflow: 0,
  inventoryValue: 0,
  completedTicketCount: 0,
};

export default function AdminFinancePage() {
  const initialToday = useMemo(() => getTodayVnYmd(), []);
  const initialYear = Number(initialToday.slice(0, 4)) || 2026;
  const initialMonthNum = Number(initialToday.slice(5, 7)) || 1;
  const initialQuarter = Math.floor((initialMonthNum - 1) / 3) + 1;

  const yearChoices = useMemo(() => {
    const set = new Set(YEAR_OPTIONS);
    set.add(initialYear);
    return Array.from(set).sort((a, b) => a - b);
  }, [initialYear]);

  // 5-Mode Period Filter State (default = "month", current VN month)
  const [periodMode, setPeriodMode] = useState<FinancePeriodMode>("month");
  const [weekStart, setWeekStart] = useState<string>(() =>
    getMondayOfWeekYmd(initialToday)
  );
  const [monthFilter, setMonthFilter] = useState<string>(() =>
    initialToday.slice(0, 7)
  );
  const [quarterYear, setQuarterYear] = useState<number>(initialYear);
  const [quarterNum, setQuarterNum] = useState<number>(initialQuarter);
  const [yearFilter, setYearFilter] = useState<number>(initialYear);

  // Data State
  const [expenses, setExpenses] = useState<FinanceTx[]>([]);
  const [completedTickets, setCompletedTickets] = useState<CompletedTicketRow[]>([]);
  const [summary, setSummary] = useState<FinanceSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"income" | "expense">("income");

  // Modal Create Operating Expense
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingTx, setDeletingTx] = useState<FinanceTx | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    category: "MAT_BANG",
    title: "",
    amount: 0,
    transactionDate: initialToday,
    paymentMethod: "CASH" as "CASH" | "BANK",
    receiptImageUrl: "",
    note: "",
  });

  // Compute active period range & API query string
  const activePeriod = useMemo(() => {
    if (periodMode === "week") {
      const to = addDaysLocal(weekStart, 6);
      return {
        qs: `from=${encodeURIComponent(weekStart)}&to=${encodeURIComponent(to)}`,
        from: weekStart,
        to,
        month: weekStart.slice(0, 7),
        tag: `tuan-${weekStart}`,
        label: `${formatDdMmYyyy(weekStart)} – ${formatDdMmYyyy(to)}`,
      };
    }
    if (periodMode === "month") {
      const range = getMonthRange(monthFilter);
      return {
        qs: `month=${encodeURIComponent(monthFilter)}`,
        from: range.from,
        to: range.to,
        month: monthFilter,
        tag: monthFilter,
        label: `Tháng ${monthFilter.slice(5, 7)}/${monthFilter.slice(0, 4)}`,
      };
    }
    if (periodMode === "quarter") {
      const range = getQuarterRange(quarterYear, quarterNum);
      return {
        qs: `from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`,
        from: range.from,
        to: range.to,
        month: range.from.slice(0, 7),
        tag: `Q${quarterNum}-${quarterYear}`,
        label: `Quý ${quarterNum}/${quarterYear}`,
      };
    }
    if (periodMode === "year") {
      const from = `${yearFilter}-01-01`;
      const to = `${yearFilter}-12-31`;
      return {
        qs: `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
        from,
        to,
        month: `${yearFilter}-01`,
        tag: `nam-${yearFilter}`,
        label: `Năm ${yearFilter}`,
      };
    }
    return {
      qs: "month=ALL",
      from: "",
      to: "",
      month: "ALL",
      tag: "toan-bo",
      label: "Toàn bộ lịch sử",
    };
  }, [periodMode, weekStart, monthFilter, quarterYear, quarterNum, yearFilter]);

  const loadFinance = useCallback(async (qs: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/finance?${qs}`);
      if (!res.ok) throw new Error("Không thể tải dữ liệu tài chính");
      const data = await res.json();

      const nextExpenses: FinanceTx[] = Array.isArray(data.expenses)
        ? data.expenses
        : (Array.isArray(data.transactions) ? data.transactions : []).filter(
            (tx: FinanceTx) => tx.type === "EXPENSE"
          );

      setExpenses(nextExpenses);
      setCompletedTickets(Array.isArray(data.completedTickets) ? data.completedTickets : []);

      if (data.summary) {
        const s = data.summary;
        const stockOut = Number(s.stockPurchaseCashOut) || 0;
        const opExp = Number(s.operatingExpenses) || 0;
        const totalExpense =
          typeof s.totalExpense === "number"
            ? s.totalExpense
            : typeof s.totalCashOut === "number"
            ? s.totalCashOut
            : stockOut + opExp;

        setSummary({
          repairRevenue: Number(s.repairRevenue) || 0,
          repairCogs: Number(s.repairCogs) || 0,
          totalRevenue: Number(s.totalRevenue) || 0,
          operatingExpenses: opExp,
          stockPurchaseCashOut: stockOut,
          totalExpense,
          businessProfit: Number(s.businessProfit) || 0,
          cashflow: Number(s.cashflow) || 0,
          inventoryValue: Number(s.inventoryValue) || 0,
          completedTicketCount: Number(s.completedTicketCount) || 0,
        });
      } else {
        setSummary(EMPTY_SUMMARY);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi tải báo cáo tài chính");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFinance(activePeriod.qs);
  }, [activePeriod.qs, loadFinance]);

  function openNewExpenseModal() {
    setForm({
      category: OPERATING_EXPENSE_CATEGORIES[0]?.key || "MAT_BANG",
      title: "",
      amount: 0,
      transactionDate: getTodayVnYmd(),
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

  async function handleSaveExpense(e: React.FormEvent) {
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
        body: JSON.stringify({
          type: "EXPENSE",
          category: form.category,
          title: form.title.trim(),
          amount: form.amount,
          transactionDate: form.transactionDate,
          paymentMethod: form.paymentMethod,
          receiptImageUrl: form.receiptImageUrl || null,
          note: form.note.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể lưu chi phí");
      toast.success("Đã ghi nhận chi phí ngoài mới");
      setModalOpen(false);
      await loadFinance(activePeriod.qs);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi lưu chi phí");
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
      if (!res.ok) throw new Error("Không thể xóa khoản chi");
      toast.success("Đã xóa khoản chi");
      setDeletingTx(null);
      await loadFinance(activePeriod.qs);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi xóa khoản chi");
    } finally {
      setDeleting(false);
    }
  }

  function handleExportCsv() {
    const summarySection: unknown[][] = [
      ["BÁO CÁO TÀI CHÍNH MQTECH", activePeriod.label],
      ["Chỉ tiêu", "Số tiền / Số lượng"],
      ["Tổng Doanh Thu (Phần Thu - Đơn COMPLETED)", summary.totalRevenue],
      ["Số đơn hàng hoàn thành", summary.completedTicketCount],
      ["Giá vốn linh kiện đã lắp", summary.repairCogs],
      ["Chi nhập kho", summary.stockPurchaseCashOut],
      ["Chi phí ngoài (vận hành)", summary.operatingExpenses],
      ["Tổng Phần Chi", summary.totalExpense],
      ["Phần Lãi (Lãi đơn hàng = Thu - Giá vốn LK - Chi ngoài)", summary.businessProfit],
      ["Cân đối Thu - Chi (Cashflow)", summary.cashflow],
      ["Giá trị tồn kho hiện tại", summary.inventoryValue],
      [],
    ];

    const incomeHeader = [
      "PHẦN THU — ĐƠN HÀNG HOÀN THÀNH",
      "Ngày",
      "Mã phiếu",
      "Khách hàng",
      "SĐT",
      "Thiết bị",
      "Số hạng mục",
      "Doanh thu (VNĐ)",
      "Giá vốn LK (VNĐ)",
      "Lãi đơn (VNĐ)",
    ];
    const incomeRows = completedTickets.map((t) => [
      "THU",
      t.date,
      t.ticketCode,
      t.customerName,
      t.customerPhone,
      t.deviceModel,
      t.itemsCount,
      t.revenue,
      t.cogs,
      t.grossProfit,
    ]);

    const expenseHeader = [
      "PHẦN CHI — NHẬP KHO & CHI PHÍ NGOÀI",
      "Ngày",
      "Phân loại",
      "Danh mục",
      "Nội dung",
      "Thanh toán",
      "Số tiền (VNĐ)",
      "Ghi chú",
      "Ảnh chứng từ",
    ];
    const expenseRows = expenses.map((tx) => [
      "CHI",
      tx.transactionDate,
      tx.category === "NHAP_HANG" || tx.stockMovementId !== null
        ? "Nhập kho"
        : "Chi phí ngoài",
      getCategoryLabel(tx.category),
      tx.title,
      tx.paymentMethod === "BANK" ? "Chuyển khoản" : "Tiền mặt",
      tx.amount,
      tx.note || "",
      tx.receiptImageUrl || "",
    ]);

    const csv =
      "\uFEFF" +
      [
        ...summarySection,
        incomeHeader,
        ...incomeRows,
        [],
        expenseHeader,
        ...expenseRows,
      ]
        .map((r) => r.map(escapeCsvCell).join(","))
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mqtech-tai-chinh-${activePeriod.tag}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Đã xuất báo cáo Tài chính Excel/CSV");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy">
            Quản lý Thu Chi &amp; Doanh thu
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Phần Thu tự động từ đơn hàng hoàn thành, Phần Chi đồng bộ trực tiếp từ nhập kho &amp; chi phí phát sinh.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-xs font-semibold text-navy transition-colors hover:border-brand hover:text-brand"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>Xuất Excel / CSV</span>
          </button>
          <button
            type="button"
            onClick={openNewExpenseModal}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-brand px-4 text-xs font-semibold text-ink-inverse transition-colors hover:bg-brand-hover"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Ghi chi phí ngoài</span>
          </button>
        </div>
      </div>

      {/* 5-Mode Period Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-3.5 shadow-card">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy">
            <Calendar className="h-4 w-4 text-brand" aria-hidden="true" />
            <span>Kỳ xem:</span>
          </div>
          <div
            role="tablist"
            aria-label="Chọn kỳ báo cáo tài chính"
            className="inline-flex flex-wrap items-center rounded-full border border-line bg-surface-subtle p-1"
          >
            {PERIOD_MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                role="tab"
                aria-selected={periodMode === m.key}
                onClick={() => setPeriodMode(m.key)}
                className={cn(
                  "min-h-8 rounded-full px-3.5 text-xs font-semibold transition-colors",
                  periodMode === m.key
                    ? "bg-navy text-ink-inverse shadow-sm"
                    : "text-ink-muted hover:text-navy"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mode-specific Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {periodMode === "week" && (
            <>
              <div className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setWeekStart((prev) => addDaysLocal(prev, -7))}
                  className="inline-flex min-h-9 items-center gap-1 rounded-xl border border-line bg-surface-subtle px-2.5 text-xs font-semibold text-navy hover:border-brand hover:text-brand"
                >
                  <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Tuần trước</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWeekStart(getMondayOfWeekYmd(getTodayVnYmd()))}
                  className="inline-flex min-h-9 items-center rounded-xl border border-line bg-surface-subtle px-3 text-xs font-semibold text-navy hover:border-brand hover:text-brand"
                >
                  Tuần này
                </button>
                <button
                  type="button"
                  onClick={() => setWeekStart((prev) => addDaysLocal(prev, 7))}
                  className="inline-flex min-h-9 items-center gap-1 rounded-xl border border-line bg-surface-subtle px-2.5 text-xs font-semibold text-navy hover:border-brand hover:text-brand"
                >
                  <span>Tuần sau</span>
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
              <span className="inline-flex min-h-9 items-center rounded-xl border border-brand/25 bg-brand-light px-3 font-mono text-xs font-semibold text-brand tabular-nums">
                {formatDdMmYyyy(activePeriod.from)} – {formatDdMmYyyy(activePeriod.to)}
              </span>
            </>
          )}

          {periodMode === "month" && (
            <input
              type="month"
              aria-label="Chọn tháng báo cáo"
              value={monthFilter}
              onChange={(e) => {
                if (e.target.value) setMonthFilter(e.target.value);
              }}
              className="min-h-9 rounded-xl border border-line bg-surface-subtle px-3 text-base sm:text-xs font-semibold text-navy focus:border-brand focus:bg-surface focus:outline-none"
            />
          )}

          {periodMode === "quarter" && (
            <>
              <select
                aria-label="Chọn quý"
                value={quarterNum}
                onChange={(e) => setQuarterNum(Number(e.target.value))}
                className="min-h-9 rounded-xl border border-line bg-surface-subtle px-3 text-base sm:text-xs font-semibold text-navy focus:border-brand focus:bg-surface focus:outline-none"
              >
                {QUARTER_OPTIONS.map((q) => (
                  <option key={q.value} value={q.value}>
                    {q.label}
                  </option>
                ))}
              </select>
              <select
                aria-label="Chọn năm cho quý"
                value={quarterYear}
                onChange={(e) => setQuarterYear(Number(e.target.value))}
                className="min-h-9 rounded-xl border border-line bg-surface-subtle px-3 text-base sm:text-xs font-semibold text-navy focus:border-brand focus:bg-surface focus:outline-none"
              >
                {yearChoices.map((y) => (
                  <option key={y} value={y}>
                    Năm {y}
                  </option>
                ))}
              </select>
            </>
          )}

          {periodMode === "year" && (
            <select
              aria-label="Chọn năm báo cáo"
              value={yearFilter}
              onChange={(e) => setYearFilter(Number(e.target.value))}
              className="min-h-9 rounded-xl border border-line bg-surface-subtle px-3 text-base sm:text-xs font-semibold text-navy focus:border-brand focus:bg-surface focus:outline-none"
            >
              {yearChoices.map((y) => (
                <option key={y} value={y}>
                  Năm {y}
                </option>
              ))}
            </select>
          )}

          {periodMode === "all" && (
            <span className="inline-flex min-h-9 items-center rounded-xl border border-line bg-surface-subtle px-3 text-xs font-medium text-ink-muted">
              Đang xem toàn bộ lịch sử từ khi mở sổ
            </span>
          )}
        </div>
      </div>

      {/* 4 Crisp KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Card 1 — Tổng Doanh Thu (Phần Thu) */}
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Tổng Doanh Thu (Phần Thu)
            </span>
            <ArrowDownLeft className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
          </div>
          <p className="mt-2 font-mono text-2xl font-extrabold text-navy tabular-nums">
            {formatVnd(summary.totalRevenue)}
          </p>
          <p className="mt-1.5 text-xs text-ink-muted">
            <strong className="font-semibold text-navy">
              {summary.completedTicketCount} đơn hoàn thành
            </strong>{" "}
            • Giá vốn LK đã lắp:{" "}
            <span className="font-mono font-semibold text-navy tabular-nums">
              {formatVnd(summary.repairCogs)}
            </span>
          </p>
        </div>

        {/* Card 2 — Phần Chi (Nhập kho & Chi ngoài) */}
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Phần Chi (Nhập kho &amp; Chi ngoài)
            </span>
            <ArrowUpRight
              className="h-5 w-5 shrink-0 text-status-danger-ink"
              aria-hidden="true"
            />
          </div>
          <p className="mt-2 font-mono text-2xl font-extrabold text-status-danger-ink tabular-nums">
            {formatVnd(summary.totalExpense)}
          </p>
          <p className="mt-1.5 text-xs text-ink-muted">
            Nhập kho:{" "}
            <span className="font-mono font-semibold text-navy tabular-nums">
              {formatVnd(summary.stockPurchaseCashOut)}
            </span>{" "}
            • Chi ngoài:{" "}
            <span className="font-mono font-semibold text-navy tabular-nums">
              {formatVnd(summary.operatingExpenses)}
            </span>
          </p>
        </div>

        {/* Card 3 — Phần Lãi (Lãi đơn hàng) */}
        <div
          className={cn(
            "rounded-2xl border p-5 shadow-card",
            summary.businessProfit >= 0
              ? "border-status-success-line bg-status-success-bg"
              : "border-status-danger-line bg-status-danger-bg"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Phần Lãi (Lãi đơn hàng)
            </span>
            {summary.businessProfit >= 0 ? (
              <TrendingUp
                className="h-5 w-5 shrink-0 text-status-success-ink"
                aria-hidden="true"
              />
            ) : (
              <TrendingDown
                className="h-5 w-5 shrink-0 text-status-danger-ink"
                aria-hidden="true"
              />
            )}
          </div>
          <p
            className={cn(
              "mt-2 font-mono text-2xl font-extrabold tabular-nums",
              summary.businessProfit >= 0
                ? "text-status-success-ink"
                : "text-status-danger-ink"
            )}
          >
            {summary.businessProfit >= 0 ? "+" : ""}
            {formatVnd(summary.businessProfit)}
          </p>
          <p className="mt-1 text-[11px] text-ink-muted">
            = Doanh thu − Giá vốn LK − Chi ngoài
          </p>
          <p className="mt-1.5 border-t border-line/60 pt-1.5 text-xs font-semibold text-navy">
            Cân đối Thu − Chi:{" "}
            <span
              className={cn(
                "font-mono font-bold tabular-nums",
                summary.cashflow >= 0
                  ? "text-status-success-ink"
                  : "text-status-warning-ink"
              )}
            >
              {summary.cashflow >= 0 ? "+" : ""}
              {formatVnd(summary.cashflow)}
            </span>
          </p>
        </div>

        {/* Card 4 — Giá Trị Tồn Kho Hiện Tại */}
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
              Giá Trị Tồn Kho Hiện Tại
            </span>
            <Package className="h-5 w-5 shrink-0 text-navy" aria-hidden="true" />
          </div>
          <p className="mt-2 font-mono text-2xl font-extrabold text-navy tabular-nums">
            {formatVnd(summary.inventoryValue)}
          </p>
          <p className="mt-1.5 text-xs text-ink-muted">
            Hàng còn tồn trong kho chưa xuất
          </p>
        </div>
      </div>

      {/* Interactive Revenue / Expense / Profit Chart */}
      <FinanceRevenueChart
        mode={periodMode}
        from={activePeriod.from}
        to={activePeriod.to}
        month={activePeriod.month}
        completedTickets={completedTickets}
        expenses={expenses}
        loading={loading}
      />

      {/* 2 Clear Tabs (Default = "income") */}
      <div className="inline-flex flex-wrap rounded-full border border-line bg-surface p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab("income")}
          className={cn(
            "min-h-10 rounded-full px-4 text-xs font-semibold transition-colors",
            activeTab === "income"
              ? "bg-navy text-ink-inverse"
              : "text-ink-muted hover:text-navy"
          )}
        >
          Phần Thu — Đơn hoàn thành ({completedTickets.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("expense")}
          className={cn(
            "min-h-10 rounded-full px-4 text-xs font-semibold transition-colors",
            activeTab === "expense"
              ? "bg-navy text-ink-inverse"
              : "text-ink-muted hover:text-navy"
          )}
        >
          Phần Chi — Nhập kho &amp; Chi phí ({expenses.length})
        </button>
      </div>

      {/* Tables */}
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-line bg-surface py-16 text-sm text-ink-muted">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-brand" aria-hidden="true" />
          Đang tổng hợp số liệu tài chính...
        </div>
      ) : activeTab === "income" ? (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-card">
          <table className="w-full min-w-[780px] text-left text-xs">
            <thead className="border-b border-line bg-surface-subtle text-xs font-bold uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-4 py-3">Mã phiếu &amp; Ngày</th>
                <th className="px-4 py-3">Khách hàng &amp; Thiết bị</th>
                <th className="px-4 py-3 text-right">Doanh thu</th>
                <th className="px-4 py-3 text-right">Giá vốn LK</th>
                <th className="px-4 py-3 text-right">Lãi đơn</th>
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
                    Chưa có đơn hàng hoàn thành (COMPLETED) nào trong kỳ này.
                  </td>
                </tr>
              ) : (
                completedTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-subtle/50">
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-brand">
                        {t.ticketCode}
                      </div>
                      <div className="font-mono text-xs text-ink-muted tabular-nums">
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
                    <td className="px-4 py-3 text-right font-mono font-semibold text-navy tabular-nums">
                      {formatVnd(t.revenue)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-ink-muted tabular-nums">
                      {formatVnd(t.cogs)}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-3 text-right font-mono font-bold tabular-nums",
                        t.grossProfit >= 0
                          ? "text-status-success-ink"
                          : "text-status-danger-ink"
                      )}
                    >
                      {t.grossProfit >= 0 ? "+" : ""}
                      {formatVnd(t.grossProfit)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/in-hoa-don/${t.id}`}
                        target="_blank"
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-brand hover:text-brand"
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
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-card">
          <table className="w-full min-w-[780px] text-left text-xs">
            <thead className="border-b border-line bg-surface-subtle text-xs font-bold uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-4 py-3">Ngày</th>
                <th className="px-4 py-3">Phân loại</th>
                <th className="px-4 py-3">Nội dung</th>
                <th className="px-4 py-3">Thanh toán</th>
                <th className="px-4 py-3 text-right">Số tiền</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {expenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm text-ink-muted"
                  >
                    Chưa có khoản chi nhập kho hoặc chi phí ngoài nào trong kỳ này.
                  </td>
                </tr>
              ) : (
                expenses.map((tx) => {
                  const isStockPurchase =
                    tx.category === "NHAP_HANG" || tx.stockMovementId !== null;
                  return (
                    <tr key={tx.id} className="hover:bg-surface-subtle/50">
                      <td className="px-4 py-3 font-mono text-xs text-ink-muted tabular-nums">
                        {tx.transactionDate}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                              isStockPurchase
                                ? "bg-brand-light text-brand"
                                : "bg-status-danger-bg text-status-danger-ink"
                            )}
                          >
                            {isStockPurchase ? (
                              <Package className="h-3 w-3" aria-hidden="true" />
                            ) : (
                              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                            )}
                            <span>
                              {isStockPurchase
                                ? "Nhập kho"
                                : `Chi phí ngoài • ${getCategoryLabel(tx.category)}`}
                            </span>
                          </span>
                          {isStockPurchase && (
                            <Link
                              href="/admin/kho-hang"
                              className="text-[11px] font-medium text-brand hover:underline"
                            >
                              Sửa giá nhập trong Kho hàng sẽ tự đồng bộ về đây →
                            </Link>
                          )}
                        </div>
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
                      <td className="px-4 py-3 text-right font-mono font-bold text-status-danger-ink tabular-nums">
                        -{formatVnd(tx.amount)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setDeletingTx(tx)}
                          title="Xóa khoản chi"
                          aria-label={`Xóa khoản chi ${tx.title}`}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink-muted transition-colors hover:border-status-danger-line hover:bg-status-danger-bg hover:text-status-danger-ink"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Record Operating Expense (excludes NHAP_HANG) */}
      <ModalDialog
        open={modalOpen}
        onOpenChange={setModalOpen}
        title="Ghi chi phí ngoài"
        description="Ghi nhận chi phí vận hành phát sinh ngoài nhập kho. Chi nhập hàng được tự động đồng bộ từ mục Kho hàng."
      >
        <form onSubmit={handleSaveExpense} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-navy">
                Danh mục chi phí
              </label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((p) => ({ ...p, category: e.target.value }))
                }
                className="min-h-10 w-full rounded-xl border border-line bg-surface-subtle px-3 text-base sm:text-xs text-navy focus:border-brand focus:bg-surface focus:outline-none"
              >
                {OPERATING_EXPENSE_CATEGORIES.map((c) => (
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
                Nội dung chi phí *
              </label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="VD: Tiền điện tháng 11, Ship linh kiện, Chạy quảng cáo..."
                className="min-h-10 w-full rounded-xl border border-line bg-surface-subtle px-3 text-base sm:text-xs text-navy focus:border-brand focus:bg-surface focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-navy">
                Ngày phát sinh
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
              <span>Lưu chi phí</span>
            </button>
          </div>
        </form>
      </ModalDialog>

      <ConfirmDialog
        open={deletingTx !== null}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeletingTx(null);
        }}
        title="Xóa khoản chi?"
        description={
          deletingTx
            ? `Xóa khoản chi "${deletingTx.title}" (${formatVnd(deletingTx.amount)})? Thao tác này không thể hoàn tác.`
            : ""
        }
        confirmLabel="Xóa khoản chi"
        loading={deleting}
        onConfirm={handleConfirmDeleteTx}
      />
    </div>
  );
}
