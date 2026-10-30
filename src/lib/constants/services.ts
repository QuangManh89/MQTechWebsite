export interface ServiceItem {
  id: string;
  slug: string;
  title: string;
  shortDesc: string;
  deliveryModes: ("IN_STORE" | "ON_SITE")[];
  features: string[];
  icon: string;
}

export const MQTECH_SERVICES: ServiceItem[] = [
  {
    id: "svc_desktop_laptop",
    slug: "sua-chua-laptop-pc",
    title: "Sửa Chữa Laptop & PC",
    shortDesc:
      "Chẩn đoán lỗi mất nguồn, màn hình, bàn phím, quạt tản nhiệt, bản lề và linh kiện cho mọi dòng máy tính bàn và laptop.",
    deliveryModes: ["IN_STORE", "ON_SITE"],
    features: [
      "Kiểm tra lỗi trực tiếp và minh bạch",
      "Linh kiện thay thế rõ nguồn gốc",
      "Báo đúng bệnh, không phát sinh chi phí",
    ],
    icon: "Laptop",
  },
  {
    id: "svc_windows_software",
    slug: "cai-dat-windows-phan-mem",
    title: "Cài Đặt Windows & Phần Mềm",
    shortDesc:
      "Cài đặt hệ điều hành Windows chuẩn, cập nhật driver đầy đủ, diệt virus và tối ưu tốc độ máy hoạt động mượt mà.",
    deliveryModes: ["IN_STORE", "ON_SITE"],
    features: [
      "Bảo toàn dữ liệu cá nhân an toàn",
      "Cài đặt đầy đủ driver và tiện ích văn phòng",
      "Tối ưu khởi động và dọn dẹp hệ thống",
    ],
    icon: "Cpu",
  },
  {
    id: "svc_hardware_upgrade",
    slug: "chan-doan-nang-cap-phan-cung",
    title: "Chẩn Đoán & Nâng Cấp Phần Cứng",
    shortDesc:
      "Nâng cấp ổ cứng SSD tốc độ cao, mở rộng dung lượng RAM, thay keo tản nhiệt chuyên dụng và vệ sinh hệ thống làm mát.",
    deliveryModes: ["IN_STORE", "ON_SITE"],
    features: [
      "Tăng tốc máy tính rõ rệt sau nâng cấp",
      "Keo tản nhiệt cao cấp giảm nhiệt độ CPU/GPU",
      "Linh kiện bảo hành chính hãng",
    ],
    icon: "Wrench",
  },
  {
    id: "svc_printer_service",
    slug: "dich-vu-may-in",
    title: "Dịch Vụ Máy In Văn Phòng",
    shortDesc:
      "Sửa chữa máy in kẹt giấy, không in được, cài đặt chia sẻ máy in qua mạng LAN và bảo dưỡng hộp mực văn phòng.",
    deliveryModes: ["IN_STORE", "ON_SITE"],
    features: [
      "Cài đặt driver và chia sẻ in nội bộ",
      "Khắc phục sự cố kẹt giấy và bản in mờ",
      "Hỗ trợ tận nơi nhanh chóng cho văn phòng",
    ],
    icon: "Printer",
  },
  {
    id: "svc_network_wifi",
    slug: "thi-cong-xu-ly-mang-lan-wifi",
    title: "Mạng LAN & Wi-Fi Nội Bộ",
    shortDesc:
      "Thi công bấm đầu dây mạng, cấu hình modem Wi-Fi, khắc phục rớt mạng và mở rộng vùng phủ sóng cho nhà ở và văn phòng.",
    deliveryModes: ["ON_SITE"],
    features: [
      "Định tuyến mạng gọn gàng, thẩm mỹ",
      "Cấu hình Wi-Fi chịu tải ổn định",
      "Xử lý dứt điểm điểm chết sóng",
    ],
    icon: "Network",
  },
  {
    id: "svc_business_it",
    slug: "ho-tro-it-doanh-nghiep",
    title: "Hỗ Trợ IT Doanh Nghiệp",
    shortDesc:
      "Gói dịch vụ bảo trì định kỳ, hỗ trợ kỹ thuật máy tính, sao lưu dữ liệu và xử lý sự cố công nghệ thông tin cho doanh nghiệp.",
    deliveryModes: ["ON_SITE"],
    features: [
      "Bảo trì định kỳ phần cứng & hệ thống",
      "Hỗ trợ kỹ thuật nhanh chóng khi có sự cố",
      "Chi phí hợp lý, hợp đồng minh bạch",
    ],
    icon: "ShieldCheck",
  },
];
