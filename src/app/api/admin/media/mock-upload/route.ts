import { getAdminSessionFromRequest } from "../../../../../lib/auth/session.ts";

export async function PUT(req: Request) {
  const session = await getAdminSessionFromRequest(req);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Acknowledge mock direct upload in local dev
  return new Response(null, { status: 200 });
}
