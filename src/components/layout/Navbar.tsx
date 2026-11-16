"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Menu, X, Clock, PhoneCall } from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-surface-dark-border bg-brand-dark/90 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] max-w-[1280px] items-center justify-between px-6 lg:px-8">
        {/* Brand Lockup */}
        <Link href="/" className="flex items-center gap-3 group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400" aria-label="MQTech — Trang chủ">
          <Image
            src="/logo/mq-tech-lockup-horizontal-white.svg"
            alt="MQTech — Computer Service"
            width={176}
            height={44}
            priority
            className="h-10 sm:h-11 w-auto transition-opacity duration-150 group-hover:opacity-90"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 text-[14px]">
          <Link
            href="/#dich-vu"
            className="text-neutral-300 hover:text-white transition-colors duration-200 font-medium whitespace-nowrap rounded-lg px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Dịch vụ
          </Link>
          <Link
            href="/cam-nang"
            className="text-neutral-300 hover:text-white transition-colors duration-200 font-medium whitespace-nowrap rounded-lg px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Cẩm nang
          </Link>
          <Link
            href="/device-test"
            className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-semibold flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
            <span>Kiểm tra thiết bị</span>
          </Link>
          <Link
            href="/#quy-trinh"
            className="text-neutral-300 hover:text-white transition-colors duration-200 font-medium whitespace-nowrap rounded-lg px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Quy trình
          </Link>
          <Link
            href="/#cam-ket"
            className="text-neutral-300 hover:text-white transition-colors duration-200 font-medium whitespace-nowrap rounded-lg px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Cam kết
          </Link>
          <Link
            href="/#lien-he"
            className="text-neutral-300 hover:text-white transition-colors duration-200 font-medium whitespace-nowrap rounded-lg px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Liên hệ
          </Link>
        </nav>

        {/* Right CTA & Operational Status */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="tel:0987482573"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[12.5px] font-semibold text-neutral-200 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            title="Gọi hotline kỹ thuật Buôn Ma Thuột 24/7"
          >
            <PhoneCall className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>0987 482 573</span>
          </a>

          {/* Live Status Pill */}
          <div className="hidden xl:flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] text-neutral-300 whitespace-nowrap">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
            <span className="font-medium text-neutral-200">Tiếp nhận yêu cầu</span>
            <span className="text-neutral-400">·</span>
            <span className="flex items-center gap-1 text-neutral-300">
              <Clock className="h-3 w-3 shrink-0" /> Buôn Ma Thuột
            </span>
          </div>

          {/* Primary CTA */}
          <Link
            href="#yeu-cau-dich-vu"
            className="group inline-flex h-10 items-center gap-2 rounded-full bg-white px-5 text-[13.5px] font-semibold text-brand-dark shadow-md transition-colors duration-200 hover:bg-neutral-100 active:scale-[0.98] whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <span>Yêu cầu dịch vụ</span>
            <ArrowRight className="h-3.5 w-3.5 opacity-70 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transform-none shrink-0" />
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          aria-label="Mở danh mục điều hướng"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/15 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
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
        <div className="md:hidden border-t border-white/10 bg-brand-dark px-6 py-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-4 text-[15px] font-medium text-neutral-200">
            <Link
              href="/#dich-vu"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white transition-colors duration-150"
            >
              Dịch vụ
            </Link>
            <Link
              href="/cam-nang"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white transition-colors duration-150"
            >
              Cẩm nang
            </Link>
            <Link
              href="/device-test"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-blue-400 font-semibold hover:text-blue-300 flex items-center gap-2 transition-colors duration-150"
            >
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              <span>Kiểm tra thiết bị (Hardware Test)</span>
            </Link>
            <Link
              href="/#quy-trinh"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white transition-colors duration-150"
            >
              Quy trình
            </Link>
            <Link
              href="#cam-ket"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white transition-colors duration-150"
            >
              Cam kết
            </Link>
            <Link
              href="#lien-he"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 hover:text-white transition-colors duration-150"
            >
              Liên hệ
            </Link>
          </nav>

          <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-[12px] text-neutral-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Phục vụ khu vực Buôn Ma Thuột (~15 km)</span>
            </div>
            <a
              href="tel:0987482573"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 text-white font-semibold text-[14px] transition-colors hover:bg-white/15"
            >
              <PhoneCall className="h-4 w-4 text-emerald-400" />
              <span>Hotline: 0987 482 573</span>
            </a>
            <Link
              href="#yeu-cau-dich-vu"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white text-brand-dark font-semibold text-[14px] shadow-md transition-colors duration-200 hover:bg-neutral-100"
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
