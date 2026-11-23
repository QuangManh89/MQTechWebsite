import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ensureDbReady } from "@/db/ensure-db";
import {
  financeTransactions,
  inventoryItems,
  stockMovements,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/auth";
import { recalculateWeightedAvgCost } from "@/lib/inventory";

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const body = await req.json();

  const itemId = Number(body.itemId);
  const type = String(body.type || "IN").toUpperCase();
  const rawQty = Math.round(Number(body.quantity) || 0);

  if (!Number.isInteger(itemId) || itemId <= 0) {
    return NextResponse.json({ error: "Thiếu mã linh kiện" }, { status: 400 });
  }
  if (!["IN", "OUT_RETAIL", "ADJUST"].includes(type)) {
    return NextResponse.json(
      { error: "Loại giao dịch kho không hợp lệ" },
      { status: 400 }
    );
  }
  if (type !== "ADJUST" && rawQty <= 0) {
    return NextResponse.json(
      { error: "Số lượng phải lớn hơn 0" },
      { status: 400 }
    );
  }

  const [item] = await db
    .select()
    .from(inventoryItems)
    .where(eq(inventoryItems.id, itemId))
    .limit(1);

  if (!item) {
    return NextResponse.json(
      { error: "Không tìm thấy linh kiện trong kho" },
      { status: 404 }
    );
  }

  const supplier = body.supplier ? String(body.supplier).trim() : item.supplier;
  const note = body.note ? String(body.note).trim() : null;
  const receiptImageUrl = body.receiptImageUrl
    ? String(body.receiptImageUrl).trim()
    : null;
  const transactionDate =
    body.transactionDate || new Date().toISOString().slice(0, 10);
  const paymentMethod = body.paymentMethod === "BANK" ? "BANK" : "CASH";

  let nextQty = item.quantity;
  let nextAvgCost = item.avgCost;
  let quantityChange = 0;
  let unitCost = item.avgCost;
  let totalCost = 0;

  if (type === "IN") {
    unitCost = Math.max(0, Math.round(Number(body.unitCost) || 0));
    nextAvgCost = recalculateWeightedAvgCost(
      item.quantity,
      item.avgCost,
      rawQty,
      unitCost
    );
    nextQty = item.quantity + rawQty;
    quantityChange = rawQty;
    totalCost = rawQty * unitCost;
  } else if (type === "OUT_RETAIL") {
    nextQty = item.quantity - rawQty;
    quantityChange = -rawQty;
    unitCost = item.avgCost;
    totalCost = rawQty * unitCost;
  } else {
    // ADJUST: rawQty represents the new target absolute quantity
    const targetQty = Math.max(0, rawQty);
    quantityChange = targetQty - item.quantity;
    nextQty = targetQty;
    unitCost = item.avgCost;
    totalCost = Math.abs(quantityChange) * unitCost;
  }

  const [updatedItem] = await db
    .update(inventoryItems)
    .set({
      quantity: nextQty,
      avgCost: nextAvgCost,
      ...(supplier ? { supplier } : {}),
      updatedAt: new Date(),
    })
    .where(eq(inventoryItems.id, itemId))
    .returning();

  const [movement] = await db
    .insert(stockMovements)
    .values({
      itemId,
      type,
      quantityChange,
      unitCost,
      totalCost,
      supplier,
      receiptImageUrl,
      note:
        note ||
        (type === "IN"
          ? `Nhập kho ${rawQty} ${item.unit}`
          : type === "OUT_RETAIL"
          ? `Xuất bán lẻ / nội bộ ${rawQty} ${item.unit}`
          : `Kiểm kho điều chỉnh thành ${nextQty} ${item.unit}`),
    })
    .returning();

  // Auto-record Finance Transaction if requested
  let createdFinance = null;
  if (type === "IN" && body.recordExpense && totalCost > 0) {
    const [fin] = await db
      .insert(financeTransactions)
      .values({
        type: "EXPENSE",
        category: "NHAP_HANG",
        amount: totalCost,
        title: `Nhập kho: ${item.name} (SL: ${rawQty})${supplier ? ` - ${supplier}` : ""}`,
        transactionDate,
        paymentMethod,
        receiptImageUrl,
        stockMovementId: movement.id,
        note,
      })
      .returning();
    createdFinance = fin;
  } else if (type === "OUT_RETAIL" && body.recordIncome) {
    const sellTotal = Math.max(
      0,
      Math.round(Number(body.sellTotal) || rawQty * item.sellPrice)
    );
    if (sellTotal > 0) {
      const [fin] = await db
        .insert(financeTransactions)
        .values({
          type: "INCOME",
          category: "BAN_LE",
          amount: sellTotal,
          title: `Bán lẻ: ${item.name} (SL: ${rawQty})`,
          transactionDate,
          paymentMethod,
          receiptImageUrl,
          stockMovementId: movement.id,
          note,
        })
        .returning();
      createdFinance = fin;
    }
  }

  return NextResponse.json(
    {
      item: updatedItem,
      movement,
      financeTransaction: createdFinance,
    },
    { status: 201 }
  );
}
