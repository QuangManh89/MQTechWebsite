import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/auth/session";
import { guardApiRoute } from "@/lib/security/request-guard";
import { generateR2PresignedGetUrl, DEFAULT_ATTACHMENTS_BUCKET } from "@/lib/storage/r2";
import { getAppConfig } from "@/lib/env";

export async function POST(req: NextRequest) {
  // 1. Guard against CSRF / unauthorized origin
  const guard = guardApiRoute(req);
  if (!guard.allowed && guard.response) {
    return guard.response;
  }

  // 2. Authenticate Session Cookie & check account status and token_version
  const session = await getAdminSessionFromRequest(req);
  if (!session) {
    return NextResponse.json(
      { error: "Unauthorized: Yêu cầu đăng nhập quản trị viên." },
      { status: 401 }
    );
  }

  // 3. Parse and validate request body
  let body: { objectKey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 400 });
  }

  const { objectKey } = body;
  if (!objectKey || typeof objectKey !== "string") {
    return NextResponse.json({ error: "objectKey không hợp lệ." }, { status: 400 });
  }

  // Enforce objectKey format: must start with attachments/ (cannot access backups or other paths)
  if (!objectKey.startsWith("attachments/")) {
    return NextResponse.json(
      { error: "Forbidden: Chỉ được phép truy cập tệp đính kèm khách hàng trong bucket attachments." },
      { status: 403 }
    );
  }

  const config = getAppConfig();
  const bucketName = config.r2AttachmentsBucket || DEFAULT_ATTACHMENTS_BUCKET;

  // Verify R2 credentials exist
  if (!config.r2AccountId || !config.r2AccessKeyId || !config.r2SecretAccessKey) {
    return NextResponse.json(
      { error: "Cấu hình lưu trữ R2 chưa sẵn sàng trên máy chủ." },
      { status: 503 }
    );
  }

  try {
    const presignedGetUrl = generateR2PresignedGetUrl({
      accountId: config.r2AccountId,
      accessKeyId: config.r2AccessKeyId,
      secretAccessKey: config.r2SecretAccessKey,
      bucketName,
      objectKey,
      expiresInSeconds: 300, // 5 minutes
    });

    return NextResponse.json({
      success: true,
      presignedGetUrl,
      bucketName,
      objectKey,
      expiresInSeconds: 300,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi tạo URL tải xuống";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
