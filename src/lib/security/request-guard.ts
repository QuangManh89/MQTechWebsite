import { validateServerEnv } from "../env.ts";

export interface GuardResult {
  allowed: boolean;
  response?: Response;
}

/**
 * Validates server environment and enforces CSRF/Origin protection
 * on API routes.
 */
export function guardApiRoute(
  req?: Request,
  options: { checkOrigin?: boolean } = {}
): GuardResult {
  // 1. Centralized Environment Validation
  try {
    validateServerEnv();
  } catch (err) {
    const isProduction = process.env.NODE_ENV === "production";
    const errorMsg = isProduction
      ? "Lỗi cấu hình máy chủ. Vui lòng liên hệ quản trị hệ thống."
      : (err instanceof Error ? err.message : String(err));

    return {
      allowed: false,
      response: Response.json(
        {
          success: false,
          error: errorMsg,
          code: "SERVER_CONFIG_ERROR",
        },
        { status: 500 }
      ),
    };
  }

  // 2. CSRF / Same-Origin Verification on State-Changing Requests
  if (req && options.checkOrigin) {
    const method = (req.method || "GET").toUpperCase();
    const isStateChanging = ["POST", "PATCH", "PUT", "DELETE"].includes(method);

    if (isStateChanging && req.headers) {
      // Check Sec-Fetch-Site if provided by browser
      const secFetchSite = req.headers.get("sec-fetch-site");
      if (secFetchSite === "cross-site") {
        return {
          allowed: false,
          response: Response.json(
            {
              success: false,
              error: "Cảnh báo bảo mật: Yêu cầu liên trang (Cross-Site) bị từ chối.",
              code: "CSRF_DETECTED",
            },
            { status: 403 }
          ),
        };
      }

      // Check Origin header against request host
      const origin = req.headers.get("origin");
      if (origin && req.url) {
        try {
          const originUrl = new URL(origin);
          const reqUrl = new URL(req.url);
          // Allow matching host/port
          const isSameHost = originUrl.host === reqUrl.host;
          if (!isSameHost) {
            return {
              allowed: false,
              response: Response.json(
                {
                  success: false,
                  error:
                    "Cảnh báo bảo mật: Origin không khớp với máy chủ tiếp nhận.",
                  code: "CSRF_ORIGIN_MISMATCH",
                },
                { status: 403 }
              ),
            };
          }
        } catch {
          return {
            allowed: false,
            response: Response.json(
              {
                success: false,
                error: "Cảnh báo bảo mật: Header Origin không hợp lệ.",
                code: "INVALID_ORIGIN",
              },
              { status: 403 }
            ),
          };
        }
      }
    }
  }

  return { allowed: true };
}
