import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ensureDbReady } from "@/db/ensure-db";
import {
  financeTransactions,
  inventoryItems,
  stockMovements,
} from "@/db/schema";
import { and, desc, eq, gt, inArray } from "drizzle-orm";
import { requireAdminSession } from "@/lib/auth";

function toVnDateStr(d: Date): string {
  const vnOffsetMs = 7 * 60 * 60 * 1000;
  return new Date(d.getTime() + vnOffsetMs).toISOString().slice(0, 10);
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const { id } = await context.params;
  const itemId = Number(id);
  if (!Number.isInteger(itemId) || itemId <= 0) {
    return NextResponse.json(
      { error: "ID linh kiện không hợp lệ" },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select()
    .from(inventoryItems)
    .where(eq(inventoryItems.id, itemId))
    .limit(1);

  if (!existing) {
    return NextResponse.json(
      { error: "Không tìm thấy linh kiện trong kho" },
      { status: 404 }
    );
  }

  const body = await req.json();

  const [updated] = await db
    .update(inventoryItems)
    .set({
      ...(body.name !== undefined ? { name: String(body.name).trim() } : {}),
      ...(body.category !== undefined
        ? { category: String(body.category).trim() }
        : {}),
      ...(body.unit !== undefined ? { unit: String(body.unit).trim() } : {}),
      ...(body.sellPrice !== undefined
        ? { sellPrice: Math.max(0, Math.round(Number(body.sellPrice) || 0)) }
        : {}),
      ...(body.avgCost !== undefined
        ? { avgCost: Math.max(0, Math.round(Number(body.avgCost) || 0)) }
        : {}),
      ...(body.minStock !== undefined
        ? { minStock: Math.max(0, Math.round(Number(body.minStock) || 0)) }
        : {}),
      ...(body.supplier !== undefined
        ? { supplier: body.supplier ? String(body.supplier).trim() : null }
        : {}),
      ...(body.notes !== undefined
        ? { notes: body.notes ? String(body.notes).trim() : null }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(inventoryItems.id, itemId))
    .returning();

  // Sync latest positive stock import movement & its linked NHAP_HANG finance row.
  // Never touch repair_tickets or OUT_TICKET movements so completed ticket COGS stays intact.
  if (
    body.avgCost !== undefined ||
    body.name !== undefined ||
    body.supplier !== undefined
  ) {
    const [latestMov] = await db
      .select()
      .from(stockMovements)
      .where(
        and(
          eq(stockMovements.itemId, itemId),
          gt(stockMovements.quantityChange, 0),
          inArray(stockMovements.type, ["IN", "ADJUST"])
        )
      )
      .orderBy(desc(stockMovements.id))
      .limit(1);

    if (latestMov) {
      const qty = Math.abs(latestMov.quantityChange);
      const newTotalCost = qty * updated.avgCost;

      if (body.avgCost !== undefined) {
        await db
          .update(stockMovements)
          .set({
            unitCost: updated.avgCost,
            totalCost: newTotalCost,
          })
          .where(eq(stockMovements.id, latestMov.id));
      }

      const [linkedTx] = await db
        .select()
        .from(financeTransactions)
        .where(eq(financeTransactions.stockMovementId, latestMov.id))
        .limit(1);

      const title = `Nhập kho: ${updated.name} (SL: ${qty})${updated.supplier ? ` - ${updated.supplier}` : ""}`;

      if (linkedTx) {
        if (body.avgCost !== undefined) {
          if (newTotalCost === 0) {
            await db
              .delete(financeTransactions)
              .where(eq(financeTransactions.id, linkedTx.id));
          } else {
            await db
              .update(financeTransactions)
              .set({
                amount: newTotalCost,
                title,
              })
              .where(eq(financeTransactions.id, linkedTx.id));
          }
        } else {
          await db
            .update(financeTransactions)
            .set({ title })
            .where(eq(financeTransactions.id, linkedTx.id));
        }
      } else if (body.avgCost !== undefined && newTotalCost > 0) {
        await db.insert(financeTransactions).values({
          type: "EXPENSE",
          category: "NHAP_HANG",
          amount: newTotalCost,
          title,
          transactionDate: toVnDateStr(new Date(latestMov.createdAt)),
          paymentMethod: "CASH",
          receiptImageUrl: latestMov.receiptImageUrl,
          stockMovementId: latestMov.id,
          note: updated.notes,
        });
      }
    }
  }

  return NextResponse.json({ item: updated });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const { id } = await context.params;
  const itemId = Number(id);
  if (!Number.isInteger(itemId) || itemId <= 0) {
    return NextResponse.json(
      { error: "ID linh kiện không hợp lệ" },
      { status: 400 }
    );
  }

  const itemMovements = await db
    .select({
      id: stockMovements.id,
      type: stockMovements.type,
    })
    .from(stockMovements)
    .where(eq(stockMovements.itemId, itemId));

  const hasOutTicket = itemMovements.some((m) => m.type === "OUT_TICKET");
  if (!hasOutTicket && itemMovements.length > 0) {
    const movementIds = itemMovements.map((m) => m.id);
    await db
      .delete(financeTransactions)
      .where(
        and(
          inArray(financeTransactions.stockMovementId, movementIds),
          eq(financeTransactions.category, "NHAP_HANG")
        )
      );
  }

  await db.delete(inventoryItems).where(eq(inventoryItems.id, itemId));
  return NextResponse.json({ ok: true });
}
