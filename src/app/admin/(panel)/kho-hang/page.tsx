"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowUpCircle,
  Download,
  ExternalLink,
  History,
  ImagePlus,
  Loader2,
  Package,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { ModalDialog } from "@/components/ui/ModalDialog";
import { formatVnd } from "@/lib/ticket-items";
import {
  INVENTORY_CATEGORIES,
  getMovementTypeLabel,
} from "@/lib/inventory-constants";
import { cn } from "@/lib/utils";

interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  avgCost: number;
  sellPrice: number;
  minStock: number;
  supplier: string | null;
  notes: string | null;
  updatedAt: string;
}

interface StockMovement {
  id: number;
  itemId: number;
  itemName: string;
  itemSku: string;
  itemUnit: string;
  type: string;
  quantityChange: number;
  unitCost: number;
  totalCost: number;
  ticketId: number | null;
  ticketCode: string | null;
  supplier: string | null;
  receiptImageUrl: string | null;
  note: string | null;
  createdAt: string;
}

interface InventorySummary {
  totalItems: number;
  totalQuantity: number;
  totalInventoryValue: number;
  lowStockCount: number;
}

function escapeCsvCell(value: unknown): string {
  const str = String(value ?? "");
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [summary, setSummary] = useState<InventorySummary>({
    totalItems: 0,
    totalQuantity: 0,
    totalInventoryValue: 0,
    lowStockCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"stock" | "history">("stock");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Create / Edit Item Modal
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [savingItem, setSavingItem] = useState(false);
  const [itemForm, setItemForm] = useState({
    name: "",
    sku: "",
    category: "SSD / Ổ cứng",
    unit: "Cái",
    quantity: 0,
    avgCost: 0,
    sellPrice: 0,
    minStock: 2,
    supplier: "",
    notes: "",
    recordExpense: true,
    paymentMethod: "CASH" as "CASH" | "BANK",
    receiptImageUrl: "",
  });

  // Stock Movement Modal (IN / OUT_RETAIL / ADJUST)
  const [movModalOpen, setMovModalOpen] = useState(false);
  const [movTarget, setMovTarget] = useState<InventoryItem | null>(null);
  const [movType, setMovType] = useState<"IN" | "OUT_RETAIL" | "ADJUST">("IN");
  const [savingMov, setSavingMov] = useState(false);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [movForm, setMovForm] = useState({
    quantity: 1,
    unitCost: 0,
    sellTotal: 0,
    supplier: "",
    note: "",
    transactionDate: new Date().toISOString().slice(0, 10),
    paymentMethod: "CASH" as "CASH" | "BANK",
    recordExpense: true,
    recordIncome: true,
    receiptImageUrl: "",
  });

  // Delete confirm
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/inventory");
      if (!res.ok) throw new Error("Không thể tải dữ liệu kho");
      const data = await res.json();
      setItems(data.items || []);
      setMovements(data.movements || []);
      if (data.summary) setSummary(data.summary);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi tải dữ liệu kho");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (categoryFilter !== "ALL" && item.category !== categoryFilter) {
        return false;
      }
      if (onlyLowStock && item.quantity > item.minStock) {
        return false;
      }
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        (item.supplier || "").toLowerCase().includes(q)
      );
    });
  }, [items, search, categoryFilter, onlyLowStock]);

  function openCreateItem() {
    setEditingItem(null);
    setItemForm({
      name: "",
      sku: "",
      category: "SSD / Ổ cứng",
      unit: "Cái",
      quantity: 0,
      avgCost: 0,
      sellPrice: 0,
      minStock: 2,
      supplier: "",
      notes: "",
      recordExpense: true,
      paymentMethod: "CASH",
      receiptImageUrl: "",
    });
    setItemModalOpen(true);
  }

  function openEditItem(item: InventoryItem) {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      sku: item.sku,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      avgCost: item.avgCost,
      sellPrice: item.sellPrice,
      minStock: item.minStock,
      supplier: item.supplier || "",
      notes: item.notes || "",
      recordExpense: false,
      paymentMethod: "CASH",
      receiptImageUrl: "",
    });
    setItemModalOpen(true);
  }

  function openMovementModal(
    item: InventoryItem,
    type: "IN" | "OUT_RETAIL" | "ADJUST"
  ) {
    setMovTarget(item);
    setMovType(type);
    setMovForm({
      quantity: type === "ADJUST" ? item.quantity : 1,
      unitCost: item.avgCost,
      sellTotal: item.sellPrice > 0 ? item.sellPrice : item.avgCost,
      supplier: item.supplier || "",
      note: "",
      transactionDate: new Date().toISOString().slice(0, 10),
      paymentMethod: "CASH",
      recordExpense: true,
      recordIncome: true,
      receiptImageUrl: "",
    });
    setMovModalOpen(true);
  }

  async function handleReceiptUpload(
    file: File | undefined,
    target: "item" | "mov"
  ) {
    if (!file) return;
    setUploadingReceipt(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload ảnh thất bại");
      if (target === "item") {
        setItemForm((prev) => ({ ...prev, receiptImageUrl: data.url }));
      } else {
        setMovForm((prev) => ({ ...prev, receiptImageUrl: data.url }));
      }
      toast.success("Đã tải ảnh hóa đơn lên Cloudflare R2");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi upload ảnh");
    } finally {
      setUploadingReceipt(false);
    }
  }

  async function handleSaveItem(e: React.FormEvent) {
    e.preventDefault();
    if (!itemForm.name.trim()) {
      toast.error("Vui lòng nhập tên linh kiện");
      return;
    }
    setSavingItem(true);
    try {
      const url = editingItem
        ? `/api/admin/inventory/${editingItem.id}`
        : "/api/admin/inventory";
      const method = editingItem ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(itemForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể lưu linh kiện");
      toast.success(
        editingItem ? "Đã cập nhật linh kiện" : "Đã thêm linh kiện mới vào kho"
      );
      setItemModalOpen(false);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi lưu linh kiện");
    } finally {
      setSavingItem(false);
    }
  }

  async function handleSaveMovement(e: React.FormEvent) {
    e.preventDefault();
    if (!movTarget) return;
    setSavingMov(true);
    try {
      const res = await fetch("/api/admin/inventory/movements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: movTarget.id,
          type: movType,
          quantity: movForm.quantity,
          unitCost: movForm.unitCost,
          sellTotal: movForm.sellTotal,
          supplier: movForm.supplier,
          note: movForm.note,
          transactionDate: movForm.transactionDate,
          paymentMethod: movForm.paymentMethod,
          recordExpense: movForm.recordExpense,
          recordIncome: movForm.recordIncome,
          receiptImageUrl: movForm.receiptImageUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể cập nhật kho");

      toast.success(
        movType === "IN"
          ? "Đã nhập kho & cập nhật giá vốn bình quân"
          : movType === "OUT_RETAIL"
          ? "Đã xuất kho thành công"
          : "Đã điều chỉnh tồn kho"
      );
      setMovModalOpen(false);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi cập nhật kho");
    } finally {
      setSavingMov(false);
    }
  }

  async function handleDeleteItem() {
    if (!deletingItem) return;
    try {
      const res = await fetch(`/api/admin/inventory/${deletingItem.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Không thể xóa linh kiện");
      toast.success(`Đã xóa "${deletingItem.name}" khỏi kho`);
      setDeletingItem(null);
      await loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Lỗi xóa linh kiện");
    }
  }

  function handleExportCsv() {
    const today = new Date().toISOString().slice(0, 10);
    if (activeTab === "stock") {
      const headers = [
        "SKU",
        "Tên linh kiện",
        "Danh mục",
        "ĐVT",
        "Tồn kho",
        "Ngưỡng cảnh báo",
        "Giá nhập bình quân (VNĐ)",
        "Giá bán gợi ý (VNĐ)",
        "Giá trị tồn (VNĐ)",
        "Nhà cung cấp",
        "Ghi chú",
      ];
      const rows = filteredItems.map((i) => [
        i.sku,
        i.name,
        i.category,
        i.unit,
        i.quantity,
        i.minStock,
        i.avgCost,
        i.sellPrice,
        Math.max(0, i.quantity) * Math.max(0, i.avgCost),
        i.supplier || "",
        i.notes || "",
      ]);
      const csv =
        "\uFEFF" +
        [headers, ...rows]
          .map((r) => r.map(escapeCsvCell).join(","))
          .join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mqtech-ton-kho-${today}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Đã xuất file Excel/CSV tồn kho");
    } else {
      const headers = [
        "Thời gian",
        "Mã SKU",
        "Linh kiện",
        "Loại giao dịch",
        "Thay đổi SL",
        "Đơn giá (VNĐ)",
        "Thành tiền (VNĐ)",
        "Mã phiếu sửa",
        "Nhà cung cấp",
        "Ghi chú",
        "Ảnh chứng từ",
      ];
      const rows = movements.map((m) => [
        new Date(m.createdAt).toLocaleString("vi-VN"),
        m.itemSku,
        m.itemName,
        getMovementTypeLabel(m.type),
        m.quantityChange,
        m.unitCost,
        m.totalCost,
        m.ticketCode || "",
        m.supplier || "",
        m.note || "",
        m.receiptImageUrl || "",
      ]);
      const csv =
        "\uFEFF" +
        [headers, ...rows]
          .map((r) => r.map(escapeCsvCell).join(","))
          .join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mqtech-nhap-xuat-kho-${today}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Đã xuất file Excel/CSV lịch sử nhập xuất kho");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy">
            Kho linh kiện &amp; Nhập xuất
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Quản lý tồn kho, tự tính giá nhập bình quân gia quyền và tự động trừ/hoàn kho khi gắn vào Phiếu sửa chữa.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-navy hover:border-brand hover:text-brand transition-colors"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>Xuất Excel / CSV</span>
          </button>
          <button
            type="button"
            onClick={openCreateItem}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 py-2 text-xs font-semibold text-ink-inverse shadow-sm hover:bg-brand-hover transition-colors"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Thêm linh kiện mới</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Mặt hàng &amp; Tổng SL tồn
            </span>
            <Package className="h-5 w-5 text-brand" aria-hidden="true" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-navy">
            {summary.totalItems} mã{" "}
            <span className="text-sm font-normal text-ink-muted">
              ({summary.totalQuantity} sản phẩm)
            </span>
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Tổng giá trị tồn kho
            </span>
            <ArrowDownCircle className="h-5 w-5 text-status-success-solid" aria-hidden="true" />
          </div>
          <p className="mt-2 font-mono text-2xl font-bold text-status-success-ink">
            {formatVnd(summary.totalInventoryValue)}
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Tính theo giá nhập bình quân gia quyền
          </p>
        </div>

        <div
          className={cn(
            "rounded-2xl border p-5 shadow-card",
            summary.lowStockCount > 0
              ? "border-status-warning-line bg-status-warning-bg"
              : "border-line bg-surface"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Cảnh báo sắp hết hàng
            </span>
            <AlertTriangle
              className={cn(
                "h-5 w-5",
                summary.lowStockCount > 0 ? "text-status-warning-solid" : "text-ink-muted"
              )}
              aria-hidden="true"
            />
          </div>
          <p
            className={cn(
              "mt-2 font-mono text-2xl font-bold",
              summary.lowStockCount > 0 ? "text-status-warning-ink" : "text-navy"
            )}
          >
            {summary.lowStockCount} mã
          </p>
          <p className="mt-1 text-xs text-ink-muted">
            Số lượng tồn &le; ngưỡng cảnh báo
          </p>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-line bg-surface p-1">
          <button
            type="button"
            onClick={() => setActiveTab("stock")}
            className={cn(
              "inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
              activeTab === "stock"
                ? "bg-navy text-ink-inverse"
                : "text-ink-muted hover:text-navy"
            )}
          >
            <Package className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Tồn kho ({items.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={cn(
              "inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
              activeTab === "history"
                ? "bg-navy text-ink-inverse"
                : "text-ink-muted hover:text-navy"
            )}
          >
            <History className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Lịch sử Nhập / Xuất ({movements.length})</span>
          </button>
        </div>

        {activeTab === "stock" && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm tên linh kiện, SKU, NCC..."
                className="min-h-10 w-60 rounded-full border border-line bg-surface pl-9 pr-3 text-base sm:text-xs text-navy focus:border-brand focus:outline-none"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="min-h-10 rounded-full border border-line bg-surface px-3 text-base sm:text-xs text-navy focus:border-brand focus:outline-none"
            >
              <option value="ALL">Tất cả danh mục</option>
              {INVENTORY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <label className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-xs font-medium text-navy">
              <input
                type="checkbox"
                checked={onlyLowStock}
                onChange={(e) => setOnlyLowStock(e.target.checked)}
                className="h-4 w-4 accent-brand"
              />
              <span>Sắp hết hàng</span>
            </label>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-line bg-surface py-16 text-sm text-ink-muted">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-brand" aria-hidden="true" />
          Đang tải dữ liệu kho...
        </div>
      ) : activeTab === "stock" ? (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-card">
          <table className="w-full min-w-[820px] text-left text-xs">
            <thead className="border-b border-line bg-surface-subtle text-xs font-bold uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-4 py-3">Linh kiện / SKU</th>
                <th className="px-4 py-3">Danh mục</th>
                <th className="px-4 py-3 text-center">Tồn kho</th>
                <th className="px-4 py-3 text-right">Giá nhập BQ</th>
                <th className="px-4 py-3 text-right">Giá bán gợi ý</th>
                <th className="px-4 py-3 text-right">Giá trị tồn</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm text-ink-muted"
                  >
                    Chưa có linh kiện nào phù hợp. Bấm{" "}
                    <strong>&ldquo;Thêm linh kiện mới&rdquo;</strong> để bắt đầu nhập kho.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.quantity <= item.minStock;
                  const stockVal =
                    Math.max(0, item.quantity) * Math.max(0, item.avgCost);
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-surface-subtle/60 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-navy">{item.name}</div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                          <span className="font-mono font-semibold text-brand">
                            {item.sku}
                          </span>
                          {item.supplier && <span>• NCC: {item.supplier}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-muted">{item.category}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-xs font-bold",
                            item.quantity <= 0
                              ? "bg-status-danger-bg text-status-danger-ink"
                              : isLow
                              ? "bg-status-warning-bg text-status-warning-ink"
                              : "bg-status-success-bg text-status-success-ink"
                          )}
                        >
                          {item.quantity} {item.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-navy">
                        {formatVnd(item.avgCost)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-brand">
                        {formatVnd(item.sellPrice)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-navy">
                        {formatVnd(stockVal)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openMovementModal(item, "IN")}
                            title="Nhập thêm hàng"
                            className="inline-flex min-h-10 items-center gap-1 rounded-lg bg-status-success-solid px-2.5 py-1 text-xs font-semibold text-ink-inverse hover:bg-status-success-ink"
                          >
                            <ArrowDownCircle className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Nhập</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openMovementModal(item, "OUT_RETAIL")}
                            title="Xuất bán lẻ / nội bộ"
                            className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-navy hover:border-brand hover:text-brand"
                          >
                            <ArrowUpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Xuất</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openMovementModal(item, "ADJUST")}
                            title="Kiểm kho điều chỉnh"
                            aria-label="Kiểm kho điều chỉnh"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink-muted hover:border-brand hover:text-brand"
                          >
                            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditItem(item)}
                            title="Sửa thông tin"
                            aria-label="Sửa thông tin"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink-muted hover:border-brand hover:text-brand"
                          >
                            <Pencil className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingItem(item)}
                            title="Xóa linh kiện"
                            aria-label="Xóa linh kiện"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink-muted hover:border-status-danger-line hover:text-status-danger-ink"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-card">
          <table className="w-full min-w-[820px] text-left text-xs">
            <thead className="border-b border-line bg-surface-subtle text-xs font-bold uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="px-4 py-3">Thời gian</th>
                <th className="px-4 py-3">Linh kiện</th>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3 text-center">SL</th>
                <th className="px-4 py-3 text-right">Đơn giá</th>
                <th className="px-4 py-3 text-right">Thành tiền</th>
                <th className="px-4 py-3">Ghi chú / Chứng từ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {movements.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-sm text-ink-muted"
                  >
                    Chưa có lịch sử nhập/xuất kho nào.
                  </td>
                </tr>
              ) : (
                movements.map((m) => (
                  <tr key={m.id} className="hover:bg-surface-subtle/50">
                    <td className="px-4 py-3 font-mono text-xs text-ink-muted">
                      {new Date(m.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-navy">{m.itemName}</div>
                      <div className="font-mono text-xs text-ink-muted">
                        {m.itemSku}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                          m.type === "IN" || m.type === "RETURN_TICKET"
                            ? "bg-status-success-bg text-status-success-ink"
                            : m.type === "ADJUST"
                            ? "bg-surface-muted text-ink-muted"
                            : "bg-status-warning-bg text-status-warning-ink"
                        )}
                      >
                        {getMovementTypeLabel(m.type)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold">
                      <span
                        className={
                          m.quantityChange >= 0
                            ? "text-status-success-ink"
                            : "text-status-danger-ink"
                        }
                      >
                        {m.quantityChange > 0
                          ? `+${m.quantityChange}`
                          : m.quantityChange}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-navy">
                      {formatVnd(m.unitCost)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-navy">
                      {formatVnd(m.totalCost)}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-muted">
                      <div>{m.note || "—"}</div>
                      {m.ticketCode && (
                        <div className="font-mono font-semibold text-brand">
                          Phiếu: {m.ticketCode}
                        </div>
                      )}
                      {m.receiptImageUrl && (
                        <a
                          href={m.receiptImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 font-semibold text-brand hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          <span>Xem ảnh hóa đơn R2</span>
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Create / Edit Item */}
      <ModalDialog
        open={itemModalOpen}
        onOpenChange={setItemModalOpen}
        title={editingItem ? "Cập nhật linh kiện" : "Thêm linh kiện mới vào kho"}
        description="Lưu thông tin linh kiện trên Neon PostgreSQL để chọn nhanh khi lập phiếu sửa chữa."
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-navy">
                Tên linh kiện *
              </label>
              <input
                type="text"
                required
                value={itemForm.name}
                onChange={(e) =>
                  setItemForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="VD: SSD Kingston NV2 256GB, Mainboard Asus B85..."
                className="min-h-10 w-full rounded-xl border border-line bg-surface-subtle px-3 text-base sm:text-xs text-navy focus:border-brand focus:bg-surface focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-navy">
                Mã SKU (bỏ trống tự tạo)
              </label>
              <input
                type="text"
                disabled={Boolean(editingItem)}
                value={itemForm.sku}
                onChange={(e) =>
                  setItemForm((p) => ({ ...p, sku: e.target.value }))
                }
                placeholder="VD: SSD-256"
                className="min-h-10 w-full rounded-xl border border-line bg-surface-subtle px-3 font-mono text-base sm:text-xs text-navy disabled:opacity-60 focus:border-brand focus:bg-surface focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-navy">
                Danh mục
              </label>
              <select
                value={itemForm.category}
                onChange={(e) =>
                  setItemForm((p) => ({ ...p, category: e.target.value }))
                }
                className="min-h-10 w-full rounded-xl border border-line bg-surface-subtle px-3 text-base sm:text-xs text-navy focus:border-brand focus:bg-surface focus:outline-none"
              >
                {INVENTORY_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {!editingItem && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-navy">
                  Số lượng tồn ban đầu
                </label>
                <input
                  type="number"
                  min={0}
                  value={itemForm.quantity}
                  onChange={(e) =>
                    setItemForm((p) => ({
                      ...p,
                      quantity: Math.max(0, Number(e.target.value) || 0),
                    }))
                  }
                  className="min-h-10 w-full rounded-xl border border-line bg-surface-subtle px-3 font-mono text-base sm:text-xs text-navy focus:border-brand focus:bg-surface focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold text-navy">
                Đơn vị tính
              </label>
              <input
                type="text"
                value={itemForm.unit}
                onChange={(e) =>
                  setItemForm((p) => ({ ...p, unit: e.target.value }))
                }
                placeholder="Cái / Thanh / Bộ"
                className="min-h-10 w-full rounded-xl border border-line bg-surface-subtle px-3 text-base sm:text-xs text-navy focus:border-brand focus:bg-surface focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-navy">
                Giá nhập / Giá vốn BQ (VNĐ)
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={itemForm.avgCost || ""}
                onChange={(e) =>
                  setItemForm((p) => ({
                    ...p,
                    avgCost: Math.max(0, Number(e.target.value) || 0),
                  }))
                }
                placeholder="400000"
                className="min-h-10 w-full rounded-xl border border-line bg-surface-subtle px-3 font-mono text-base sm:text-xs text-navy focus:border-brand focus:bg-surface focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-navy">
                Giá bán gợi ý (VNĐ)
              </label>
              <input
                type="number"
                min={0}
                step={1}
                value={itemForm.sellPrice || ""}
                onChange={(e) =>
                  setItemForm((p) => ({
                    ...p,
                    sellPrice: Math.max(0, Number(e.target.value) || 0),
                  }))
                }
                placeholder="650000"
                className="min-h-10 w-full rounded-xl border border-line bg-surface-subtle px-3 font-mono text-base sm:text-xs text-navy focus:border-brand focus:bg-surface focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-navy">
                Ngưỡng cảnh báo hết hàng
              </label>
              <input
                type="number"
                min={0}
                value={itemForm.minStock}
                onChange={(e) =>
                  setItemForm((p) => ({
                    ...p,
                    minStock: Math.max(0, Number(e.target.value) || 0),
                  }))
                }
                className="min-h-10 w-full rounded-xl border border-line bg-surface-subtle px-3 font-mono text-base sm:text-xs text-navy focus:border-brand focus:bg-surface focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-navy">
                Nhà cung cấp quen thuộc
              </label>
              <input
                type="text"
                value={itemForm.supplier}
                onChange={(e) =>
                  setItemForm((p) => ({ ...p, supplier: e.target.value }))
                }
                placeholder="VD: Vi Tính Phát Đạt / Shopee"
                className="min-h-10 w-full rounded-xl border border-line bg-surface-subtle px-3 text-base sm:text-xs text-navy focus:border-brand focus:bg-surface focus:outline-none"
              />
            </div>
          </div>

          {!editingItem && itemForm.quantity > 0 && itemForm.avgCost > 0 && (
            <div className="rounded-xl border border-brand/25 bg-brand-light/40 p-3 space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-navy cursor-pointer">
                <input
                  type="checkbox"
                  checked={itemForm.recordExpense}
                  onChange={(e) =>
                    setItemForm((p) => ({
                      ...p,
                      recordExpense: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-brand"
                />
                <span>
                  Tự động ghi khoản Chi nhập hàng (
                  {formatVnd(itemForm.quantity * itemForm.avgCost)}) vào Sổ Thu/Chi
                </span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-navy hover:border-brand">
                  <ImagePlus className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                  <span>
                    {uploadingReceipt
                      ? "Đang tải lên R2..."
                      : "Đính kèm ảnh hóa đơn (R2)"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleReceiptUpload(e.target.files?.[0], "item")
                    }
                  />
                </label>
                {itemForm.receiptImageUrl && (
                  <a
                    href={itemForm.receiptImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-brand underline"
                  >
                    Đã đính kèm ảnh
                  </a>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-navy">
              Ghi chú
            </label>
            <textarea
              rows={2}
              value={itemForm.notes}
              onChange={(e) =>
                setItemForm((p) => ({ ...p, notes: e.target.value }))
              }
              placeholder="Ghi chú bảo hành NCC, thông số..."
              className="w-full rounded-xl border border-line bg-surface-subtle p-3 text-base sm:text-xs text-navy focus:border-brand focus:bg-surface focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setItemModalOpen(false)}
              className="min-h-10 rounded-full border border-line px-4 text-xs font-semibold text-navy hover:bg-surface-subtle"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={savingItem}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-brand px-5 text-xs font-semibold text-ink-inverse hover:bg-brand-hover disabled:opacity-60"
            >
              {savingItem && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
              <span>{editingItem ? "Lưu thay đổi" : "Thêm vào kho"}</span>
            </button>
          </div>
        </form>
      </ModalDialog>

      {/* Modal: Stock Movement (IN / OUT_RETAIL / ADJUST) */}
      <ModalDialog
        open={movModalOpen}
        onOpenChange={setMovModalOpen}
        title={
          movType === "IN"
            ? `Nhập kho: ${movTarget?.name || ""}`
            : movType === "OUT_RETAIL"
            ? `Xuất bán lẻ / nội bộ: ${movTarget?.name || ""}`
            : `Kiểm kho điều chỉnh: ${movTarget?.name || ""}`
        }
        description={
          movTarget
            ? `Tồn hiện tại: ${movTarget.quantity} ${movTarget.unit} • Giá nhập BQ hiện tại: ${formatVnd(movTarget.avgCost)}`
            : ""
        }
      >
        <form onSubmit={handleSaveMovement} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-navy">
                {movType === "ADJUST"
                  ? "Số lượng tồn thực tế sau kiểm kê"
                  : "Số lượng"}
              </label>
              <input
                type="number"
                min={movType === "ADJUST" ? 0 : 1}
                required
                value={movForm.quantity}
                onChange={(e) => {
                  const q = Math.max(0, Number(e.target.value) || 0);
                  setMovForm((p) => ({
                    ...p,
                    quantity: q,
                    ...(movType === "OUT_RETAIL" && movTarget
                      ? {
                          sellTotal:
                            q *
                            (movTarget.sellPrice > 0
                              ? movTarget.sellPrice
                              : movTarget.avgCost),
                        }
                      : {}),
                  }));
                }}
                className="min-h-10 w-full rounded-xl border border-line bg-surface-subtle px-3 font-mono text-base sm:text-xs text-navy focus:border-brand focus:bg-surface focus:outline-none"
              />
            </div>

            {movType === "IN" && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-navy">
                  Đơn giá nhập lô này (VNĐ)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  required
                  value={movForm.unitCost || ""}
                  onChange={(e) =>
                    setMovForm((p) => ({
                      ...p,
                      unitCost: Math.max(0, Number(e.target.value) || 0),
                    }))
                  }
                  className="min-h-10 w-full rounded-xl border border-line bg-surface-subtle px-3 font-mono text-base sm:text-xs text-navy focus:border-brand focus:bg-surface focus:outline-none"
                />
              </div>
            )}

            {movType === "OUT_RETAIL" && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-navy">
                  Tổng tiền thu bán lẻ (VNĐ)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={movForm.sellTotal || ""}
                  onChange={(e) =>
                    setMovForm((p) => ({
                      ...p,
                      sellTotal: Math.max(0, Number(e.target.value) || 0),
                    }))
                  }
                  className="min-h-10 w-full rounded-xl border border-line bg-surface-subtle px-3 font-mono text-base sm:text-xs text-navy focus:border-brand focus:bg-surface focus:outline-none"
                />
              </div>
            )}

            {movType === "IN" && (
              <div>
                <label className="mb-1 block text-xs font-semibold text-navy">
                  Nhà cung cấp
                </label>
                <input
                  type="text"
                  value={movForm.supplier}
                  onChange={(e) =>
                    setMovForm((p) => ({ ...p, supplier: e.target.value }))
                  }
                  placeholder="Tên cửa hàng / NPP"
                  className="min-h-10 w-full rounded-xl border border-line bg-surface-subtle px-3 text-base sm:text-xs text-navy focus:border-brand focus:bg-surface focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-semibold text-navy">
                Ngày giao dịch
              </label>
              <input
                type="date"
                value={movForm.transactionDate}
                onChange={(e) =>
                  setMovForm((p) => ({ ...p, transactionDate: e.target.value }))
                }
                className="min-h-10 w-full rounded-xl border border-line bg-surface-subtle px-3 text-base sm:text-xs text-navy focus:border-brand focus:bg-surface focus:outline-none"
              />
            </div>
          </div>

          {movType === "IN" && (
            <div className="rounded-xl border border-brand/25 bg-brand-light/40 p-3 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-navy">
                <span>Tổng tiền nhập lô này:</span>
                <span className="font-mono text-brand">
                  {formatVnd(movForm.quantity * movForm.unitCost)}
                </span>
              </div>
              <label className="flex items-center gap-2 text-xs font-medium text-navy cursor-pointer">
                <input
                  type="checkbox"
                  checked={movForm.recordExpense}
                  onChange={(e) =>
                    setMovForm((p) => ({
                      ...p,
                      recordExpense: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-brand"
                />
                <span>
                  Tự động ghi vào Sổ Thu/Chi (Loại: Nhập hàng — chỉ tính vào Dòng tiền, không trừ trùng Lãi kinh doanh)
                </span>
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={movForm.paymentMethod}
                  onChange={(e) =>
                    setMovForm((p) => ({
                      ...p,
                      paymentMethod: e.target.value as "CASH" | "BANK",
                    }))
                  }
                  className="min-h-10 rounded-lg border border-line bg-surface px-2.5 text-base sm:text-xs font-medium text-navy"
                >
                  <option value="CASH">Tiền mặt</option>
                  <option value="BANK">Chuyển khoản</option>
                </select>
                <label className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-navy hover:border-brand">
                  <ImagePlus className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                  <span>
                    {uploadingReceipt
                      ? "Đang tải ảnh lên R2..."
                      : "Chụp / Tải ảnh hóa đơn (R2)"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleReceiptUpload(e.target.files?.[0], "mov")
                    }
                  />
                </label>
                {movForm.receiptImageUrl && (
                  <a
                    href={movForm.receiptImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-brand underline"
                  >
                    Xem ảnh đã tải
                  </a>
                )}
              </div>
            </div>
          )}

          {movType === "OUT_RETAIL" && (
            <div className="rounded-xl border border-status-success-line bg-status-success-bg p-3 space-y-2">
              <label className="flex items-center gap-2 text-xs font-medium text-navy cursor-pointer">
                <input
                  type="checkbox"
                  checked={movForm.recordIncome}
                  onChange={(e) =>
                    setMovForm((p) => ({
                      ...p,
                      recordIncome: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-status-success-solid"
                />
                <span>
                  Tự động ghi khoản Thu bán lẻ ({formatVnd(movForm.sellTotal)}) vào Sổ Thu/Chi
                </span>
              </label>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-navy">
              Ghi chú
            </label>
            <input
              type="text"
              value={movForm.note}
              onChange={(e) =>
                setMovForm((p) => ({ ...p, note: e.target.value }))
              }
              placeholder="VD: Nhập lô tháng 11 / Bán lẻ cho khách quen..."
              className="min-h-10 w-full rounded-xl border border-line bg-surface-subtle px-3 text-base sm:text-xs text-navy focus:border-brand focus:bg-surface focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setMovModalOpen(false)}
              className="min-h-10 rounded-full border border-line px-4 text-xs font-semibold text-navy hover:bg-surface-subtle"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={savingMov || uploadingReceipt}
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-brand px-5 text-xs font-semibold text-ink-inverse hover:bg-brand-hover disabled:opacity-60"
            >
              {savingMov && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
              <span>Xác nhận</span>
            </button>
          </div>
        </form>
      </ModalDialog>

      {/* Delete Confirm Modal */}
      <ModalDialog
        open={Boolean(deletingItem)}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        title="Xác nhận xóa linh kiện"
        description={`Bạn có chắc muốn xóa "${deletingItem?.name}" (${deletingItem?.sku}) khỏi kho? Toàn bộ lịch sử nhập xuất của mã này cũng sẽ bị xóa.`}
      >
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setDeletingItem(null)}
            className="min-h-10 rounded-full border border-line px-4 text-xs font-semibold text-navy hover:bg-surface-subtle"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleDeleteItem}
            className="min-h-10 rounded-full bg-status-danger-solid px-5 text-xs font-semibold text-ink-inverse hover:bg-status-danger-hover"
          >
            Xóa vĩnh viễn
          </button>
        </div>
      </ModalDialog>
    </div>
  );
}
