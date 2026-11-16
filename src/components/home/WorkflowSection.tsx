import React from "react";
import { PhoneCall, Search, Wrench, CheckCircle } from "lucide-react";

export function WorkflowSection() {
  const steps = [
    {
      num: "01",
      title: "Gửi yêu cầu dịch vụ",
      desc: "Quý khách chọn mang máy đến tiệm hoặc yêu cầu kỹ thuật viên đến tận nơi qua biểu mẫu trên website.",
      icon: PhoneCall,
    },
    {
      num: "02",
      title: "Chẩn đoán & tư vấn",
      desc: "Kiểm tra tình trạng thiết bị minh bạch, xác định chính xác nguyên nhân và giải thích rõ phương án.",
      icon: Search,
    },
    {
      num: "03",
      title: "Xác nhận & báo giá",
      desc: "Báo giá chi tiết linh kiện và công thợ. Chỉ tiến hành sửa chữa sau khi quý khách đồng ý.",
      icon: CheckCircle,
    },
    {
      num: "04",
      title: "Xử lý & nghiệm thu",
      desc: "Kỹ thuật viên thực hiện sửa chữa cẩn thận, chạy kiểm thử hệ thống và bàn giao cho khách hàng kiểm tra.",
      icon: Wrench,
    },
  ];

  return (
    <section id="quy-trinh" className="bg-slate-50 text-slate-900 py-20 lg:py-28 border-b border-slate-200/80">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-balance text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
            4 Bước Xử Lý Minh Bạch, Rõ Ràng
          </h2>
          <p className="mt-3 text-pretty text-base text-slate-600 leading-relaxed">
            Mọi bước xử lý đều được thông tin rõ ràng đến quý khách để đảm bảo sự an tâm tuyệt đối về thiết bị và dữ liệu.
          </p>
        </div>

        {/* 4 Step Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-lg font-mono font-bold tracking-tight text-indigo-600">
                      {step.num}
                    </span>
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold tracking-tight text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed text-slate-600 text-pretty">
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
