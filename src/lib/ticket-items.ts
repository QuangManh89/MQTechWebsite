export interface RepairLineItem {
  name: string;
  price: number;
  inventoryItemId?: number;
  quantity?: number;
  unitCost?: number;
  warranty?: string;
}

export const QUICK_REPAIR_PRESETS: RepairLineItem[] = [
  { name: "Sửa main", price: 250_000, warranty: "1 tháng" },
  { name: "Cài Win 10/11 + Phần mềm", price: 150_000, warranty: "1 tháng" },
  { name: "Thay Main [Asus B85]", price: 650_000, warranty: "12 tháng" },
  { name: "Thay Nguồn [PSU]", price: 450_000, warranty: "12 tháng" },
  { name: "Vệ sinh + Tra keo tản nhiệt", price: 150_000, warranty: "Không BH" },
  { name: "Nâng cấp SSD [256GB]", price: 800_000, warranty: "36 tháng" },
  { name: "Nâng cấp RAM [8GB]", price: 550_000, warranty: "36 tháng" },
  { name: "Thay Pin / Bàn phím / Màn hình", price: 350_000, warranty: "6 tháng" },
];

function sanitizeItem(raw: unknown): RepairLineItem | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const name = String(obj.name ?? "").trim();
  const price = Math.max(0, Math.round(Number(obj.price) || 0));
  if (name.length === 0 && price === 0) return null;

  const item: RepairLineItem = { name, price };

  if (typeof obj.warranty === "string" && obj.warranty.trim()) {
    item.warranty = obj.warranty.trim().slice(0, 100);
  }

  const invId = Number(obj.inventoryItemId);
  if (Number.isInteger(invId) && invId > 0) {
    item.inventoryItemId = invId;
    const qty = Math.max(1, Math.round(Number(obj.quantity) || 1));
    item.quantity = qty;
  } else if (obj.quantity !== undefined) {
    const qty = Math.max(1, Math.round(Number(obj.quantity) || 1));
    if (qty > 1) item.quantity = qty;
  }

  if (obj.unitCost !== undefined && obj.unitCost !== null && obj.unitCost !== "") {
    const uc = Math.max(0, Math.round(Number(obj.unitCost) || 0));
    item.unitCost = uc;
  }

  return item;
}

export function parseTicketItems(raw?: string | null): RepairLineItem[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(sanitizeItem)
      .filter((item): item is RepairLineItem => item !== null);
  } catch {
    return [];
  }
}

export function normalizeTicketItemsJson(input: unknown): string {
  if (typeof input === "string") {
    return JSON.stringify(parseTicketItems(input));
  }
  if (Array.isArray(input)) {
    const clean = input
      .map(sanitizeItem)
      .filter((item): item is RepairLineItem => item !== null);
    return JSON.stringify(clean);
  }
  return "[]";
}

export function getLineItemTotal(item: RepairLineItem): number {
  const qty = Math.max(1, Number(item.quantity) || 1);
  return (Number(item.price) || 0) * qty;
}

export function calculateItemsTotal(items: RepairLineItem[]): number {
  return items.reduce((sum, item) => sum + getLineItemTotal(item), 0);
}

export function calculateItemsCogs(items: RepairLineItem[]): number {
  return items.reduce((sum, item) => {
    if (!item.inventoryItemId) return sum;
    const qty = Math.max(1, Number(item.quantity) || 1);
    const cost = Math.max(0, Number(item.unitCost) || 0);
    return sum + cost * qty;
  }, 0);
}

export function parseVndString(raw?: string | null): number {
  if (!raw) return 0;
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return 0;
  return Number(digits) || 0;
}

export function formatVnd(amount: number): string {
  return `${Math.round(amount).toLocaleString("vi-VN")}đ`;
}
