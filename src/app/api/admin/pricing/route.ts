import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ensureDbReady } from "@/db/ensure-db";
import { pricingItems } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/auth";
import { revalidateSiteContent } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const rows = await db
    .select()
    .from(pricingItems)
    .orderBy(asc(pricingItems.tabCategory), asc(pricingItems.sortOrder));
  return NextResponse.json({ items: rows });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const body = await req.json();
  const [created] = await db
    .insert(pricingItems)
    .values({
      tabCategory: body.tabCategory,
      serviceName: body.serviceName,
      priceText: body.priceText,
      duration: body.duration,
      warranty: body.warranty,
      sortOrder: Number(body.sortOrder ?? 10),
      isActive: body.isActive !== false,
    })
    .returning();

  revalidateSiteContent();
  return NextResponse.json({ item: created }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const body = await req.json();
  const [updated] = await db
    .update(pricingItems)
    .set({
      tabCategory: body.tabCategory,
      serviceName: body.serviceName,
      priceText: body.priceText,
      duration: body.duration,
      warranty: body.warranty,
      sortOrder: Number(body.sortOrder ?? 0),
      isActive: Boolean(body.isActive),
    })
    .where(eq(pricingItems.id, Number(body.id)))
    .returning();

  revalidateSiteContent();
  return NextResponse.json({ item: updated });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const { searchParams } = new URL(req.url);
  await db
    .delete(pricingItems)
    .where(eq(pricingItems.id, Number(searchParams.get("id"))));
  revalidateSiteContent();
  return NextResponse.json({ ok: true });
}
