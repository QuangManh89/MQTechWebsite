"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import {
  ClipboardList,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  Package,
  Settings,
  Tag,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/layout/BrandLogo";
import type { AdminRole } from "@/lib/auth";

const AdminRoleContext = createContext<AdminRole>("ADMIN");

export function useAdminRole(): AdminRole {
  return useContext(AdminRoleContext);
}

const ADMIN_LINKS: Array<{
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  editorAllowed?: boolean;
}> = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard, exact: true },
  { href: "/admin/phieu-sua", label: "Phiếu sửa & Lịch hẹn", icon: ClipboardList },
  { href: "/admin/khach-hang", label: "Khách hàng & Bảo hành", icon: Users },
  { href: "/admin/kho-hang", label: "Kho linh kiện", icon: Package },
  { href: "/admin/tai-chinh", label: "Thu chi & Lãi lỗ", icon: Wallet },
  { href: "/admin/dich-vu", label: "Dịch vụ", icon: Wrench, editorAllowed: true },
  { href: "/admin/bang-gia", label: "Bảng giá", icon: Tag },
  { href: "/admin/bai-viet", label: "Bài viết SEO", icon: FileText, editorAllowed: true },
  { href: "/admin/lien-he", label: "Câu hỏi liên hệ", icon: Mail },
  { href: "/admin/cai-dat", label: "Cài đặt & Thông báo", icon: Settings },
];

function isEditorAllowedPath(pathname: string): boolean {
  return (
    pathname.startsWith("/admin/bai-viet") ||
    pathname.startsWith("/admin/dich-vu")
  );
}

export function AdminShell({
  userEmail,
  userRole = "ADMIN",
  userName,
  children,
}: {
  userEmail: string;
  userRole?: AdminRole;
  userName?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const isRestrictedForEditor =
    userRole === "EDITOR" && !isEditorAllowedPath(pathname);

  useEffect(() => {
    if (isRestrictedForEditor) {
      router.replace("/admin/bai-viet");
    }
  }, [isRestrictedForEditor, router]);

  const visibleLinks =
    userRole === "EDITOR"
      ? ADMIN_LINKS.filter((item) => item.editorAllowed)
      : ADMIN_LINKS;

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <AdminRoleContext.Provider value={userRole}>
      <div className="min-h-screen bg-surface-subtle lg:flex">
        <a
          href="#admin-main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-brand focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-ink-inverse focus:shadow-lg"
        >
          Bỏ qua điều hướng đến nội dung quản trị
        </a>

        <aside className="w-full bg-navy text-ink-inverse-muted lg:w-64 lg:shrink-0 lg:min-h-screen flex flex-col justify-between">
          <div className="p-5 space-y-6">
            <BrandLogo
              brandName="MQTech Admin"
              subTagline={
                userRole === "EDITOR"
                  ? "BIÊN TẬP VIÊN NỘI DUNG"
                  : "QUẢN TRỊ HỆ THỐNG BMT"
              }
              variant="dark"
            />

            <nav
              aria-label="Điều hướng quản trị"
              className="flex flex-row gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0"
            >
              {visibleLinks.map((item) => {
                const Icon = item.icon;
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
                      active
                        ? "bg-brand text-ink-inverse"
                        : "text-ink-inverse-muted hover:bg-surface/10 hover:text-ink-inverse"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-navy-border p-4 space-y-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-semibold text-ink-inverse">
                  {userName || userEmail}
                </span>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                    userRole === "EDITOR"
                      ? "bg-brand/20 text-brand-glow"
                      : "bg-status-success-bg text-status-success-ink"
                  )}
                >
                  {userRole === "EDITOR" ? "Biên tập viên" : "Admin"}
                </span>
              </div>
              <p className="truncate text-ink-inverse-muted" title={userEmail}>
                {userEmail}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                target="_blank"
                className="flex-1 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-surface/10 px-3 py-2 font-semibold text-ink-inverse hover:bg-surface/20"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Xem web</span>
              </Link>
              <button
                type="button"
                disabled={loggingOut}
                onClick={() => void handleLogout()}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-status-danger-solid px-3.5 py-2 font-semibold text-ink-inverse hover:bg-status-danger-hover disabled:opacity-60"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{loggingOut ? "..." : "Thoát"}</span>
              </button>
            </div>
          </div>
        </aside>

        <main
          id="admin-main-content"
          tabIndex={-1}
          className="flex-1 p-5 sm:p-8 lg:p-10 min-w-0 outline-none"
        >
          {isRestrictedForEditor ? (
            <div className="rounded-2xl border border-line bg-surface p-6 text-sm text-ink-muted">
              Đang chuyển hướng về mục Bài viết SEO...
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </AdminRoleContext.Provider>
  );
}
