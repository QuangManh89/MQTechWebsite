export async function GET() {
  return Response.json({
    status: "ok",
    service: "mqtech-web",
    timestamp: new Date().toISOString(),
  });
}
