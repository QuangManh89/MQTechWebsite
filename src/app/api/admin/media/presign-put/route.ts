import { getAdminSessionFromRequest } from "../../../../../lib/auth/session.ts";
import { guardApiRoute } from "../../../../../lib/security/request-guard.ts";
import {
  validateMediaUpload,
  generateArticleImageObjectKey,
  generateR2PresignedPutUrl,
  buildMediaPublicUrl,
} from "../../../../../lib/storage/r2.ts";
import { getAppConfig } from "../../../../../lib/env.ts";

export async function POST(req: Request) {
  // 1. Guard against CSRF
  const guard = guardApiRoute(req);
  if (!guard.allowed && guard.response) {
    return guard.response;
  }

  // 2. Authenticate Admin Session
  const session = await getAdminSessionFromRequest(req);
  if (!session) {
    return Response.json(
      { error: "Unauthorized: Yêu cầu đăng nhập quản trị viên." },
      { status: 401 }
    );
  }

  // 3. Parse request payload
  let body: {
    fileName?: string;
    contentType?: string;
    sizeBytes?: number;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Dữ liệu yêu cầu không hợp lệ." }, { status: 400 });
  }

  const { fileName = "", contentType = "", sizeBytes = 0 } = body;

  // 4. Validate file format & safety (JPEG, PNG, WebP, AVIF <= 5MB, strict SVG rejection)
  const validation = validateMediaUpload({
    fileName,
    contentType,
    sizeBytes,
    category: "SERVICE_ASSET",
    visibility: "PUBLIC",
  });

  if (!validation.valid || !validation.sanitizedFileName) {
    return Response.json(
      { error: validation.error || "Tệp không hợp lệ." },
      { status: 400 }
    );
  }

  const config = getAppConfig();
  const bucketName = config.r2MediaBucket;
  const { mediaId, objectKey } = generateArticleImageObjectKey(validation.sanitizedFileName);

  const publicUrl = buildMediaPublicUrl(objectKey, {
    bucketName,
    visibility: "PUBLIC",
  });

  // 5. If Cloudflare R2 credentials exist, generate AWS S3 SigV4 Presigned PUT URL
  if (config.r2AccountId && config.r2AccessKeyId && config.r2SecretAccessKey) {
    try {
      const uploadUrl = generateR2PresignedPutUrl({
        accountId: config.r2AccountId,
        accessKeyId: config.r2AccessKeyId,
        secretAccessKey: config.r2SecretAccessKey,
        bucketName,
        objectKey,
        contentType,
        expiresInSeconds: 900, // 15 mins
      });

      return Response.json({
        success: true,
        uploadMode: "R2_DIRECT",
        uploadUrl,
        publicUrl,
        objectKey,
        mediaId,
        bucketName,
        expiresInSeconds: 900,
      });
    } catch (err) {
      console.warn("SigV4 Presigned PUT generation failed:", err);
    }
  }

  // 6. In development / testing fallback mode
  return Response.json({
    success: true,
    uploadMode: "LOCAL_MOCK",
    uploadUrl: `/api/admin/media/mock-upload?key=${encodeURIComponent(objectKey)}`,
    publicUrl: publicUrl || `/articles/images/${validation.sanitizedFileName}`,
    objectKey,
    mediaId,
    bucketName,
    expiresInSeconds: 900,
  });
}
