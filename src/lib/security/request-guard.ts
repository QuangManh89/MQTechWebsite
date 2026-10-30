import { validateServerEnv, getAppConfig } from "../env.ts";

export interface GuardResult {
  allowed: boolean;
  response?: Response;
}

const LOCAL_DEV_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);

/**
 * Validates server environment and enforces strict CSRF & Trusted Origin protection.
 * Prevents Cross-Site Request Forgery and unauthorized cross-domain submissions.
 */
export function guardApiRoute(
  req?: Request,
  options: { checkOrigin?: boolean; enforceOriginInTest?: boolean } = {}
): GuardResult {
  const config = getAppConfig();

  // 1. Centralized Environment Validation
  try {
    validateServerEnv();
  } catch (err) {
    const isProduction = config.isProduction;
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

  // 2. CSRF & Trusted Origin Validation on Unsafe (State-Changing) Methods
  if (req && options.checkOrigin) {
    const method = (req.method || "GET").toUpperCase();
    const isUnsafeMethod = ["POST", "PATCH", "PUT", "DELETE"].includes(method);

    if (isUnsafeMethod && req.headers) {
      // 2a. Fetch Metadata: Reject cross-site requests immediately
      const secFetchSite = req.headers.get("sec-fetch-site")?.toLowerCase();
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

      // 2b. Extract Origin or fallback to Referer
      let rawOrigin = req.headers.get("origin");
      if (!rawOrigin && req.headers.get("referer")) {
        try {
          const refererUrl = new URL(req.headers.get("referer")!);
          rawOrigin = refererUrl.origin;
        } catch {
          // Malformed referer will be caught below
        }
      }

      // 2c. Explicitly reject Origin: null (e.g. sandboxed iframes, file://, privacy redirects)
      if (rawOrigin === "null" || rawOrigin === "NULL") {
        return {
          allowed: false,
          response: Response.json(
            {
              success: false,
              error: "Cảnh báo bảo mật: Origin null bị từ chối.",
              code: "NULL_ORIGIN_REJECTED",
            },
            { status: 403 }
          ),
        };
      }

      // 2d. Fail-closed behavior on missing Origin for unsafe methods
      if (!rawOrigin) {
        const isTestEnv = config.environment === "test";
        // In test environment, allow missing origin for direct unit test convenience unless enforceOriginInTest is true
        if (!isTestEnv || options.enforceOriginInTest) {
          return {
            allowed: false,
            response: Response.json(
              {
                success: false,
                error:
                  "Cảnh báo bảo mật: Thiếu header Origin trên yêu cầu thay đổi dữ liệu.",
                code: "ORIGIN_REQUIRED",
              },
              { status: 403 }
            ),
          };
        }
      }

      // 2e. Validate Origin against Trusted Origin Allowlist
      if (rawOrigin) {
        let originUrl: URL;
        try {
          originUrl = new URL(rawOrigin);
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

        const isAllowed = isOriginTrusted(originUrl, config);
        if (!isAllowed) {
          return {
            allowed: false,
            response: Response.json(
              {
                success: false,
                error:
                  "Cảnh báo bảo mật: Origin không nằm trong danh sách máy chủ được tin cậy.",
                code: "CSRF_ORIGIN_MISMATCH",
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

function isOriginTrusted(
  originUrl: URL,
  config: ReturnType<typeof getAppConfig>
): boolean {
  // If a trusted origin is configured (e.g. MQTECH_PUBLIC_ORIGIN=https://mqcomputech.com)
  if (config.trustedOrigin) {
    try {
      const expectedUrl = new URL(config.trustedOrigin);
      if (
        originUrl.protocol === expectedUrl.protocol &&
        originUrl.host === expectedUrl.host
      ) {
        return true;
      }
    } catch {
      // Ignored
    }
  }

  // In non-production (development, test), permit verified local development origins
  if (!config.isProduction) {
    const hostname = originUrl.hostname.toLowerCase();
    if (LOCAL_DEV_HOSTS.has(hostname)) {
      return true;
    }
  }

  return false;
}
