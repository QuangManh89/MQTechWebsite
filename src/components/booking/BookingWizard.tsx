"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Home,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const DEVICE_TYPES = [
  "Laptop Windows",
  "MacBook",
  "PC / Máy tính bàn",
  "Chưa xác định",
];

const SERVICE_OPTIONS = [
  "Chưa rõ / Cần chẩn đoán miễn phí",
  "Cài Win 10/11 & Phần mềm tại nhà BMT",
  "Sửa máy tính tại nhà BMT",
  "Sửa chữa Laptop Windows",
  "Sửa MacBook chuyên nghiệp",
  "Sửa PC & Build máy bộ",
  "Vệ sinh & Tra keo tản nhiệt",
  "Nâng cấp RAM / SSD",
  "Bảo trì IT công ty / phòng máy",
];

type QuickIssueChip = {
  label: string;
  description: string;
  suggestedService?: string;
};

const QUICK_ISSUE_CHIPS: QuickIssueChip[] = [
  {
    label: "Cài Win 10/11 & Phần mềm",
    description:
      "Cần cài lại Windows 10/11 sạch, Office và phần mềm văn phòng",
    suggestedService: "Cài Win 10/11 & Phần mềm tại nhà BMT",
  },
  {
    label: "Máy chạy chậm / Nâng SSD",
    description:
      "Máy khởi động chậm, hay bị đơ lag, cần kiểm tra nâng cấp SSD/RAM",
    suggestedService: "Nâng cấp RAM / SSD",
  },
  {
    label: "Vệ sinh + Tra keo tản nhiệt",
    description: "Máy nóng, quạt kêu to, cần vệ sinh và tra keo tản nhiệt",
    suggestedService: "Vệ sinh & Tra keo tản nhiệt",
  },
  {
    label: "Không lên nguồn / Màn hình đen",
    description:
      "Bật máy không lên nguồn hoặc màn hình đen, cần kỹ thuật kiểm tra",
  },
  {
    label: "Lỗi WiFi / Chia sẻ máy in",
    description:
      "Lỗi không kết nối được WiFi hoặc không in được máy in văn phòng",
  },
  {
    label: "Thay Pin / Phím / Màn hình",
    description: "Cần kiểm tra thay pin / bàn phím / màn hình laptop",
  },
];

function resolveInitialService(raw?: string): string {
  const trimmed = raw?.trim();
  if (!trimmed) return SERVICE_OPTIONS[0];

  const lower = trimmed.toLowerCase();
  const exact = SERVICE_OPTIONS.find((opt) => opt.toLowerCase() === lower);
  if (exact) return exact;

  if (lower.includes("macbook")) return "Sửa MacBook chuyên nghiệp";
  if (
    lower.includes("bảo trì it") ||
    lower.includes("phòng máy") ||
    lower.includes("doanh nghiệp") ||
    lower.includes("công ty")
  ) {
    return "Bảo trì IT công ty / phòng máy";
  }
  if (
    lower.includes("cài win") ||
    lower.includes("windows") ||
    /\bwin\b/.test(lower) ||
    lower.includes("phần mềm")
  ) {
    return "Cài Win 10/11 & Phần mềm tại nhà BMT";
  }
  if (
    lower.includes("ssd") ||
    /\bram\b/.test(lower) ||
    lower.includes("nâng cấp")
  ) {
    return "Nâng cấp RAM / SSD";
  }
  if (lower.includes("vệ sinh") || lower.includes("keo tản nhiệt")) {
    return "Vệ sinh & Tra keo tản nhiệt";
  }
  if (
    lower.includes("build") ||
    lower.includes("máy bộ") ||
    /\bpc\b/.test(lower)
  ) {
    return "Sửa PC & Build máy bộ";
  }
  if (lower.includes("tại nhà") || lower.includes("tận nơi")) {
    return "Sửa máy tính tại nhà BMT";
  }
  if (lower.includes("laptop")) {
    return "Sửa chữa Laptop Windows";
  }

  return trimmed;
}

const TIME_SLOTS = [
  "08:00 - 10:00",
  "10:00 - 12:00",
  "13:30 - 15:30",
  "15:30 - 17:30",
  "17:30 - 19:30",
];

function getLocalTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function BookingWizard({
  initialService,
  initialIssue,
  storeAddress,
}: {
  initialService?: string;
  initialIssue?: string;
  storeAddress: string;
}) {
  const todayIso = useMemo(() => getLocalTodayIso(), []);
  const wizardTopRef = useRef<HTMLDivElement | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function moveToStep(nextStep: 1 | 2 | 3) {
    setStep(nextStep);
    wizardTopRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  const resolvedInitialService = useMemo(
    () => resolveInitialService(initialService),
    [initialService]
  );

  const [deviceType, setDeviceType] = useState("Laptop Windows");
  const [serviceCategory, setServiceCategory] = useState(
    resolvedInitialService
  );
  const [deviceModel, setDeviceModel] = useState("");
  const [issueDescription, setIssueDescription] = useState(initialIssue || "");

  const selectServiceOptions = useMemo(() => {
    const options = [...SERVICE_OPTIONS];
    if (
      resolvedInitialService &&
      !options.includes(resolvedInitialService)
    ) {
      options.unshift(resolvedInitialService);
    }
    if (serviceCategory && !options.includes(serviceCategory)) {
      options.unshift(serviceCategory);
    }
    return options;
  }, [resolvedInitialService, serviceCategory]);

  const [serviceMode, setServiceMode] = useState<"ONSITE" | "STORE">("ONSITE");
  const [onsiteAddress, setOnsiteAddress] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(todayIso);
  const [appointmentSlot, setAppointmentSlot] = useState(TIME_SLOTS[0]);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  function clearFieldError(field: string) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleNextStep1() {
    if (issueDescription.trim().length < 5) {
      setFieldErrors({
        issueDescription:
          "Vui lòng nhập ít nhất 5 ký tự mô tả triệu chứng lỗi (VD: máy không lên nguồn, quạt kêu to).",
      });
      return;
    }
    setFieldErrors({});
    moveToStep(2);
  }

  function handleNextStep2() {
    const errs: Record<string, string> = {};
    if (serviceMode === "ONSITE" && onsiteAddress.trim().length < 5) {
      errs.onsiteAddress =
        "Vui lòng nhập số nhà, tên đường và phường tại Buôn Ma Thuột để kỹ thuật viên đến đúng nơi.";
    }
    if (!appointmentDate) {
      errs.appointmentDate = "Vui lòng chọn ngày hẹn.";
    } else if (appointmentDate < todayIso) {
      errs.appointmentDate =
        "Ngày hẹn không được nằm trong quá khứ. Vui lòng chọn từ hôm nay trở đi.";
    }
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }
    setFieldErrors({});
    moveToStep(3);
  }

  async function submitBooking() {
    const errs: Record<string, string> = {};
    if (customerName.trim().length < 2) {
      errs.customerName = "Vui lòng nhập họ và tên tối thiểu 2 ký tự.";
    }
    const cleanPhone = customerPhone.replace(/[\s.-]+/g, "");
    if (!/^[0-9+]{9,15}$/.test(cleanPhone)) {
      errs.customerPhone =
        "Số điện thoại cần từ 9 đến 15 chữ số (VD: 0987482573).";
    }
    if (
      customerEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())
    ) {
      errs.customerEmail =
        "Định dạng email chưa đúng (VD: tenban@gmail.com) hoặc để trống nếu không dùng.";
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setFieldErrors({});
    setSubmitError(null);
    setSubmitting(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15_000);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          serviceMode,
          onsiteAddress,
          deviceType,
          serviceCategory,
          deviceModel,
          issueDescription,
          appointmentDate,
          appointmentSlot,
          customerName,
          customerPhone: cleanPhone,
          customerEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg =
          data.error ||
          "Không thể gửi lịch hẹn lúc này. Vui lòng kiểm tra thông tin và thử lại.";
        setSubmitError(msg);
        toast.error(msg);
        return;
      }
      trackEvent("booking_submitted", {
        service_category: serviceCategory,
        service_mode: serviceMode,
        device_type: deviceType,
      });
      setCreatedCode(data.ticket.ticketCode);
      toast.success("Đặt lịch sửa chữa thành công!");
    } catch (err) {
      const isTimeout = err instanceof DOMException && err.name === "AbortError";
      const msg = isTimeout
        ? "Máy chủ phản hồi quá thời gian chờ (15 giây). Thông tin của bạn vẫn được giữ nguyên — hãy bấm Thử gửi lại."
        : "Mất kết nối tới máy chủ. Dữ liệu bạn nhập vẫn được giữ nguyên — hãy kiểm tra mạng và bấm Thử gửi lại.";
      setSubmitError(msg);
      toast.error(isTimeout ? "Quá thời gian kết nối" : "Lỗi kết nối mạng");
    } finally {
      window.clearTimeout(timeoutId);
      setSubmitting(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void submitBooking();
  }

  if (createdCode) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl border border-status-success-line bg-surface p-8 text-center shadow-card"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-status-success-bg text-status-success-ink">
          <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-navy">
          Đặt lịch sửa chữa thành công!
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          Kỹ thuật viên MQTech BMT đã nhận yêu cầu và sẽ gọi xác nhận trong 15
          phút.
        </p>

        <div className="mx-auto my-6 max-w-sm rounded-2xl border border-brand/30 bg-brand-light p-5 space-y-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
              Mã phiếu theo dõi của bạn
            </p>
            <p className="mt-1 font-mono text-2xl font-bold text-brand select-all tabular-nums">
              {createdCode}
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(createdCode);
                setCopiedCode(true);
                toast.success(`Đã sao chép mã ${createdCode}`);
                window.setTimeout(() => setCopiedCode(false), 2500);
              } catch {
                toast.error("Không thể tự động sao chép, vui lòng bôi đen mã phiếu.");
              }
            }}
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-brand/30 bg-surface px-4 py-2 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-ink-inverse"
          >
            {copiedCode ? (
              <>
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Đã sao chép mã</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Sao chép mã phiếu</span>
              </>
            )}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={`/tra-cuu?code=${encodeURIComponent(createdCode)}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-ink-inverse hover:bg-brand-hover"
          >
            <Search className="h-4 w-4" aria-hidden="true" />
            <span>Tra cứu tiến độ phiếu</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              setCreatedCode(null);
              setCopiedCode(false);
              setSubmitError(null);
              setStep(1);
              setIssueDescription("");
            }}
            className="min-h-11 rounded-full border border-line px-5 py-3 text-sm font-semibold text-ink-body hover:bg-surface-subtle"
          >
            Đặt thêm lịch khác
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={wizardTopRef}
      className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card"
    >
      {/* Dark Navy Stepper Header */}
      <div className="bg-navy px-4 py-4 text-ink-inverse sm:px-6">
        <ol
          aria-label="Các bước đặt lịch sửa chữa"
          className="flex flex-wrap items-center justify-between gap-2 sm:flex-nowrap"
        >
          {(
            [
              { num: 1, label: "Thiết bị & lỗi" },
              { num: 2, label: "Hình thức & giờ" },
              { num: 3, label: "Liên hệ" },
            ] as const
          ).map((item, idx) => {
            const isCompleted = step > item.num;
            const inner = (
              <>
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold tabular-nums",
                    step === item.num
                      ? "bg-brand text-ink-inverse"
                      : isCompleted
                      ? "bg-status-success-solid text-ink-inverse"
                      : "bg-surface/10 text-ink-inverse-muted"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    item.num
                  )}
                </span>
                <span
                  className={cn(
                    "text-xs font-semibold sm:text-sm",
                    step >= item.num ? "text-ink-inverse" : "text-ink-inverse-muted"
                  )}
                >
                  {item.label}
                </span>
              </>
            );

            return (
              <li
                key={item.num}
                aria-current={step === item.num ? "step" : undefined}
                className="flex items-center gap-2.5"
              >
                {isCompleted ? (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => moveToStep(item.num)}
                    className="inline-flex min-h-11 items-center gap-2.5 rounded-full px-2 py-1 text-left transition-opacity hover:opacity-90 disabled:opacity-60"
                  >
                    {inner}
                  </button>
                ) : (
                  <div className="inline-flex min-h-11 items-center gap-2.5 px-1">
                    {inner}
                  </div>
                )}
                {idx < 2 && (
                  <span
                    aria-hidden="true"
                    className="hidden h-px w-8 bg-surface/15 sm:inline-block"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-8 space-y-6">
        {step === 1 && (
          <div className="space-y-5">
            <fieldset>
              <legend className="block text-sm font-semibold text-navy mb-2.5">
                Thiết bị của bạn *
              </legend>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {DEVICE_TYPES.map((type) => {
                  const selected = deviceType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setDeviceType(type)}
                      className={cn(
                        "min-h-11 rounded-xl border px-3 py-3 text-xs font-semibold transition-all sm:text-sm",
                        selected
                          ? "border-brand bg-brand-light text-brand ring-1 ring-brand"
                          : "border-line bg-surface text-ink-muted hover:border-line-strong"
                      )}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <label
                htmlFor="serviceCategory"
                className="block text-sm font-semibold text-navy mb-2"
              >
                Dịch vụ quan tâm
              </label>
              <select
                id="serviceCategory"
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value)}
                className="min-h-12 w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-navy focus:border-brand sm:text-sm"
              >
                {selectServiceOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="deviceModel"
                className="block text-sm font-semibold text-navy mb-2"
              >
                Model máy (nếu biết)
              </label>
              <input
                id="deviceModel"
                type="text"
                maxLength={120}
                value={deviceModel}
                onChange={(e) => setDeviceModel(e.target.value)}
                placeholder="VD: Dell Inspiron 15, MacBook Air M2, PC Gaming i5..."
                className="min-h-12 w-full rounded-xl border border-line px-4 py-3 text-base text-navy placeholder:text-ink-subtle focus:border-brand sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="issueDescription"
                className="block text-sm font-semibold text-navy mb-2"
              >
                Mô tả lỗi gặp phải *
              </label>

              <div className="mb-3">
                <p className="text-xs font-medium text-ink-muted mb-2">
                  Chọn nhanh tình trạng máy (1 chạm):
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_ISSUE_CHIPS.map((chip) => {
                    const isSelected = issueDescription === chip.description;
                    return (
                      <button
                        key={chip.label}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => {
                          setIssueDescription(chip.description);
                          clearFieldError("issueDescription");
                          if (
                            chip.suggestedService &&
                            serviceCategory === SERVICE_OPTIONS[0]
                          ) {
                            setServiceCategory(chip.suggestedService);
                          }
                        }}
                        className={cn(
                          "min-h-11 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:text-sm",
                          isSelected
                            ? "border-brand bg-brand-light text-brand ring-1 ring-brand"
                            : "border-line bg-surface-subtle text-navy hover:border-brand/50 hover:bg-brand-light/50"
                        )}
                      >
                        {chip.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <textarea
                id="issueDescription"
                rows={4}
                maxLength={1500}
                aria-invalid={Boolean(fieldErrors.issueDescription)}
                aria-describedby={
                  fieldErrors.issueDescription
                    ? "issueDescription-error"
                    : undefined
                }
                value={issueDescription}
                onChange={(e) => {
                  setIssueDescription(e.target.value);
                  clearFieldError("issueDescription");
                }}
                placeholder="VD: Máy bật không lên nguồn, chạy chậm đơ lag, hoặc cần vệ sinh tra keo tại nhà..."
                className={cn(
                  "w-full rounded-xl border px-4 py-3 text-base text-navy placeholder:text-ink-subtle sm:text-sm",
                  fieldErrors.issueDescription
                    ? "border-status-danger-solid focus:border-status-danger-hover"
                    : "border-line focus:border-brand"
                )}
              />
              {fieldErrors.issueDescription && (
                <p
                  id="issueDescription-error"
                  role="alert"
                  className="mt-1.5 text-xs font-medium text-status-danger-ink"
                >
                  {fieldErrors.issueDescription}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleNextStep1}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-ink-inverse shadow-brand-glow hover:bg-brand-hover"
              >
                <span>Tiếp tục</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <fieldset>
              <legend className="block text-sm font-semibold text-navy mb-2.5">
                Chọn hình thức sửa chữa *
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  aria-pressed={serviceMode === "ONSITE"}
                  onClick={() => setServiceMode("ONSITE")}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                    serviceMode === "ONSITE"
                      ? "border-brand bg-brand-light ring-1 ring-brand"
                      : "border-line hover:border-line-strong"
                  )}
                >
                  <Home
                    className="h-5 w-5 shrink-0 text-brand mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-navy">
                      Sửa tại nhà / Cơ quan (BMT)
                    </p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      Kỹ thuật viên đến tận nơi kiểm tra sau 20 - 30 phút
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  aria-pressed={serviceMode === "STORE"}
                  onClick={() => setServiceMode("STORE")}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-4 text-left transition-all",
                    serviceMode === "STORE"
                      ? "border-brand bg-brand-light ring-1 ring-brand"
                      : "border-line hover:border-line-strong"
                  )}
                >
                  <Building2
                    className="h-5 w-5 shrink-0 text-brand mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-navy">
                      Mang máy đến cửa hàng
                    </p>
                    <p className="text-xs text-ink-muted mt-0.5 break-words">
                      {storeAddress}
                    </p>
                  </div>
                </button>
              </div>
            </fieldset>

            {serviceMode === "ONSITE" && (
              <div>
                <label
                  htmlFor="onsiteAddress"
                  className="block text-sm font-semibold text-navy mb-2"
                >
                  Địa chỉ cần sửa tại Buôn Ma Thuột *
                </label>
                <input
                  id="onsiteAddress"
                  type="text"
                  maxLength={250}
                  aria-invalid={Boolean(fieldErrors.onsiteAddress)}
                  aria-describedby={
                    fieldErrors.onsiteAddress ? "onsiteAddress-error" : undefined
                  }
                  value={onsiteAddress}
                  onChange={(e) => {
                    setOnsiteAddress(e.target.value);
                    clearFieldError("onsiteAddress");
                  }}
                  placeholder="Số nhà, tên đường, phường (VD: Võ Thị Sáu, P. Tân Lập / Hà Huy Tập, P. Tân An / trung tâm BMT)"
                  className={cn(
                    "min-h-12 w-full rounded-xl border px-4 py-3 text-base text-navy placeholder:text-ink-subtle sm:text-sm",
                    fieldErrors.onsiteAddress
                      ? "border-status-danger-solid focus:border-status-danger-hover"
                      : "border-line focus:border-brand"
                  )}
                />
                {fieldErrors.onsiteAddress && (
                  <p
                    id="onsiteAddress-error"
                    role="alert"
                    className="mt-1.5 text-xs font-medium text-status-danger-ink"
                  >
                    {fieldErrors.onsiteAddress}
                  </p>
                )}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="appointmentDate"
                  className="block text-sm font-semibold text-navy mb-2"
                >
                  Ngày hẹn *
                </label>
                <input
                  id="appointmentDate"
                  type="date"
                  min={todayIso}
                  aria-invalid={Boolean(fieldErrors.appointmentDate)}
                  aria-describedby={
                    fieldErrors.appointmentDate
                      ? "appointmentDate-error"
                      : undefined
                  }
                  value={appointmentDate}
                  onChange={(e) => {
                    setAppointmentDate(e.target.value);
                    clearFieldError("appointmentDate");
                  }}
                  className={cn(
                    "min-h-12 w-full rounded-xl border px-4 py-3 text-base text-navy sm:text-sm",
                    fieldErrors.appointmentDate
                      ? "border-status-danger-solid focus:border-status-danger-hover"
                      : "border-line focus:border-brand"
                  )}
                />
                {fieldErrors.appointmentDate && (
                  <p
                    id="appointmentDate-error"
                    role="alert"
                    className="mt-1.5 text-xs font-medium text-status-danger-ink"
                  >
                    {fieldErrors.appointmentDate}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="appointmentSlot"
                  className="block text-sm font-semibold text-navy mb-2"
                >
                  Khung giờ ưu tiên *
                </label>
                <select
                  id="appointmentSlot"
                  value={appointmentSlot}
                  onChange={(e) => setAppointmentSlot(e.target.value)}
                  className="min-h-12 w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-navy focus:border-brand sm:text-sm"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-5 py-3 text-sm font-semibold text-ink-body hover:bg-surface-subtle"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Quay lại</span>
              </button>
              <button
                type="button"
                onClick={handleNextStep2}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-ink-inverse shadow-brand-glow hover:bg-brand-hover"
              >
                <span>Tiếp tục</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            {submitError && (
              <div
                role="alert"
                className="flex flex-col gap-3 rounded-xl border border-status-danger-line bg-status-danger-bg p-4 text-sm text-status-danger-ink sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <AlertCircle
                    className="h-5 w-5 shrink-0 text-status-danger-ink mt-0.5"
                    aria-hidden="true"
                  />
                  <span className="break-words">{submitError}</span>
                </div>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => void submitBooking()}
                  className="min-h-11 shrink-0 rounded-full bg-status-danger-solid px-4 py-2 text-xs font-semibold text-ink-inverse hover:bg-status-danger-hover disabled:opacity-60"
                >
                  Thử gửi lại
                </button>
              </div>
            )}

            <div>
              <label
                htmlFor="customerName"
                className="block text-sm font-semibold text-navy mb-2"
              >
                Họ và tên *
              </label>
              <input
                id="customerName"
                type="text"
                required
                maxLength={100}
                autoComplete="name"
                aria-invalid={Boolean(fieldErrors.customerName)}
                aria-describedby={
                  fieldErrors.customerName ? "customerName-error" : undefined
                }
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  clearFieldError("customerName");
                }}
                placeholder="VD: Nguyễn Văn An"
                className={cn(
                  "min-h-12 w-full rounded-xl border px-4 py-3 text-base text-navy placeholder:text-ink-subtle sm:text-sm",
                  fieldErrors.customerName
                    ? "border-status-danger-solid focus:border-status-danger-hover"
                    : "border-line focus:border-brand"
                )}
              />
              {fieldErrors.customerName && (
                <p
                  id="customerName-error"
                  role="alert"
                  className="mt-1.5 text-xs font-medium text-status-danger-ink"
                >
                  {fieldErrors.customerName}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="customerPhone"
                  className="block text-sm font-semibold text-navy mb-2"
                >
                  Số điện thoại (Zalo) *
                </label>
                <input
                  id="customerPhone"
                  type="tel"
                  required
                  maxLength={20}
                  autoComplete="tel"
                  aria-invalid={Boolean(fieldErrors.customerPhone)}
                  aria-describedby={
                    fieldErrors.customerPhone ? "customerPhone-error" : undefined
                  }
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    clearFieldError("customerPhone");
                  }}
                  placeholder="09xx xxx xxx"
                  className={cn(
                    "min-h-12 w-full rounded-xl border px-4 py-3 text-base text-navy placeholder:text-ink-subtle sm:text-sm",
                    fieldErrors.customerPhone
                      ? "border-status-danger-solid focus:border-status-danger-hover"
                      : "border-line focus:border-brand"
                  )}
                />
                {fieldErrors.customerPhone && (
                  <p
                    id="customerPhone-error"
                    role="alert"
                    className="mt-1.5 text-xs font-medium text-status-danger-ink"
                  >
                    {fieldErrors.customerPhone}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="customerEmail"
                  className="block text-sm font-semibold text-navy mb-2"
                >
                  Email (không bắt buộc)
                </label>
                <input
                  id="customerEmail"
                  type="email"
                  maxLength={120}
                  autoComplete="email"
                  aria-invalid={Boolean(fieldErrors.customerEmail)}
                  aria-describedby={
                    fieldErrors.customerEmail ? "customerEmail-error" : undefined
                  }
                  value={customerEmail}
                  onChange={(e) => {
                    setCustomerEmail(e.target.value);
                    clearFieldError("customerEmail");
                  }}
                  placeholder="email@example.com"
                  className={cn(
                    "min-h-12 w-full rounded-xl border px-4 py-3 text-base text-navy placeholder:text-ink-subtle sm:text-sm",
                    fieldErrors.customerEmail
                      ? "border-status-danger-solid focus:border-status-danger-hover"
                      : "border-line focus:border-brand"
                  )}
                />
                {fieldErrors.customerEmail && (
                  <p
                    id="customerEmail-error"
                    role="alert"
                    className="mt-1.5 text-xs font-medium text-status-danger-ink"
                  >
                    {fieldErrors.customerEmail}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-surface-subtle p-4 text-xs leading-relaxed text-ink-body break-words">
              <p className="font-semibold text-navy mb-1">Tóm tắt lịch hẹn:</p>
              <p>
                {deviceType} • {serviceCategory} •{" "}
                {serviceMode === "ONSITE"
                  ? `Sửa tận nơi: ${onsiteAddress}`
                  : "Mang đến cửa hàng"}{" "}
                • {appointmentDate} ({appointmentSlot})
              </p>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setStep(2)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-5 py-3 text-sm font-semibold text-ink-body hover:bg-surface-subtle disabled:opacity-60"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Quay lại</span>
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-7 py-3 text-sm font-semibold text-ink-inverse shadow-brand-glow hover:bg-brand-hover disabled:opacity-60"
              >
                <span>{submitting ? "Đang gửi..." : "Hoàn tất đặt lịch"}</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
