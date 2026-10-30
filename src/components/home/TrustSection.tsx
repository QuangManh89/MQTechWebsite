import React from "react";
import { ShieldCheck, Eye, MapPin, CheckCircle, FileText } from "lucide-react";

export function TrustSection() {
  const commitments = [
    {
      title: "Chẩn Đoán Trung Thực",
      desc: "Kiểm tra đúng lỗi, phân tích nguyên nhân rõ ràng và giải thích cặn kẽ để khách hàng nắm bắt tình trạng thiết bị.",
      icon: Eye,
    },
    {
      title: "Báo Giá Trước Khi Sửa",
      desc: "Báo giá chi tiết linh kiện và chi phí kỹ thuật trước khi làm. Khách hàng đồng ý mới tiến hành, không vẽ thêm bệnh.",
      icon: FileText,
    },
    {
      title: "Bảo Vệ Quyền Riêng Tư",
      desc: "Không bao giờ yêu cầu khách hàng cung cấp mật khẩu Windows hay mật khẩu cá nhân. Dữ liệu của khách hàng luôn được giữ an toàn.",
      icon: ShieldCheck,
    },
    {
      title: "Gắn Bó Địa Phương BMT",
      desc: "Phục vụ người dân và doanh nghiệp tại Buôn Ma Thuột trong bán kính ~15 km với sự nhanh nhẹn, chu đáo và trách nhiệm dài lâu.",
      icon: MapPin,
    },
  ];

  return (
    <section id="cam-ket" className="bg-[#0A0A0B] text-white py-20 lg:py-28 border-t border-white/10 relative">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="max-w-[640px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-[11px] tracking-[0.12em] uppercase font-medium text-white/80">
            Nguyên tắc hoạt động
          </div>
          <h2 className="mt-4 text-[32px] sm:text-[42px] font-bold tracking-tight text-white leading-[1.1]">
            Cam Kết Vàng Từ MQTech
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-white/65">
            Chúng tôi xây dựng uy tín bằng kỹ thuật chuyên môn và sự chân thành.
            Khách hàng trao gửi niềm tin, MQTech trao trả sự an tâm.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {commitments.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className="rounded-[20px] bg-white/[0.03] p-7 border border-white/[0.08] flex flex-col justify-between hover:border-white/20 transition-all duration-200"
              >
                <div>
                  <div className="grid h-11 w-11 place-items-center rounded-[10px] bg-[#3B82F6]/15 text-[#3B82F6] mb-5">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-[17px] font-bold text-white tracking-tight">
                    {c.title}
                  </h3>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-white/60">
                    {c.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-1.5 text-[12px] font-medium text-emerald-400">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Cam kết chuẩn mực</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
