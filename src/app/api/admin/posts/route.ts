import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ensureDbReady } from "@/db/ensure-db";
import { posts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getAdminSession, requireAdminSession } from "@/lib/auth";
import { revalidateSiteContent } from "@/lib/site-data";

export const dynamic = "force-dynamic";

function cleanText(input: unknown): string {
  if (typeof input !== "string") return "";
  return input.replace(/^[\s\t\uFEFF]+|[\s\t\uFEFF]+$/g, "");
}

function normalizeGalleryImages(input: unknown): string {
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return JSON.stringify(parsed);
    } catch {
      return "[]";
    }
  }
  if (Array.isArray(input)) {
    return JSON.stringify(input);
  }
  return "[]";
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureDbReady();
  const rows = await db.select().from(posts).orderBy(desc(posts.publishedAt));
  return NextResponse.json({ posts: rows });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureDbReady();
  const body = await req.json();
  const title = cleanText(body.title);
  const slug = cleanText(body.slug);
  const excerpt = cleanText(body.excerpt);
  const seoTitle = cleanText(body.seoTitle) || title;
  const seoDescription = cleanText(body.seoDescription) || excerpt;
  const focusKeyword = cleanText(body.focusKeyword);

  const [created] = await db
    .insert(posts)
    .values({
      title,
      slug,
      excerpt,
      content: typeof body.content === "string" ? body.content.trim() : "",
      category: cleanText(body.category),
      coverImage: cleanText(body.coverImage),
      authorName: cleanText(body.authorName) || "Kỹ thuật MQTech BMT",
      readTimeMinutes: Number(body.readTimeMinutes ?? 5),
      featured: Boolean(body.featured),
      isPublished: body.isPublished !== false,
      galleryImages: normalizeGalleryImages(body.galleryImages),
      focusKeyword,
      seoTitle,
      seoDescription,
    })
    .returning();

  revalidateSiteContent();
  return NextResponse.json({ post: created }, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await ensureDbReady();
  const body = await req.json();
  const title = cleanText(body.title);
  const slug = cleanText(body.slug);
  const excerpt = cleanText(body.excerpt);
  const seoTitle = cleanText(body.seoTitle) || title;
  const seoDescription = cleanText(body.seoDescription) || excerpt;
  const focusKeyword = cleanText(body.focusKeyword);

  const [updated] = await db
    .update(posts)
    .set({
      title,
      slug,
      excerpt,
      content: typeof body.content === "string" ? body.content.trim() : "",
      category: cleanText(body.category),
      coverImage: cleanText(body.coverImage),
      authorName: cleanText(body.authorName) || "Kỹ thuật MQTech BMT",
      readTimeMinutes: Number(body.readTimeMinutes ?? 5),
      featured: Boolean(body.featured),
      isPublished: Boolean(body.isPublished),
      galleryImages: normalizeGalleryImages(body.galleryImages),
      focusKeyword,
      seoTitle,
      seoDescription,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, Number(body.id)))
    .returning();

  revalidateSiteContent();
  return NextResponse.json({ post: updated });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const { searchParams } = new URL(req.url);
  await db.delete(posts).where(eq(posts.id, Number(searchParams.get("id"))));
  revalidateSiteContent();
  return NextResponse.json({ ok: true });
}
