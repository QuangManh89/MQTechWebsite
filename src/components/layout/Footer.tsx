import React from "react";
import { ShieldCheck, MapPin, Clock } from "lucide-react";

export function Footer() {
  return (
    <footer id="lien-he" className="border-t border-white/10 bg-[#0A0A0B] text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-14 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Col 1: Brand & Identity */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-[10px] bg-white text-[#0A0A0B] font-bold text-[13px]">
                MQ
              </div>
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-white text-[16px]">
                  MQTech
                </span>
                <span className="text-[10px] tracking-[0.18em] text-white/40 uppercase font-medium">
                  Computer Service
                </span>
              </div>
            </div>
            <p className="text-[14px] leading-relaxed text-white/60">
              Dịch vụ sửa chữa máy tính, laptop, phần cứng và hỗ trợ IT chuyên
              nghiệp, trung thực tại Buôn Ma Thuột.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-white/70 w-fit">
              <ShieldCheck className="h-3.5 w-3.5 text-[#3B82F6]" />
              <span>Báo đúng bệnh • Không vẽ thêm</span>
            </div>
          </div>

          {/* Col 2: Services List */}
          <div>
            <h3 className="text-[13px] font-semibold tracking-wider uppercase text-white/40 mb-4">
              Dịch Vụ Kỹ Thuật
            </h3>
            <ul className="space-y-2.5 text-[14px] text-white/70">
              <li>Sửa chữa Laptop & PC để bàn</li>
              <li>Cài đặt Windows & Phần mềm</li>
              <li>Chẩn đoán & Thay thế phần cứng</li>
              <li>Dịch vụ máy in văn phòng</li>
              <li>Thi công mạng LAN & Wi-Fi</li>
              <li>Hỗ trợ IT doanh nghiệp</li>
            </ul>
          </div>

          {/* Col 3: Service Area & Working Model */}
          <div>
            <h3 className="text-[13px] font-semibold tracking-wider uppercase text-white/40 mb-4">
              Khu Vực & Phương Thức
            </h3>
            <ul className="space-y-3 text-[14px] text-white/70">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[#3B82F6] shrink-0 mt-0.5" />
                <span>
                  Phục vụ tại TP. Buôn Ma Thuột và các phường/xã lân cận trong bán
                  kính ~15 km.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Tiếp nhận mang máy đến tiệm hoặc hỗ trợ kỹ thuật viên sửa tận
                  nơi.
                </span>
              </li>
              <li className="text-[12px] text-white/40 bg-white/[0.02] p-2.5 rounded-[10px] border border-white/[0.06]">
                Địa chỉ cửa hàng chính thức đang được cập nhật. Quý khách vui lòng
                liên hệ trước khi mang máy đến.
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Disclaimer */}
          <div>
            <h3 className="text-[13px] font-semibold tracking-wider uppercase text-white/40 mb-4">
              Xác Nhận & Bảo Mật
            </h3>
            <div className="space-y-3 text-[13px] text-white/60">
              <p>
                Mọi yêu cầu gửi qua website sẽ được kỹ thuật viên liên hệ xác
                nhận qua Điện thoại hoặc Zalo.
              </p>
              <div className="rounded-[12px] bg-white/[0.03] border border-white/10 p-3 text-[12px] text-white/70">
                <span className="font-semibold text-white block mb-1">
                  Chính sách bảo mật:
                </span>
                MQTech không bao giờ yêu cầu khách hàng cung cấp mật khẩu đăng
                nhập máy tính cá nhân qua website.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-white/40">
          <p>© 2026 MQTech — Computer Service. Bảo lưu mọi quyền.</p>
          <div className="flex items-center gap-6">
            <span>Buôn Ma Thuột • Đắk Lắk</span>
            <span>Domain: mqcomputech.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
