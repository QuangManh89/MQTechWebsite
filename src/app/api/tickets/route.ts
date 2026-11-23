import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { ensureDbReady } from "@/db/ensure-db";
import { repairTickets, siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateTicketCode } from "@/lib/utils";
import { dispatchNotification } from "@/lib/notifications";
import { upsertCustomerFromTicket } from "@/lib/customers";
import { enforceRateLimit } from "@/lib/rate-limit";

const createTicketSchema = z.object({
  serviceMode: z.enum(["ONSITE", "STORE"]).default("ONSITE"),
  onsiteAddress: z.string().max(300, "Địa chỉ tối đa 300 ký tự").optional().default(""),
  deviceType: z.string().min(2, "Vui lòng chọn loại thiết bị").max(80),
  serviceCategory: z.string().min(2, "Vui lòng chọn dịch vụ").max(120),
  deviceModel: z.string().max(150, "Model máy tối đa 150 ký tự").optional().default(""),
  issueDescription: z
    .string()
    .min(5, "Vui lòng mô tả tình trạng lỗi tối thiểu 5 ký tự")
    .max(2000, "Mô tả lỗi tối đa 2000 ký tự"),
  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Định dạng ngày hẹn không hợp lệ"),
  appointmentSlot: z.string().min(2, "Vui lòng chọn khung giờ").max(60),
  customerName: z
    .string()
    .min(2, "Vui lòng nhập họ tên tối thiểu 2 ký tự")
    .max(120, "Họ tên tối đa 120 ký tự"),
  customerPhone: z
    .string()
    .min(9, "Số điện thoại không hợp lệ")
    .max(20, "Số điện thoại không hợp lệ"),
  customerEmail: z
    .string()
    .max(150)
    .refine(
      (val) => !val.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
      "Định dạng email không hợp lệ"
    )
    .optional()
    .default(""),
});

export async function POST(req: NextRequest) {
  const rateLimited = enforceRateLimit(req, {
    bucket: "public-create-ticket",
    limit: 10,
    windowMs: 10 * 60_000,
    message:
      "Bạn đã gửi quá nhiều yêu cầu đặt lịch liên tiếp. Vui lòng đợi vài phút hoặc gọi trực tiếp Hotline 0987 482 573.",
  });
  if (rateLimited) return rateLimited;

  try {
    await ensureDbReady();
    const body = await req.json();
    const parsed = createTicketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    if (data.serviceMode === "ONSITE" && data.onsiteAddress.trim().length < 5) {
      return NextResponse.json(
        { error: "Vui lòng nhập địa chỉ cần sửa tại nhà / cơ quan ở BMT" },
        { status: 400 }
      );
    }

    const minAllowed = new Date(Date.now() - 86_400_000)
      .toISOString()
      .slice(0, 10);
    if (data.appointmentDate < minAllowed) {
      return NextResponse.json(
        { error: "Ngày hẹn không được nằm trong quá khứ" },
        { status: 400 }
      );
    }

    const cleanPhone = data.customerPhone.replace(/[\s.-]+/g, "");
    if (!/^[0-9+]{9,15}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: "Số điện thoại cần từ 9 đến 15 chữ số" },
        { status: 400 }
      );
    }

    const settingsRows = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, 1))
      .limit(1);
    const prefix = settingsRows[0]?.ticketPrefix || "MQ";

    let ticketCode = generateTicketCode(prefix);
    for (let attempt = 0; attempt < 3; attempt++) {
      const existing = await db
        .select({ id: repairTickets.id })
        .from(repairTickets)
        .where(eq(repairTickets.ticketCode, ticketCode))
        .limit(1);
      if (existing.length === 0) break;
      ticketCode = generateTicketCode(prefix);
    }

    const [created] = await db
      .insert(repairTickets)
      .values({
        ticketCode,
        source: "ONLINE",
        serviceMode: data.serviceMode,
        onsiteAddress: data.onsiteAddress.trim() || null,
        deviceType: data.deviceType.trim(),
        serviceCategory: data.serviceCategory.trim(),
        deviceModel: data.deviceModel.trim() || null,
        issueDescription: data.issueDescription.trim(),
        appointmentDate: data.appointmentDate,
        appointmentSlot: data.appointmentSlot,
        customerName: data.customerName.trim(),
        customerPhone: cleanPhone,
        customerEmail: data.customerEmail.trim() || null,
        status: "PENDING",
      })
      .returning();

    void upsertCustomerFromTicket({
      phone: created.customerPhone,
      name: created.customerName,
      email: created.customerEmail,
      address: created.onsiteAddress,
    });

    void dispatchNotification({
      title: `Lịch hẹn mới ${created.ticketCode}`,
      lines: [
        `• Khách hàng: ${created.customerName} (${created.customerPhone})`,
        `• Hình thức: ${created.serviceMode === "ONSITE" ? "Sửa tại nhà BMT" : "Mang đến cửa hàng"}`,
        ...(created.onsiteAddress ? [`• Địa chỉ: ${created.onsiteAddress}`] : []),
        `• Thiết bị: ${created.deviceType} ${created.deviceModel || ""}`.trim(),
        `• Dịch vụ: ${created.serviceCategory}`,
        `• Lịch hẹn: ${created.appointmentDate} (${created.appointmentSlot})`,
        `• Mô tả lỗi: ${created.issueDescription}`,
      ],
    });

    return NextResponse.json({ ticket: created }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/tickets]", err);
    return NextResponse.json(
      {
        error:
          "Hệ thống đang bận tạm thời. Vui lòng bấm Thử gửi lại hoặc gọi Hotline 0987 482 573.",
      },
      { status: 500 }
    );
  }
}
