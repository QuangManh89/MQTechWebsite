"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Headphones,
  Music,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  Volume2,
  VolumeX,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ChannelMode = "AUTO" | "LEFT" | "RIGHT" | "STEREO";

export function SpeakerTester({
  onStatusChange,
}: {
  onStatusChange?: (status: "good" | "issue" | "untested") => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [channelMode, setChannelMode] = useState<ChannelMode>("AUTO");
  const [activeChannel, setActiveChannel] = useState<"LEFT" | "RIGHT" | "BOTH" | "IDLE">("IDLE");
  const [progressSec, setProgressSec] = useState(0);
  const [freqPlaying, setFreqPlaying] = useState<string | null>(null);
  const [userFeedback, setUserFeedback] = useState<"good" | "issue" | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const pannerNodeRef = useRef<StereoPannerNode | null>(null);
  const oscNodeRef = useRef<OscillatorNode | null>(null);
  const timerRef = useRef<number | null>(null);

  // Initialize or get AudioContext
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioCtx();
    }
    if (audioContextRef.current.state === "suspended") {
      void audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const stopAllAudio = useCallback(() => {
    // Stop MP3 / WAV
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    // Stop Oscillator
    if (oscNodeRef.current) {
      try {
        oscNodeRef.current.stop();
        oscNodeRef.current.disconnect();
      } catch {}
      oscNodeRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPlaying(false);
    setFreqPlaying(null);
    setActiveChannel("IDLE");
    setProgressSec(0);
  }, []);

  useEffect(() => {
    return () => stopAllAudio();
  }, [stopAllAudio]);

  // Set stereo pan (-1 = Left, 0 = Center, 1 = Right)
  const setPan = useCallback((panValue: number) => {
    if (pannerNodeRef.current && audioContextRef.current) {
      pannerNodeRef.current.pan.setValueAtTime(panValue, audioContextRef.current.currentTime);
    }
  }, []);

  // Play stereo test track with auto sequence or manual override
  const playStereoTrack = useCallback(
    (mode: ChannelMode) => {
      stopAllAudio();
      setChannelMode(mode);

      const ctx = getAudioContext();

      // Setup audio element if not already
      if (!audioElementRef.current) {
        const audio = new Audio("/audio/stereo-test.wav");
        audioElementRef.current = audio;

        // Try stereo panner
        if (ctx.createStereoPanner) {
          const source = ctx.createMediaElementSource(audio);
          const panner = ctx.createStereoPanner();
          pannerNodeRef.current = panner;
          source.connect(panner);
          panner.connect(ctx.destination);
        }
      }

      const audio = audioElementRef.current;
      audio.currentTime = 0;

      if (mode === "LEFT") {
        setPan(-1);
        setActiveChannel("LEFT");
      } else if (mode === "RIGHT") {
        setPan(1);
        setActiveChannel("RIGHT");
      } else if (mode === "STEREO") {
        setPan(0);
        setActiveChannel("BOTH");
      } else {
        // AUTO sequence (0-5s Left, 5-10s Right, 10-15s Both)
        setPan(0); // Audio track already has channels hard-panned
        setActiveChannel("LEFT");
      }

      void audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // If autoplay / audio tag is blocked, synthesize with Web Audio directly
        synthesizeStereoSequence();
      });

      // Track time & update active channel dynamically
      timerRef.current = window.setInterval(() => {
        if (!audio) return;
        const cur = audio.currentTime;
        setProgressSec(Math.round(cur));

        if (mode === "AUTO") {
          if (cur < 5) {
            setActiveChannel("LEFT");
          } else if (cur < 10) {
            setActiveChannel("RIGHT");
          } else {
            setActiveChannel("BOTH");
          }
        }

        if (audio.ended || cur >= 15) {
          stopAllAudio();
        }
      }, 200);
    },
    [getAudioContext, setPan, stopAllAudio]
  );

  // Web Audio Direct Fallback Synthesizer
  function synthesizeStereoSequence() {
    const ctx = getAudioContext();
    const duration = 15;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

    osc.type = "sine";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.setValueAtTime(523.25, ctx.currentTime + 5);
    osc.frequency.setValueAtTime(440, ctx.currentTime + 10);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);

    if (panner) {
      panner.pan.setValueAtTime(-1, ctx.currentTime);
      panner.pan.setValueAtTime(1, ctx.currentTime + 5);
      panner.pan.setValueAtTime(0, ctx.currentTime + 10);
      osc.connect(gain);
      gain.connect(panner);
      panner.connect(ctx.destination);
    } else {
      osc.connect(gain);
      gain.connect(ctx.destination);
    }

    osc.start();
    osc.stop(ctx.currentTime + duration);
    oscNodeRef.current = osc;
    setIsPlaying(true);
    setActiveChannel("LEFT");

    let sec = 0;
    timerRef.current = window.setInterval(() => {
      sec++;
      setProgressSec(sec);
      if (sec < 5) setActiveChannel("LEFT");
      else if (sec < 10) setActiveChannel("RIGHT");
      else if (sec < 15) setActiveChannel("BOTH");
      else stopAllAudio();
    }, 1000);
  }

  // Play single frequency tone (Bass, Treble, Sweep)
  function playTone(freq: number, label: string) {
    stopAllAudio();
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 4); // 4 seconds tone
    oscNodeRef.current = osc;

    setFreqPlaying(label);
    setIsPlaying(true);
    setActiveChannel("BOTH");

    timerRef.current = window.setTimeout(() => {
      stopAllAudio();
    }, 4000);
  }

  function playSweep() {
    stopAllAudio();
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(20, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(16000, ctx.currentTime + 6); // 20Hz -> 16kHz
    gain.gain.setValueAtTime(0.2, ctx.currentTime);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 6.2);
    oscNodeRef.current = osc;

    setFreqPlaying("sweep");
    setIsPlaying(true);
    setActiveChannel("BOTH");

    timerRef.current = window.setTimeout(() => {
      stopAllAudio();
    }, 6200);
  }

  function handleFeedback(status: "good" | "issue") {
    setUserFeedback(status);
    onStatusChange?.(status);
  }

  return (
    <div className="space-y-6">
      {/* Visual Stereo Soundwave Theater (Obsidian Navy frame) */}
      <div className="rounded-2xl border border-navy-border bg-navy p-6 shadow-card-hover text-ink-inverse sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-border/60 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-ink-inverse shadow-sm">
              <Headphones className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-ink-inverse">
                Đoạn nhạc Test Loa Trái &amp; Phải (Stereo Sound Check)
              </h2>
              <p className="text-xs text-ink-inverse-muted">
                {isPlaying
                  ? `Đang phát (${progressSec}/15s) • Kênh: ${
                      activeChannel === "LEFT"
                        ? "Loa TRÁI"
                        : activeChannel === "RIGHT"
                        ? "Loa PHẢI"
                        : "CẢ HAI BÊN"
                    }`
                  : "Bấm Phát để nghe lần lượt: 5s Loa Trái ➔ 5s Loa Phải ➔ 5s Cả hai loa"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <button
                type="button"
                onClick={() => playStereoTrack("AUTO")}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-xs font-semibold text-ink-inverse shadow-md shadow-black/25 hover:bg-brand-hover"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>Phát kịch bản chuẩn</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopAllAudio}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-navy-border bg-surface/10 px-5 py-2.5 text-xs font-semibold text-ink-inverse hover:bg-surface/20"
              >
                <Pause className="h-4 w-4" />
                <span>Dừng lại</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Laptop & Dual Speaker Pulse Theater */}
        <div className="relative mx-auto my-6 flex max-w-xl items-center justify-between gap-6 px-4 py-8">
          {/* Left Speaker Node */}
          <div className="flex flex-1 flex-col items-center gap-3 text-center">
            <div
              className={cn(
                "relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-2xl border transition-all duration-300",
                activeChannel === "LEFT" || activeChannel === "BOTH"
                  ? "border-brand bg-brand/20 shadow-md shadow-black/30 scale-105"
                  : "border-navy-border bg-surface/5 opacity-60"
              )}
            >
              <Volume2
                className={cn(
                  "h-10 w-10 sm:h-12 sm:w-12 transition-colors",
                  activeChannel === "LEFT" || activeChannel === "BOTH"
                    ? "text-brand-glow"
                    : "text-ink-inverse-muted"
                )}
              />

              {/* Pulsing Soundwaves */}
              {(activeChannel === "LEFT" || activeChannel === "BOTH") && (
                <div className="absolute inset-0 rounded-2xl border-2 border-brand-glow animate-ping motion-reduce:animate-none opacity-35" />
              )}
            </div>
            <span
              className={cn(
                "font-heading text-xs sm:text-sm font-bold tracking-wider uppercase",
                activeChannel === "LEFT" || activeChannel === "BOTH"
                  ? "text-brand-glow"
                  : "text-ink-inverse-muted"
              )}
            >
              Kênh Trái (Left)
            </span>
          </div>

          {/* Center Laptop Silhouette */}
          <div className="hidden sm:flex flex-col items-center justify-center opacity-80">
            <div className="h-20 w-32 rounded-lg border border-navy-border bg-surface/10 flex items-center justify-center text-xs text-ink-inverse-muted font-mono">
              MQTech Bench
            </div>
            <div className="h-2.5 w-40 rounded-b-md bg-navy-border mt-0.5" />
          </div>

          {/* Right Speaker Node */}
          <div className="flex flex-1 flex-col items-center gap-3 text-center">
            <div
              className={cn(
                "relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-2xl border transition-all duration-300",
                activeChannel === "RIGHT" || activeChannel === "BOTH"
                  ? "border-brand bg-brand/20 shadow-md shadow-black/30 scale-105"
                  : "border-navy-border bg-surface/5 opacity-60"
              )}
            >
              <Volume2
                className={cn(
                  "h-10 w-10 sm:h-12 sm:w-12 transition-colors",
                  activeChannel === "RIGHT" || activeChannel === "BOTH"
                    ? "text-brand-glow"
                    : "text-ink-inverse-muted"
                )}
              />

              {/* Pulsing Soundwaves */}
              {(activeChannel === "RIGHT" || activeChannel === "BOTH") && (
                <div className="absolute inset-0 rounded-2xl border-2 border-brand-glow animate-ping motion-reduce:animate-none opacity-35" />
              )}
            </div>
            <span
              className={cn(
                "font-heading text-xs sm:text-sm font-bold tracking-wider uppercase",
                activeChannel === "RIGHT" || activeChannel === "BOTH"
                  ? "text-brand-glow"
                  : "text-ink-inverse-muted"
              )}
            >
              Kênh Phải (Right)
            </span>
          </div>
        </div>

        {/* Manual Speaker Override Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 border-t border-navy-border/60 pt-5">
          <span className="text-xs text-ink-inverse-muted mr-1">Chủ động nghe riêng:</span>
          <button
            type="button"
            onClick={() => playStereoTrack("LEFT")}
            className={cn(
              "min-h-11 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
              channelMode === "LEFT" && isPlaying
                ? "border-brand bg-brand text-ink-inverse"
                : "border-navy-border bg-surface/10 text-ink-inverse hover:border-brand/50"
            )}
          >
            <span>Chỉ Loa Trái</span>
          </button>
          <button
            type="button"
            onClick={() => playStereoTrack("RIGHT")}
            className={cn(
              "min-h-11 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
              channelMode === "RIGHT" && isPlaying
                ? "border-brand bg-brand text-ink-inverse"
                : "border-navy-border bg-surface/10 text-ink-inverse hover:border-brand/50"
            )}
          >
            <span>Chỉ Loa Phải</span>
          </button>
          <button
            type="button"
            onClick={() => playStereoTrack("STEREO")}
            className={cn(
              "min-h-11 inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
              channelMode === "STEREO" && isPlaying
                ? "border-brand bg-brand text-ink-inverse"
                : "border-navy-border bg-surface/10 text-ink-inverse hover:border-brand/50"
            )}
          >
            <span>Cả Hai Loa (Stereo)</span>
          </button>
        </div>
      </div>

      {/* Advanced Frequency Diagnostics (Bass, Treble, Sweep) */}
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-card">
        <h3 className="font-heading text-sm font-bold text-navy mb-2 flex items-center gap-2">
          <Music className="h-4 w-4 text-brand" />
          <span>Kiểm tra chuyên sâu màng loa &amp; độ rè âm thanh</span>
        </h3>
        <p className="text-xs text-ink-muted mb-4 leading-relaxed">
          Sử dụng bộ sóng âm chuẩn để nhận biết rách màng loa khi đánh âm trầm, hoặc
          mất tép ở dải tần số cao:
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => playTone(60, "bass")}
            className={cn(
              "flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all min-h-16",
              freqPlaying === "bass"
                ? "border-brand bg-brand-light shadow-sm"
                : "border-line bg-surface hover:border-brand/40"
            )}
          >
            <span className="font-heading text-xs font-bold text-navy">
              Âm trầm (Bass 60 Hz)
            </span>
            <span className="text-xs text-ink-muted">
              Kiểm tra độ rung màng loa, phát hiện tiếng rè bass
            </span>
          </button>

          <button
            type="button"
            onClick={() => playTone(4000, "treble")}
            className={cn(
              "flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all min-h-16",
              freqPlaying === "treble"
                ? "border-brand bg-brand-light shadow-sm"
                : "border-line bg-surface hover:border-brand/40"
            )}
          >
            <span className="font-heading text-xs font-bold text-navy">
              Tần số cao (Treble 4 kHz)
            </span>
            <span className="text-xs text-ink-muted">
              Kiểm tra độ trong trẻo, tiếng xé hoặc nghẹt âm tép
            </span>
          </button>

          <button
            type="button"
            onClick={playSweep}
            className={cn(
              "flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-all min-h-16",
              freqPlaying === "sweep"
                ? "border-brand bg-brand-light shadow-sm"
                : "border-line bg-surface hover:border-brand/40"
            )}
          >
            <span className="font-heading text-xs font-bold text-navy">
              Quét toàn dải (20 Hz - 16 kHz)
            </span>
            <span className="text-xs text-ink-muted">
              Quét liên tục toàn bộ dải tần số tai người nghe được
            </span>
          </button>
        </div>
      </div>

      {/* Simple Diagnostic Feedback ([Hoạt động tốt] / [Có vấn đề]) */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-card flex flex-col justify-between sm:flex-row sm:items-center gap-4">
        <div className="space-y-1">
          <h3 className="font-heading text-sm font-bold text-navy">
            Đánh giá tình trạng loa của bạn
          </h3>
          <p className="text-xs text-ink-muted">
            Âm thanh 2 bên có nghe đều, trong trẻo và không bị rè hay mất tiếng một bên không?
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
            <span>Hoạt động tốt</span>
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
            <span>Có vấn đề</span>
          </button>
        </div>
      </div>

      {userFeedback === "issue" && (
        <div className="rounded-2xl border border-status-danger-line bg-status-danger-bg p-5 text-xs text-status-danger-ink flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1 max-w-xl">
            <p className="font-bold text-sm flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Phát hiện loa bị rè, nghẹt hoặc mất 1 bên</span>
            </p>
            <p className="leading-relaxed">
              Nguyên nhân thường do rách màng loa sau thời gian dài sử dụng, kẹt bụi côn loa, đứt cáp loa ngầm hoặc lỗi chip xử lý âm thanh trên bo mạch chủ.
            </p>
          </div>
          <Link
            href={`/dat-lich?dich_vu=${encodeURIComponent(
              "Sửa Chữa Laptop Windows Chuyên Sâu"
            )}&mo_ta=${encodeURIComponent("Loa laptop bị rè / mất 1 bên kênh qua test online")}`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-ink-inverse shadow-sm hover:bg-brand-hover shrink-0"
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>Đặt lịch kiểm tra loa</span>
          </Link>
        </div>
      )}

      {userFeedback === "good" && (
        <div className="rounded-2xl border border-status-success-line bg-status-success-bg p-4 text-xs text-status-success-ink flex items-center gap-2.5">
          <CheckCircle2 className="h-5 w-5 text-status-success-solid shrink-0" />
          <span>Loa hoạt động tốt! Âm thanh nổi Stereo 2 bên trái - phải phát chuẩn xác, không rè.</span>
        </div>
      )}
    </div>
  );
}
