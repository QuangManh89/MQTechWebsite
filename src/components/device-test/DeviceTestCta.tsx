"use client";

import React from "react";
import Link from "next/link";
import { PhoneCall, ShieldCheck, ArrowRight } from "lucide-react";

interface DeviceTestCtaProps {
  testName: string;
  hardwareHint?: string;
}

export function DeviceTestCta({
  testName,
  hardwareHint = "Nếu thiết bị của bạn bị kẹt phím, đốm màn hình, rè loa, lỗi camera hoặc quá nhiệt khi chạy tác vụ nặng, đừng tự tháo máy tại nhà.",
}: DeviceTestCtaProps) {
  return (
    <section className="mt-12 rounded-2xl border border-surface-dark-border bg-surface-dark-card p-6 md:p-8 relative overflow-hidden">
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <p className="text-[13px] font-medium text-blue-400 mb-2">
            Kỹ thuật viên MQTech Buôn Ma Thuột
          </p>
          <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight text-balance">
            Phát Hiện Lỗi Sau Khi Kiểm Tra {testName}?
          </h3>
          <p className="mt-2 text-sm md:text-base text-neutral-300 leading-relaxed text-pretty">
            {hardwareHint} MQTech nhận kiểm tra trực tiếp, vệ sinh tra keo tản nhiệt, thay thế linh kiện chính hãng bảo hành dài lâu.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-neutral-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Linh kiện chuẩn &amp; Báo giá minh bạch
            </span>
            <span className="flex items-center gap-1.5">
              <PhoneCall className="h-4 w-4 text-blue-400" />
              Hỗ trợ tận nơi bán kính ~15 km BMT
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row w-full md:w-auto items-stretch sm:items-center gap-3 shrink-0">
          <Link
            href="/#yeu-cau-dich-vu"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-colors duration-150 text-sm active:scale-[0.98]"
          >
            <span>Gửi Yêu Cầu Sửa Chữa</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="tel:0987482573"
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-medium text-neutral-200 bg-surface-dark-elevated hover:bg-white/10 border border-surface-dark-border transition-colors duration-150 text-sm"
          >
            <PhoneCall className="h-4 w-4 text-blue-400" />
            <span>0987 482 573</span>
          </a>
        </div>
      </div>
    </section>
  );
}
