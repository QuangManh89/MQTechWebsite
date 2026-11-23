import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ensureDbReady } from "@/db/ensure-db";
import { contactInquiries } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const rows = await db
    .select()
    .from(contactInquiries)
    .orderBy(desc(contactInquiries.createdAt));
  return NextResponse.json({ inquiries: rows });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const body = await req.json();
  const [updated] = await db
    .update(contactInquiries)
    .set({
      status: body.status,
      adminNote: body.adminNote ?? null,
    })
    .where(eq(contactInquiries.id, Number(body.id)))
    .returning();
  return NextResponse.json({ inquiry: updated });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  await db.delete(contactInquiries).where(eq(contactInquiries.id, id));
  return NextResponse.json({ ok: true });
}
