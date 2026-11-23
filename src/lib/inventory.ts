import { db } from "@/db";
import { inventoryItems, stockMovements } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { RepairLineItem } from "@/lib/ticket-items";

export * from "@/lib/inventory-constants";

/**
 * Synchronizes stock_movements & inventory_items quantities for a repair ticket.
 * - Deducts stock immediately when an item with inventoryItemId is added to a non-CANCELLED ticket.
 * - Automatically restores stock if an item is removed, quantity reduced, ticket CANCELLED, or ticket deleted.
 * - Stamps unitCost (snapshot of avgCost at deduction time) onto RepairLineItem for accurate P&L.
 */
export async function syncTicketInventoryMovements(params: {
  ticketId: number;
  ticketCode: string;
  status: string;
  items: RepairLineItem[];
}): Promise<RepairLineItem[]> {
  const { ticketId, ticketCode, status, items } = params;

  const isCancelled = status === "CANCELLED";

  // Desired quantities per inventoryItemId
  const desiredMap = new Map<number, number>();
  if (!isCancelled) {
    for (const line of items) {
      if (line.inventoryItemId && line.inventoryItemId > 0) {
        const qty = Math.max(1, Math.round(Number(line.quantity) || 1));
        desiredMap.set(
          line.inventoryItemId,
          (desiredMap.get(line.inventoryItemId) || 0) + qty
        );
      }
    }
  }

  // Existing net deducted quantities for this ticket
  const existingMovements = await db
    .select()
    .from(stockMovements)
    .where(eq(stockMovements.ticketId, ticketId));

  const deductedMap = new Map<number, number>();
  const lastCostMap = new Map<number, number>();
  for (const mov of existingMovements) {
    if (mov.type === "OUT_TICKET" || mov.type === "RETURN_TICKET") {
      deductedMap.set(
        mov.itemId,
        (deductedMap.get(mov.itemId) || 0) - mov.quantityChange
      );
      if (mov.type === "OUT_TICKET" && mov.unitCost > 0) {
        lastCostMap.set(mov.itemId, mov.unitCost);
      }
    }
  }

  const allItemIds = new Set<number>([
    ...desiredMap.keys(),
    ...deductedMap.keys(),
  ]);

  const resolvedUnitCostMap = new Map<number, number>();

  for (const itemId of allItemIds) {
    const desired = desiredMap.get(itemId) || 0;
    const deducted = deductedMap.get(itemId) || 0;
    const delta = desired - deducted;

    const [invItem] = await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.id, itemId))
      .limit(1);

    if (!invItem) continue;

    const unitCostSnapshot =
      delta > 0 ? invItem.avgCost : lastCostMap.get(itemId) ?? invItem.avgCost;
    resolvedUnitCostMap.set(itemId, unitCostSnapshot);

    if (delta === 0) continue;

    if (delta > 0) {
      const nextQty = invItem.quantity - delta;
      await db
        .update(inventoryItems)
        .set({ quantity: nextQty, updatedAt: new Date() })
        .where(eq(inventoryItems.id, itemId));

      await db.insert(stockMovements).values({
        itemId,
        type: "OUT_TICKET",
        quantityChange: -delta,
        unitCost: invItem.avgCost,
        totalCost: delta * invItem.avgCost,
        ticketId,
        ticketCode,
        note: `Xuất linh kiện cho phiếu sửa ${ticketCode}`,
      });
    } else {
      const restoreQty = Math.abs(delta);
      const nextQty = invItem.quantity + restoreQty;
      await db
        .update(inventoryItems)
        .set({ quantity: nextQty, updatedAt: new Date() })
        .where(eq(inventoryItems.id, itemId));

      await db.insert(stockMovements).values({
        itemId,
        type: "RETURN_TICKET",
        quantityChange: restoreQty,
        unitCost: unitCostSnapshot,
        totalCost: restoreQty * unitCostSnapshot,
        ticketId,
        ticketCode,
        note: isCancelled
          ? `Hoàn kho do hủy phiếu ${ticketCode}`
          : `Hoàn kho do giảm/gỡ linh kiện trên phiếu ${ticketCode}`,
      });
    }
  }

  return items.map((line) => {
    if (!line.inventoryItemId) return line;
    if (line.unitCost !== undefined && line.unitCost > 0) return line;
    const resolved = resolvedUnitCostMap.get(line.inventoryItemId);
    if (resolved !== undefined) {
      return { ...line, unitCost: resolved };
    }
    return line;
  });
}
