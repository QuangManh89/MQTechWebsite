"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Activity,
  AlertCircle,
  Camera,
  Check,
  CheckCircle2,
  Copy,
  Cpu,
  Headphones,
  Keyboard,
  Layers,
  Mic,
  Monitor,
  Phone,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { KeyboardTester } from "./KeyboardTester";
import { ScreenTester } from "./ScreenTester";
import { SpeakerTester } from "./SpeakerTester";
import { MicrophoneTester } from "./MicrophoneTester";
import { CameraTester } from "./CameraTester";
import { BenchmarkTester } from "./BenchmarkTester";

export type TestTab =
  | "tong-quan"
  | "ban-phim"
  | "man-hinh"
  | "loa"
  | "micro"
  | "camera"
  | "benchmark";

interface TestModuleMeta {
  id: TestTab;
  title: string;
  badge?: string;
  icon: typeof Keyboard;
  desc: string;
}

const MODULES: TestModuleMeta[] = [
  {
    id: "ban-phim",
    title: "Bàn Phím",
    badge: "Phổ biến",
    icon: Keyboard,
    desc: "Kiểm tra liệt phím, kẹt phím, đếm số phím nhận đồng thời (Rollover), chuyển đổi layout Windows/Mac.",
  },
  {
    id: "man-hinh",
    title: "Màn Hình",
    badge: "Chuẩn xác",
    icon: Monitor,
    desc: "Đo thông số màn hình thực tế (DPR, HDR, P3, Hz) và chế độ toàn màn hình 6 gam màu tìm điểm chết.",
  },
  {
    id: "loa",
    title: "Loa & Âm Thanh",
    icon: Headphones,
    desc: "Phát đoạn nhạc Stereo tách kênh Trái / Phải, kiểm tra âm trầm Bass 60Hz và dải tần phát hiện rè màng loa.",
  },
  {
    id: "micro",
    title: "Microphone",
    icon: Mic,
    desc: "Đo cường độ tín hiệu âm thanh (dB meter), thu âm mẫu 5 giây tự nghe lại và phát hiện vỡ tiếng.",
  },
  {
    id: "camera",
    title: "Camera / Webcam",
    icon: Camera,
    desc: "Xem video trực tiếp, phát hiện độ phân giải thực, lật gương và chụp ảnh thử nghiệm độ sắc nét.",
  },
  {
    id: "benchmark",
    title: "Đo Hiệu Năng",
    badge: "Stress Test",
    icon: Cpu,
    desc: "Đo tốc độ CPU & GPU (phép tính/µs), kiểm tra độ ổn định tản nhiệt và phát hiện tụt xung khi tải nặng.",
  },
];

type ModuleStatus = "good" | "issue" | "untested";

export function DeviceTestApp({ hotlineRaw }: { hotlineRaw: string }) {
  const [activeTab, setActiveTab] = useState<TestTab>("tong-quan");
  const [copied, setCopied] = useState(false);

  // Diagnostic Status Store
  const [statuses, setStatuses] = useState<Record<string, ModuleStatus>>({
    "ban-phim": "untested",
    "man-hinh": "untested",
    "loa": "untested",
    "micro": "untested",
    "camera": "untested",
    "benchmark": "untested",
  });

  // URL Hash Synchronization
  useEffect(() => {
    function readHash() {
      const hash = window.location.hash.replace("#", "") as TestTab;
      if (
        [
          "tong-quan",
          "ban-phim",
          "man-hinh",
          "loa",
          "micro",
          "camera",
          "benchmark",
        ].includes(hash)
      ) {
        setActiveTab(hash);
      }
    }

    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  const switchTab = useCallback((tab: TestTab) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      window.location.hash = tab === "tong-quan" ? "" : tab;
    }
    if (tab !== "tong-quan") {
      trackEvent("use_hardware_test", {
        test_module: tab,
        action: "open_module",
      });
    }
  }, []);

  function handleStatusUpdate(modId: string, status: ModuleStatus) {
    setStatuses((prev) => ({ ...prev, [modId]: status }));
    if (status !== "untested") {
      trackEvent("use_hardware_test", {
        test_module: modId,
        action: "mark_status",
        status,
      });
    }
  }

  // Generate formatted diagnostic summary text
  const getDiagnosticReport = useCallback(() => {
    const lines = [
      "=== BÁO CÁO KIỂM TRA THIẾT BỊ ONLINE (MQTECH BMT) ===",
      `Thời gian: ${new Date().toLocaleString("vi-VN")}`,
      "----------------------------------------",
      `1. Bàn phím: ${
        statuses["ban-phim"] === "good"
          ? "✅ Hoạt động tốt"
          : statuses["ban-phim"] === "issue"
          ? "⚠️ Phát hiện liệt / kẹt phím"
          : "Chưa kiểm tra"
      }`,
      `2. Màn hình: ${
        statuses["man-hinh"] === "good"
          ? "✅ Sắc nét, không điểm chết"
          : statuses["man-hinh"] === "issue"
          ? "⚠️ Có điểm chết / sọc / hở sáng"
          : "Chưa kiểm tra"
      }`,
      `3. Loa Stereo: ${
        statuses["loa"] === "good"
          ? "✅ Nghe rõ 2 bên, không rè"
          : statuses["loa"] === "issue"
          ? "⚠️ Rè / Mất tiếng 1 bên"
          : "Chưa kiểm tra"
      }`,
      `4. Microphone: ${
        statuses["micro"] === "good"
          ? "✅ Bắt tiếng trong trẻo"
          : statuses["micro"] === "issue"
          ? "⚠️ Nghẹt tiếng / rè / quá nhỏ"
          : "Chưa kiểm tra"
      }`,
      `5. Camera / Webcam: ${
        statuses["camera"] === "good"
          ? "✅ Hình ảnh rõ, đúng màu"
          : statuses["camera"] === "issue"
          ? "⚠️ Mờ kính / sọc / không nhận"
          : "Chưa kiểm tra"
      }`,
      `6. Hiệu năng & Nhiệt độ: ${
        statuses["benchmark"] === "good"
          ? "✅ Mát êm, ổn định"
          : statuses["benchmark"] === "issue"
          ? "⚠️ Nóng máy / quạt rú to / lag"
          : "Chưa kiểm tra"
      }`,
      "----------------------------------------",
      "Trung tâm cứu hộ & sửa chữa máy tính MQTech Buôn Ma Thuột",
      `Hotline/Zalo hỗ trợ kỹ thuật: 0987 482 573`,
    ];
    return lines.join("\n");
  }, [statuses]);

  async function handleCopyReport() {
    try {
      const text = getDiagnosticReport();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      trackEvent("use_hardware_test", {
        test_module: "all",
        action: "copy_report",
        issue_count: issueCount,
        good_count: goodCount,
      });
      toast.success("Đã sao chép kết quả chẩn đoán vào bộ nhớ tạm");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Không thể sao chép kết quả lúc này");
    }
  }

  // Calculate issue count
  const issueCount = Object.values(statuses).filter((s) => s === "issue").length;
  const goodCount = Object.values(statuses).filter((s) => s === "good").length;

  // Build target booking service & issue description
  let autoService = "Sửa Chữa Laptop Windows Chuyên Sâu";
  const issuesFound: string[] = [];
  if (statuses["ban-phim"] === "issue") issuesFound.push("liệt phím");
  if (statuses["man-hinh"] === "issue") issuesFound.push("lỗi màn hình điểm chết");
  if (statuses["loa"] === "issue") issuesFound.push("loa bị rè");
  if (statuses["micro"] === "issue") issuesFound.push("micro nghẹt tiếng");
  if (statuses["camera"] === "issue") issuesFound.push("camera mờ/sọc");
  if (statuses["benchmark"] === "issue") {
    issuesFound.push("máy bị nóng/quạt rú to");
    autoService = "Vệ Sinh & Tra Keo Tản Nhiệt Chuẩn Lab";
  }

  const bookingHref = `/dat-lich?dich_vu=${encodeURIComponent(
    autoService
  )}&mo_ta=${encodeURIComponent(
    `Phát hiện lỗi qua bộ test online: ${issuesFound.join(", ")}`
  )}`;

  return (
    <div className="space-y-8">
      {/* Horizontal Pill Navigation Bar (Bo tròn chuẩn 9999px) */}
      <div className="overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div
          role="tablist"
          aria-label="Chọn công cụ kiểm tra thiết bị"
          className="inline-flex min-w-full items-center gap-1.5 rounded-full border border-line bg-surface p-1.5 shadow-sm sm:flex-wrap sm:min-w-0"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "tong-quan"}
            onClick={() => switchTab("tong-quan")}
            className={cn(
              "inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors",
              activeTab === "tong-quan"
                ? "bg-brand text-ink-inverse shadow-sm"
                : "text-ink-muted hover:bg-surface-subtle hover:text-navy"
            )}
          >
            <Layers className="h-4 w-4" />
            <span>Tất cả công cụ</span>
          </button>

          {MODULES.map((m) => {
            const Icon = m.icon;
            const isCurrent = activeTab === m.id;
            const status = statuses[m.id];
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={isCurrent}
                onClick={() => switchTab(m.id)}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors",
                  isCurrent
                    ? "bg-brand text-ink-inverse shadow-sm"
                    : "text-ink-muted hover:bg-surface-subtle hover:text-navy"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{m.title}</span>
                {status === "good" && (
                  <span className="h-2 w-2 rounded-full bg-status-success-solid" />
                )}
                {status === "issue" && (
                  <span className="h-2 w-2 rounded-full bg-status-danger-solid" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT: Overview Grid */}
      {activeTab === "tong-quan" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              const status = statuses[mod.id];
              return (
                <div
                  key={mod.id}
                  className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-6 shadow-card transition-all hover:-translate-y-1 hover:border-brand/40 hover:shadow-card-hover"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-light text-brand">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex items-center gap-2">
                        {status === "good" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-status-success-bg px-2.5 py-0.5 text-xs font-semibold text-status-success-ink">
                            <Check className="h-3 w-3" /> Đạt
                          </span>
                        )}
                        {status === "issue" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-status-danger-bg px-2.5 py-0.5 text-xs font-semibold text-status-danger-ink">
                            <AlertCircle className="h-3 w-3" /> Có lỗi
                          </span>
                        )}
                        {mod.badge && status === "untested" && (
                          <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-semibold text-ink-muted">
                            {mod.badge}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h2 className="font-heading text-lg font-bold text-navy">
                        {mod.title}
                      </h2>
                      <p className="mt-1.5 text-xs text-ink-muted leading-relaxed">
                        {mod.desc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-line-subtle pt-4">
                    <button
                      type="button"
                      onClick={() => switchTab(mod.id)}
                      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-brand px-4 py-2.5 text-xs font-semibold text-ink-inverse shadow-sm hover:bg-brand-hover"
                    >
                      <span>Vào kiểm tra ngay</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Privacy & Technical Philosophy Banner */}
          <div className="rounded-2xl border border-line bg-surface-subtle p-6 text-xs text-ink-muted sm:p-8 space-y-3">
            <h3 className="font-heading text-sm font-bold text-navy flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand" />
              <span>Bảo mật dữ liệu tuyệt đối &amp; Không cần cài đặt phần mềm</span>
            </h3>
            <p className="leading-relaxed max-w-[58ch]">
              Toàn bộ bài kiểm tra bàn phím, màn hình, loa, microphone, webcam và hiệu
              năng CPU/GPU đều chạy 100% bằng các API tiêu chuẩn của trình duyệt web
              (Web Audio API, Canvas, MediaDevices, WebGL2, Web Workers). Không có bất
              kỳ âm thanh thu âm, hình ảnh webcam hay thông tin cá nhân nào được lưu
              trữ hay truyền về máy chủ.
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Individual Modules */}
      {activeTab === "ban-phim" && (
        <KeyboardTester onStatusChange={(st) => handleStatusUpdate("ban-phim", st)} />
      )}
      {activeTab === "man-hinh" && (
        <ScreenTester onStatusChange={(st) => handleStatusUpdate("man-hinh", st)} />
      )}
      {activeTab === "loa" && (
        <SpeakerTester onStatusChange={(st) => handleStatusUpdate("loa", st)} />
      )}
      {activeTab === "micro" && (
        <MicrophoneTester onStatusChange={(st) => handleStatusUpdate("micro", st)} />
      )}
      {activeTab === "camera" && (
        <CameraTester onStatusChange={(st) => handleStatusUpdate("camera", st)} />
      )}
      {activeTab === "benchmark" && (
        <BenchmarkTester onStatusChange={(st) => handleStatusUpdate("benchmark", st)} />
      )}

      {/* Floating Bottom Diagnostic Scorecard & Hand-off Bar */}
      <div className="rounded-2xl border border-navy-border bg-navy p-5 shadow-lg text-ink-inverse flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <span className="font-heading text-sm font-bold text-ink-inverse">
              Bảng chẩn đoán thiết bị
            </span>
            <span className="rounded-full bg-surface/10 px-2.5 py-0.5 font-mono text-xs text-brand-glow">
              {goodCount} Đạt • {issueCount} Cần xử lý
            </span>
          </div>
          <p className="text-xs text-ink-inverse-muted">
            {issueCount > 0
              ? `Hệ thống ghi nhận ${issueCount} sự cố phần cứng cần hỗ trợ kỹ thuật tại BMT.`
              : "Sao chép báo cáo kết quả kiểm tra hoặc đặt lịch bảo dưỡng trực tuyến."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleCopyReport}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-navy-border bg-surface/10 px-4 py-2 text-xs font-semibold text-ink-inverse hover:bg-surface/20"
          >
            {copied ? (
              <Check className="h-4 w-4 text-status-success-solid" />
            ) : (
              <Copy className="h-4 w-4 text-brand-glow" />
            )}
            <span>{copied ? "Đã sao chép!" : "Sao chép kết quả"}</span>
          </button>

          {issueCount > 0 ? (
            <Link
              href={bookingHref}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-ink-inverse shadow-md shadow-black/25 hover:bg-brand-hover"
            >
              <Wrench className="h-4 w-4" />
              <span>Đặt lịch sửa lỗi này ngay</span>
            </Link>
          ) : (
            <Link
              href="/dat-lich"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-ink-inverse shadow-md shadow-black/25 hover:bg-brand-hover"
            >
              <Wrench className="h-4 w-4" />
              <span>Đặt lịch bảo dưỡng</span>
            </Link>
          )}

          <a
            href={`tel:${hotlineRaw}`}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-surface/20 bg-surface/5 px-4 py-2 font-mono text-xs font-semibold text-ink-inverse hover:bg-surface/15 tabular-nums"
          >
            <Phone className="h-3.5 w-3.5 text-brand-glow" />
            <span>0987 482 573</span>
          </a>
        </div>
      </div>
    </div>
  );
}
