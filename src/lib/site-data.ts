import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/db";
import { ensureDbReady } from "@/db/ensure-db";
import { siteSettings, services, pricingItems, posts } from "@/db/schema";
import { asc, desc, eq } from "drizzle-orm";

export const SITE_DATA_CACHE_TAG = "site-data";

export function revalidateSiteContent() {
  revalidateTag(SITE_DATA_CACHE_TAG);
  revalidatePath("/", "layout");
}

const DEFAULT_SITE_SETTINGS: typeof siteSettings.$inferSelect = {
  id: 1,
  brandName: "MQTech - Sửa Máy Tính Tại Nhà BMT",
  subTagline: "DỊCH VỤ SỬA MÁY TÍNH TẠI NHÀ BMT",
  slogan: "Sự Hài Lòng Của Khách Hàng Là Động Lực Của Chúng Tôi.",
  ticketPrefix: "MQ",
  hotline: "0987 482 573",
  hotlineRaw: "0987482573",
  zaloUrl: "https://zalo.me/0987482573",
  facebookUrl: "https://www.facebook.com/suamaytinhbmt",
  messengerUrl: "https://m.me/suamaytinhbmt",
  email: "manhquang89@gmail.com",
  address: "Đường Võ Thị Sáu, P. Tân Lập, TP. Buôn Ma Thuột, Đắk Lắk",
  workingHours: "07:30 - 20:00 (Thứ 2 - Chủ Nhật)",
  siteUrl: "https://suamaytinhbmt.id.vn",
  isOpen: true,
  todayReceivedCount: 18,
  todaySlotsLeft: 6,
  bookingDiscount: "50.000đ",
  showExactPrices: true,
  telegramBotToken: "",
  telegramChatId: "",
  enableTelegram: false,
  smtpHost: "",
  smtpPort: 587,
  smtpUser: "",
  smtpPass: "",
  notifyEmailTo: "manhquang89@gmail.com",
  enableEmail: false,
  googleSiteVerification: "",
  googleAnalyticsId: "",
  googleMapsEmbedUrl: "",
  updatedAt: new Date(),
};

export async function getSiteSettings(): Promise<typeof siteSettings.$inferSelect> {
  try {
    await ensureDbReady();
    const rows = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, 1))
      .limit(1);
    return rows[0] || DEFAULT_SITE_SETTINGS;
  } catch (err) {
    console.warn("[getSiteSettings error]", err);
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function getPublishedServices(): Promise<(typeof services.$inferSelect)[]> {
  try {
    await ensureDbReady();
    return await db
      .select()
      .from(services)
      .where(eq(services.isPublished, true))
      .orderBy(asc(services.sortOrder), asc(services.id));
  } catch (err) {
    console.warn("[getPublishedServices error]", err);
    return [];
  }
}

export async function getServiceBySlug(slug: string): Promise<typeof services.$inferSelect | null> {
  try {
    await ensureDbReady();
    const rows = await db
      .select()
      .from(services)
      .where(eq(services.slug, slug))
      .limit(1);
    return rows[0] || null;
  } catch (err) {
    console.warn("[getServiceBySlug error]", err);
    return null;
  }
}

export async function getActivePricing(): Promise<(typeof pricingItems.$inferSelect)[]> {
  try {
    await ensureDbReady();
    return await db
      .select()
      .from(pricingItems)
      .where(eq(pricingItems.isActive, true))
      .orderBy(asc(pricingItems.sortOrder), asc(pricingItems.id));
  } catch (err) {
    console.warn("[getActivePricing error]", err);
    return [];
  }
}

export async function getPublishedPosts(): Promise<(typeof posts.$inferSelect)[]> {
  try {
    await ensureDbReady();
    return await db
      .select()
      .from(posts)
      .where(eq(posts.isPublished, true))
      .orderBy(desc(posts.featured), desc(posts.publishedAt));
  } catch (err) {
    console.warn("[getPublishedPosts error]", err);
    return [];
  }
}

export async function getPostBySlug(slug: string): Promise<typeof posts.$inferSelect | null> {
  try {
    await ensureDbReady();
    const rows = await db
      .select()
      .from(posts)
      .where(eq(posts.slug, slug))
      .limit(1);
    return rows[0] || null;
  } catch (err) {
    console.warn("[getPostBySlug error]", err);
    return null;
  }
}
