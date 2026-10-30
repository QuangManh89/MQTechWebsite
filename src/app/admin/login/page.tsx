"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, User, ArrowRight, Loader2, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Đăng nhập không thành công.");
        return;
      }

      // Redirect to Admin Dashboard upon success
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Không thể kết nối đến máy chủ xác thực.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col justify-between p-6">
      <div className="flex items-center justify-between max-w-[1200px] w-full mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[13px] text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Về trang chủ MQTech</span>
        </Link>
        <div className="flex items-center gap-2 text-[12px] text-white/40">
          <ShieldCheck className="h-4 w-4 text-[#3B82F6]" />
          <span>Cổng bảo mật nội bộ</span>
        </div>
      </div>

      <div className="w-full max-w-[420px] mx-auto my-12 animate-in fade-in duration-200">
        <div className="rounded-[24px] bg-[#121214] border border-white/10 p-8 shadow-2xl backdrop-blur">
          {/* Brand Lockup */}
          <div className="flex flex-col items-center text-center">
            <div className="grid h-12 w-12 place-items-center rounded-[14px] bg-white text-[#0A0A0B] font-bold text-[16px] shadow-sm mb-4">
              MQ
            </div>
            <h1 className="text-[22px] font-bold tracking-tight text-white">
              Đăng Nhập Quản Trị
            </h1>
            <p className="text-[13px] text-white/50 mt-1">
              Hệ thống quản lý và xử lý yêu cầu dịch vụ MQTech
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-[12px] bg-red-500/10 border border-red-500/20 p-3.5 text-[13px] text-red-400 text-center"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-[13px] font-medium text-white/70 mb-1.5"
              >
                Tên đăng nhập
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tài khoản quản trị"
                  className="w-full rounded-[12px] bg-white/[0.04] border border-white/10 pl-10 pr-4 py-3 text-[14px] text-white placeholder-white/30 outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition"
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[13px] font-medium text-white/70 mb-1.5"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full rounded-[12px] bg-white/[0.04] border border-white/10 pl-10 pr-4 py-3 text-[14px] text-white placeholder-white/30 outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[46px] rounded-full bg-white text-[#0A0A0B] font-semibold text-[14px] shadow-md hover:bg-[#F5F5F7] active:scale-[0.98] transition flex items-center justify-center gap-2 mt-6 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-[#0A0A0B]" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập hệ thống</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] text-white/40 leading-relaxed">
            Khu vực giới hạn. Mọi hành vi truy cập trái phép đều được ghi nhận và
            giới hạn theo địa chỉ IP.
          </p>
        </div>
      </div>

      <div className="text-center text-[12px] text-white/30">
        © 2026 MQTech — Computer Service • Buôn Ma Thuột
      </div>
    </div>
  );
}
