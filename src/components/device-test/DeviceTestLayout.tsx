"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Keyboard,
  Monitor,
  Volume2,
  Mic,
  Camera,
  Cpu,
  ChevronRight,
  Home,
  CheckCircle2,
} from "lucide-react";
import { DEVICE_TESTS } from "@/components/device-test/types";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

interface DeviceTestLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const iconMap = {
  Keyboard,
  Monitor,
  Volume2,
  Mic,
  Camera,
  Cpu,
};

export function DeviceTestLayout({
  title,
  description,
  children,
}: DeviceTestLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-brand-dark text-white flex flex-col">
      {/* Top Sticky Site Navigation with Brand Logo */}
      <Navbar />

      <div className="flex-1 pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1280px] mx-auto">
          {/* Breadcrumb Navigation & Home Logo Bar */}
          <div className="flex items-center justify-between gap-4 mb-6 flex-wrap pb-4 border-b border-surface-dark-border/60">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-blue-500/40 hover:bg-white/[0.08] transition-colors duration-150 group"
              title="Bấm để quay về trang chủ MQTech"
              aria-label="Quay về trang chủ MQTech"
            >
              <Image
                src="/logo/mq-tech-symbol-white.svg"
                alt="MQTech"
                width={20}
                height={20}
                className="h-5 w-5"
              />
              <span className="text-xs font-semibold text-neutral-200 group-hover:text-blue-400 transition-colors duration-150">
                Trang chủ MQTech
              </span>
            </Link>

            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs text-neutral-400 flex-wrap"
            >
              <Link
                href="/"
                className="flex items-center gap-1 hover:text-white transition-colors duration-150"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Trang chủ</span>
              </Link>
              <ChevronRight className="h-3 w-3 text-neutral-600" />
              <Link
                href="/device-test"
                className="hover:text-white transition-colors duration-150"
              >
                <span>Kiểm tra thiết bị</span>
              </Link>
              <ChevronRight className="h-3 w-3 text-neutral-600" />
              <span className="text-neutral-200 font-medium">{title}</span>
            </nav>
          </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-semibold text-blue-400 mb-3">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>MQTech Diagnostic Tool: Chạy trực tiếp trên trình duyệt</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white text-balance">
            {title}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-neutral-300 max-w-3xl leading-relaxed text-pretty">
            {description}
          </p>
        </div>

        {/* Tool Selector Navigation Tabs */}
        <div className="mb-8 relative">
          <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-white/10">
            <div className="flex items-center gap-2 min-w-max border-b border-surface-dark-border pb-4">
              <Link
                href="/device-test"
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors duration-150 ${
                  pathname === "/device-test"
                    ? "bg-blue-600 text-white"
                    : "bg-surface-dark-card border border-surface-dark-border text-neutral-300 hover:bg-surface-dark-elevated hover:text-white"
                }`}
              >
                Tất cả công cụ
              </Link>

              {DEVICE_TESTS.map((test) => {
                const Icon = iconMap[test.iconName as keyof typeof iconMap] || Cpu;
                const isActive = pathname === test.path;

                return (
                  <Link
                    key={test.id}
                    href={test.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors duration-150 ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "bg-surface-dark-card border border-surface-dark-border text-neutral-300 hover:bg-surface-dark-elevated hover:text-white"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{test.shortTitle}</span>
                    {test.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-400/20 text-blue-300 font-bold">
                        {test.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Tool Content */}
        <main>{children}</main>
      </div>
    </div>
    {/* Site Footer with Logo and Business Info */}
    <Footer />
  </div>
);
}
