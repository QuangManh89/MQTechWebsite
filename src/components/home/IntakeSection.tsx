"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Copy,
  Check,
  RotateCcw,
  Loader2,
  MapPin,
  Clock,
} from "lucide-react";
import { MQTECH_SERVICES } from "@/lib/constants/services";
import { ServiceDeliveryMode, DeviceCategory } from "@/lib/db/types";

interface SubmissionSuccessData {
  referenceCode: string;
  customerName: string;
  serviceMode: ServiceDeliveryMode;
  deviceCategory: DeviceCategory;
  statusLabel: string;
  createdAt: string;
}

export function IntakeSection() {
  // Form State
  const [serviceMode, setServiceMode] = useState<ServiceDeliveryMode>("IN_STORE");
  const [deviceCategory, setDeviceCategory] = useState<DeviceCategory>("LAPTOP");
  const [serviceCategoryId, setServiceCategoryId] = useState<string>(
    MQTECH_SERVICES[0].id
  );
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [serviceAddress, setServiceAddress] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [preferredContactTime, setPreferredContactTime] = useState("Càng sớm càng tốt");

  // Interaction & Validation States
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<SubmissionSuccessData | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Listen for pre-selection events from service cards or hero
  useEffect(() => {
    const handleServiceSelect = (event: Event) => {
      const customEvent = event as CustomEvent<{
        serviceId?: string;
        mode?: ServiceDeliveryMode;
      }>;
      if (customEvent.detail?.serviceId) {
        setServiceCategoryId(customEvent.detail.serviceId);
      }
      if (customEvent.detail?.mode) {
        setServiceMode(customEvent.detail.mode);
      }
      // Scroll to intake section
      const el = document.getElementById("yeu-cau-dich-vu");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    };

    window.addEventListener("mqtech-select-service", handleServiceSelect);
    return () => {
      window.removeEventListener("mqtech-select-service", handleServiceSelect);
    };
  }, []);

  // Client-side quick check
  const validateClient = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerName.trim() || customerName.trim().length < 2) {
      newErrors.customerName = "Vui lòng nhập họ và tên của bạn (ít nhất 2 ký tự).";
    }

    const cleanPhone = customerPhone.trim().replace(/\s+/g, "");
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
    if (!cleanPhone) {
      newErrors.customerPhone = "Vui lòng nhập số điện thoại liên hệ.";
    } else if (!phoneRegex.test(cleanPhone)) {
      newErrors.customerPhone = "Số điện thoại không đúng định dạng di động Việt Nam.";
    }

    if (serviceMode === "ON_SITE") {
      if (!serviceAddress.trim() || serviceAddress.trim().length < 5) {
        newErrors.serviceAddress =
          "Vui lòng cung cấp địa chỉ cụ thể tại Buôn Ma Thuột để kỹ thuật viên đến tận nơi.";
      }
    }

    if (!issueDescription.trim() || issueDescription.trim().length < 10) {
      newErrors.issueDescription =
        "Vui lòng mô tả sự cố rõ hơn (ít nhất 10 ký tự) để chúng tôi chuẩn bị giải pháp.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateClient()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        serviceMode,
        deviceCategory,
        serviceCategoryId,
        issueDescription: issueDescription.trim(),
        serviceAddress:
          serviceMode === "ON_SITE" ? serviceAddress.trim() : undefined,
        preferredContactTime: preferredContactTime.trim(),
      };

      const res = await fetch("/api/service-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setGeneralError(
            result.error || "Gửi yêu cầu không thành công. Quý khách vui lòng thử lại."
          );
        }
        return;
      }

      // Success
      setSuccessData(result.data);
      setErrors({});
    } catch {
      setGeneralError(
        "Không thể kết nối tới máy chủ tiếp nhận. Quý khách vui lòng kiểm tra kết nối mạng và thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleReset = () => {
    setSuccessData(null);
    setCustomerName("");
    setCustomerPhone("");
    setServiceAddress("");
    setIssueDescription("");
    setErrors({});
    setGeneralError(null);
  };

  return (
    <section
      id="yeu-cau-dich-vu"
      className="bg-brand-dark text-white py-20 lg:py-28 border-t border-surface-dark-border relative overflow-hidden"
    >
      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-14 items-start">
          {/* Left Column: Guidance, Security Notice & Service Area */}
          <div>
            <p className="text-[13px] font-medium text-blue-400 mb-2">
              Tiếp nhận & xác nhận
            </p>
            <h2 className="text-balance text-[32px] sm:text-[42px] font-bold tracking-tight text-white leading-[1.1]">
              Gửi Yêu Cầu Dịch Vụ: Phục Vụ Chu Đáo
            </h2>
            <p className="text-pretty mt-4 text-[15px] leading-relaxed text-neutral-300">
              Quý khách chỉ cần để lại thông tin liên hệ và mô tả sự cố máy tính.
              Kỹ thuật viên MQTech sẽ chủ động gọi điện hoặc liên hệ qua Zalo để
              tư vấn chẩn đoán ban đầu và xác nhận lịch hẹn trước khi tiếp nhận.
            </p>

            {/* Crucial Security Notice */}
            <div className="mt-8 rounded-[18px] bg-white/[0.04] border border-white/10 p-5 space-y-3">
              <div className="flex items-center gap-2 text-[13.5px] font-semibold text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Cam kết an toàn thông tin & dữ liệu</span>
              </div>
              <p className="text-[13px] text-neutral-300 leading-relaxed">
                MQTech <strong>không bao giờ</strong> yêu cầu khách hàng cung cấp
                mật khẩu đăng nhập Windows, mã PIN hay mật khẩu email qua biểu
                mẫu. Quý khách hoàn toàn an tâm về tính riêng tư của dữ liệu cá
                nhân.
              </p>
            </div>

            {/* Mandatory Confirmation Notice */}
            <div className="mt-4 rounded-[18px] bg-blue-500/10 border border-blue-500/20 p-5">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-[13px] text-neutral-200 leading-relaxed">
                  <span className="font-semibold text-white">
                    Quy định trạng thái:
                  </span>{" "}
                  Yêu cầu sau khi gửi sẽ ở trạng thái <em>Chờ xác nhận</em>. Nhân
                  viên sẽ liên hệ với quý khách để xác nhận chi tiết trước khi
                  lịch hẹn có hiệu lực chính thức.
                </div>
              </div>
            </div>

            {/* Service Area Card */}
            <div className="mt-4 rounded-[18px] bg-white/[0.02] border border-white/[0.08] p-5 text-[13px] text-neutral-300 space-y-2">
              <div className="flex items-center gap-2 font-medium text-white">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span>Phạm vi phục vụ: Buôn Ma Thuột & Lân cận</span>
              </div>
              <p className="text-neutral-400 text-[12.5px] leading-relaxed">
                Hỗ trợ kỹ thuật viên đến sửa tận nơi trong bán kính ~15 km từ trung
                tâm thành phố. Địa chỉ cửa hàng chính thức đang được hoàn thiện cập
                nhật, vui lòng liên hệ trước khi mang máy đến.
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Form or Success View */}
          <div className="rounded-[24px] bg-surface-dark-card border border-surface-dark-border p-7 lg:p-9 relative">
            {successData ? (
              /* Success View */
              <div className="py-2 text-center animate-in fade-in duration-200">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-400 mb-5">
                  <CheckCircle2 className="h-9 w-9" />
                </div>

                <h3 className="text-[22px] font-bold text-white tracking-tight">
                  Tiếp Nhận Thành Công!
                </h3>

                <p className="text-[14px] text-neutral-300 mt-2 max-w-[420px] mx-auto leading-relaxed">
                  Yêu cầu của <strong>{successData.customerName}</strong> đã được
                  ghi nhận vào hệ thống tiếp nhận dịch vụ của MQTech.
                </p>

                {/* Reference Code Box */}
                <div className="mt-6 rounded-[16px] bg-white/[0.04] border border-white/10 p-4 max-w-[360px] mx-auto">
                  <span className="text-[11px] font-medium text-neutral-400 block">
                    Mã tra cứu yêu cầu
                  </span>
                  <div className="mt-1 flex items-center justify-center gap-3">
                    <span className="font-mono text-[22px] font-bold tracking-wider text-white">
                      {successData.referenceCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(successData.referenceCode)}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white/80 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Sao chép mã tra cứu"
                    >
                      {copiedCode ? (
                        <Check className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {copiedCode && (
                    <span className="text-[11px] text-emerald-400 block mt-1">
                      Đã sao chép mã vào bộ nhớ tạm!
                    </span>
                  )}
                </div>

                {/* Status Chip */}
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 text-[12px] font-medium text-amber-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Trạng thái: {successData.statusLabel}</span>
                </div>

                {/* Next Steps Guidance */}
                <div className="mt-6 text-left rounded-[16px] bg-blue-500/10 border border-blue-500/20 p-4 text-[13px] text-neutral-200 space-y-2">
                  <p className="font-semibold text-white">
                    Các bước tiếp theo của MQTech:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-neutral-300 text-[12.5px]">
                    <li>
                      Kỹ thuật viên sẽ kiểm tra nội dung sự cố và gọi điện/nhắn
                      Zalo tới số điện thoại của quý khách.
                    </li>
                    <li>
                      Trao đổi chẩn đoán dự kiến và xác nhận thời gian hỗ trợ cụ
                      thể.
                    </li>
                    <li>
                      <em>Lưu ý:</em> Đây là phiếu ghi nhận thông tin, chưa phải
                      lịch hẹn đã xác nhận chính thức.
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 py-2.5 text-[13px] font-medium text-white hover:bg-white/[0.12] transition-colors duration-150 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                  <span className="whitespace-nowrap">Gửi thêm yêu cầu dịch vụ khác</span>
                </button>
              </div>
            ) : (
              /* Request Form View */
              <div>
                <h3 className="text-[20px] font-bold text-white tracking-tight">
                  Phiếu Tiếp Nhận Yêu Cầu
                </h3>
                <p className="text-[13px] text-neutral-400 mt-1">
                  Chọn phương thức nhận máy phù hợp với nhu cầu của bạn
                </p>

                {/* Dual Delivery Mode Toggle Pill */}
                <div
                  role="tablist"
                  aria-label="Hình thức tiếp nhận dịch vụ"
                  className="mt-6 flex rounded-full bg-white/[0.05] p-1 border border-white/10"
                >
                  <button
                    type="button"
                    role="tab"
                    id="tab-in-store"
                    aria-selected={serviceMode === "IN_STORE"}
                    onClick={() => {
                      setServiceMode("IN_STORE");
                      if (errors.serviceAddress) {
                        const next = { ...errors };
                        delete next.serviceAddress;
                        setErrors(next);
                      }
                    }}
                    className={`flex-1 rounded-full py-2.5 text-[13px] font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap ${
                      serviceMode === "IN_STORE"
                        ? "bg-white text-brand-dark"
                        : "text-neutral-300 hover:text-white"
                    }`}
                  >
                    Mang máy đến tiệm
                  </button>
                  <button
                    type="button"
                    role="tab"
                    id="tab-on-site"
                    aria-selected={serviceMode === "ON_SITE"}
                    onClick={() => setServiceMode("ON_SITE")}
                    className={`flex-1 rounded-full py-2.5 text-[13px] font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap ${
                      serviceMode === "ON_SITE"
                        ? "bg-white text-brand-dark"
                        : "text-neutral-300 hover:text-white"
                    }`}
                  >
                    Sửa chữa tận nơi
                  </button>
                </div>

                {serviceMode === "IN_STORE" && (
                  <div className="mt-4 rounded-[14px] bg-blue-500/10 border border-blue-500/20 p-3.5 text-[12.5px] text-neutral-200 flex items-start gap-2.5 animate-in fade-in duration-150">
                    <MapPin className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <span className="font-semibold text-white">Địa chỉ tiệm tiếp nhận:</span>{" "}
                      Hẻm 4, số nhà 13/2 Võ Thị Sáu, Phường Tân Lập, TP. Buôn Ma Thuột.
                      <span className="text-neutral-400 block mt-0.5">
                        Giờ làm việc: 08:00 – 18:30 (Thứ 2 – Chủ Nhật) · Hotline: 0987 482 573
                      </span>
                    </div>
                  </div>
                )}

                {generalError && (
                  <div
                    role="alert"
                    className="mt-4 rounded-[12px] bg-red-500/10 border border-red-500/20 p-3.5 text-[13px] text-red-400"
                  >
                    {generalError}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
                  {/* Customer Name */}
                  <div>
                    <label
                      htmlFor="customerName"
                      className="block text-[13px] font-medium text-neutral-300 mb-1.5"
                    >
                      Họ và tên của bạn <span className="text-blue-400">*</span>
                    </label>
                    <input
                      id="customerName"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn A"
                      aria-invalid={Boolean(errors.customerName)}
                      aria-describedby={
                        errors.customerName ? "err-customerName" : undefined
                      }
                      className={`w-full rounded-[12px] bg-surface-dark-elevated border px-4 py-3 text-[14px] text-white placeholder-neutral-500 outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-150 ${
                        errors.customerName
                          ? "border-red-500 focus:border-red-500"
                          : "border-surface-dark-border focus:border-blue-500"
                      }`}
                    />
                    {errors.customerName && (
                      <p
                        id="err-customerName"
                        className="mt-1 text-[12px] text-red-400"
                      >
                        {errors.customerName}
                      </p>
                    )}
                  </div>

                  {/* Customer Phone */}
                  <div>
                    <label
                      htmlFor="customerPhone"
                      className="block text-[13px] font-medium text-neutral-300 mb-1.5"
                    >
                      Số điện thoại liên hệ (hoặc số Zalo){" "}
                      <span className="text-blue-400">*</span>
                    </label>
                    <input
                      id="customerPhone"
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Ví dụ: 0912 345 678"
                      aria-invalid={Boolean(errors.customerPhone)}
                      aria-describedby={
                        errors.customerPhone ? "err-customerPhone" : undefined
                      }
                      className={`w-full rounded-[12px] bg-surface-dark-elevated border px-4 py-3 text-[14px] text-white placeholder-neutral-500 outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-150 ${
                        errors.customerPhone
                          ? "border-red-500 focus:border-red-500"
                          : "border-surface-dark-border focus:border-blue-500"
                      }`}
                    />
                    {errors.customerPhone && (
                      <p
                        id="err-customerPhone"
                        className="mt-1 text-[12px] text-red-400"
                      >
                        {errors.customerPhone}
                      </p>
                    )}
                  </div>

                  {/* Device Category & Service Group */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="deviceCategory"
                        className="block text-[13px] font-medium text-neutral-300 mb-1.5"
                      >
                        Loại thiết bị
                      </label>
                      <select
                        id="deviceCategory"
                        value={deviceCategory}
                        onChange={(e) =>
                          setDeviceCategory(e.target.value as DeviceCategory)
                        }
                        className="w-full rounded-[12px] bg-surface-dark-elevated border border-surface-dark-border px-3.5 py-3 text-[13.5px] text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-150"
                      >
                        <option value="LAPTOP">Laptop</option>
                        <option value="PC_DESKTOP">Máy tính để bàn (PC)</option>
                        <option value="PRINTER">Máy in văn phòng</option>
                        <option value="NETWORK">Thiết bị mạng (Router/LAN)</option>
                        <option value="OTHER">Thiết bị khác</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="serviceCategoryId"
                        className="block text-[13px] font-medium text-neutral-300 mb-1.5"
                      >
                        Nhóm dịch vụ cần hỗ trợ
                      </label>
                      <select
                        id="serviceCategoryId"
                        value={serviceCategoryId}
                        onChange={(e) => setServiceCategoryId(e.target.value)}
                        className="w-full rounded-[12px] bg-surface-dark-elevated border border-surface-dark-border px-3.5 py-3 text-[13.5px] text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-150"
                      >
                        {MQTECH_SERVICES.map((s) => (
                          <option
                            key={s.id}
                            value={s.id}
                            className="bg-surface-dark-elevated text-white"
                          >
                            {s.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Service Address (Conditional: Required if Mode B: ON_SITE) */}
                  {serviceMode === "ON_SITE" && (
                    <div className="animate-in fade-in duration-150">
                      <label
                        htmlFor="serviceAddress"
                        className="block text-[13px] font-medium text-neutral-300 mb-1.5"
                      >
                        Địa chỉ phục vụ tận nơi tại Buôn Ma Thuột{" "}
                        <span className="text-blue-400">*</span>
                      </label>
                      <input
                        id="serviceAddress"
                        type="text"
                        required
                        value={serviceAddress}
                        onChange={(e) => setServiceAddress(e.target.value)}
                        placeholder="Số nhà, tên đường, phường/xã tại Buôn Ma Thuột"
                        aria-invalid={Boolean(errors.serviceAddress)}
                        aria-describedby={
                          errors.serviceAddress ? "err-serviceAddress" : undefined
                        }
                        className={`w-full rounded-[12px] bg-surface-dark-elevated border px-4 py-3 text-[14px] text-white placeholder-neutral-500 outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-150 ${
                          errors.serviceAddress
                            ? "border-red-500 focus:border-red-500"
                            : "border-surface-dark-border focus:border-blue-500"
                        }`}
                      />
                      {errors.serviceAddress && (
                        <p
                          id="err-serviceAddress"
                          className="mt-1 text-[12px] text-red-400"
                        >
                          {errors.serviceAddress}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Issue Description */}
                  <div>
                    <label
                      htmlFor="issueDescription"
                      className="block text-[13px] font-medium text-neutral-300 mb-1.5"
                    >
                      Mô tả tình trạng sự cố <span className="text-blue-400">*</span>
                    </label>
                    <textarea
                      id="issueDescription"
                      rows={3}
                      required
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      placeholder="Ví dụ: Máy laptop không lên nguồn, quạt kêu to, cần kiểm tra và báo giá…"
                      aria-invalid={Boolean(errors.issueDescription)}
                      aria-describedby={
                        errors.issueDescription ? "err-issueDescription" : undefined
                      }
                      className={`w-full rounded-[12px] bg-surface-dark-elevated border px-4 py-3 text-[14px] text-white placeholder-neutral-500 outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-150 resize-none ${
                        errors.issueDescription
                          ? "border-red-500 focus:border-red-500"
                          : "border-surface-dark-border focus:border-blue-500"
                      }`}
                    />
                    {errors.issueDescription && (
                      <p
                        id="err-issueDescription"
                        className="mt-1 text-[12px] text-red-400"
                      >
                        {errors.issueDescription}
                      </p>
                    )}
                  </div>

                  {/* Preferred Contact Time */}
                  <div>
                    <label
                      htmlFor="preferredContactTime"
                      className="block text-[13px] font-medium text-neutral-300 mb-1.5"
                    >
                      Khung giờ thuận tiện nhận cuộc gọi / tin nhắn Zalo
                    </label>
                    <select
                      id="preferredContactTime"
                      value={preferredContactTime}
                      onChange={(e) => setPreferredContactTime(e.target.value)}
                      className="w-full rounded-[12px] bg-surface-dark-elevated border border-surface-dark-border px-3.5 py-3 text-[13.5px] text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-150"
                    >
                      <option value="Càng sớm càng tốt">Càng sớm càng tốt</option>
                      <option value="Buổi sáng (08:00 - 11:30)">
                        Buổi sáng (08:00 - 11:30)
                      </option>
                      <option value="Buổi chiều (13:30 - 17:00)">
                        Buổi chiều (13:30 - 17:00)
                      </option>
                      <option value="Buổi tối (17:30 - 20:00)">
                        Buổi tối (17:30 - 20:00)
                      </option>
                    </select>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-[48px] rounded-xl bg-white text-brand-dark font-semibold text-[14px] hover:bg-neutral-100 active:scale-[0.98] transition-colors duration-150 flex items-center justify-center gap-2 mt-4 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 whitespace-nowrap"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-brand-dark shrink-0" />
                        <span className="whitespace-nowrap">Đang gửi yêu cầu…</span>
                      </>
                    ) : (
                      <>
                        <span className="whitespace-nowrap">Gửi yêu cầu dịch vụ</span>
                        <ArrowRight className="h-4 w-4 shrink-0" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-[12px] text-neutral-400 mt-3 leading-normal">
                    Thông tin liên hệ của quý khách chỉ dùng để liên lạc xác nhận dịch vụ.
                    MQTech cam kết bảo mật tuyệt đối.
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
