import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { ensureDbReady } from "@/db/ensure-db";
import { contactInquiries } from "@/db/schema";
import { dispatchNotification } from "@/lib/notifications";
import { enforceRateLimit } from "@/lib/rate-limit";

const contactSchema = z.object({
  fullName: z
    .string()
    .min(2, "Vui lòng nhập họ tên tối thiểu 2 ký tự")
    .max(120, "Họ tên tối đa 120 ký tự"),
  phone: z
    .string()
    .min(9, "Vui lòng nhập số điện thoại hợp lệ")
    .max(20, "Số điện thoại không hợp lệ"),
  topic: z.string().min(2, "Vui lòng chọn chủ đề").max(150),
  message: z
    .string()
    .min(5, "Vui lòng nhập nội dung câu hỏi tối thiểu 5 ký tự")
    .max(2000, "Nội dung câu hỏi tối đa 2000 ký tự"),
});

export async function POST(req: NextRequest) {
  const rateLimited = enforceRateLimit(req, {
    bucket: "public-contact",
    limit: 10,
    windowMs: 10 * 60_000,
    message:
      "Bạn đã gửi quá nhiều câu hỏi liên tiếp. Vui lòng đợi vài phút hoặc nhắn trực tiếp Zalo 0987 482 573.",
  });
  if (rateLimited) return rateLimited;

  try {
    await ensureDbReady();
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    const cleanPhone = parsed.data.phone.replace(/[\s.-]+/g, "");
    if (!/^[0-9+]{9,15}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: "Số điện thoại cần từ 9 đến 15 chữ số" },
        { status: 400 }
      );
    }

    const [created] = await db
      .insert(contactInquiries)
      .values({
        fullName: parsed.data.fullName.trim(),
        phone: cleanPhone,
        topic: parsed.data.topic.trim(),
        message: parsed.data.message.trim(),
      })
      .returning();

    void dispatchNotification({
      title: `Câu hỏi tư vấn mới từ ${created.fullName}`,
      lines: [
        `• SĐT: ${created.phone}`,
        `• Chủ đề: ${created.topic}`,
        `• Nội dung: ${created.message}`,
      ],
    });

    return NextResponse.json({ inquiry: created }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/contact]", err);
    return NextResponse.json(
      {
        error:
          "Hệ thống đang bận tạm thời. Vui lòng bấm Gửi lại hoặc gọi Hotline 0987 482 573.",
      },
      { status: 500 }
    );
  }
}
