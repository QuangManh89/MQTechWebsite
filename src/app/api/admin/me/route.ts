import { getAdminSessionFromRequest } from "../../../../lib/auth/session.ts";

export async function GET(req: Request) {
  const session = getAdminSessionFromRequest(req);
  if (!session) {
    return Response.json(
      { success: false, error: "Phiên làm việc không hợp lệ hoặc đã hết hạn." },
      { status: 401 }
    );
  }

  return Response.json({
    success: true,
    user: {
      username: session.username,
      fullName: session.fullName,
      role: session.role,
    },
  });
}
