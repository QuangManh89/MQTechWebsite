import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ensureDbReady } from "@/db/ensure-db";
import {
  financeTransactions,
  inventoryItems,
  stockMovements,
} from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/auth";
import { generateSku } from "@/lib/inventory";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();

  const [items, movements] = await Promise.all([
    db.select().from(inventoryItems).orderBy(desc(inventoryItems.updatedAt)),
    db
      .select()
      .from(stockMovements)
      .orderBy(desc(stockMovements.createdAt))
      .limit(100),
  ]);

  const itemMap = new Map(items.map((i) => [i.id, i]));

  const enrichedMovements = movements.map((m) => ({
    ...m,
    itemName: itemMap.get(m.itemId)?.name || `Linh kiện #${m.itemId}`,
    itemSku: itemMap.get(m.itemId)?.sku || "",
    itemUnit: itemMap.get(m.itemId)?.unit || "Cái",
  }));

  const totalInventoryValue = items.reduce(
    (sum, item) => sum + Math.max(0, item.quantity) * Math.max(0, item.avgCost),
    0
  );
  const lowStockCount = items.filter((i) => i.quantity <= i.minStock).length;
  const totalQuantity = items.reduce(
    (sum, item) => sum + Math.max(0, item.quantity),
    0
  );

  return NextResponse.json({
    items,
    movements: enrichedMovements,
    summary: {
      totalItems: items.length,
      totalQuantity,
      totalInventoryValue,
      lowStockCount,
    },
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const body = await req.json();

  const name = String(body.name ?? "").trim();
  if (!name) {
    return NextResponse.json(
      { error: "Vui lòng nhập tên linh kiện" },
      { status: 400 }
    );
  }

  let sku = String(body.sku ?? "").trim().toUpperCase();
  if (!sku) {
    sku = generateSku();
    // Ensure uniqueness
    const existing = await db
      .select({ id: inventoryItems.id })
      .from(inventoryItems)
      .where(eq(inventoryItems.sku, sku))
      .limit(1);
    if (existing.length > 0) {
      sku = `${generateSku()}-${Date.now().toString().slice(-3)}`;
    }
  } else {
    const existing = await db
      .select({ id: inventoryItems.id })
      .from(inventoryItems)
      .where(eq(inventoryItems.sku, sku))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json(
        { error: `Mã SKU "${sku}" đã tồn tại trong kho.` },
        { status: 409 }
      );
    }
  }

  const quantity = Math.max(0, Math.round(Number(body.quantity) || 0));
  const avgCost = Math.max(0, Math.round(Number(body.avgCost) || 0));
  const sellPrice = Math.max(0, Math.round(Number(body.sellPrice) || 0));
  const minStock = Math.max(0, Math.round(Number(body.minStock ?? 2) || 0));
  const supplier = body.supplier ? String(body.supplier).trim() : null;
  const notes = body.notes ? String(body.notes).trim() : null;
  const receiptImageUrl = body.receiptImageUrl
    ? String(body.receiptImageUrl).trim()
    : null;

  const [created] = await db
    .insert(inventoryItems)
    .values({
      sku,
      name,
      category: String(body.category || "Linh kiện khác").trim(),
      unit: String(body.unit || "Cái").trim(),
      quantity,
      avgCost,
      sellPrice,
      minStock,
      supplier,
      notes,
    })
    .returning();

  // If created with initial stock > 0, record IN movement & optional expense
  if (quantity > 0) {
    const totalCost = quantity * avgCost;
    const [mov] = await db
      .insert(stockMovements)
      .values({
        itemId: created.id,
        type: "IN",
        quantityChange: quantity,
        unitCost: avgCost,
        totalCost,
        supplier,
        receiptImageUrl,
        note: "Nhập tồn ban đầu khi tạo mới linh kiện",
      })
      .returning();

    if (body.recordExpense && totalCost > 0) {
      const todayStr = new Date().toISOString().slice(0, 10);
      await db.insert(financeTransactions).values({
        type: "EXPENSE",
        category: "NHAP_HANG",
        amount: totalCost,
        title: `Nhập kho: ${name} (SL: ${quantity})${supplier ? ` - ${supplier}` : ""}`,
        transactionDate: body.transactionDate || todayStr,
        paymentMethod: body.paymentMethod === "BANK" ? "BANK" : "CASH",
        receiptImageUrl,
        stockMovementId: mov.id,
        note: notes,
      });
    }
  }

  return NextResponse.json({ item: created }, { status: 201 });
}
