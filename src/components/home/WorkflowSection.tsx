import React from "react";
import { PhoneCall, Search, Wrench, CheckCircle } from "lucide-react";

export function WorkflowSection() {
  const steps = [
    {
      num: "01",
      title: "Gửi Yêu Cầu Dịch Vụ",
      desc: "Quý khách chọn mang máy đến tiệm hoặc yêu cầu kỹ thuật viên đến tận nơi qua biểu mẫu trên website.",
      icon: PhoneCall,
    },
    {
      num: "02",
      title: "Chẩn Đoán & Tư Vấn",
      desc: "Kiểm tra tình trạng thiết bị minh bạch, xác định chính xác nguyên nhân và giải thích rõ phương án.",
      icon: Search,
    },
    {
      num: "03",
      title: "Xác Nhận & Báo Giá",
      desc: "Báo giá chi tiết linh kiện và công thợ. Chỉ tiến hành sửa chữa sau khi quý khách đồng ý.",
      icon: CheckCircle,
    },
    {
      num: "04",
      title: "Xử Lý & Nghiệm Thu",
      desc: "Kỹ thuật viên thực hiện sửa chữa cẩn thận, chạy kiểm thử hệ thống và bàn giao cho khách hàng kiểm tra.",
      icon: Wrench,
    },
  ];

  return (
    <section id="quy-trinh" className="bg-white text-[#0A0A0B] py-20 lg:py-28 border-t border-black/[0.05]">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-[620px] mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.04] px-3.5 py-1.5 text-[11px] tracking-[0.12em] uppercase font-semibold text-[#0A0A0B]/70">
            Quy trình làm việc
          </div>
          <h2 className="mt-4 text-[32px] sm:text-[40px] font-bold tracking-tight text-[#0A0A0B]">
            4 Bước Minh Bạch — Không Rườm Rà
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[#0A0A0B]/65">
            Mọi bước xử lý đều được thông tin rõ ràng đến quý khách để đảm bảo
            sự an tâm tuyệt đối về thiết bị và dữ liệu.
          </p>
        </div>

        {/* 4 Step Cards */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="relative rounded-[20px] bg-[#F5F5F7] p-7 border border-black/[0.05] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-[24px] font-extrabold tracking-tight text-[#3B82F6]">
                      {step.num}
                    </span>
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-white text-[#0A0A0B] shadow-sm">
                      <Icon className="h-5 w-5 text-[#3B82F6]" />
                    </div>
                  </div>
                  <h3 className="text-[17px] font-bold tracking-tight text-[#0A0A0B]">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-[13.5px] leading-relaxed text-[#0A0A0B]/65">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
