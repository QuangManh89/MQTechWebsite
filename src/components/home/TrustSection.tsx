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
    <section id="cam-ket" className="bg-brand-dark text-white py-20 lg:py-28 border-t border-white/10 relative">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        <div className="max-w-[640px]">
          <p className="text-xs font-semibold text-indigo-400 mb-2">
            Nguyên tắc hoạt động
          </p>
          <h2 className="text-balance text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Cam Kết Vàng Từ MQTech
          </h2>
          <p className="text-pretty mt-3 text-base leading-relaxed text-neutral-300">
            Chúng tôi xây dựng uy tín bằng kỹ thuật chuyên môn và sự chân thành. Khách hàng trao gửi niềm tin, MQTech trao trả sự an tâm.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {commitments.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white/[0.03] p-6 sm:p-7 border border-white/10 flex flex-col justify-between hover:border-white/20 transition-colors duration-150"
              >
                <div>
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-500/15 text-indigo-400 mb-5">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight mb-2">
                    {c.title}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-neutral-400">
                    {c.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-1.5 text-xs font-medium text-emerald-400">
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
