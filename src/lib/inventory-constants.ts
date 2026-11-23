export const INVENTORY_CATEGORIES = [
  "SSD / Ổ cứng",
  "RAM",
  "Mainboard",
  "Nguồn PSU",
  "Pin / Bàn phím / Màn hình",
  "Phụ kiện / Keo tản nhiệt",
  "Linh kiện khác",
] as const;

export const EXPENSE_CATEGORIES = [
  { key: "NHAP_HANG", label: "Nhập hàng vào kho", isStockPurchase: true },
  { key: "MAT_BANG", label: "Thuê mặt bằng", isStockPurchase: false },
  { key: "DIEN_NUOC", label: "Điện / Nước / Internet", isStockPurchase: false },
  { key: "SHIP_DI_LAI", label: "Ship hàng / Xăng xe", isStockPurchase: false },
  { key: "QUANG_CAO", label: "Quảng cáo / Marketing", isStockPurchase: false },
  { key: "DUNG_CU", label: "Dụng cụ / Thiết bị sửa", isStockPurchase: false },
  { key: "LUONG_THUONG", label: "Lương / Phụ cấp", isStockPurchase: false },
  { key: "KHAC", label: "Chi phí khác", isStockPurchase: false },
] as const;

export const INCOME_CATEGORIES = [
  { key: "BAN_LE", label: "Bán lẻ linh kiện / Phụ kiện" },
  { key: "THU_KHAC", label: "Thu nhập khác" },
] as const;

export const PAYMENT_METHODS = [
  { key: "CASH", label: "Tiền mặt" },
  { key: "BANK", label: "Chuyển khoản" },
] as const;

export function getCategoryLabel(categoryKey: string): string {
  const exp = EXPENSE_CATEGORIES.find((c) => c.key === categoryKey);
  if (exp) return exp.label;
  const inc = INCOME_CATEGORIES.find((c) => c.key === categoryKey);
  if (inc) return inc.label;
  return categoryKey;
}

export function getMovementTypeLabel(type: string): string {
  switch (type) {
    case "IN":
      return "Nhập kho";
    case "OUT_TICKET":
      return "Xuất theo phiếu sửa";
    case "OUT_RETAIL":
      return "Xuất bán lẻ / nội bộ";
    case "RETURN_TICKET":
      return "Hoàn kho (hủy/gỡ phiếu)";
    case "ADJUST":
      return "Kiểm kho điều chỉnh";
    default:
      return type;
  }
}

export function recalculateWeightedAvgCost(
  currentQty: number,
  currentAvgCost: number,
  addedQty: number,
  importUnitCost: number
): number {
  const safeCurrentQty = Math.max(0, Math.round(currentQty));
  const safeAddedQty = Math.max(0, Math.round(addedQty));
  if (safeAddedQty === 0) return Math.max(0, Math.round(currentAvgCost));
  if (safeCurrentQty === 0) return Math.max(0, Math.round(importUnitCost));
  const totalQty = safeCurrentQty + safeAddedQty;
  const totalValue =
    safeCurrentQty * Math.max(0, currentAvgCost) +
    safeAddedQty * Math.max(0, importUnitCost);
  return Math.round(totalValue / totalQty);
}

export function generateSku(): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `LK-${rand}`;
}
