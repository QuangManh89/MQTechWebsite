import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ensureDbReady } from "@/db/ensure-db";
import { repairTickets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/auth";
import { normalizeTicketItemsJson, parseTicketItems } from "@/lib/ticket-items";
import { syncTicketInventoryMovements } from "@/lib/inventory";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const { id } = await context.params;
  const ticketId = Number(id);
  const body = await req.json();

  const [updated] = await db
    .update(repairTickets)
    .set({
      status: body.status,
      technicianNote: body.technicianNote ?? null,
      estimatedCost: body.estimatedCost ?? null,
      ...(body.itemsJson !== undefined
        ? { itemsJson: normalizeTicketItemsJson(body.itemsJson) }
        : {}),
      warrantyText: body.warrantyText ?? null,
      warrantyUntil: body.warrantyUntil ?? null,
      deviceModel: body.deviceModel ?? undefined,
      serialNumber: body.serialNumber ?? undefined,
      updatedAt: new Date(),
    })
    .where(eq(repairTickets.id, ticketId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Không tìm thấy phiếu" }, { status: 404 });
  }

  // Sync inventory movements (deduct new parts, restore removed parts or cancelled tickets)
  const parsedItems = parseTicketItems(updated.itemsJson);
  const stampedItems = await syncTicketInventoryMovements({
    ticketId: updated.id,
    ticketCode: updated.ticketCode,
    status: updated.status,
    items: parsedItems,
  });

  const stampedJson = JSON.stringify(stampedItems);
  let finalTicket = updated;
  if (stampedJson !== updated.itemsJson) {
    const [refreshed] = await db
      .update(repairTickets)
      .set({ itemsJson: stampedJson })
      .where(eq(repairTickets.id, updated.id))
      .returning();
    if (refreshed) finalTicket = refreshed;
  }

  return NextResponse.json({ ticket: finalTicket });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const { id } = await context.params;
  const ticketId = Number(id);

  // Restore any inventory items previously deducted by this ticket before deleting
  const [existing] = await db
    .select()
    .from(repairTickets)
    .where(eq(repairTickets.id, ticketId))
    .limit(1);

  if (existing) {
    await syncTicketInventoryMovements({
      ticketId: existing.id,
      ticketCode: existing.ticketCode,
      status: "CANCELLED",
      items: [],
    });
  }

  await db.delete(repairTickets).where(eq(repairTickets.id, ticketId));
  return NextResponse.json({ ok: true });
}
