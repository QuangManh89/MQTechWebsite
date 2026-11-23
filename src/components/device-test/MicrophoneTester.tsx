"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Mic,
  MicOff,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Square,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function MicrophoneTester({
  onStatusChange,
}: {
  onStatusChange?: (status: "good" | "issue" | "untested") => void;
}) {
  const [isActive, setIsActive] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0); // 0 - 100
  const [isClipping, setIsClipping] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [userFeedback, setUserFeedback] = useState<"good" | "issue" | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordIntervalRef = useRef<number | null>(null);

  const stopMicStream = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (recordIntervalRef.current) {
      clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsActive(false);
    setVolumeLevel(0);
    setIsRecording(false);
  }, []);

  useEffect(() => {
    return () => stopMicStream();
  }, [stopMicStream]);

  async function startMicrophone() {
    stopMicStream();
    setPermissionError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      streamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsActive(true);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      function updateMeter() {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const normalized = Math.min(100, Math.round((average / 128) * 100));

        setVolumeLevel(normalized);
        if (normalized >= 95) {
          setIsClipping(true);
        }

        animFrameRef.current = requestAnimationFrame(updateMeter);
      }

      animFrameRef.current = requestAnimationFrame(updateMeter);
    } catch (err) {
      const msg =
        err instanceof Error && err.name === "NotAllowedError"
          ? "Trình duyệt chưa được cấp quyền truy cập Microphone. Vui lòng bấm Cho phép trên thanh địa chỉ."
          : "Không tìm thấy thiết bị Microphone hoặc micro đang bị ứng dụng khác chiếm giữ.";
      setPermissionError(msg);
      setIsActive(false);
    }
  }

  function startRecordSample() {
    if (!streamRef.current) return;

    audioChunksRef.current = [];
    setRecordedAudioUrl(null);
    setIsRecording(true);
    setRecordingSeconds(5);

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        setIsRecording(false);
        if (recordIntervalRef.current) {
          clearInterval(recordIntervalRef.current);
          recordIntervalRef.current = null;
        }
      };

      mediaRecorder.start();

      let left = 5;
      recordIntervalRef.current = window.setInterval(() => {
        left--;
        setRecordingSeconds(left);
        if (left <= 0) {
          if (mediaRecorder.state !== "inactive") {
            mediaRecorder.stop();
          }
        }
      }, 1000);
    } catch {
      setIsRecording(false);
    }
  }

  function handleFeedback(status: "good" | "issue") {
    setUserFeedback(status);
    onStatusChange?.(status);
  }

  return (
    <div className="space-y-6">
      {/* Privacy Notice Banner */}
      <div className="flex items-center gap-2.5 rounded-2xl border border-line bg-surface p-4 text-xs text-ink-muted shadow-card sm:p-5">
        <ShieldCheck className="h-5 w-5 text-status-success-solid shrink-0" />
        <span className="leading-relaxed">
          <strong>Cam kết bảo mật 100% Client-side:</strong> Âm thanh micro chỉ được
          xử lý trực tiếp trên bộ nhớ máy bạn để đo âm lượng và phát lại thử nghiệm. MQTech
          tuyệt đối không ghi âm, không lưu trữ và không truyền âm thanh ra bên ngoài.
        </span>
      </div>

      {/* Main Microphone Console Card */}
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-card space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line-subtle pb-5">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
                isActive
                  ? "bg-status-success-bg text-status-success-solid"
                  : "bg-surface-muted text-ink-muted"
              )}
            >
              <Mic className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-base font-bold text-navy">
                Kiểm tra tín hiệu âm thanh Microphone
              </h2>
              <p className="text-xs text-ink-muted">
                {isActive
                  ? "Micro đang mở • Hãy nói vào máy để kiểm tra thanh đo âm lượng"
                  : "Bấm 'Bật Micro' để bắt đầu kiểm tra cường độ và thu âm mẫu"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isActive ? (
              <button
                type="button"
                onClick={startMicrophone}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-xs font-semibold text-ink-inverse shadow-brand-glow hover:bg-brand-hover"
              >
                <Mic className="h-4 w-4" />
                <span>Bật Micro</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopMicStream}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-navy hover:border-brand/40"
              >
                <MicOff className="h-4 w-4 text-status-danger-solid" />
                <span>Tắt Micro</span>
              </button>
            )}
          </div>
        </div>

        {permissionError && (
          <div className="rounded-xl border border-status-danger-line bg-status-danger-bg p-4 text-xs text-status-danger-ink flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{permissionError}</span>
          </div>
        )}

        {/* Live Input Level Meter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-navy">
              Cường độ âm thanh đầu vào (Input Meter):
            </span>
            <span className="font-mono text-xs text-ink-muted tabular-nums">
              {volumeLevel}% {isClipping && "• Cảnh báo: Vỡ tiếng (Clipping)"}
            </span>
          </div>

          <div className="h-5 w-full rounded-full border border-line bg-surface-subtle p-0.5 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-75",
                volumeLevel > 85
                  ? "bg-status-danger-solid"
                  : volumeLevel > 60
                  ? "bg-status-warning-solid"
                  : "bg-status-success-solid"
              )}
              style={{ width: `${volumeLevel}%` }}
            />
          </div>
        </div>

        {/* 5-second Recording Test Section */}
        {isActive && (
          <div className="rounded-xl border border-line-subtle bg-surface-subtle p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-heading text-sm font-bold text-navy">
                  Thu âm mẫu 5 giây để tự nghe lại giọng nói
                </h3>
                <p className="text-xs text-ink-muted">
                  Bấm Thu âm, đếm từ 1 đến 5 để kiểm tra tiếng có bị nghẹt, rè hoặc nhỏ tiếng không
                </p>
              </div>

              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecordSample}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 py-2 text-xs font-semibold text-ink-inverse shadow-sm hover:bg-brand-hover"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                  <span>Bắt đầu thu âm 5 giây</span>
                </button>
              ) : (
                <div className="inline-flex min-h-11 items-center gap-2 rounded-full border border-status-danger-solid bg-status-danger-bg px-4 py-2 font-mono text-xs font-bold text-status-danger-ink">
                  <span>Đang thu âm: còn {recordingSeconds}s</span>
                </div>
              )}
            </div>

            {recordedAudioUrl && (
              <div className="rounded-xl border border-line bg-surface p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs space-y-0.5">
                  <span className="font-bold text-navy block">
                    Bản thu âm thử nghiệm của bạn:
                  </span>
                  <span className="text-ink-muted block">
                    Bấm phát để lắng nghe độ trong trẻo và âm lượng thực tế
                  </span>
                </div>
                <audio
                  src={recordedAudioUrl}
                  controls
                  className="h-10 w-full sm:w-64 max-w-full"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Simple Diagnostic Evaluation Card */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-card flex flex-col justify-between sm:flex-row sm:items-center gap-4">
        <div className="space-y-1">
          <h3 className="font-heading text-sm font-bold text-navy">
            Ghi nhận kết quả kiểm tra Microphone
          </h3>
          <p className="text-xs text-ink-muted">
            Micro có bắt tiếng rõ ràng, không bị rè hoặc quá nhỏ khi đàm thoại không?
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
              <span>Phát hiện micro bị nghẹt, rè hoặc không bắt tiếng</span>
            </p>
            <p className="leading-relaxed">
              Nguyên nhân phổ biến do bụi bẩn bít lỗ mic trên vỏ máy, ẩm mốc cáp bẹ nối micro hoặc lỗi chip xử lý âm thanh. MQTech hỗ trợ vệ sinh thông lỗ mic miễn phí và thay cụm mic chính hãng lấy ngay tại BMT.
            </p>
          </div>
          <Link
            href={`/dat-lich?dich_vu=${encodeURIComponent(
              "Sửa Chữa Laptop Windows Chuyên Sâu"
            )}&mo_ta=${encodeURIComponent("Micro laptop bị nghẹt / rè / không bắt tiếng qua test online")}`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-ink-inverse shadow-sm hover:bg-brand-hover shrink-0"
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>Đặt lịch kiểm tra micro</span>
          </Link>
        </div>
      )}

      {userFeedback === "good" && (
        <div className="rounded-2xl border border-status-success-line bg-status-success-bg p-4 text-xs text-status-success-ink flex items-center gap-2.5">
          <CheckCircle2 className="h-5 w-5 text-status-success-solid shrink-0" />
          <span>Microphone bắt tiếng trong trẻo, âm lượng thu chuẩn và không bị rè hay vỡ tiếng!</span>
        </div>
      )}
    </div>
  );
}
