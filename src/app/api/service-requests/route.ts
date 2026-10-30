import { validateServiceRequestInput } from "../../../lib/validations/service-request.ts";
import { serviceRequestRepo } from "../../../lib/db/repository.ts";
import { intakeRateLimiter } from "../../../lib/utils/rate-limiter.ts";
import { guardApiRoute } from "../../../lib/security/request-guard.ts";

export async function POST(req: Request) {
  try {
    const guard = guardApiRoute(req, { checkOrigin: true });
    if (!guard.allowed && guard.response) {
      return guard.response;
    }
    // 1. Identify client IP for rate-limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

    const rateLimit = intakeRateLimiter.check(ip);
    if (!rateLimit.allowed) {
      return Response.json(
        {
          success: false,
          error:
            "Quý khách đã gửi yêu cầu quá nhiều lần trong thời gian ngắn. Vui lòng thử lại sau ít phút hoặc liên hệ trực tiếp.",
          code: "RATE_LIMITED",
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil(
              (rateLimit.resetAt - Date.now()) / 1000
            ).toString(),
          },
        }
      );
    }

    // 2. Safe JSON body parsing with length limit check
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 64 * 1024) {
      return Response.json(
        {
          success: false,
          error: "Dung lượng dữ liệu gửi lên vượt quá giới hạn cho phép (64KB).",
          code: "PAYLOAD_TOO_LARGE",
        },
        { status: 413 }
      );
    }

    let rawBody: Record<string, unknown>;
    try {
      rawBody = (await req.json()) as Record<string, unknown>;
    } catch {
      return Response.json(
        {
          success: false,
          error: "Định dạng dữ liệu không hợp lệ. Yêu cầu JSON hợp lệ.",
          code: "INVALID_JSON",
        },
        { status: 400 }
      );
    }

    // 3. Authoritative server-side schema & security validation
    const validation = validateServiceRequestInput(rawBody);
    if (!validation.success || !validation.data) {
      return Response.json(
        {
          success: false,
          errors: validation.errors,
          code: "VALIDATION_FAILED",
        },
        { status: 400 }
      );
    }

    // 4. Persistence via repository
    const created = await serviceRequestRepo.create(validation.data);

    // 5. Minimal secure response (never expose internal DB UUIDs or private data)
    return Response.json(
      {
        success: true,
        data: {
          referenceCode: created.referenceCode,
          customerName: created.customerName,
          serviceMode: created.serviceMode,
          deviceCategory: created.deviceCategory,
          status: created.status,
          statusLabel: "Chờ xác nhận",
          createdAt: created.createdAt.toISOString(),
        },
        message:
          "Yêu cầu tiếp nhận dịch vụ đã được ghi nhận. Kỹ thuật viên MQTech sẽ liên hệ xác nhận qua điện thoại hoặc Zalo trước khi hỗ trợ.",
      },
      { status: 201 }
    );
  } catch (error) {
    // Safe error handling: Log error internally without exposing system secrets
    console.error("Lỗi xử lý tiếp nhận yêu cầu dịch vụ:", error);

    return Response.json(
      {
        success: false,
        error:
          "Đã xảy ra sự cố kỹ thuật trong quá trình xử lý yêu cầu. Quý khách vui lòng thử lại sau.",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 }
    );
  }
}
