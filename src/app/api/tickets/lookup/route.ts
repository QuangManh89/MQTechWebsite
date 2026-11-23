import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { ensureDbReady } from "@/db/ensure-db";
import { repairTickets } from "@/db/schema";
import { desc, eq, or } from "drizzle-orm";
import { enforceRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const rateLimited = enforceRateLimit(req, {
    bucket: "public-ticket-lookup",
    limit: 30,
    windowMs: 5 * 60_000,
    message: "Bạn tra cứu quá nhiều lần liên tiếp. Vui lòng đợi ít phút rồi thử lại.",
  });
  if (rateLimited) return rateLimited;

  try {
    await ensureDbReady();
    const { searchParams } = new URL(req.url);
    const code = (searchParams.get("code") || "")
      .trim()
      .toUpperCase()
      .slice(0, 40);
    const phone = (searchParams.get("phone") || "")
      .replace(/[\s.-]+/g, "")
      .trim()
      .slice(0, 20);

    if (!code && !phone) {
      return NextResponse.json(
        { error: "Vui lòng nhập Mã phiếu hoặc Số điện thoại để tra cứu" },
        { status: 400 }
      );
    }

    const conditions = [];
    if (code) conditions.push(eq(repairTickets.ticketCode, code));
    if (phone) conditions.push(eq(repairTickets.customerPhone, phone));

    const rows = await db
      .select({
        id: repairTickets.id,
        ticketCode: repairTickets.ticketCode,
        source: repairTickets.source,
        serviceMode: repairTickets.serviceMode,
        deviceType: repairTickets.deviceType,
        deviceModel: repairTickets.deviceModel,
        serviceCategory: repairTickets.serviceCategory,
        issueDescription: repairTickets.issueDescription,
        appointmentDate: repairTickets.appointmentDate,
        appointmentSlot: repairTickets.appointmentSlot,
        customerName: repairTickets.customerName,
        status: repairTickets.status,
        technicianNote: repairTickets.technicianNote,
        estimatedCost: repairTickets.estimatedCost,
        itemsJson: repairTickets.itemsJson,
        warrantyText: repairTickets.warrantyText,
        warrantyUntil: repairTickets.warrantyUntil,
        createdAt: repairTickets.createdAt,
        updatedAt: repairTickets.updatedAt,
      })
      .from(repairTickets)
      .where(conditions.length === 2 ? or(conditions[0], conditions[1]) : conditions[0])
      .orderBy(desc(repairTickets.createdAt))
      .limit(10);

    return NextResponse.json({ tickets: rows });
  } catch (err) {
    console.error("[GET /api/tickets/lookup]", err);
    return NextResponse.json(
      {
        error:
          "Không thể truy vấn dữ liệu bảo hành lúc này. Vui lòng thử lại sau giây lát.",
      },
      { status: 500 }
    );
  }
}
