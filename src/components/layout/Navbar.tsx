"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, Clock } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#0A0A0B]/80 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between px-6 lg:px-8">
        {/* Brand Lockup */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="grid h-9 w-9 place-items-center rounded-[10px] bg-white text-[#0A0A0B] font-bold tracking-[-0.02em] text-[13px] shadow-sm transition-transform group-hover:scale-105">
            MQ
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-[-0.04em] text-white text-[15px] leading-tight">
              MQTech
            </span>
            <span className="text-[10px] tracking-[0.18em] text-white/40 font-medium uppercase leading-none mt-0.5">
              Computer Service
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-[14px]">
          <Link
            href="#dich-vu"
            className="text-white/60 hover:text-white transition-colors font-medium"
          >
            Dịch vụ
          </Link>
          <Link
            href="#quy-trinh"
            className="text-white/60 hover:text-white transition-colors font-medium"
          >
            Quy trình
          </Link>
          <Link
            href="#cam-ket"
            className="text-white/60 hover:text-white transition-colors font-medium"
          >
            Cam kết
          </Link>
          <Link
            href="#lien-he"
            className="text-white/60 hover:text-white transition-colors font-medium"
          >
            Liên hệ
          </Link>
        </nav>

        {/* Right CTA & Operational Status */}
        <div className="hidden md:flex items-center gap-4">
          {/* Live Status Pill */}
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] text-white/70">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)] animate-pulse" />
            <span className="font-medium">Tiếp nhận yêu cầu</span>
            <span className="text-white/30">•</span>
            <span className="flex items-center gap-1 text-white/50">
              <Clock className="h-3 w-3" /> Buôn Ma Thuột
            </span>
          </div>

          {/* Primary CTA */}
          <Link
            href="#yeu-cau-dich-vu"
            className="group inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-[13.5px] font-semibold text-[#0A0A0B] shadow-[0_8px_24px_rgba(255,255,255,0.14)] transition-all hover:bg-[#F5F5F7] hover:shadow-[0_12px_32px_rgba(255,255,255,0.22)] active:scale-[0.98]"
          >
            <span>Yêu cầu dịch vụ</span>
            <ArrowRight className="h-3.5 w-3.5 opacity-70 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          aria-label="Mở danh mục điều hướng"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0A0A0B] px-6 py-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-4 text-[15px] font-medium text-white/80">
            <Link
              href="#dich-vu"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Dịch vụ
            </Link>
            <Link
              href="#quy-trinh"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Quy trình
            </Link>
            <Link
              href="#cam-ket"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Cam kết
            </Link>
            <Link
              href="#lien-he"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white"
            >
              Liên hệ
            </Link>
          </nav>

          <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[12px] text-white/60">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Phục vụ khu vực Buôn Ma Thuột (~15 km)</span>
            </div>
            <Link
              href="#yeu-cau-dich-vu"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white text-[#0A0A0B] font-semibold text-[14px] shadow-md"
            >
              <span>Gửi yêu cầu dịch vụ</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
