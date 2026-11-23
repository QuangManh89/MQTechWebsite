import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ensureDbReady } from "@/db/ensure-db";
import { services } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { getAdminSession, requireAdminSession } from "@/lib/auth";
import { revalidateSiteContent } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureDbReady();
  const rows = await db
    .select()
    .from(services)
    .orderBy(asc(services.sortOrder), asc(services.id));
  return NextResponse.json({ services: rows });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureDbReady();
  const body = await req.json();
  const [created] = await db
    .insert(services)
    .values({
      title: body.title,
      slug: body.slug,
      category: body.category,
      shortDesc: body.shortDesc,
      description: body.description,
      priceFrom: body.priceFrom,
      warranty: body.warranty,
      duration: body.duration,
      imageUrl: body.imageUrl,
      symptomsJson: body.symptomsJson || "[]",
      servicePricesJson: body.servicePricesJson || "[]",
      featured: Boolean(body.featured),
      sortOrder: Number(body.sortOrder ?? 10),
      isPublished: body.isPublished !== false,
    })
    .returning();

  revalidateSiteContent();
  return NextResponse.json({ service: created }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureDbReady();
  const body = await req.json();
  const [updated] = await db
    .update(services)
    .set({
      title: body.title,
      slug: body.slug,
      category: body.category,
      shortDesc: body.shortDesc,
      description: body.description,
      priceFrom: body.priceFrom,
      warranty: body.warranty,
      duration: body.duration,
      imageUrl: body.imageUrl,
      symptomsJson: body.symptomsJson ?? "[]",
      servicePricesJson: body.servicePricesJson ?? "[]",
      featured: Boolean(body.featured),
      sortOrder: Number(body.sortOrder ?? 0),
      isPublished: Boolean(body.isPublished),
      updatedAt: new Date(),
    })
    .where(eq(services.id, Number(body.id)))
    .returning();

  revalidateSiteContent();
  return NextResponse.json({ service: updated });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const { searchParams } = new URL(req.url);
  await db.delete(services).where(eq(services.id, Number(searchParams.get("id"))));
  revalidateSiteContent();
  return NextResponse.json({ ok: true });
}
