import React from "react";
import Link from "next/link";
import {
  Laptop,
  Cpu,
  Wrench,
  Printer,
  Network,
  ShieldCheck,
  Check,
  ArrowRight,
} from "lucide-react";
import { MQTECH_SERVICES, ServiceItem } from "@/lib/constants/services";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Laptop,
  Cpu,
  Wrench,
  Printer,
  Network,
  ShieldCheck,
};

export function ServicesSection() {
  return (
    <section id="dich-vu" className="bg-[#F5F5F7] text-[#0A0A0B] py-20 lg:py-28">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-[640px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.04] px-3.5 py-1.5 text-[11px] tracking-[0.12em] uppercase font-semibold text-[#0A0A0B]/70">
            Dịch vụ kỹ thuật cốt lõi
          </div>
          <h2 className="mt-4 text-[32px] sm:text-[42px] font-bold tracking-tight text-[#0A0A0B] leading-[1.1]">
            Chẩn đoán chuẩn xác. Phục vụ tận tâm.
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-[#0A0A0B]/65">
            MQTech tập trung vào 6 nhóm dịch vụ thiết thực nhất cho nhu cầu sử
            dụng máy tính của gia đình, cá nhân và văn phòng tại Buôn Ma Thuột.
          </p>
        </div>

        {/* 6-Card Services Grid */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MQTECH_SERVICES.map((service: ServiceItem) => {
            const IconComponent = ICON_MAP[service.icon] || Laptop;
            const isDeliveryDual = service.deliveryModes.includes("IN_STORE") && service.deliveryModes.includes("ON_SITE");

            return (
              <div
                key={service.id}
                className="group relative flex flex-col justify-between rounded-[22px] bg-white p-7 border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(0,0,0,0.08)]"
              >
                <div>
                  {/* Top Bar with Icon and Mode Tag */}
                  <div className="flex items-start justify-between">
                    <div className="grid h-12 w-12 place-items-center rounded-[12px] bg-[#3B82F6]/10 text-[#3B82F6] transition-transform duration-200 group-hover:scale-105">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-black/[0.04] px-3 py-1 text-[11px] font-medium text-[#0A0A0B]/60">
                      {isDeliveryDual ? "Tại tiệm & Tận nơi" : "Hỗ trợ tận nơi"}
                    </span>
                  </div>

                  {/* Title & Short Description */}
                  <h3 className="mt-5 text-[19px] font-bold tracking-tight text-[#0A0A0B]">
                    {service.title}
                  </h3>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-[#0A0A0B]/65">
                    {service.shortDesc}
                  </p>

                  {/* Feature Checklist */}
                  <ul className="mt-6 space-y-2.5 border-t border-black/[0.06] pt-5 text-[13px] text-[#0A0A0B]/80">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-[#3B82F6] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer Action */}
                <div className="mt-8 pt-4 border-t border-black/[0.04] flex items-center justify-between">
                  <span className="text-[12px] font-medium text-[#0A0A0B]/50">
                    Báo giá trước khi làm
                  </span>
                  <Link
                    href="#yeu-cau-dich-vu"
                    className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#3B82F6] hover:text-[#2563EB] transition-colors"
                  >
                    <span>Yêu cầu tư vấn</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
