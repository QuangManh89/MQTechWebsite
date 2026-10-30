import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session.ts";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient.tsx";

export const metadata = {
  title: "Bảng Điều Khiển Quản Trị | MQTech — Computer Service",
  robots: {
    index: false,
    follow: false,
  },
};

async function AdminProtectedShell() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);

  if (!sessionCookie || !sessionCookie.value) {
    redirect("/admin/login");
  }

  const session = verifySessionToken(sessionCookie.value);
  if (!session) {
    redirect("/admin/login");
  }

  return <AdminDashboardClient currentUser={session} />;
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0A0B] text-white flex items-center justify-center font-sans">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            <p className="text-[13px] text-white/50">Đang xác thực quyền quản trị...</p>
          </div>
        </div>
      }
    >
      <AdminProtectedShell />
    </Suspense>
  );
}
