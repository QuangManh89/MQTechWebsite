import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ensureDbReady } from "@/db/ensure-db";
import { financeTransactions } from "@/db/schema";
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
  const txId = Number(id);
  const body = await req.json();

  const [updated] = await db
    .update(financeTransactions)
    .set({
      ...(body.type !== undefined
        ? { type: body.type === "INCOME" ? "INCOME" : "EXPENSE" }
        : {}),
      ...(body.category !== undefined
        ? { category: String(body.category).trim() }
        : {}),
      ...(body.title !== undefined ? { title: String(body.title).trim() } : {}),
      ...(body.amount !== undefined
        ? { amount: Math.max(0, Math.round(Number(body.amount) || 0)) }
        : {}),
      ...(body.transactionDate !== undefined
        ? { transactionDate: String(body.transactionDate).trim() }
        : {}),
      ...(body.paymentMethod !== undefined
        ? { paymentMethod: body.paymentMethod === "BANK" ? "BANK" : "CASH" }
        : {}),
      ...(body.receiptImageUrl !== undefined
        ? {
            receiptImageUrl: body.receiptImageUrl
              ? String(body.receiptImageUrl).trim()
              : null,
          }
        : {}),
      ...(body.note !== undefined
        ? { note: body.note ? String(body.note).trim() : null }
        : {}),
    })
    .where(eq(financeTransactions.id, txId))
    .returning();

  if (!updated) {
    return NextResponse.json(
      { error: "Không tìm thấy giao dịch thu/chi" },
      { status: 404 }
    );
  }

  return NextResponse.json({ transaction: updated });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const { id } = await context.params;
  await db
    .delete(financeTransactions)
    .where(eq(financeTransactions.id, Number(id)));
  return NextResponse.json({ ok: true });
}
