"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
    <div className="min-h-screen bg-brand-dark text-white flex flex-col justify-between p-6">
      <div className="flex items-center justify-between max-w-[1200px] w-full mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[13px] text-neutral-400 hover:text-white transition-colors duration-150"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Về trang chủ MQTech</span>
        </Link>
        <div className="flex items-center gap-2 text-[12px] text-neutral-400">
          <ShieldCheck className="h-4 w-4 text-blue-400" />
          <span>Cổng bảo mật nội bộ</span>
        </div>
      </div>

      <div className="w-full max-w-[420px] mx-auto my-12 animate-in fade-in duration-200">
        <div className="rounded-[24px] bg-surface-dark-card border border-surface-dark-border p-8">
          {/* Brand Lockup */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex items-center justify-center">
              <Image
                src="/logo/mq-tech-symbol.svg"
                alt="MQTech Logo Symbol"
                width={56}
                height={42}
                priority
                className="h-12 w-auto"
              />
            </div>
            <h1 className="text-[22px] font-bold tracking-tight text-white text-balance">
              Đăng Nhập Quản Trị
            </h1>
            <p className="text-[13px] text-neutral-400 mt-1 text-pretty">
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
                className="block text-[13px] font-medium text-neutral-300 mb-1.5"
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
                  className="w-full rounded-[12px] bg-surface-dark-elevated border border-surface-dark-border pl-10 pr-4 py-3 text-[14px] text-white placeholder-neutral-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-150"
                />
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[13px] font-medium text-neutral-300 mb-1.5"
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
                  className="w-full rounded-[12px] bg-surface-dark-elevated border border-surface-dark-border pl-10 pr-4 py-3 text-[14px] text-white placeholder-neutral-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-150"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[46px] rounded-full bg-white text-brand-dark font-semibold text-[14px] hover:bg-neutral-100 active:scale-[0.98] transition-colors duration-150 flex items-center justify-center gap-2 mt-6 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-brand-dark" />
                  <span>Đang xác thực…</span>
                </>
              ) : (
                <>
                  <span>Đăng nhập hệ thống</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[12.5px] text-neutral-400 leading-relaxed">
            Khu vực giới hạn. Mọi hành vi truy cập trái phép đều được ghi nhận và
            giới hạn theo địa chỉ IP.
          </p>
        </div>
      </div>

      <div className="text-center text-[12px] text-neutral-500">
        © 2026 MQTech (Computer Service) · Buôn Ma Thuột
      </div>
    </div>
  );
}
