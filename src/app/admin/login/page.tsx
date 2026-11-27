"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Lock } from "lucide-react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/layout/BrandLogo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("manhquang89@gmail.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg("Vui lòng nhập đầy đủ Email và Mật khẩu quản trị.");
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15_000);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error || "Email hoặc mật khẩu chưa chính xác.";
        setErrorMsg(msg);
        toast.error(msg);
        return;
      }
      toast.success("Đăng nhập thành công");
      router.push(data.user?.role === "EDITOR" ? "/admin/bai-viet" : "/admin");
      router.refresh();
    } catch (err) {
      const isTimeout = err instanceof DOMException && err.name === "AbortError";
      setErrorMsg(
        isTimeout
          ? "Máy chủ phản hồi quá hạn 15 giây. Vui lòng thử đăng nhập lại."
          : "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại."
      );
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy px-4">
      <div className="w-full max-w-md rounded-2xl border border-navy-border bg-surface p-8 shadow-2xl space-y-6">
        <div className="flex justify-center">
          <BrandLogo
            brandName="MQTech - Sửa Máy Tính Tại Nhà BMT"
            subTagline="QUẢN TRỊ HỆ THỐNG BMT"
            variant="light"
          />
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-status-danger-line bg-status-danger-bg p-3.5 text-xs font-medium text-status-danger-ink"
          >
            <AlertCircle
              className="h-4 w-4 shrink-0 text-status-danger-ink mt-0.5"
              aria-hidden="true"
            />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="adminEmail"
              className="block text-sm font-semibold text-navy mb-1.5"
            >
              Email quản trị
            </label>
            <input
              id="adminEmail"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              className="min-h-12 w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-navy sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="adminPassword"
              className="block text-sm font-semibold text-navy mb-1.5"
            >
              Mật khẩu
            </label>
            <input
              id="adminPassword"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Nhập mật khẩu quản trị"
              className="min-h-12 w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-navy sm:text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-ink-inverse shadow-brand-glow hover:bg-brand-hover disabled:opacity-60"
          >
            <Lock className="h-4 w-4" aria-hidden="true" />
            <span>{loading ? "Đang xác thực..." : "Đăng nhập Admin"}</span>
          </button>
        </form>

        <p className="text-center text-xs text-ink-muted">
          Mật khẩu mặc định lần đầu:{" "}
          <span className="font-mono font-semibold text-navy">MQTech@2026</span>{" "}
          (nên đổi ngay trong mục Cài đặt).
        </p>
      </div>
    </main>
  );
}
