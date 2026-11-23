import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { uploadImageAsset } from "@/lib/storage";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json(
      { error: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." },
      { status: 401 }
    );
  }

  try {
    const formData = await req.formData();
    const rawFiles = [
      ...formData.getAll("files"),
      ...formData.getAll("file"),
    ].filter((item): item is File => item instanceof File && item.size > 0);

    if (rawFiles.length === 0) {
      return NextResponse.json({ error: "Thiếu file ảnh tải lên" }, { status: 400 });
    }

    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/svg+xml",
    ];

    const results: Array<{ url: string; name: string; provider: string }> = [];

    for (const file of rawFiles) {
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          {
            error: `Ảnh "${file.name}" vượt quá giới hạn 5MB. Vui lòng nén ảnh trước khi tải lên.`,
          },
          { status: 400 }
        );
      }
      if (!allowed.includes(file.type)) {
        return NextResponse.json(
          { error: `File "${file.name}" không hợp lệ. Chỉ hỗ trợ JPG, PNG, WebP, AVIF hoặc SVG.` },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (file.type === "image/svg+xml") {
        const svgText = buffer.toString("utf8");
        if (/<script\b|javascript:|on[a-z]+\s*=/i.test(svgText)) {
          return NextResponse.json(
            { error: `File SVG "${file.name}" chứa mã thực thi không an toàn đã bị từ chối.` },
            { status: 400 }
          );
        }
      }

      const res = await uploadImageAsset(buffer, file.name, file.type);
      results.push({ url: res.url, name: file.name, provider: res.provider });
    }

    return NextResponse.json({
      url: results[0]?.url || "",
      provider: results[0]?.provider || "",
      urls: results,
    });
  } catch (err) {
    console.error("[POST /api/upload]", err);
    return NextResponse.json(
      { error: "Không thể tải ảnh lên máy chủ lúc này. Vui lòng thử lại." },
      { status: 500 }
    );
  }
}
