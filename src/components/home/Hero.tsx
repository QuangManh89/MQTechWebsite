import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Laptop,
  Activity,
  MapPin,
} from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0A0A0B] text-white pt-10 pb-20 lg:pt-16 lg:pb-28">
      {/* Ambient Radial Lighting Glows */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[30%] left-1/2 h-[800px] w-[1100px] -translate-x-1/2 rounded-full bg-[#3B82F6]/15 blur-[160px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-[#3B82F6]/10 blur-[120px]"
      />

      <div className="relative mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        {/* Left Column: Headline & Action */}
        <div className="flex flex-col items-start">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-[11px] tracking-[0.12em] uppercase font-medium text-white/80">
            <span className="grid h-4 w-4 place-items-center rounded-full bg-[#3B82F6] text-white">
              <ShieldCheck className="h-2.5 w-2.5" />
            </span>
            <span>Kỹ thuật viên máy tính tại Buôn Ma Thuột</span>
          </div>

          {/* Display Headline */}
          <h1 className="mt-6 text-balance text-[38px] font-bold leading-[1.05] tracking-[-0.04em] sm:text-[52px] lg:text-[62px]">
            Sửa đúng bệnh.{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
                Báo giá rõ ràng
              </span>
              <span
                aria-hidden="true"
                className="absolute bottom-[0.15em] left-0 h-[0.26em] w-full bg-[#3B82F6]/30 -rotate-[1deg] rounded-sm"
              />
            </span>{" "}
            trước khi sửa.
          </h1>

          {/* Subheading */}
          <p className="mt-6 max-w-[540px] text-[16px] leading-[1.65] text-white/70">
            Dịch vụ sửa chữa Laptop, PC, mạng LAN/Wi-Fi và hỗ trợ kỹ thuật tận
            nơi cho cá nhân & doanh nghiệp tại Buôn Ma Thuột. Kiểm tra lỗi minh
            bạch, khách đồng ý mới tiến hành.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="#yeu-cau-dich-vu"
              className="group inline-flex h-[48px] items-center gap-3 rounded-full bg-white px-6 text-[14px] font-semibold text-[#0A0A0B] shadow-[0_12px_32px_rgba(255,255,255,0.14)] transition-all hover:bg-[#F5F5F7] hover:shadow-[0_16px_40px_rgba(255,255,255,0.22)] active:scale-[0.98]"
            >
              <span>Yêu cầu sửa chữa</span>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#0A0A0B] text-white transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>

            <Link
              href="#dich-vu"
              className="inline-flex h-[48px] items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-6 text-[14px] font-medium text-white/80 backdrop-blur transition hover:bg-white/[0.12] hover:text-white"
            >
              <span>Khám phá 6 dịch vụ</span>
            </Link>
          </div>

          {/* 3-Column Trust Strip */}
          <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-8 w-full max-w-[540px]">
            <div>
              <div className="text-[20px] font-bold tracking-tight text-white flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-[#3B82F6]" /> ~15 km
              </div>
              <div className="mt-1 text-[12px] text-white/50">
                Bán kính phục vụ BMT
              </div>
            </div>
            <div>
              <div className="text-[20px] font-bold tracking-tight text-white flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-emerald-400" /> 2 Hình thức
              </div>
              <div className="mt-1 text-[12px] text-white/50">
                Tại tiệm & Tận nơi
              </div>
            </div>
            <div>
              <div className="text-[20px] font-bold tracking-tight text-white flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-[#3B82F6]" /> 100%
              </div>
              <div className="mt-1 text-[12px] text-white/50">
                Báo giá trước khi sửa
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry & Diagnostic Console Card */}
        <div className="relative">
          <div className="rounded-[24px] border border-white/10 bg-[#121214] p-6 lg:p-8 shadow-2xl backdrop-blur relative overflow-hidden">
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 text-[12px]">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white/90">
                  HỆ THỐNG TIẾP NHẬN SẴN SÀNG
                </span>
              </div>
              <span className="text-white/40 font-mono text-[11px]">
                MQTECH LAB
              </span>
            </div>

            {/* Diagnostic Monitor Items */}
            <div className="mt-6 space-y-4">
              <div className="rounded-[16px] bg-white/[0.03] border border-white/[0.06] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#3B82F6]/15 text-[#3B82F6]">
                    <Laptop className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-white">
                      Tiếp nhận Laptop & PC
                    </h3>
                    <p className="text-[12px] text-white/50">
                      Chẩn đoán lỗi nguồn, màn hình, phần cứng
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/80">
                  Tại tiệm / Tận nơi
                </span>
              </div>

              <div className="rounded-[16px] bg-white/[0.03] border border-white/[0.06] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-emerald-500/15 text-emerald-400">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold text-white">
                      Xử lý hệ thống & Phần mềm
                    </h3>
                    <p className="text-[12px] text-white/50">
                      Windows chuẩn, tối ưu tốc độ, bảo toàn dữ liệu
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
                  Bảo toàn dữ liệu
                </span>
              </div>
            </div>

            {/* Workflow Notice */}
            <div className="mt-6 rounded-[14px] bg-[#3B82F6]/10 border border-[#3B82F6]/20 p-4">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#3B82F6] shrink-0 mt-0.5" />
                <div className="text-[12.5px] leading-relaxed text-white/80">
                  <strong className="text-white">Quy trình minh bạch:</strong>{" "}
                  Yêu cầu của bạn được nhân viên liên hệ xác nhận qua Điện thoại
                  hoặc Zalo trước khi tiếp nhận và kiểm tra.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
