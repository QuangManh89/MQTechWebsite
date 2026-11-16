import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, MapPin, Clock, PhoneCall } from "lucide-react";

export function Footer() {
  return (
    <footer id="lien-he" className="border-t border-white/10 bg-brand-dark text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-14 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Col 1: Brand & Identity */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="inline-block" aria-label="MQTech — Trang chủ">
              <Image
                src="/logo/mq-tech-lockup-horizontal-white.svg"
                alt="MQTech — Computer Service"
                width={176}
                height={44}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-[14px] leading-relaxed text-neutral-400">
              Dịch vụ sửa chữa máy tính, laptop, phần cứng và hỗ trợ IT chuyên
              nghiệp, trung thực tại Buôn Ma Thuột.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-neutral-300 w-fit">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
              <span>Báo đúng bệnh · Không vẽ thêm</span>
            </div>
          </div>

          {/* Col 2: Services & Diagnostic Tools */}
          <div>
            <h3 className="text-[13px] font-semibold text-neutral-200 mb-4">
              Dịch vụ & công cụ
            </h3>
            <ul className="space-y-2.5 text-[14px] text-neutral-300">
              <li>Sửa chữa Laptop &amp; PC để bàn</li>
              <li>Cài đặt Windows &amp; Phần mềm</li>
              <li>Chẩn đoán &amp; Thay thế phần cứng</li>
              <li>Dịch vụ máy in văn phòng</li>
              <li className="pt-2 border-t border-white/[0.08]">
                <Link
                  href="/device-test"
                  className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1.5 transition-colors duration-150"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  <span>Kiểm tra thiết bị (Hardware Test)</span>
                </Link>
              </li>
              <li className="text-[12px] text-neutral-400 flex flex-wrap gap-2 pt-1">
                <Link href="/device-test/ban-phim" className="hover:text-white transition-colors duration-150">Bàn phím</Link>
                <Link href="/device-test/man-hinh" className="hover:text-white transition-colors duration-150">Màn hình</Link>
                <Link href="/device-test/loa" className="hover:text-white transition-colors duration-150">Loa</Link>
                <Link href="/device-test/micro" className="hover:text-white transition-colors duration-150">Mic</Link>
                <Link href="/device-test/camera" className="hover:text-white transition-colors duration-150">Webcam</Link>
                <Link href="/device-test/benchmark" className="hover:text-white transition-colors duration-150">Benchmark</Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Service Area & Working Model */}
          <div>
            <h3 className="text-[13px] font-semibold text-neutral-200 mb-4">
              Khu vực & phương thức
            </h3>
            <ul className="space-y-3 text-[14px] text-neutral-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  Hẻm 4, số nhà 13/2 Võ Thị Sáu, Phường Tân Lập, TP. Buôn Ma Thuột, Đắk Lắk.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Giờ làm việc: 08:00 – 18:30 (Thứ 2 – Chủ Nhật)
                </span>
              </li>
              <li className="text-[12px] text-neutral-300 bg-white/[0.04] p-2.5 rounded-xl border border-white/[0.08] leading-relaxed">
                Phục vụ mang máy đến tiệm hoặc kỹ thuật viên đến sửa tận nơi trong bán kính ~15 km TP. Buôn Ma Thuột.
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Disclaimer */}
          <div>
            <h3 className="text-[13px] font-semibold text-neutral-200 mb-4">
              Xác nhận & bảo mật
            </h3>
            <div className="space-y-3 text-[13px] text-neutral-400">
              <div className="flex flex-col gap-2">
                <a
                  href="tel:0987482573"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold text-sm transition-colors"
                >
                  <PhoneCall className="h-4 w-4 text-emerald-400" />
                  <span>Hotline: 0987 482 573</span>
                </a>
                <a
                  href="https://www.facebook.com/suamaytinhbmt/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-neutral-300 hover:text-white transition-colors text-xs font-medium"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="text-[#1877F2] shrink-0">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Fanpage: fb.com/suamaytinhbmt</span>
                </a>
              </div>
              <p>
                Mọi yêu cầu gửi qua website sẽ được kỹ thuật viên liên hệ xác
                nhận qua Điện thoại hoặc Zalo.
              </p>
              <div className="rounded-[12px] bg-white/[0.03] border border-white/10 p-3 text-[12px] text-neutral-300">
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
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-neutral-400">
          <p>© 2026 MQTech (Computer Service). Bảo lưu mọi quyền.</p>
          <div className="flex items-center gap-6">
            <span>Buôn Ma Thuột · Đắk Lắk</span>
            <span>Domain: mqcomputech.com</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
