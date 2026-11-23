"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TOPICS = [
  "Tư vấn sửa máy tính tại nhà BMT",
  "Báo giá nâng cấp RAM / SSD / Build PC",
  "Hợp đồng bảo trì IT công ty / phòng máy",
  "Kiểm tra bảo hành / Phản hồi dịch vụ",
];

export function ContactFormClient() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submitForm() {
    const nextErrs: Record<string, string> = {};
    if (fullName.trim().length < 2) {
      nextErrs.fullName = "Vui lòng nhập họ và tên tối thiểu 2 ký tự.";
    }
    const cleanPhone = phone.replace(/[\s.-]+/g, "");
    if (!/^[0-9+]{9,15}$/.test(cleanPhone)) {
      nextErrs.phone = "Số điện thoại cần từ 9 đến 15 chữ số.";
    }
    if (message.trim().length < 5) {
      nextErrs.message = "Vui lòng nhập nội dung câu hỏi tối thiểu 5 ký tự.";
    }

    if (Object.keys(nextErrs).length > 0) {
      setErrors(nextErrs);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setLoading(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15_000);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: cleanPhone,
          topic,
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error || "Không thể gửi câu hỏi lúc này.";
        setSubmitError(msg);
        toast.error(msg);
        return;
      }
      setSentSuccess(true);
      toast.success("Đã gửi câu hỏi! Kỹ thuật viên MQTech sẽ phản hồi sớm nhất.");
      setFullName("");
      setPhone("");
      setMessage("");
    } catch (err) {
      const isTimeout = err instanceof DOMException && err.name === "AbortError";
      const msg = isTimeout
        ? "Kết nối quá hạn 15 giây. Nội dung bạn nhập vẫn được giữ lại — vui lòng bấm Gửi lại."
        : "Không thể kết nối máy chủ. Nội dung bạn nhập vẫn được giữ lại — vui lòng bấm Gửi lại.";
      setSubmitError(msg);
      toast.error(isTimeout ? "Quá thời gian kết nối" : "Lỗi kết nối mạng");
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void submitForm();
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-line bg-surface p-6 shadow-card sm:p-8 space-y-5"
    >
      <h2 className="font-heading text-2xl font-bold text-navy">
        Gửi câu hỏi tư vấn miễn phí
      </h2>

      {sentSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2.5 rounded-xl border border-status-success-line bg-status-success-bg px-4 py-3 text-xs font-medium text-status-success-ink"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-status-success-ink" aria-hidden="true" />
          <span>
            Đã tiếp nhận câu hỏi của bạn! Kỹ thuật viên MQTech BMT sẽ gọi hoặc
            nhắn Zalo phản hồi sớm nhất.
          </span>
        </div>
      )}

      {submitError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-status-danger-line bg-status-danger-bg px-4 py-3 text-xs font-medium text-status-danger-ink"
        >
          <span className="inline-flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-status-danger-ink" aria-hidden="true" />
            {submitError}
          </span>
          <button
            type="button"
            disabled={loading}
            onClick={() => void submitForm()}
            className="min-h-11 rounded-full bg-status-danger-solid px-4 py-2 text-xs font-semibold text-ink-inverse hover:bg-status-danger-hover"
          >
            Gửi lại
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="contactName"
            className="block text-sm font-semibold text-navy mb-2"
          >
            Họ và tên *
          </label>
          <input
            id="contactName"
            type="text"
            required
            maxLength={100}
            autoComplete="name"
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "contactName-error" : undefined}
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setSentSuccess(false);
              if (errors.fullName) setErrors({ ...errors, fullName: "" });
            }}
            placeholder="Nhập họ tên của bạn"
            className={cn(
              "min-h-12 w-full rounded-xl border bg-surface px-4 py-3 text-base text-navy sm:text-sm",
              errors.fullName
                ? "border-status-danger-solid focus:border-status-danger-hover"
                : "border-line focus:border-brand"
            )}
          />
          {errors.fullName && (
            <p
              id="contactName-error"
              role="alert"
              className="mt-1.5 text-xs font-medium text-status-danger-ink"
            >
              {errors.fullName}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="contactPhone"
            className="block text-sm font-semibold text-navy mb-2"
          >
            Số điện thoại *
          </label>
          <input
            id="contactPhone"
            type="tel"
            required
            maxLength={20}
            autoComplete="tel"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "contactPhone-error" : undefined}
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setSentSuccess(false);
              if (errors.phone) setErrors({ ...errors, phone: "" });
            }}
            placeholder="09xx xxx xxx"
            className={cn(
              "min-h-12 w-full rounded-xl border bg-surface px-4 py-3 text-base text-navy sm:text-sm",
              errors.phone
                ? "border-status-danger-solid focus:border-status-danger-hover"
                : "border-line focus:border-brand"
            )}
          />
          {errors.phone && (
            <p
              id="contactPhone-error"
              role="alert"
              className="mt-1.5 text-xs font-medium text-status-danger-ink"
            >
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="contactTopic"
          className="block text-sm font-semibold text-navy mb-2"
        >
          Chủ đề cần hỗ trợ
        </label>
        <select
          id="contactTopic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="min-h-12 w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-navy focus:border-brand sm:text-sm"
        >
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="contactMessage"
          className="block text-sm font-semibold text-navy mb-2"
        >
          Nội dung câu hỏi *
        </label>
        <textarea
          id="contactMessage"
          rows={4}
          required
          maxLength={1500}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "contactMessage-error" : undefined}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            setSentSuccess(false);
            if (errors.message) setErrors({ ...errors, message: "" });
          }}
          placeholder="Mô tả tình trạng máy hoặc nhu cầu tư vấn của bạn..."
          className={cn(
            "w-full rounded-xl border bg-surface px-4 py-3 text-base text-navy sm:text-sm",
            errors.message
              ? "border-status-danger-solid focus:border-status-danger-hover"
              : "border-line focus:border-brand"
          )}
        />
        {errors.message && (
          <p
            id="contactMessage-error"
            role="alert"
            className="mt-1.5 text-xs font-medium text-status-danger-ink"
          >
            {errors.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-ink-inverse shadow-brand-glow hover:bg-brand-hover disabled:opacity-60"
      >
        <Send className="h-4 w-4" aria-hidden="true" />
        <span>{loading ? "Đang gửi..." : "Gửi câu hỏi"}</span>
      </button>
    </form>
  );
}
