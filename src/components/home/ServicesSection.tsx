"use client";

import React from "react";
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
  const handleSelect = (serviceId: string, preferredMode: "IN_STORE" | "ON_SITE") => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("mqtech-select-service", {
          detail: { serviceId, mode: preferredMode },
        })
      );
    }
  };

  return (
    <section id="dich-vu" className="bg-slate-50 text-slate-900 py-20 lg:py-28 border-b border-slate-200/80">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 text-balance">
            6 Hạng Mục Phục Vụ Đạt Chuẩn
          </h2>
          <p className="mt-3 text-base text-slate-600 leading-relaxed text-pretty">
            MQTech tập trung vào 6 nhóm dịch vụ thiết thực nhất cho nhu cầu sử dụng máy tính của gia đình, cá nhân và văn phòng tại Buôn Ma Thuột.
          </p>
        </div>

        {/* 6-Card Services Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MQTECH_SERVICES.map((service: ServiceItem) => {
            const IconComponent = ICON_MAP[service.icon] || Laptop;
            const isDeliveryDual =
              service.deliveryModes.includes("IN_STORE") &&
              service.deliveryModes.includes("ON_SITE");
            const defaultMode = service.deliveryModes[0];

            return (
              <div
                key={service.id}
                className="group relative flex flex-col justify-between rounded-2xl bg-white p-6 sm:p-7 border border-slate-200/80 shadow-xs transition-transform duration-200 hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none hover:shadow-md hover:border-indigo-300"
              >
                <div>
                  {/* Top Bar with Icon and Mode Tag */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600 transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 border border-slate-200">
                      {isDeliveryDual ? "Tại tiệm & Tận nơi" : "Tại tiệm"}
                    </span>
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug text-balance">
                    {service.title}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-600 mb-5">
                    {service.shortDesc}
                  </p>

                  {/* Features Bullet List */}
                  <ul className="space-y-2 pt-3 border-t border-slate-100">
                    {service.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                        <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Footer Action */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Buôn Ma Thuột</span>
                  <button
                    type="button"
                    onClick={() => handleSelect(service.id, defaultMode)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 group-hover:text-indigo-800 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-md"
                  >
                    <span>Yêu cầu dịch vụ</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform motion-reduce:transform-none" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
