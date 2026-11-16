import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { DEVICE_TESTS } from "@/components/device-test/types";
import {
  Keyboard,
  Monitor,
  Volume2,
  Mic,
  Camera,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DeviceTestCta } from "@/components/device-test/DeviceTestCta";

export const metadata: Metadata = {
  title: "Kiểm Tra Thiết Bị Online — Test Bàn Phím, Màn Hình, Loa, Mic, Camera | MQTech",
  description:
    "Bộ công cụ kiểm tra phần cứng máy tính và laptop trực tiếp trên trình duyệt từ MQTech Buôn Ma Thuột. Chẩn đoán phím liệt, điểm chết màn hình, loa rè, microphone và đo benchmark CPU/GPU hoàn toàn miễn phí.",
  keywords: [
    "kiểm tra máy tính online",
    "test ban phim laptop",
    "test man hinh diem chet",
    "test loa rè",
    "test microphone online",
    "test webcam",
    "benchmark máy tính online",
    "MQTech",
  ],
};

const iconMap = {
  Keyboard,
  Monitor,
  Volume2,
  Mic,
  Camera,
  Cpu,
};

export default function DeviceTestHubPage() {
  return (
    <div className="min-h-screen bg-brand-dark text-white flex flex-col">
      {/* Top Sticky Site Navigation with Brand Logo */}
      <Navbar />

      <div className="flex-1 pt-8 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1280px] mx-auto">
          {/* Header Hero */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="flex justify-center mb-6">
              <Link
                href="/"
                className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-blue-500/40 hover:bg-white/[0.08] transition-colors duration-150 group"
                title="Bấm để quay về trang chủ MQTech"
                aria-label="Quay về trang chủ MQTech"
              >
                <Image
                  src="/logo/mq-tech-lockup-horizontal-white.svg"
                  alt="MQTech — Computer Service"
                  width={150}
                  height={42}
                  priority
                  className="h-8 w-auto"
                />
              </Link>
            </div>
            <p className="text-[13px] font-medium text-blue-400 mb-2">
              MQTech Hardware Diagnostics
            </p>
          <h1 className="text-balance text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Bộ Công Cụ Kiểm Tra Thiết Bị &amp; Phần Cứng Online
          </h1>
          <p className="text-pretty mt-4 text-sm sm:text-base text-neutral-300 leading-relaxed max-w-[65ch] mx-auto">
            Chẩn đoán nhanh chóng tình trạng bàn phím, màn hình, loa, micro, camera và hiệu năng máy tính của bạn hoàn toàn trên trình duyệt. Không cần cài đặt phần mềm ngoài, đảm bảo an toàn và bảo mật 100%.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Bảo mật 100% (Xử lý cục bộ)
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-blue-400" />
              Chạy trực tiếp không cần cài đặt
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-blue-400" />
              Hỗ trợ cả Windows &amp; macOS
            </span>
          </div>
        </div>

        {/* 6 Hardware Diagnostic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEVICE_TESTS.map((test) => {
            const Icon = iconMap[test.iconName as keyof typeof iconMap] || Cpu;

            return (
              <Link
                key={test.id}
                href={test.path}
                className="group relative rounded-2xl border border-surface-dark-border bg-surface-dark-card p-6 transition-colors duration-200 hover:border-blue-500/40 hover:bg-surface-dark-elevated flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 transition-colors">
                      <Icon className="h-6 w-6" />
                    </div>
                    {test.badge ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                        {test.badge}
                      </span>
                    ) : (
                      <span className="text-[12px] text-neutral-400">Công cụ #{test.id}</span>
                    )}
                  </div>

                  <h2 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors duration-150">
                    {test.title}
                  </h2>
                  <p className="mt-2 text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    {test.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-semibold text-blue-400">
                  <span>Mở công cụ kiểm tra</span>
                  <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Master CTA */}
        <DeviceTestCta
          testName="Thiết Bị Toàn Diện"
          hardwareHint="Bạn vừa kiểm tra xong và phát hiện máy tính có lỗi phần cứng cần thay thế hoặc sửa chữa? Đội ngũ kỹ thuật viên MQTech tại Buôn Ma Thuột luôn sẵn sàng hỗ trợ bạn nhanh chóng và tận tâm."
        />
      </div>
    </div>
    {/* Site Footer with Logo and Business Info */}
    <Footer />
  </div>
);
}
