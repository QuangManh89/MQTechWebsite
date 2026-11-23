import Link from "next/link";
import { ArrowRight, Clock, Layers, Mail, Wrench } from "lucide-react";
import { db } from "@/db";
import { ensureDbReady } from "@/db/ensure-db";
import {
  contactInquiries,
  posts,
  repairTickets,
  services,
} from "@/db/schema";
import { count, desc, eq } from "drizzle-orm";
import { TICKET_STATUS_MAP, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await ensureDbReady();

  const [
    pendingCount,
    activeRepairCount,
    newInquiryCount,
    serviceCount,
    postCount,
    recentTickets,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(repairTickets)
      .where(eq(repairTickets.status, "PENDING")),
    db
      .select({ value: count() })
      .from(repairTickets)
      .where(eq(repairTickets.status, "REPAIRING")),
    db
      .select({ value: count() })
      .from(contactInquiries)
      .where(eq(contactInquiries.status, "NEW")),
    db.select({ value: count() }).from(services),
    db.select({ value: count() }).from(posts),
    db
      .select()
      .from(repairTickets)
      .orderBy(desc(repairTickets.createdAt))
      .limit(8),
  ]);

  const stats = [
    {
      label: "Lịch hẹn chờ xác nhận",
      value: Number(pendingCount[0]?.value ?? 0),
      href: "/admin/phieu-sua",
      icon: Clock,
      accent: "text-status-warning-ink",
      iconBox: "bg-status-warning-bg text-status-warning-ink",
    },
    {
      label: "Máy đang sửa chữa",
      value: Number(activeRepairCount[0]?.value ?? 0),
      href: "/admin/phieu-sua",
      icon: Wrench,
      accent: "text-brand",
      iconBox: "bg-brand-light text-brand",
    },
    {
      label: "Câu hỏi liên hệ mới",
      value: Number(newInquiryCount[0]?.value ?? 0),
      href: "/admin/lien-he",
      icon: Mail,
      accent: "text-status-success-ink",
      iconBox: "bg-status-success-bg text-status-success-ink",
    },
    {
      label: "Dịch vụ / Bài viết SEO",
      value: `${Number(serviceCount[0]?.value ?? 0)} / ${Number(postCount[0]?.value ?? 0)}`,
      href: "/admin/dich-vu",
      icon: Layers,
      accent: "text-navy",
      iconBox: "bg-status-info-bg text-status-info-ink",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold text-navy sm:text-3xl">
          Tổng quan MQTech BMT
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          Theo dõi nhanh lịch hẹn sửa tại nhà, phiếu tiếp nhận tại tiệm và nội
          dung website.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.label}
              href={s.href}
              className="rounded-2xl border border-line bg-surface p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand/40"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  {s.label}
                </p>
                <span
                  className={cn(
                    "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                    s.iconBox
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
              </div>
              <p
                className={cn(
                  "mt-2 font-mono text-3xl font-bold tabular-nums",
                  s.accent
                )}
              >
                {s.value}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="rounded-2xl border border-line bg-surface shadow-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-subtle px-6 py-4">
          <h2 className="font-heading text-lg font-bold text-navy">
            Phiếu sửa chữa &amp; Lịch hẹn mới nhất
          </h2>
          <Link
            href="/admin/phieu-sua"
            className="inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
          >
            <span>Quản lý tất cả</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {recentTickets.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-muted">
            Chưa có phiếu sửa chữa nào được ghi nhận.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-surface-subtle text-xs uppercase text-ink-muted">
                <tr>
                  <th scope="col" className="px-6 py-3">Mã phiếu</th>
                  <th scope="col" className="px-6 py-3">Khách hàng</th>
                  <th scope="col" className="px-6 py-3">Hình thức</th>
                  <th scope="col" className="px-6 py-3">Thiết bị &amp; Dịch vụ</th>
                  <th scope="col" className="px-6 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-subtle">
                {recentTickets.map((t) => {
                  const st = TICKET_STATUS_MAP[t.status] ?? {
                    label: t.status,
                    badgeClass: "bg-surface-muted text-ink-body border-line",
                  };
                  return (
                    <tr key={t.id} className="hover:bg-surface-subtle">
                      <td className="px-6 py-3.5 font-mono font-bold text-brand tabular-nums">
                        {t.ticketCode}
                      </td>
                      <td className="px-6 py-3.5 max-w-[220px]">
                        <p className="font-semibold text-navy break-words">
                          {t.customerName}
                        </p>
                        <a
                          href={`tel:${t.customerPhone}`}
                          className="font-mono text-xs text-ink-muted tabular-nums hover:text-brand"
                        >
                          {t.customerPhone}
                        </a>
                      </td>
                      <td className="px-6 py-3.5 text-xs text-ink-body">
                        {t.serviceMode === "ONSITE"
                          ? "Sửa tại nhà BMT"
                          : "Tại cửa hàng"}
                      </td>
                      <td className="px-6 py-3.5 max-w-xs">
                        <p className="font-medium text-navy break-words">
                          {t.deviceType}
                        </p>
                        <p className="text-xs text-ink-muted break-words">
                          {t.serviceCategory}
                        </p>
                      </td>
                      <td className="px-6 py-3.5 whitespace-nowrap">
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-1 text-xs font-semibold",
                            st.badgeClass
                          )}
                        >
                          {st.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
