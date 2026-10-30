import { ADMIN_COOKIE_NAME } from "../../../../lib/auth/session.ts";

export async function POST() {
  const isProduction = process.env.NODE_ENV === "production";
  const clearCookie = `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${
    isProduction ? "; Secure" : ""
  }`;

  return new Response(
    JSON.stringify({ success: true, message: "Đăng xuất thành công." }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": clearCookie,
      },
    }
  );
}
