import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ensureDbReady } from "@/db/ensure-db";
import { inventoryItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const { id } = await context.params;
  const itemId = Number(id);
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

  if (!updated) {
    return NextResponse.json(
      { error: "Không tìm thấy linh kiện trong kho" },
      { status: 404 }
    );
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
  await db.delete(inventoryItems).where(eq(inventoryItems.id, Number(id)));
  return NextResponse.json({ ok: true });
}
