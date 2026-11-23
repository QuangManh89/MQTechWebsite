import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ensureDbReady } from "@/db/ensure-db";
import { siteSettings, adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdminSession } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { dispatchNotification } from "@/lib/notifications";
import { revalidateSiteContent } from "@/lib/site-data";

export const dynamic = "force-dynamic";

function extractGoogleVerificationToken(raw: unknown): string {
  const str = String(raw ?? "").trim();
  if (!str) return "";
  const contentMatch = /content=["']([^"']+)["']/i.exec(str);
  if (contentMatch?.[1]) return contentMatch[1].trim();
  return str.replace(/^google-site-verification=/i, "").trim();
}

function extractMapsEmbedUrl(raw: unknown): string {
  const str = String(raw ?? "").trim();
  if (!str) return "";
  const srcMatch = /src=["']([^"']+)["']/i.exec(str);
  const candidate = (srcMatch?.[1] || str).trim();
  if (candidate.startsWith("https://")) return candidate;
  return "";
}

function normalizeGa4Id(raw: unknown): string {
  const str = String(raw ?? "").trim().toUpperCase();
  if (!str) return "";
  return /^[A-Z0-9-]+$/.test(str) ? str : "";
}

export async function GET() {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const rows = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, 1))
    .limit(1);
  return NextResponse.json({ settings: rows[0] });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const body = await req.json();

  if (body.newPassword && String(body.newPassword).length >= 6) {
    const hash = await bcrypt.hash(String(body.newPassword), 10);
    await db
      .update(adminUsers)
      .set({ passwordHash: hash })
      .where(eq(adminUsers.id, auth.session.userId));
  }

  const [updated] = await db
    .update(siteSettings)
    .set({
      brandName: body.brandName,
      subTagline: body.subTagline,
      slogan: body.slogan,
      ticketPrefix: body.ticketPrefix,
      hotline: body.hotline,
      hotlineRaw: String(body.hotline || "").replace(/\s+/g, ""),
      zaloUrl: body.zaloUrl,
      facebookUrl: body.facebookUrl,
      messengerUrl: body.messengerUrl,
      email: body.email,
      address: body.address,
      workingHours: body.workingHours,
      siteUrl: body.siteUrl ?? "",
      isOpen: Boolean(body.isOpen),
      todayReceivedCount: Number(body.todayReceivedCount ?? 18),
      todaySlotsLeft: Number(body.todaySlotsLeft ?? 6),
      bookingDiscount: body.bookingDiscount,
      showExactPrices: Boolean(body.showExactPrices),
      telegramBotToken: body.telegramBotToken ?? "",
      telegramChatId: body.telegramChatId ?? "",
      enableTelegram: Boolean(body.enableTelegram),
      smtpHost: body.smtpHost ?? "",
      smtpPort: Number(body.smtpPort ?? 587),
      smtpUser: body.smtpUser ?? "",
      smtpPass: body.smtpPass ?? "",
      notifyEmailTo: body.notifyEmailTo ?? "",
      enableEmail: Boolean(body.enableEmail),
      googleSiteVerification: extractGoogleVerificationToken(
        body.googleSiteVerification
      ),
      googleAnalyticsId: normalizeGa4Id(body.googleAnalyticsId),
      googleMapsEmbedUrl: extractMapsEmbedUrl(body.googleMapsEmbedUrl),
      updatedAt: new Date(),
    })
    .where(eq(siteSettings.id, 1))
    .returning();

  revalidateSiteContent();
  return NextResponse.json({ settings: updated });
}

export async function POST() {
  const auth = await requireAdminSession("ADMIN");
  if (auth.error) return auth.error;

  await ensureDbReady();
  const result = await dispatchNotification({
    title: "Kiểm tra kết nối thông báo MQTech BMT",
    lines: [
      "• Hệ thống gửi thông báo Telegram / Email đã hoạt động ổn định.",
      `• Thời gian: ${new Date().toLocaleString("vi-VN")}`,
    ],
  });

  return NextResponse.json(result);
}
