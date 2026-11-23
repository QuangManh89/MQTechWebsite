"use client";

import { useEffect, useState } from "react";
import { Package, Plus, Trash2, ShieldCheck } from "lucide-react";
import {
  QUICK_REPAIR_PRESETS,
  calculateItemsTotal,
  formatVnd,
  getLineItemTotal,
  type RepairLineItem,
} from "@/lib/ticket-items";

const WARRANTY_CHIPS = [
  { label: "Không BH", value: "Không BH" },
  { label: "1T", value: "1 tháng" },
  { label: "3T", value: "3 tháng" },
  { label: "6T", value: "6 tháng" },
  { label: "12T", value: "12 tháng" },
  { label: "24T", value: "24 tháng" },
  { label: "36T", value: "36 tháng" },
];

interface InventoryOption {
  id: number;
  sku: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  avgCost: number;
  sellPrice: number;
}

interface TicketItemsEditorProps {
  items: RepairLineItem[];
  onChange: (nextItems: RepairLineItem[]) => void;
}

export function TicketItemsEditor({ items, onChange }: TicketItemsEditorProps) {
  const [inventory, setInventory] = useState<InventoryOption[]>([]);
  const [selectedInvId, setSelectedInvId] = useState<string>("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/inventory")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && data?.items) {
          setInventory(data.items);
        }
      })
      .catch(() => {
        // Silently ignore if inventory is unavailable
      });
    return () => {
      active = false;
    };
  }, []);

  const total = calculateItemsTotal(items);

  function addPreset(preset: RepairLineItem) {
    onChange([
      ...items,
      {
        name: preset.name,
        price: preset.price,
        warranty: preset.warranty || "",
      },
    ]);
  }

  function addFromInventory() {
    const invId = Number(selectedInvId);
    const inv = inventory.find((i) => i.id === invId);
    if (!inv) return;

    // Default warranty based on category
    const catLower = (inv.category || "").toLowerCase();
    const defaultWarranty =
      catLower.includes("main") || catLower.includes("ram") || catLower.includes("ssd")
        ? "36 tháng"
        : catLower.includes("nguồn") || catLower.includes("psu") || catLower.includes("màn")
        ? "12 tháng"
        : "6 tháng";

    // If same inventory item already in list, increment quantity
    const existingIdx = items.findIndex((row) => row.inventoryItemId === inv.id);
    if (existingIdx >= 0) {
      const next = items.map((row, idx) =>
        idx === existingIdx
          ? { ...row, quantity: (row.quantity || 1) + 1 }
          : row
      );
      onChange(next);
    } else {
      onChange([
        ...items,
        {
          name: `${inv.name}`,
          price: inv.sellPrice > 0 ? inv.sellPrice : inv.avgCost,
          inventoryItemId: inv.id,
          quantity: 1,
          unitCost: inv.avgCost,
          warranty: defaultWarranty,
        },
      ]);
    }
    setSelectedInvId("");
  }

  function addBlankRow() {
    onChange([...items, { name: "", price: 0, warranty: "" }]);
  }

  function updateRow(idx: number, patch: Partial<RepairLineItem>) {
    const next = items.map((row, i) => (i === idx ? { ...row, ...patch } : row));
    onChange(next);
  }

  function removeRow(idx: number) {
    onChange(items.filter((_, i) => i !== idx));
  }

  return (
    <div className="rounded-xl border border-line bg-surface-subtle p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-navy">
            Chi tiết hạng mục sửa chữa &amp; linh kiện
          </p>
          <p className="text-xs text-ink-muted">
            Gõ tự do cho công sửa hoặc chọn linh kiện từ Kho (tự động trừ tồn kho &amp; tính giá vốn khi lưu phiếu).
          </p>
        </div>
        <button
          type="button"
          onClick={addBlankRow}
          className="inline-flex min-h-10 items-center gap-1 rounded-full border border-brand/40 bg-brand-light px-3 py-1 text-xs font-semibold text-brand hover:bg-brand hover:text-ink-inverse transition-colors"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Thêm dòng trống</span>
        </button>
      </div>

      {/* Pick from Inventory */}
      {inventory.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-brand/25 bg-surface p-2.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy shrink-0">
            <Package className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
            <span>Lấy từ Kho:</span>
          </div>
          <select
            value={selectedInvId}
            onChange={(e) => setSelectedInvId(e.target.value)}
            className="min-h-10 flex-1 min-w-[200px] rounded-lg border border-line bg-surface-subtle px-2.5 py-1.5 text-base sm:text-xs text-navy focus:border-brand focus:bg-surface focus:outline-none"
          >
            <option value="">-- Chọn linh kiện có sẵn trong kho --</option>
            {inventory.map((inv) => (
              <option key={inv.id} value={inv.id}>
                [{inv.sku}] {inv.name} • Tồn: {inv.quantity} {inv.unit} • Bán:{" "}
                {formatVnd(inv.sellPrice > 0 ? inv.sellPrice : inv.avgCost)}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!selectedInvId}
            onClick={addFromInventory}
            className="inline-flex min-h-10 items-center gap-1 rounded-lg bg-navy px-3 py-1.5 text-xs font-semibold text-ink-inverse hover:bg-brand disabled:opacity-40 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Thêm vào phiếu</span>
          </button>
        </div>
      )}

      {/* Quick Preset Chips */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_REPAIR_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => addPreset(preset)}
            className="inline-flex min-h-10 items-center gap-1 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-navy hover:border-brand hover:text-brand transition-colors"
          >
            <Plus className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
            <span>{preset.name}</span>
            <span className="font-mono text-xs text-ink-muted">
              ({formatVnd(preset.price)})
            </span>
          </button>
        ))}
      </div>

      {/* Line Items List */}
      {items.length > 0 && (
        <div className="space-y-2 pt-1">
          {items.map((row, idx) => {
            const isFromStock = Boolean(row.inventoryItemId);
            const qty = Math.max(1, Number(row.quantity) || 1);
            return (
              <div
                key={idx}
                className="space-y-2 rounded-lg border border-line bg-surface p-2.5"
              >
                <div className="grid grid-cols-12 items-center gap-2">
                  <div className="col-span-12 sm:col-span-6 space-y-1">
                    <div className="flex items-center gap-1.5">
                      {isFromStock && (
                        <span className="inline-flex items-center gap-1 rounded bg-brand-light px-1.5 py-0.5 text-xs font-bold text-brand shrink-0">
                          <Package className="h-3 w-3" aria-hidden="true" />
                          Kho
                        </span>
                      )}
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => updateRow(idx, { name: e.target.value })}
                        placeholder="VD: Thay Main [Gigabyte H110], Sửa main..."
                        className="min-h-10 w-full rounded-lg border border-line-subtle bg-surface-subtle px-2.5 py-1.5 text-base sm:text-xs text-navy focus:border-brand focus:bg-surface focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="col-span-3 sm:col-span-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-ink-muted">SL</span>
                      <input
                        type="number"
                        min={1}
                        value={qty}
                        onChange={(e) => {
                          const q = Math.max(1, Math.round(Number(e.target.value) || 1));
                          updateRow(idx, { quantity: q });
                        }}
                        className="min-h-10 w-full rounded-lg border border-line-subtle bg-surface-subtle px-2 py-1.5 text-center font-mono text-base sm:text-xs text-navy focus:border-brand focus:bg-surface focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="col-span-7 sm:col-span-3">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={row.price === 0 ? "" : row.price}
                      onChange={(e) => {
                        const num = Math.max(0, Number(e.target.value) || 0);
                        updateRow(idx, { price: num });
                      }}
                      placeholder="Đơn giá (VNĐ)"
                      className="min-h-10 w-full rounded-lg border border-line-subtle bg-surface-subtle px-2.5 py-1.5 text-right font-mono text-base sm:text-xs text-navy focus:border-brand focus:bg-surface focus:outline-none"
                    />
                    {qty > 1 && (
                      <p className="mt-0.5 text-right font-mono text-xs text-ink-muted">
                        = {formatVnd(getLineItemTotal(row))}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2 sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeRow(idx)}
                      aria-label="Xóa hạng mục"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink-muted hover:bg-status-danger-bg hover:text-status-danger-ink transition-colors"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Per-item Warranty Input & Quick Chips */}
                <div className="flex flex-wrap items-center gap-2 border-t border-line-subtle pt-2">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-navy shrink-0">
                    <ShieldCheck className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
                    <span>Bảo hành:</span>
                  </div>
                  <input
                    type="text"
                    value={row.warranty || ""}
                    onChange={(e) => updateRow(idx, { warranty: e.target.value })}
                    placeholder="VD: 12 tháng, 1 tháng..."
                    className="min-h-8 flex-1 min-w-[130px] max-w-[200px] rounded-md border border-line-subtle bg-surface-subtle px-2 py-1 text-xs text-navy focus:border-brand focus:bg-surface focus:outline-none"
                  />
                  <div className="flex flex-wrap items-center gap-1">
                    {WARRANTY_CHIPS.map((chip) => {
                      const isSelected = row.warranty?.trim() === chip.value;
                      return (
                        <button
                          key={chip.label}
                          type="button"
                          onClick={() => updateRow(idx, { warranty: chip.value })}
                          className={`rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors ${
                            isSelected
                              ? "bg-navy text-ink-inverse font-bold shadow-xs"
                              : "border border-line-subtle bg-surface-subtle text-ink-muted hover:border-brand hover:text-brand"
                          }`}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-between rounded-lg bg-navy/5 px-3 py-2 text-xs">
            <span className="font-semibold text-navy">
              Tổng cộng ({items.length} hạng mục):
            </span>
            <span className="font-mono text-sm font-bold text-brand">
              {formatVnd(total)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
