import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "mqtech_admin_session";

export type AdminRole = "ADMIN" | "EDITOR";

function getSecretKey(): Uint8Array {
  const raw =
    process.env.JWT_SECRET ||
    "mqtech-bmt-titanium-cobalt-dev-secret-change-in-production";
  return new TextEncoder().encode(raw);
}

export interface AdminSessionPayload {
  userId: number;
  email: string;
  name: string;
  role: AdminRole;
}

export async function signAdminToken(
  payload: AdminSessionPayload
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function verifyAdminToken(
  token: string
): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (
      typeof payload.userId === "number" &&
      typeof payload.email === "string"
    ) {
      return {
        userId: payload.userId,
        email: payload.email,
        name: String(payload.name ?? "Admin"),
        role: payload.role === "EDITOR" ? "EDITOR" : "ADMIN",
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function requireAdminSession(
  requiredRole?: AdminRole
): Promise<
  | { session: AdminSessionPayload; error?: undefined }
  | { session?: undefined; error: NextResponse }
> {
  const session = await getAdminSession();
  if (!session) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (requiredRole === "ADMIN" && session.role !== "ADMIN") {
    return {
      error: NextResponse.json(
        {
          error:
            "Tài khoản Biên tập viên không có quyền thực hiện thao tác này.",
        },
        { status: 403 }
      ),
    };
  }
  return { session };
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
