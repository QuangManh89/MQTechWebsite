"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Expand,
  Info,
  Maximize2,
  Monitor,
  RotateCcw,
  ShieldAlert,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ScreenSpecs {
  cssRes: string;
  physicalRes: string;
  dpr: string;
  colorDepth: string;
  wideGamut: string;
  hdr: string;
  refreshRate: number | null;
}

const TEST_COLORS = [
  { name: "Trắng thuần (White #FFFFFF)", bg: "#ffffff", textDark: true },
  { name: "Đen sâu (Black #000000)", bg: "#000000", textDark: false },
  { name: "Đỏ tươi (Red #FF0000)", bg: "#ff0000", textDark: false },
  { name: "Xanh lá (Green #00FF00)", bg: "#00ff00", textDark: true },
  { name: "Xanh dương (Blue #0000FF)", bg: "#0000ff", textDark: false },
  { name: "Dải màu xám bậc thang (Grayscale)", bg: "linear-gradient(to right, #0b1120 0%, #1e293b 25%, #475569 50%, #dde5f0 75%, #ffffff 100%)", textDark: false },
];

export function ScreenTester({
  onStatusChange,
}: {
  onStatusChange?: (status: "good" | "issue" | "untested") => void;
}) {
  const [specs, setSpecs] = useState<ScreenSpecs>({
    cssRes: "Đang đo...",
    physicalRes: "Đang đo...",
    dpr: "1.0",
    colorDepth: "24-bit",
    wideGamut: "Đang kiểm tra...",
    hdr: "Đang kiểm tra...",
    refreshRate: null,
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const [userFeedback, setUserFeedback] = useState<"good" | "issue" | null>(null);

  const fullscreenContainerRef = useRef<HTMLDivElement | null>(null);

  // Measure display specs & refresh rate
  useEffect(() => {
    if (typeof window === "undefined") return;

    const dpr = window.devicePixelRatio || 1;
    const w = window.screen.width;
    const h = window.screen.height;
    const physW = Math.round(w * dpr);
    const physH = Math.round(h * dpr);

    const isP3 = window.matchMedia("(color-gamut: p3)").matches;
    const isHdr = window.matchMedia("(dynamic-range: high)").matches;

    setSpecs((prev) => ({
      ...prev,
      cssRes: `${w} × ${h} px`,
      physicalRes: `${physW} × ${physH} px`,
      dpr: dpr.toFixed(2),
      colorDepth: `${window.screen.colorDepth || 24}-bit`,
      wideGamut: isP3 ? "Có (DCI-P3)" : "Tiêu chuẩn (sRGB)",
      hdr: isHdr ? "Có (HDR)" : "Không (SDR)",
    }));

    // Estimate refresh rate via requestAnimationFrame
    let frames = 0;
    let startTime = performance.now();
    let animId: number;

    function countFrames(time: number) {
      frames++;
      if (time - startTime >= 1000) {
        const fps = Math.round((frames * 1000) / (time - startTime));
        setSpecs((s) => ({ ...s, refreshRate: fps }));
      } else {
        animId = requestAnimationFrame(countFrames);
      }
    }
    animId = requestAnimationFrame(countFrames);

    return () => cancelAnimationFrame(animId);
  }, []);

  // Listen for fullscreen change events
  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  // Key navigation in fullscreen
  useEffect(() => {
    if (!isFullscreen) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setColorIndex((idx) => (idx + 1) % TEST_COLORS.length);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setColorIndex((idx) => (idx - 1 + TEST_COLORS.length) % TEST_COLORS.length);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isFullscreen]);

  async function handleStartTest() {
    try {
      if (fullscreenContainerRef.current) {
        await fullscreenContainerRef.current.requestFullscreen();
        setColorIndex(0);
      }
    } catch {
      // Fallback if fullscreen is blocked by browser policy
      setIsFullscreen(true);
    }
  }

  function handleExitFullscreen() {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      setIsFullscreen(false);
    }
  }

  function handleFeedback(status: "good" | "issue") {
    setUserFeedback(status);
    onStatusChange?.(status);
  }

  const currentColor = TEST_COLORS[colorIndex];

  return (
    <div className="space-y-6">
      {/* Hardware Specs Table Card */}
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-subtle pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-light text-brand">
              <Monitor className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-base font-bold text-navy">
                Thông số phần cứng màn hình (Auto Detected)
              </h2>
              <p className="text-xs text-ink-muted">
                Được nhận diện tự động từ GPU và trình điều khiển hiển thị của hệ thống
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleStartTest}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-ink-inverse shadow-brand-glow hover:bg-brand-hover"
          >
            <Maximize2 className="h-4 w-4" />
            <span>Bắt đầu kiểm tra toàn màn hình</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7 text-xs">
          <div className="rounded-xl border border-line-subtle bg-surface-subtle p-3">
            <span className="text-ink-muted block text-xs">Độ phân giải CSS</span>
            <strong className="font-mono text-navy text-sm font-bold block mt-1">
              {specs.cssRes}
            </strong>
          </div>
          <div className="rounded-xl border border-line-subtle bg-surface-subtle p-3">
            <span className="text-ink-muted block text-xs">Độ phân giải thực</span>
            <strong className="font-mono text-navy text-sm font-bold block mt-1">
              {specs.physicalRes}
            </strong>
          </div>
          <div className="rounded-xl border border-line-subtle bg-surface-subtle p-3">
            <span className="text-ink-muted block text-xs">Pixel Ratio (DPR)</span>
            <strong className="font-mono text-brand text-sm font-bold block mt-1">
              {specs.dpr}x
            </strong>
          </div>
          <div className="rounded-xl border border-line-subtle bg-surface-subtle p-3">
            <span className="text-ink-muted block text-xs">Độ sâu màu</span>
            <strong className="font-mono text-navy text-sm font-bold block mt-1">
              {specs.colorDepth}
            </strong>
          </div>
          <div className="rounded-xl border border-line-subtle bg-surface-subtle p-3">
            <span className="text-ink-muted block text-xs">Dải màu rộng</span>
            <strong className="text-navy text-sm font-bold block mt-1">
              {specs.wideGamut}
            </strong>
          </div>
          <div className="rounded-xl border border-line-subtle bg-surface-subtle p-3">
            <span className="text-ink-muted block text-xs">Hỗ trợ HDR</span>
            <strong className="text-navy text-sm font-bold block mt-1">
              {specs.hdr}
            </strong>
          </div>
          <div className="rounded-xl border border-line-subtle bg-surface-subtle p-3">
            <span className="text-ink-muted block text-xs">Tần số quét</span>
            <strong className="font-mono text-brand text-sm font-bold block mt-1">
              {specs.refreshRate ? `${specs.refreshRate} Hz` : "Đo..."}
            </strong>
          </div>
        </div>
      </div>

      {/* Inline Preview / Launch Screen Card */}
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-card space-y-5">
        <div>
          <h3 className="font-heading text-base font-bold text-navy mb-1">
            Quy trình kiểm tra điểm chết (Dead Pixel) &amp; Hở sáng (Bleed)
          </h3>
          <p className="text-xs text-ink-muted leading-relaxed">
            Hệ thống sẽ chuyển toàn bộ màn hình sang 6 gam màu đơn sắc. Hãy quan sát
            kỹ bề mặt màn hình để tìm các đốm đen bất thường (điểm chết), chấm sáng cố định
            (điểm kẹt màu) hoặc viền màn hình bị lọt sáng loang lổ.
          </p>
        </div>

        {/* 6 Color Swatches */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
          {TEST_COLORS.map((col, idx) => (
            <button
              key={col.name}
              type="button"
              onClick={() => {
                setColorIndex(idx);
                void handleStartTest();
              }}
              className="group flex flex-col items-center gap-2 rounded-xl border border-line p-3 text-center transition-all hover:border-brand/40 hover:shadow-sm"
            >
              <div
                className="h-12 w-full rounded-lg border border-line shadow-inner"
                style={{ background: col.bg }}
              />
              <span className="text-xs font-medium text-ink-body group-hover:text-brand line-clamp-1">
                {col.name.split(" (")[0]}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line-subtle pt-4">
          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <Info className="h-4 w-4 text-brand shrink-0" />
            <span>Phím tắt trong chế độ test: Bấm chuột hoặc Space để đổi màu • Nhấn Esc để thoát</span>
          </div>

          <button
            type="button"
            onClick={handleStartTest}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-xs font-semibold text-ink-inverse shadow-brand-glow hover:bg-brand-hover"
          >
            <Expand className="h-4 w-4" />
            <span>Kiểm tra toàn màn hình ngay</span>
          </button>
        </div>
      </div>

      {/* Diagnostic Evaluation Card */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-card flex flex-col justify-between sm:flex-row sm:items-center gap-4">
        <div className="space-y-1">
          <h3 className="font-heading text-sm font-bold text-navy">
            Ghi nhận kết quả kiểm tra màn hình
          </h3>
          <p className="text-xs text-ink-muted">
            Màn hình của bạn có điểm chết, sọc chỉ, đốm ố lót hay hở sáng không?
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleFeedback("good")}
            className={cn(
              "min-h-11 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
              userFeedback === "good"
                ? "border-status-success-solid bg-status-success-bg text-status-success-ink"
                : "border-line bg-surface text-ink-body hover:border-brand/40"
            )}
          >
            <CheckCircle2 className="h-4 w-4 text-status-success-solid" />
            <span>Hiển thị sắc nét, không lỗi</span>
          </button>
          <button
            type="button"
            onClick={() => handleFeedback("issue")}
            className={cn(
              "min-h-11 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
              userFeedback === "issue"
                ? "border-status-danger-solid bg-status-danger-bg text-status-danger-ink"
                : "border-line bg-surface text-ink-body hover:border-brand/40"
            )}
          >
            <AlertCircle className="h-4 w-4 text-status-danger-solid" />
            <span>Có điểm chết / sọc / hở sáng</span>
          </button>
        </div>
      </div>

      {userFeedback === "issue" && (
        <div className="rounded-2xl border border-status-danger-line bg-status-danger-bg p-5 text-xs text-status-danger-ink flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <p className="font-bold text-sm flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Phát hiện lỗi tấm nền / cáp màn hình</span>
            </p>
            <p className="leading-relaxed">
              MQTech nhận thay màn hình Laptop HD, FHD, IPS, 2K/144Hz chính hãng lấy ngay 30 - 45 phút, bảo hành 6 - 12 tháng tại Buôn Ma Thuột.
            </p>
          </div>
          <Link
            href={`/dat-lich?dich_vu=${encodeURIComponent(
              "Sửa Chữa Laptop Windows Chuyên Sâu"
            )}&mo_ta=${encodeURIComponent("Màn hình có điểm chết / sọc / hở sáng qua test online")}`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-ink-inverse shadow-sm hover:bg-brand-hover shrink-0"
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>Đặt lịch kiểm tra màn hình</span>
          </Link>
        </div>
      )}

      {/* FULLSCREEN TEST OVERLAY */}
      <div
        ref={fullscreenContainerRef}
        onClick={() => setColorIndex((idx) => (idx + 1) % TEST_COLORS.length)}
        className={cn(
          "fixed inset-0 z-50 flex flex-col justify-between p-6 select-none cursor-pointer transition-colors duration-150",
          isFullscreen ? "flex" : "hidden"
        )}
        style={{ background: currentColor.bg }}
      >
        <div className="flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity">
          <span
            className={cn(
              "rounded-full px-3 py-1 font-mono text-xs font-semibold shadow-sm",
              currentColor.textDark
                ? "bg-navy/10 text-navy"
                : "bg-surface/20 text-ink-inverse"
            )}
          >
            {colorIndex + 1} / {TEST_COLORS.length}: {currentColor.name}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleExitFullscreen();
            }}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold shadow-md",
              currentColor.textDark
                ? "bg-navy text-ink-inverse hover:bg-navy/80"
                : "bg-surface text-navy hover:bg-surface-subtle"
            )}
          >
            Thoát (Esc)
          </button>
        </div>

        <div className="text-center opacity-40 hover:opacity-100 transition-opacity">
          <p
            className={cn(
              "text-xs font-medium",
              currentColor.textDark ? "text-navy" : "text-ink-inverse"
            )}
          >
            Bấm bất kỳ đâu hoặc dùng phím mũi tên để đổi màu tiếp theo
          </p>
        </div>
      </div>
    </div>
  );
}
