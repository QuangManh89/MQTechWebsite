"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  AlertCircle,
  Camera,
  CameraOff,
  CheckCircle2,
  FlipHorizontal,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface VideoDeviceInfo {
  deviceId: string;
  label: string;
}

export function CameraTester({
  onStatusChange,
}: {
  onStatusChange?: (status: "good" | "issue" | "untested") => void;
}) {
  const [isActive, setIsActive] = useState(false);
  const [isMirrored, setIsMirrored] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const [devices, setDevices] = useState<VideoDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");

  const [resolution, setResolution] = useState<{ width: number; height: number } | null>(null);
  const [snapshotUrl, setSnapshotUrl] = useState<string | null>(null);
  const [userFeedback, setUserFeedback] = useState<"good" | "issue" | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setResolution(null);
  }, []);

  useEffect(() => {
    return () => stopCameraStream();
  }, [stopCameraStream]);

  // Load available camera devices
  const loadDevices = useCallback(async () => {
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevs = allDevices
        .filter((d) => d.kind === "videoinput")
        .map((d, idx) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${idx + 1}`,
        }));
      setDevices(videoDevs);
      if (videoDevs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoDevs[0].deviceId);
      }
    } catch {}
  }, [selectedDeviceId]);

  async function startCamera(deviceIdToUse?: string) {
    stopCameraStream();
    setPermissionError(null);
    setSnapshotUrl(null);

    const targetDevId = deviceIdToUse || selectedDeviceId;

    try {
      const constraints: MediaStreamConstraints = {
        video: targetDevId
          ? { deviceId: { exact: targetDevId }, width: { ideal: 1920 }, height: { ideal: 1080 } }
          : { width: { ideal: 1920 }, height: { ideal: 1080 } },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            setResolution({
              width: videoRef.current.videoWidth,
              height: videoRef.current.videoHeight,
            });
          }
        };
      }

      setIsActive(true);
      await loadDevices();
    } catch (err) {
      const msg =
        err instanceof Error && err.name === "NotAllowedError"
          ? "Trình duyệt chưa được cấp quyền truy cập Camera / Webcam. Vui lòng bấm Cho phép trên thanh địa chỉ."
          : "Không tìm thấy thiết bị Webcam hoặc camera đang bị ứng dụng khác (Zoom, Teams, Meet) chiếm giữ.";
      setPermissionError(msg);
      setIsActive(false);
    }
  }

  function handleDeviceChange(newId: string) {
    setSelectedDeviceId(newId);
    void startCamera(newId);
  }

  function captureSnapshot() {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth || 640;
    canvas.height = v.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setSnapshotUrl(dataUrl);
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
          <strong>Bảo mật hình ảnh 100% Client-side:</strong> Luồng video chỉ được
          hiển thị trực tiếp trên trình duyệt của bạn để kiểm tra thấu kính và cảm biến hình ảnh.
          MQTech tuyệt đối không ghi lại, không lưu trữ và không truyền bất kỳ hình ảnh nào về máy chủ.
        </span>
      </div>

      {/* Main Camera Viewport Card (Obsidian Navy frame) */}
      <div className="rounded-2xl border border-navy-border bg-navy p-6 shadow-card-hover text-ink-inverse sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-navy-border/60 pb-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-ink-inverse shadow-sm">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-ink-inverse">
                Kiểm tra hình ảnh Camera / Webcam
              </h2>
              <p className="text-xs text-ink-inverse-muted">
                {isActive && resolution
                  ? `Độ phân giải thực: ${resolution.width} × ${resolution.height} px • Cảm biến đang hoạt động`
                  : "Bấm 'Bật Camera' để kiểm tra độ sắc nét, màu sắc và cảm biến thấu kính"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {devices.length > 1 && (
              <select
                value={selectedDeviceId}
                onChange={(e) => handleDeviceChange(e.target.value)}
                className="h-10 rounded-full border border-navy-border bg-surface/10 px-3.5 text-xs font-semibold text-ink-inverse focus:border-brand"
              >
                {devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId} className="bg-navy text-ink-inverse">
                    {d.label}
                  </option>
                ))}
              </select>
            )}

            {!isActive ? (
              <button
                type="button"
                onClick={() => void startCamera()}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-xs font-semibold text-ink-inverse shadow-md shadow-black/25 hover:bg-brand-hover"
              >
                <Camera className="h-4 w-4" />
                <span>Bật Camera</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsMirrored((m) => !m)}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-navy-border bg-surface/10 px-4 py-2 text-xs font-semibold text-ink-inverse hover:bg-surface/20"
                >
                  <FlipHorizontal className="h-4 w-4" />
                  <span>{isMirrored ? "Tắt lật gương" : "Bật lật gương"}</span>
                </button>

                <button
                  type="button"
                  onClick={captureSnapshot}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-semibold text-ink-inverse shadow-sm hover:bg-brand-hover"
                >
                  <Camera className="h-4 w-4" />
                  <span>Chụp ảnh thử</span>
                </button>

                <button
                  type="button"
                  onClick={stopCameraStream}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-navy-border bg-surface/10 px-4 py-2 text-xs font-semibold text-status-danger-solid hover:bg-surface/20"
                >
                  <CameraOff className="h-4 w-4" />
                  <span>Tắt</span>
                </button>
              </>
            )}
          </div>
        </div>

        {permissionError && (
          <div className="mb-6 rounded-xl border border-status-danger-line bg-status-danger-bg p-4 text-xs text-status-danger-ink flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{permissionError}</span>
          </div>
        )}

        {/* Live Video Viewport Container */}
        <div className="relative mx-auto aspect-video max-w-2xl overflow-hidden rounded-2xl border border-navy-border bg-surface/5 shadow-inner flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn(
              "h-full w-full object-cover transition-transform",
              isMirrored ? "-scale-x-100" : "scale-x-100",
              !isActive && "hidden"
            )}
          />

          {!isActive && (
            <div className="text-center p-8 space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-surface/10 text-ink-inverse-muted">
                <Camera className="h-7 w-7" />
              </div>
              <p className="text-xs text-ink-inverse-muted max-w-sm">
                Webcam đang tắt. Bấm nút <strong>&ldquo;Bật Camera&rdquo;</strong> phía trên để xem hình ảnh trực tiếp.
              </p>
            </div>
          )}
        </div>

        {/* Snapshot Modal/Card */}
        {snapshotUrl && (
          <div className="mt-6 rounded-xl border border-navy-border bg-surface/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={snapshotUrl}
                alt="Ảnh chụp thử từ webcam"
                className="h-16 w-24 rounded-lg object-cover border border-navy-border"
              />
              <div className="text-xs">
                <p className="font-bold text-ink-inverse">Ảnh chụp mẫu từ Camera</p>
                <p className="text-ink-inverse-muted">
                  Kiểm tra độ nét của mắt kính, màu da và độ nhiễu hạt (noise) khi thiếu sáng
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSnapshotUrl(null)}
              className="min-h-9 rounded-full border border-navy-border px-3.5 py-1 text-xs text-ink-inverse-muted hover:text-ink-inverse"
            >
              Đóng ảnh
            </button>
          </div>
        )}
      </div>

      {/* Simple Diagnostic Evaluation Card */}
      <div className="rounded-2xl border border-line bg-surface p-5 shadow-card flex flex-col justify-between sm:flex-row sm:items-center gap-4">
        <div className="space-y-1">
          <h3 className="font-heading text-sm font-bold text-navy">
            Ghi nhận kết quả kiểm tra Camera
          </h3>
          <p className="text-xs text-ink-muted">
            Hình ảnh camera có hiển thị sáng rõ, đúng màu sắc và không bị sọc nhiễu không?
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
              <span>Phát hiện camera bị mờ, đục kính, sọc hoặc mất kết nối</span>
            </p>
            <p className="leading-relaxed max-w-[58ch]">
              Nguyên nhân có thể do đứt cáp màn hình (cáp webcam đi chung bản lề), ẩm mốc cụm camera hoặc chết cảm biến CMOS. MQTech hỗ trợ vệ sinh mắt camera miễn phí và thay cụm webcam laptop chính hãng tại Buôn Ma Thuột.
            </p>
          </div>
          <Link
            href={`/dat-lich?dich_vu=${encodeURIComponent(
              "Sửa Chữa Laptop Windows Chuyên Sâu"
            )}&mo_ta=${encodeURIComponent("Camera laptop bị mờ / sọc / không nhận qua test online")}`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-ink-inverse shadow-sm hover:bg-brand-hover shrink-0"
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>Đặt lịch kiểm tra camera</span>
          </Link>
        </div>
      )}

      {userFeedback === "good" && (
        <div className="rounded-2xl border border-status-success-line bg-status-success-bg p-4 text-xs text-status-success-ink flex items-center gap-2.5">
          <CheckCircle2 className="h-5 w-5 text-status-success-solid shrink-0" />
          <span>Camera hoạt động tốt! Độ phân giải sắc nét, màu sắc tự nhiên và cảm biến thấu kính sạch sẽ.</span>
        </div>
      )}
    </div>
  );
}
