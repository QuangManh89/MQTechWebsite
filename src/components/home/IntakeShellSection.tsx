"use client";

import React, { useState } from "react";
import { ShieldCheck, AlertTriangle, ArrowRight } from "lucide-react";
import { MQTECH_SERVICES } from "@/lib/constants/services";

export function IntakeShellSection() {
  const [deliveryMode, setDeliveryMode] = useState<"IN_STORE" | "ON_SITE">("IN_STORE");

  return (
    <section id="yeu-cau-dich-vu" className="bg-[#0A0A0B] text-white py-20 lg:py-28 border-t border-white/10 relative overflow-hidden">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[900px] rounded-full bg-[#3B82F6]/10 blur-[150px]"
      />

      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-14 items-start">
          {/* Left Column: Direct Guidance & Security Notice */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-[11px] tracking-[0.12em] uppercase font-medium text-white/80">
              Tiếp nhận & Xác nhận
            </div>
            <h2 className="mt-4 text-[32px] sm:text-[42px] font-bold tracking-tight text-white leading-[1.1]">
              Gửi Yêu Cầu Dịch Vụ — Hỗ Trợ Nhanh Chóng
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-white/70">
              Quý khách chỉ cần cung cấp thông tin liên hệ và mô tả sự cố. Kỹ
              thuật viên MQTech sẽ chủ động gọi điện hoặc nhắn tin Zalo để trao
              đổi chi tiết và xác nhận phương án hỗ trợ.
            </p>

            {/* Crucial Security Notice */}
            <div className="mt-8 rounded-[18px] bg-white/[0.04] border border-white/10 p-5 space-y-3">
              <div className="flex items-center gap-2 text-[13.5px] font-semibold text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Cam kết bảo mật & quyền riêng tư</span>
              </div>
              <p className="text-[13px] text-white/60 leading-relaxed">
                MQTech <strong>không bao giờ</strong> yêu cầu khách hàng cung cấp
                mật khẩu Windows, mã PIN hay tài khoản email qua biểu mẫu. Quý
                khách hoàn toàn yên tâm về an toàn dữ liệu cá nhân.
              </p>
            </div>

            {/* Confirmation State Note */}
            <div className="mt-4 rounded-[18px] bg-[#3B82F6]/10 border border-[#3B82F6]/20 p-5">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-[#3B82F6] shrink-0 mt-0.5" />
                <div className="text-[13px] text-white/80 leading-relaxed">
                  <span className="font-semibold text-white">Trạng thái tiếp nhận:</span>{" "}
                  Yêu cầu gửi qua website sẽ ở trạng thái <em>Chờ xác nhận</em>.
                  Nhân viên sẽ liên hệ để xác nhận thời gian chính thức trước khi
                  tiến hành kiểm tra hoặc sửa chữa.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Representative Request Form Shell */}
          <div className="rounded-[24px] bg-[#121214] border border-white/10 p-7 lg:p-9 shadow-2xl backdrop-blur">
            <h3 className="text-[20px] font-bold text-white tracking-tight">
              Phiếu Tiếp Nhận Yêu Cầu
            </h3>
            <p className="text-[13px] text-white/50 mt-1">
              Phục vụ tại TP. Buôn Ma Thuột và lân cận (~15 km)
            </p>

            {/* Dual Delivery Mode Toggle Pill */}
            <div className="mt-6 flex rounded-full bg-white/[0.05] p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setDeliveryMode("IN_STORE")}
                className={`flex-1 rounded-full py-2.5 text-[13px] font-semibold transition-all ${
                  deliveryMode === "IN_STORE"
                    ? "bg-white text-[#0A0A0B] shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Mang máy đến tiệm
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMode("ON_SITE")}
                className={`flex-1 rounded-full py-2.5 text-[13px] font-semibold transition-all ${
                  deliveryMode === "ON_SITE"
                    ? "bg-white text-[#0A0A0B] shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                Sửa chữa tận nơi
              </button>
            </div>

            {/* Form Fields */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert(
                  "Trong Phase P1, biểu mẫu này hoạt động như một thành phần giao diện mẫu. Logic xử lý backend và lưu cơ sở dữ liệu sẽ được triển khai chính thức trong Phase P2 theo đúng quy trình kế hoạch."
                );
              }}
              className="mt-6 space-y-4"
            >
              <div>
                <label className="block text-[13px] font-medium text-white/70 mb-1.5">
                  Họ và tên của bạn <span className="text-[#3B82F6]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full rounded-[12px] bg-white/[0.04] border border-white/10 px-4 py-3 text-[14px] text-white placeholder-white/30 outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-white/70 mb-1.5">
                  Số điện thoại liên hệ (hoặc số Zalo) <span className="text-[#3B82F6]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Ví dụ: 09xx xxx xxx"
                  className="w-full rounded-[12px] bg-white/[0.04] border border-white/10 px-4 py-3 text-[14px] text-white placeholder-white/30 outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-white/70 mb-1.5">
                  Chọn nhóm dịch vụ cần hỗ trợ
                </label>
                <select className="w-full rounded-[12px] bg-[#18181B] border border-white/10 px-4 py-3 text-[14px] text-white outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition">
                  {MQTECH_SERVICES.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#18181B] text-white">
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-white/70 mb-1.5">
                  Mô tả tình trạng sự cố của máy
                </label>
                <textarea
                  rows={3}
                  placeholder="Ví dụ: Máy laptop không lên nguồn, quạt kêu to, cần kiểm tra..."
                  className="w-full rounded-[12px] bg-white/[0.04] border border-white/10 px-4 py-3 text-[14px] text-white placeholder-white/30 outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full h-[48px] rounded-full bg-white text-[#0A0A0B] font-semibold text-[14px] shadow-[0_8px_24px_rgba(255,255,255,0.14)] hover:shadow-[0_12px_32px_rgba(255,255,255,0.22)] active:scale-[0.98] transition flex items-center justify-center gap-2 mt-2"
              >
                <span>Gửi yêu cầu dịch vụ</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <p className="text-center text-[11px] text-white/40 mt-3">
                Thông tin của bạn được bảo mật tuyệt đối. Chúng tôi không bao giờ chia sẻ số điện thoại với bên thứ ba.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
