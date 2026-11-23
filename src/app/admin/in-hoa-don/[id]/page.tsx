import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { db } from "@/db";
import { ensureDbReady } from "@/db/ensure-db";
import { repairTickets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAdminSession } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-data";
import { InvoicePrintClient } from "@/components/admin/InvoicePrintClient";

export const dynamic = "force-dynamic";

export default async function PrintInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  if (session.role === "EDITOR") {
    redirect("/admin/bai-viet");
  }

  const { id } = await params;
  const ticketId = Number(id);
  if (!ticketId || Number.isNaN(ticketId)) {
    notFound();
  }

  await ensureDbReady();
  const [ticketRows, settings] = await Promise.all([
    db
      .select()
      .from(repairTickets)
      .where(eq(repairTickets.id, ticketId))
      .limit(1),
    getSiteSettings(),
  ]);

  const ticket = ticketRows[0];
  if (!ticket) {
    notFound();
  }

  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    settings.siteUrl ||
    "https://suamaytinhbmt.id.vn"
  ).replace(/\/$/, "");
  const lookupUrl = `${baseUrl}/tra-cuu?code=${encodeURIComponent(
    ticket.ticketCode
  )}`;

  let qrDataUrl = "";
  try {
    qrDataUrl = await QRCode.toDataURL(lookupUrl, {
      margin: 1,
      width: 180,
      color: {
        dark: "#0B1120",
        light: "#FFFFFF",
      },
    });
  } catch (err) {
    console.warn("[QR generate warning]", err);
  }

  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap"
      />
      <InvoicePrintClient
        ticket={ticket}
        settings={settings}
        qrDataUrl={qrDataUrl}
        lookupUrl={lookupUrl}
      />
    </>
  );
}
