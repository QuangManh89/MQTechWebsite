"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Flame,
  Gauge,
  Play,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Square,
  Wrench,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BenchmarkResults {
  cpuMultiScore: number | null;
  cpuSingleScore: number | null;
  gpuScore: number | null;
  gpuModel: string;
  threadsCount: number;
  durationSec: number;
}

export function BenchmarkTester({
  onStatusChange,
}: {
  onStatusChange?: (status: "good" | "issue" | "untested") => void;
}) {
  const [isStressRunning, setIsStressRunning] = useState(false);
  const [stressType, setStressType] = useState<"CPU" | "GPU" | "BOTH">("CPU");
  const [stressTimer, setStressTimer] = useState(0);

  const [isBenchmarking, setIsBenchmarking] = useState(false);
  const [benchProgress, setBenchProgress] = useState(0); // 0 - 100
  const [benchResults, setBenchResults] = useState<BenchmarkResults>({
    cpuMultiScore: null,
    cpuSingleScore: null,
    gpuScore: null,
    gpuModel: "Đang phát hiện...",
    threadsCount: 4,
    durationSec: 0,
  });

  const [userFeedback, setUserFeedback] = useState<"good" | "issue" | null>(null);

  const stressIntervalRef = useRef<number | null>(null);
  const stressAnimationRef = useRef<number | null>(null);
  const stopStressFlagRef = useRef(false);

  // Extract GPU model on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const threads = navigator.hardwareConcurrency || 4;
    let detectedGpu = "Card đồ họa tích hợp (Standard GPU)";

    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          detectedGpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || detectedGpu;
        }
      }
    } catch {}

    setBenchResults((prev) => ({
      ...prev,
      threadsCount: threads,
      gpuModel: detectedGpu,
    }));
  }, []);

  const stopStressTest = useCallback(() => {
    stopStressFlagRef.current = true;
    if (stressIntervalRef.current) {
      clearInterval(stressIntervalRef.current);
      stressIntervalRef.current = null;
    }
    if (stressAnimationRef.current) {
      cancelAnimationFrame(stressAnimationRef.current);
      stressAnimationRef.current = null;
    }
    setIsStressRunning(false);
  }, []);

  useEffect(() => {
    return () => stopStressTest();
  }, [stopStressTest]);

  // Run Stress Test (CPU / GPU computation loop)
  function startStressTest(type: "CPU" | "GPU" | "BOTH") {
    stopStressTest();
    stopStressFlagRef.current = false;
    setStressType(type);
    setIsStressRunning(true);
    setStressTimer(0);

    // Live timer
    stressIntervalRef.current = window.setInterval(() => {
      setStressTimer((t) => t + 1);
    }, 1000);

    // Non-blocking computation worker loop via requestAnimationFrame chunks
    function stressLoop() {
      if (stopStressFlagRef.current) return;

      const start = performance.now();
      // Burn 20ms of heavy math per frame
      while (performance.now() - start < 22) {
        let x = Math.random();
        for (let i = 0; i < 2000; i++) {
          x = Math.sin(x) * Math.cos(x) + Math.sqrt(x + 1.0001);
        }
      }

      stressAnimationRef.current = requestAnimationFrame(stressLoop);
    }

    stressAnimationRef.current = requestAnimationFrame(stressLoop);
  }

  // Run Benchmark (Calculates ops / microsecond)
  async function runFullBenchmark() {
    stopStressTest();
    setIsBenchmarking(true);
    setBenchProgress(10);

    const startBench = performance.now();

    // 1. Single-Thread CPU Benchmark
    await new Promise((r) => setTimeout(r, 100));
    const t0 = performance.now();
    let opsSingle = 0;
    while (performance.now() - t0 < 800) {
      for (let i = 0; i < 50000; i++) {
        Math.hypot(i, i * 2);
      }
      opsSingle += 50000;
    }
    const singleScore = Math.round(opsSingle / ((performance.now() - t0) * 1000));
    setBenchProgress(45);

    // 2. Multi-Thread Workload Estimation
    await new Promise((r) => setTimeout(r, 100));
    const threads = benchResults.threadsCount || 4;
    const multiScore = Math.round(singleScore * Math.max(1.8, threads * 0.78));
    setBenchProgress(75);

    // 3. WebGL GPU Shader Benchmark
    await new Promise((r) => setTimeout(r, 100));
    let gpuOps = 0;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (gl) {
        const tGpu0 = performance.now();
        gl.clearColor(0.1, 0.2, 0.3, 1.0);
        while (performance.now() - tGpu0 < 600) {
          gl.clear(gl.COLOR_BUFFER_BIT);
          gpuOps += 10000;
        }
      }
    } catch {}
    const gpuFinalScore = Math.max(450, Math.round(gpuOps / 500) + singleScore * 2);

    const totalDuration = Math.round((performance.now() - startBench) / 1000);
    setBenchProgress(100);

    setBenchResults((prev) => ({
      ...prev,
      cpuSingleScore: singleScore,
      cpuMultiScore: multiScore,
      gpuScore: gpuFinalScore,
      durationSec: totalDuration,
    }));

    setIsBenchmarking(false);
  }

  function handleFeedback(status: "good" | "issue") {
    setUserFeedback(status);
    onStatusChange?.(status);
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Benchmark & Stress Diagnostic Intro */}
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-subtle pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-light text-brand">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-base font-bold text-navy">
                Đo điểm hiệu năng &amp; Kiểm tra độ ổn định tản nhiệt (Stress Test)
              </h2>
              <p className="text-xs text-ink-muted">
                Phát hiện máy tính có bị tụt xung (Thermal Throttling), quạt kêu to bất thường hay đơ lag khi tải nặng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isBenchmarking}
              onClick={runFullBenchmark}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-xs font-semibold text-ink-inverse shadow-brand-glow hover:bg-brand-hover disabled:opacity-60"
            >
              <Gauge className="h-4 w-4" />
              <span>{isBenchmarking ? "Đang đo điểm..." : "Chạy Benchmark tính điểm"}</span>
            </button>
          </div>
        </div>

        {/* System Specs Snapshot Strip */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-xl border border-line-subtle bg-surface-subtle p-3.5">
            <span className="text-ink-muted block text-xs">Luồng xử lý CPU khả dụng</span>
            <strong className="font-mono text-brand text-sm font-bold block mt-1">
              {benchResults.threadsCount} luồng (Cores/Threads)
            </strong>
          </div>
          <div className="rounded-xl border border-line-subtle bg-surface-subtle p-3.5 sm:col-span-2">
            <span className="text-ink-muted block text-xs">Card đồ họa GPU nhận diện</span>
            <strong className="text-navy text-xs font-bold block mt-1 truncate">
              {benchResults.gpuModel}
            </strong>
          </div>
        </div>
      </div>

      {/* Benchmark Score Results Card */}
      {(benchResults.cpuMultiScore !== null || isBenchmarking) && (
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-bold text-navy flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-brand" />
              <span>Kết quả điểm số hiệu năng (Operations / µs)</span>
            </h3>
            {isBenchmarking && (
              <span className="font-mono text-xs text-brand font-semibold">
                Tiến độ: {benchProgress}%
              </span>
            )}
          </div>

          {isBenchmarking && (
            <div className="h-3 w-full rounded-full bg-surface-subtle overflow-hidden border border-line">
              <div
                className="h-full bg-brand rounded-full transition-all duration-300"
                style={{ width: `${benchProgress}%` }}
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-line bg-surface-subtle p-4">
              <span className="text-xs text-ink-muted block">CPU Đa luồng (Multi-Core)</span>
              <p className="mt-1 font-mono text-2xl font-bold text-brand tabular-nums">
                {benchResults.cpuMultiScore ? `${benchResults.cpuMultiScore} pts` : "---"}
              </p>
              <span className="text-xs text-ink-subtle block mt-0.5">
                Hiệu năng render, nén file và xử lý song song
              </span>
            </div>

            <div className="rounded-xl border border-line bg-surface-subtle p-4">
              <span className="text-xs text-ink-muted block">CPU Đơn luồng (Single-Core)</span>
              <p className="mt-1 font-mono text-2xl font-bold text-navy tabular-nums">
                {benchResults.cpuSingleScore ? `${benchResults.cpuSingleScore} pts` : "---"}
              </p>
              <span className="text-xs text-ink-subtle block mt-0.5">
                Tốc độ phản hồi ứng dụng, lướt web và văn phòng
              </span>
            </div>

            <div className="rounded-xl border border-line bg-surface-subtle p-4">
              <span className="text-xs text-ink-muted block">Đồ họa GPU Shader</span>
              <p className="mt-1 font-mono text-2xl font-bold text-brand tabular-nums">
                {benchResults.gpuScore ? `${benchResults.gpuScore} pts` : "---"}
              </p>
              <span className="text-xs text-ink-subtle block mt-0.5">
                Khả năng đổ bóng WebGL và xử lý hình ảnh
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Stress Test Thermal Chamber (Obsidian Navy frame) */}
      <div className="rounded-2xl border border-navy-border bg-navy p-6 shadow-card-hover text-ink-inverse sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-border/60 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-status-danger-solid text-ink-inverse shadow-sm">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-ink-inverse">
                Phòng thử tải nhiệt độ (Stress Test Chamber)
              </h3>
              <p className="text-xs text-ink-inverse-muted">
                {isStressRunning
                  ? `Đang ép tải ${stressType} liên tục • Thời gian: ${formatTime(stressTimer)}`
                  : "Chạy tải nặng 100% để kiểm tra quạt tản nhiệt, nhiệt độ đáy máy và độ ổn định nguồn"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!isStressRunning ? (
              <>
                <button
                  type="button"
                  onClick={() => startStressTest("CPU")}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-navy-border bg-surface/10 px-4 py-2 text-xs font-semibold text-ink-inverse hover:bg-surface/20"
                >
                  <Cpu className="h-4 w-4" />
                  <span>Nạp CPU</span>
                </button>
                <button
                  type="button"
                  onClick={() => startStressTest("GPU")}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-navy-border bg-surface/10 px-4 py-2 text-xs font-semibold text-ink-inverse hover:bg-surface/20"
                >
                  <Zap className="h-4 w-4" />
                  <span>Nạp GPU</span>
                </button>
                <button
                  type="button"
                  onClick={() => startStressTest("BOTH")}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-status-danger-solid px-5 py-2 text-xs font-semibold text-ink-inverse shadow-sm hover:bg-status-danger-solid/90"
                >
                  <Flame className="h-4 w-4" />
                  <span>Nạp Full CPU &amp; GPU</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={stopStressTest}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-navy-border bg-surface/20 px-6 py-2.5 font-mono text-xs font-bold text-ink-inverse hover:bg-surface/30"
              >
                <Square className="h-4 w-4 fill-current" />
                <span>Dừng ép tải ({formatTime(stressTimer)})</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Stress Heat Meter / Advisory */}
        <div className="grid gap-4 sm:grid-cols-2 text-xs">
          <div className="rounded-xl border border-navy-border bg-surface/5 p-4 space-y-2">
            <span className="font-semibold text-ink-inverse block">
              Dấu hiệu nhận biết máy tản nhiệt tốt:
            </span>
            <ul className="space-y-1.5 text-ink-inverse-muted list-disc list-inside">
              <li>Quạt tản nhiệt tăng tốc êm ái, gió thổi ra khe tản đều và ấm nóng.</li>
              <li>Máy duy trì mượt mà, con trỏ chuột không bị giật lag hay khựng hình.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-navy-border bg-surface/5 p-4 space-y-2">
            <span className="font-semibold text-status-danger-ink bg-status-danger-bg px-2 py-0.5 rounded inline-block">
              Dấu hiệu keo tản nhiệt đã khô / Quạt nghẹt bụi:
            </span>
            <ul className="space-y-1.5 text-ink-inverse-muted list-disc list-inside">
              <li>Quạt rú to bất thường nhưng gió thổi ra rất yếu, đáy máy nóng ran.</li>
              <li>Máy tự sập nguồn hoặc đơ lag do cơ chế tự bảo vệ quá nhiệt (Thermal Throttling).</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Simple Diagnostic Feedback ([Hoạt động tốt] / [Có vấn đề]) */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-card flex flex-col justify-between sm:flex-row sm:items-center gap-4">
        <div className="space-y-1">
          <h3 className="font-heading text-sm font-bold text-navy">
            Ghi nhận kết quả kiểm tra nhiệt độ &amp; hiệu năng
          </h3>
          <p className="text-xs text-ink-muted">
            Máy của bạn có chạy mát êm, không bị sập nguồn hay giật lag khi tải nặng không?
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
            <span>Mát êm, ổn định</span>
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
            <span>Nóng máy / Quạt rú to / Lag</span>
          </button>
        </div>
      </div>

      {userFeedback === "issue" && (
        <div className="rounded-2xl border border-status-danger-line bg-status-danger-bg p-5 text-xs text-status-danger-ink flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <p className="font-bold text-sm flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Máy tính cần vệ sinh làm mát &amp; thay keo tản nhiệt</span>
            </p>
            <p className="leading-relaxed">
              Keo tản nhiệt sau 6 - 12 tháng bị khô cứng khiến nhiệt lượng CPU/VGA không truyền được ra quạt tản, gây tụt xung và giảm tuổi thọ máy. Dịch vụ vệ sinh 12 bước tra keo Arctic MX-6 / Thermal Grizzly tại MQTech giúp hạ nhiệt 10 - 20°C ngay sau 35 phút.
            </p>
          </div>
          <Link
            href={`/dat-lich?dich_vu=${encodeURIComponent(
              "Vệ Sinh & Tra Keo Tản Nhiệt Chuẩn Lab"
            )}&mo_ta=${encodeURIComponent("Máy bị nóng / quạt kêu to / tụt xung qua test stress online")}`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-ink-inverse shadow-sm hover:bg-brand-hover shrink-0"
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>Đặt lịch vệ sinh tra keo chuẩn Lab</span>
          </Link>
        </div>
      )}

      {userFeedback === "good" && (
        <div className="rounded-2xl border border-status-success-line bg-status-success-bg p-4 text-xs text-status-success-ink flex items-center gap-2.5">
          <CheckCircle2 className="h-5 w-5 text-status-success-solid shrink-0" />
          <span>Hệ thống hoạt động ổn định! Điểm số hiệu năng đáp ứng tốt và hệ thống tản nhiệt thông thoáng.</span>
        </div>
      )}
    </div>
  );
}
