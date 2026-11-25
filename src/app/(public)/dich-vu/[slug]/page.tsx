import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Info,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  getPublishedPosts,
  getPublishedServices,
  getServiceBySlug,
  getSiteSettings,
} from "@/lib/site-data";
import { getCategoryLabel } from "@/lib/utils";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { FaqAccordion, type FaqItem } from "@/components/home/FaqAccordion";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

function getServicePromoBanner(
  slug: string,
  category: string
): { src: string; alt: string } {
  if (
    slug === "ve-sinh-tra-keo-tan-nhiet" ||
    slug === "nang-cap-ram-ssd-linh-kien" ||
    category === "clean-upgrade"
  ) {
    return {
      src: "/banners/nangcap.webp",
      alt: "MQTech - Chẩn đoán & nâng cấp phần cứng SSD NVMe Gen 4 siêu tốc, mở rộng RAM DDR4/DDR5, thay keo tản nhiệt và vệ sinh làm mát",
    };
  }
  if (
    slug === "sua-may-tinh-tai-nha-bmt" ||
    slug === "bao-tri-it-cong-ty-phong-may" ||
    category === "onsite-it"
  ) {
    return {
      src: "/banners/win.webp",
      alt: "MQTech - Cài đặt Windows & phần mềm bảo toàn dữ liệu 100%, diệt sạch mã độc, cập nhật đủ driver lấy liền sau 30 phút",
    };
  }
  return {
    src: "/banners/laptoppc.webp?v=2",
    alt: "MQTech - Sửa chữa Laptop & PC siêu tốc tại TP. Buôn Ma Thuột, Đắk Lắk: lấy liền 30 - 60 phút, bảo hành 6 - 12 tháng, miễn phí kiểm tra, Hotline 0987 482 573",
  };
}

function getRelatedPostsForService<
  T extends {
    id: number;
    slug: string;
    title: string;
    category: string;
    excerpt: string;
  },
>(
  service: { slug: string; category: string },
  allPosts: T[],
  limit = 3
): T[] {
  const sSlug = service.slug.toLowerCase();
  const sCategory = service.category.toLowerCase();

  const rules: Array<{
    matchesService: boolean;
    categoryKeywords: string[];
    slugKeywords: string[];
  }> = [
    {
      matchesService:
        (sSlug.includes("cai-win") ||
          sSlug.includes("windows") ||
          sCategory === "software") &&
        !sSlug.includes("sua-laptop"),
      categoryKeywords: [
        "thủ thuật windows",
        "thủ thuật văn phòng",
        "windows",
        "phần mềm",
      ],
      slugKeywords: [
        "cai-win",
        "windows",
        "win-10",
        "win-11",
        "phan-mem",
        "unikey",
        "word",
        "excel",
        "van-phong",
        "wifi",
      ],
    },
    {
      matchesService:
        sSlug.includes("ve-sinh") || sSlug.includes("tan-nhiet"),
      categoryKeywords: ["bảo dưỡng"],
      slugKeywords: ["ve-sinh", "tan-nhiet", "keo", "nong"],
    },
    {
      matchesService:
        sSlug.includes("nang-cap") ||
        sSlug.includes("ssd") ||
        sSlug.includes("ram"),
      categoryKeywords: ["nâng cấp"],
      slugKeywords: ["ssd", "ram", "cham", "nang-cap"],
    },
    {
      matchesService: sCategory === "pc-build" || sSlug.includes("pc"),
      categoryKeywords: ["nâng cấp", "bảo dưỡng", "sửa chữa", "bảng giá"],
      slugKeywords: [
        "ssd",
        "ram",
        "ve-sinh",
        "bang-gia",
        "man-hinh-xanh",
        "nang-cap",
        "no-signal",
        "wifi",
      ],
    },
    {
      matchesService: sSlug.includes("sua-macbook") || sSlug.includes("macbook"),
      categoryKeywords: ["macbook"],
      slugKeywords: ["macbook", "macos", "apple"],
    },
    {
      matchesService:
        sSlug.includes("sua-laptop") ||
        sSlug.includes("laptop") ||
        sCategory === "repair",
      categoryKeywords: ["bảo dưỡng", "sửa chữa"],
      slugKeywords: [
        "laptop",
        "man-hinh",
        "pin",
        "ban-phim",
        "sac",
        "wifi",
        "no-signal",
      ],
    },
    {
      matchesService: sSlug.includes("bao-tri-it"),
      categoryKeywords: ["thủ thuật văn phòng", "dịch vụ", "bảng giá"],
      slugKeywords: [
        "may-in",
        "máy in",
        "0x0000011b",
        "0x00000709",
        "word",
        "excel",
        "unikey",
        "van-phong",
        "wifi",
        "tai-nha",
        "bang-gia",
      ],
    },
    {
      matchesService:
        (sSlug.includes("sua-may-tinh-tai-nha") ||
          sSlug.includes("tai-nha") ||
          sCategory === "onsite-it") &&
        !sSlug.includes("bao-tri-it"),
      categoryKeywords: ["dịch vụ", "bảng giá", "thủ thuật văn phòng"],
      slugKeywords: [
        "tai-nha",
        "tan-lap",
        "bang-gia",
        "sua-may-tinh",
        "bmt",
        "may-in",
        "máy in",
        "0x0000011b",
        "wifi",
        "van-phong",
      ],
    },
  ];

  const activeRules = rules.filter((r) => r.matchesService);
  const serviceTokens = sSlug.split("-").filter((t) => t.length >= 3);

  const scored = allPosts.map((post, index) => {
    const pCategory = post.category.toLowerCase();
    const pSlug = post.slug.toLowerCase();
    const pTitle = post.title.toLowerCase();
    let score = 0;

    for (const rule of activeRules) {
      for (const kw of rule.categoryKeywords) {
        if (pCategory.includes(kw)) score += 4;
      }
      for (const kw of rule.slugKeywords) {
        if (pSlug.includes(kw)) score += 3;
        else if (pTitle.includes(kw.replace(/-/g, " "))) score += 2;
      }
    }

    for (const token of serviceTokens) {
      if (pSlug.includes(token)) score += 1;
    }

    return { post, score, index };
  });

  scored.sort((a, b) => b.score - a.score || a.index - b.index);
  return scored.slice(0, limit).map((item) => item.post);
}

interface ServiceAeoContent {
  directAnswer: string;
  faqs: FaqItem[];
}

function getServiceAeoContent(
  service: {
    slug: string;
    title: string;
    priceFrom: string;
    duration: string;
    warranty: string;
  },
  settings: {
    brandName: string;
    hotline: string;
    address: string;
    workingHours: string;
    bookingDiscount: string;
  }
): ServiceAeoContent {
  const s = service.slug.toLowerCase();
  const priceText = service.priceFrom || "báo giá công khai sau kiểm tra";
  const hours = settings.workingHours || "07:30 - 20:00 (Thứ 2 - Chủ Nhật)";

  if (s === "sua-may-tinh-tai-nha-bmt") {
    return {
      directAnswer: `${settings.brandName} cung cấp dịch vụ sửa máy tính, laptop và PC tại nhà trên toàn TP. Buôn Ma Thuột (${hours}). Kỹ thuật viên có mặt tận nơi sau 20 - 30 phút tại Tân Lập, Tân Lợi, Tân An, Tự An, Ea Tam, Thắng Lợi và khu vực lân cận; kiểm tra miễn phí, báo giá trước (${priceText}), bảo hành ${service.warranty}. Hotline/Zalo: ${settings.hotline}.`,
      faqs: [
        {
          id: "tn-1",
          question: "MQTech có hỗ trợ sửa máy tính tại nhà ở những phường nào tại Buôn Ma Thuột?",
          answer: `Kỹ thuật viên MQTech xuất phát từ ${settings.address}, phục vụ tận nhà khắp TP. Buôn Ma Thuột gồm Tân Lập, Tân Lợi, Tân An, Tân Thành, Tự An, Thắng Lợi, Ea Tam, Khánh Xuân, Thành Nhất và các khu vực lân cận. Thời gian di chuyển trung bình 20 - 30 phút sau khi xác nhận lịch.`,
        },
        {
          id: "tn-2",
          question: "Sửa máy tính tại nhà có bị tính phí kiểm tra nếu không sửa không?",
          answer: `MQTech kiểm tra chẩn đoán lỗi và báo giá minh bạch trước khi thực hiện. Nếu khách hàng ở khu vực nội thành BMT chỉ cần kiểm tra cơ bản hoặc chọn sửa ngay tại chỗ, phí kiểm tra được miễn phí 100%; không có chi phí ẩn hay tự ý thay linh kiện.`,
        },
        {
          id: "tn-3",
          question: "Những lỗi nào có thể sửa lấy liền ngay tại nhà mà không cần mang máy về tiệm?",
          answer: "Hơn 85% sự cố phổ biến được xử lý dứt điểm ngay tại chỗ trong 30 - 60 phút: cài Windows 10/11, cài Office/phần mềm đồ họa, sửa lỗi mất Wi-Fi, không kết nối máy in mạng LAN, máy chạy chậm 100% disk, thay RAM/SSD, thay bàn phím, thay pin và vệ sinh tra keo tản nhiệt.",
        },
        {
          id: "tn-4",
          question: "MQTech có làm việc Thứ 7, Chủ Nhật hoặc buổi tối không?",
          answer: `Có. MQTech phục vụ xuyên suốt ${hours}, hỗ trợ cả cuối tuần và ngoài giờ hành chính cho khách hàng văn phòng, sinh viên tại Buôn Ma Thuột. Đặt lịch trực tuyến trên website được giảm ngay ${settings.bookingDiscount}.`,
        },
      ],
    };
  }

  if (s === "cai-win-10-11-phan-mem-tai-nha-bmt") {
    return {
      directAnswer: `Dịch vụ cài Win 10, Win 11 và phần mềm văn phòng, đồ họa tại nhà TP. Buôn Ma Thuột của ${settings.brandName} xử lý nhanh trong ${service.duration}, chi phí minh bạch ${priceText}. Cam kết bảo toàn 100% dữ liệu cá nhân ổ D/E, cài đủ driver chuẩn hãng, Unikey, Office, trình duyệt và hỗ trợ bảo hành phần mềm ${service.warranty}. Liên hệ ${settings.hotline}.`,
      faqs: [
        {
          id: "cw-1",
          question: "Cài lại Windows 10/11 tại MQTech có bị mất dữ liệu ở Desktop và ổ D không?",
          answer: "Không. Trước khi cài mới, kỹ thuật viên luôn sao lưu toàn bộ dữ liệu quan trọng ở Desktop, Documents, Downloads sang phân vùng an toàn và chỉ format phân vùng hệ điều hành (ổ C) sau khi khách hàng xác nhận.",
        },
        {
          id: "cw-2",
          question: "Gói cài Win tại nhà BMT đã bao gồm những phần mềm cơ bản nào?",
          answer: "Gói tiêu chuẩn đã bao gồm Windows 10 hoặc 11 sạch chuẩn hãng (không ghost đa cấu hình), đầy đủ driver Wi-Fi/âm thanh/card đồ họa, bộ gõ tiếng Việt Unikey, bộ font chữ văn phòng, trình duyệt, phần mềm giải nén, đọc PDF và bộ tin học văn phòng theo yêu cầu.",
        },
        {
          id: "cw-3",
          question: "Máy đời cũ hoặc RAM 4GB nên cài Windows 10 hay Windows 11?",
          answer: "Kỹ thuật viên sẽ kiểm tra thực tế cấu hình CPU, RAM và ổ cứng trước khi cài. Với máy RAM 4GB hoặc chạy ổ HDD, Windows 10 tối ưu nhẹ sẽ ổn định hơn; máy có SSD và RAM từ 8GB trở lên chạy Windows 11 rất mượt mà.",
        },
        {
          id: "cw-4",
          question: "Cài Win và phần mềm chuyên ngành (AutoCAD, Photoshop, Kế toán) mất bao lâu?",
          answer: `Thời gian cài Windows và bộ phần mềm cơ bản mất khoảng ${service.duration}. Nếu cài thêm các bộ phần mềm đồ họa, kỹ thuật nặng như AutoCAD, Photoshop, Illustrator, thời gian xử lý khoảng 60 - 90 phút ngay tại nhà hoặc tại cửa hàng.`,
        },
      ],
    };
  }

  if (s === "sua-laptop-windows") {
    return {
      directAnswer: `${settings.brandName} chuyên sửa chữa Laptop Windows (Dell, HP, Asus, Acer, Lenovo, MSI) tại TP. Buôn Ma Thuột với thời gian xử lý ${service.duration}, chi phí tham khảo ${priceText} và bảo hành ${service.warranty}. Khách hàng được kiểm tra lỗi miễn phí, ký tên lên linh kiện nếu cần giữ máy và quan sát trực tiếp quy trình thay thế minh bạch. Hotline: ${settings.hotline}.`,
      faqs: [
        {
          id: "sl-1",
          question: "Laptop bật nguồn sáng đèn nhưng không lên màn hình có sửa lấy liền được không?",
          answer: "Tùy nguyên nhân cụ thể: nếu do lỏng RAM, lỗi cáp màn hình hoặc hư màn hình thì có thể xử lý lấy liền trong 30 - 60 phút. Nếu lỗi nguồn trên mainboard hoặc chip GPU, kỹ thuật viên sẽ đo đạc miễn phí, báo giá rõ ràng và hẹn thời gian trả máy chính xác.",
        },
        {
          id: "sl-2",
          question: "Thay pin, bàn phím hoặc màn hình laptop có được kiểm tra linh kiện trước khi lắp không?",
          answer: "Có. MQTech cho khách hàng kiểm tra trực tiếp tem mác, thông số và độ tương thích của pin, bàn phím hoặc màn hình mới trước khi thay. Khách hàng có thể ngồi xem trực tiếp toàn bộ quá trình tháo lắp.",
        },
        {
          id: "sl-3",
          question: "Nếu phải giữ lại laptop để sửa phần cứng mainboard thì MQTech đảm bảo linh kiện thế nào?",
          answer: "Với các ca sửa mainboard cần thời gian đo đạc chuyên sâu, khách hàng được ký tên xác nhận lên từng linh kiện quan trọng (RAM, SSD, pin, màn hình) và nhận phiếu biên nhận ghi rõ tình trạng máy cùng thời hạn bảo hành.",
        },
        {
          id: "sl-4",
          question: "Chế độ bảo hành sau khi sửa laptop tại MQTech BMT ra sao?",
          answer: `Mọi hạng mục sửa chữa và linh kiện thay thế đều có tem và phiếu bảo hành rõ ràng (${service.warranty} tùy hạng mục). Khi phát sinh lỗi trong thời hạn bảo hành, MQTech hỗ trợ kiểm tra và xử lý ưu tiên không thu thêm phí.`,
        },
      ],
    };
  }

  if (s === "nang-cap-ram-ssd-linh-kien") {
    return {
      directAnswer: `Dịch vụ nâng cấp SSD NVMe/SATA và RAM DDR4/DDR5 chính hãng tại TP. Buôn Ma Thuột của ${settings.brandName} giúp tăng tốc khởi động máy chỉ còn 10 - 15 giây, xử lý lấy liền trong ${service.duration} (${priceText}). Miễn phí công lắp đặt, hỗ trợ chuyển toàn bộ Windows và dữ liệu cũ sang ổ mới, bảo hành chính hãng ${service.warranty}. Hotline: ${settings.hotline}.`,
      faqs: [
        {
          id: "nc-1",
          question: "Máy tính chạy chậm 100% Disk nên nâng cấp SSD hay nâng cấp RAM trước?",
          answer: "Nếu máy đang dùng ổ cứng cơ HDD, nâng cấp lên ổ SSD mang lại hiệu quả tăng tốc rõ rệt nhất (khởi động nhanh gấp 4 - 5 lần và hết tình trạng treo 100% Disk). Sau đó, nâng cấp RAM lên tối thiểu 8GB hoặc 16GB sẽ giúp mở nhiều tab trình duyệt và phần mềm cùng lúc không bị giật lag.",
        },
        {
          id: "nc-2",
          question: "Nâng cấp SSD mới có giữ lại được Windows và dữ liệu từ ổ cứng cũ không?",
          answer: "Hoàn toàn được. Kỹ thuật viên MQTech hỗ trợ nhân bản (clone) toàn bộ hệ điều hành, phần mềm và dữ liệu sang ổ SSD mới hoặc cài sạch Windows rồi chép đầy đủ dữ liệu cũ sang, đảm bảo không mất tệp tin công việc.",
        },
        {
          id: "nc-3",
          question: "Làm sao biết laptop của tôi còn khe trống để gắn thêm RAM hay SSD NVMe?",
          answer: `Bạn chỉ cần gửi model máy qua Zalo ${settings.hotline} hoặc mang máy đến ${settings.address}, kỹ thuật viên sẽ tra cứu và kiểm tra thực tế miễn phí số khe RAM, chuẩn bus hỗ trợ và khe M.2 NVMe trước khi tư vấn phương án tiết kiệm nhất.`,
        },
        {
          id: "nc-4",
          question: "Linh kiện RAM và SSD tại MQTech là hàng mới chính hãng và bảo hành bao lâu?",
          answer: `MQTech chỉ sử dụng RAM và SSD chính hãng (Kingston, Crucial, Samsung, Lexar, WD...) nguyên seal, có tem nhà phân phối và thời gian bảo hành dài hạn (${service.warranty}).`,
        },
      ],
    };
  }

  if (s === "ve-sinh-tra-keo-tan-nhiet") {
    return {
      directAnswer: `Dịch vụ vệ sinh laptop, PC và tra keo tản nhiệt cao cấp tại TP. Buôn Ma Thuột của ${settings.brandName} thực hiện trực tiếp lấy liền sau ${service.duration} với chi phí chỉ ${priceText}. Làm sạch bụi bẩn quạt tản nhiệt, khe gió, thay keo tản nhiệt dẫn nhiệt cao giúp giảm ngay 10 - 15°C, hết kêu quạt to và tăng tuổi thọ linh kiện. Hotline: ${settings.hotline}.`,
      faqs: [
        {
          id: "vs-1",
          question: "Bao lâu nên vệ sinh laptop và tra keo tản nhiệt một lần?",
          answer: "Với khí hậu Tây Nguyên nhiều bụi mịn, bạn nên vệ sinh và thay keo tản nhiệt định kỳ mỗi 6 - 12 tháng/lần (hoặc 6 tháng/lần với laptop gaming, máy làm đồ họa chạy tải cao liên tục) để tránh khô keo gây quá nhiệt sập nguồn.",
        },
        {
          id: "vs-2",
          question: "Vệ sinh laptop tại MQTech mất bao lâu và có được ngồi xem trực tiếp không?",
          answer: `Quy trình tháo máy, làm sạch bụi quạt, khe tản nhiệt và tra keo mới mất khoảng ${service.duration}. Khách hàng có thể ngồi quan sát trực tiếp tại quầy kỹ thuật hoặc đặt lịch kỹ thuật viên đến làm tận nhà tại BMT.`,
        },
        {
          id: "vs-3",
          question: "MQTech sử dụng loại keo tản nhiệt nào khi bảo dưỡng máy?",
          answer: "MQTech sử dụng keo tản nhiệt hiệu năng cao (chuẩn MX-4 / Kryonaut hoặc tương đương cho dòng gaming/workstation), tuyệt đối không dùng keo silicon trắng rẻ tiền nhanh khô.",
        },
        {
          id: "vs-4",
          question: "Vệ sinh máy có giúp hết tình trạng laptop bị tụt FPS và quạt kêu ồn không?",
          answer: "Có. Khi khe tản nhiệt bị bít bụi và keo cũ bị khô cứng, CPU/GPU sẽ tự hạ xung nhịp (thermal throttling) để bảo vệ máy gây giật lag và quạt quay tối đa. Vệ sinh sạch và thay keo mới giúp máy mát hơn 10 - 15°C và vận hành êm ái trở lại.",
        },
      ],
    };
  }

  return {
    directAnswer: `${service.title} tại ${settings.brandName} (TP. Buôn Ma Thuột, Đắk Lắk) được thực hiện bởi kỹ thuật viên trực tiếp trong ${service.duration}, mức giá công khai ${priceText}, bảo hành ${service.warranty}. Miễn phí kiểm tra ban đầu, báo giá trước khi làm và hỗ trợ tận nơi hoặc tại ${settings.address} (${hours}). Hotline/Zalo: ${settings.hotline}.`,
    faqs: [
      {
        id: "gen-1",
        question: `Dịch vụ ${service.title} tại MQTech BMT mất bao lâu và giá bao nhiêu?`,
        answer: `Thời gian xử lý trung bình là ${service.duration} với chi phí tham khảo ${priceText}. Kỹ thuật viên luôn kiểm tra miễn phí và báo giá trọn gói trước khi tiến hành để khách hàng hoàn toàn chủ động.`,
      },
      {
        id: "gen-2",
        question: "MQTech có hỗ trợ kiểm tra tận nơi ở Buôn Ma Thuột không?",
        answer: `Có. Đội ngũ MQTech phục vụ cả tại cửa hàng (${settings.address}) và tận nơi nội thành TP. Buôn Ma Thuột trong khung giờ ${hours}.`,
      },
      {
        id: "gen-3",
        question: "Chính sách bảo hành của dịch vụ này như thế nào?",
        answer: `Dịch vụ được bảo hành rõ ràng (${service.warranty}) kèm biên nhận hoặc tem bảo hành. Mọi vấn đề phát sinh trong thời hạn bảo hành đều được kiểm tra và hỗ trợ nhanh chóng.`,
      },
      {
        id: "gen-4",
        question: "Đặt lịch online qua website có ưu đãi gì không?",
        answer: `Khách hàng đặt lịch trực tuyến qua website hoặc Zalo ${settings.hotline} được ưu tiên xếp kỹ thuật viên sớm nhất và giảm ngay ${settings.bookingDiscount} trên hóa đơn dịch vụ.`,
      },
    ],
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [service, settings] = await Promise.all([
    getServiceBySlug(slug),
    getSiteSettings(),
  ]);
  if (!service) return { title: "Không tìm thấy dịch vụ" };

  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    settings.siteUrl ||
    "https://suamaytinhbmt.id.vn"
  ).replace(/\/$/, "");
  const canonicalUrl = `${baseUrl}/dich-vu/${service.slug}`;

  return {
    title: service.title,
    description: service.shortDesc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      locale: "vi_VN",
      siteName: settings.brandName,
      url: canonicalUrl,
      title: service.title,
      description: service.shortDesc,
      images: service.imageUrl
        ? [{ url: service.imageUrl, alt: service.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: service.title,
      description: service.shortDesc,
      images: service.imageUrl ? [service.imageUrl] : undefined,
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [service, settings, allServices, allPosts] = await Promise.all([
    getServiceBySlug(slug),
    getSiteSettings(),
    getPublishedServices(),
    getPublishedPosts(),
  ]);

  if (!service) notFound();

  let symptoms: string[] = [];
  let priceRows: Array<{ item: string; price: string }> = [];
  try {
    const parsed = JSON.parse(service.symptomsJson);
    if (Array.isArray(parsed)) symptoms = parsed;
  } catch {
    symptoms = [];
  }
  try {
    const parsed = JSON.parse(service.servicePricesJson);
    if (Array.isArray(parsed)) priceRows = parsed;
  } catch {
    priceRows = [];
  }

  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    settings.siteUrl ||
    "https://suamaytinhbmt.id.vn"
  ).replace(/\/$/, "");
  const canonicalUrl = `${baseUrl}/dich-vu/${service.slug}`;

  const relatedServices = allServices
    .filter((s) => s.id !== service.id)
    .slice(0, 3);
  const relatedPosts = getRelatedPostsForService(service, allPosts, 3);
  const promoBanner = getServicePromoBanner(service.slug, service.category);
  const aeo = getServiceAeoContent(service, settings);

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: service.title,
        description: service.shortDesc,
        url: canonicalUrl,
        serviceType: service.title,
        areaServed: {
          "@type": "City",
          name: "Buôn Ma Thuột, Đắk Lắk",
        },
        provider: {
          "@type": "LocalBusiness",
          name: settings.brandName,
          telephone: settings.hotline,
          address: settings.address,
          url: baseUrl,
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: aeo.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      },
    ],
  };

  return (
    <div className="bg-surface">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="border-b border-line bg-surface-subtle py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumb
            items={[
              { label: "Dịch vụ", href: "/dich-vu" },
              { label: service.title },
            ]}
          />

          <div className="grid items-center gap-10 lg:grid-cols-12 mt-2">
            <div className="lg:col-span-7 space-y-5 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-full bg-brand-light px-3.5 py-1 text-xs font-semibold text-brand">
                  {getCategoryLabel(service.category)}
                </span>
                <span className="rounded-full bg-navy px-3.5 py-1 font-mono text-xs font-semibold text-brand-glow">
                  {settings.showExactPrices
                    ? service.priceFrom
                    : "Báo giá sau kiểm tra miễn phí"}
                </span>
              </div>

              <h1 className="font-heading text-3xl font-bold tracking-tight text-navy sm:text-4xl lg:text-5xl break-words">
                {service.title}
              </h1>

              <p className="max-w-[68ch] text-base leading-relaxed text-ink-muted sm:text-lg break-words">
                {service.description}
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-2">
                <div className="rounded-xl border border-line bg-surface p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-ink-muted">
                    <Clock className="h-4 w-4 text-brand" aria-hidden="true" />
                    <span>Thời gian xử lý</span>
                  </div>
                  <p className="mt-1 font-heading text-base font-bold text-navy">
                    {service.duration}
                  </p>
                </div>
                <div className="rounded-xl border border-line bg-surface p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-ink-muted">
                    <ShieldCheck
                      className="h-4 w-4 text-brand"
                      aria-hidden="true"
                    />
                    <span>Bảo hành</span>
                  </div>
                  <p className="mt-1 font-heading text-base font-bold text-navy">
                    {service.warranty}
                  </p>
                </div>
                <div className="rounded-xl border border-line bg-surface p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-ink-muted">
                    <Sparkles
                      className="h-4 w-4 text-brand"
                      aria-hidden="true"
                    />
                    <span>Chẩn đoán</span>
                  </div>
                  <p className="mt-1 font-heading text-base font-bold text-navy">
                    Miễn phí
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href={`/dat-lich?dich_vu=${encodeURIComponent(service.title)}`}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-brand px-6 py-3.5 text-sm font-semibold text-ink-inverse shadow-brand-glow hover:bg-brand-hover"
                >
                  <CalendarCheck className="h-4 w-4" aria-hidden="true" />
                  <span>Đặt lịch dịch vụ này</span>
                </Link>
                <a
                  href={`tel:${settings.hotlineRaw}`}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border-2 border-navy bg-surface px-6 py-3 font-mono text-sm font-semibold text-navy tabular-nums hover:bg-navy hover:text-ink-inverse"
                >
                  <Phone className="h-4 w-4 text-brand" aria-hidden="true" />
                  <span>{settings.hotline}</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 min-w-0">
              <div className="overflow-hidden rounded-2xl border border-line bg-surface-muted shadow-card-hover">
                <ResponsiveImage
                  src={service.imageUrl}
                  alt={service.title}
                  width={800}
                  height={600}
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  priority
                  className="h-[320px] w-full object-cover sm:h-[380px]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-14">
          <Link
            href={`/dat-lich?dich_vu=${encodeURIComponent(service.title)}`}
            aria-label={`Đặt lịch ngay: ${service.title}`}
            className="group block overflow-hidden rounded-2xl border border-line bg-navy shadow-card transition-all hover:shadow-card-hover hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 aspect-[8/3]"
          >
            <ResponsiveImage
              src={promoBanner.src}
              alt={promoBanner.alt}
              width={1920}
              height={720}
              sizes="(max-width: 1280px) 100vw, 1216px"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.01]"
            />
          </Link>

          <aside
            aria-label="Tóm tắt dịch vụ nhanh"
            className="rounded-2xl border border-line border-l-4 border-l-brand bg-surface-subtle p-6 sm:p-7"
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand mb-2">
              <Info className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Tóm tắt dịch vụ nhanh</span>
            </div>
            <p className="text-sm leading-relaxed text-ink-body sm:text-base max-w-[78ch] break-words">
              {aeo.directAnswer}
            </p>
          </aside>

          <div className="grid gap-10 lg:grid-cols-2">
            <div className="rounded-2xl border border-line bg-surface-subtle p-6 sm:p-8">
              <h2 className="font-heading text-2xl font-bold text-navy mb-5">
                Dấu hiệu máy cần xử lý ngay
              </h2>
              {symptoms.length === 0 ? (
                <p className="text-sm leading-relaxed text-ink-muted">
                  Máy có biểu hiện hoạt động bất thường, nóng máy, chậm lag hoặc
                  không lên nguồn — hãy liên hệ kỹ thuật viên MQTech BMT để kiểm
                  tra miễn phí chính xác nguyên nhân.
                </p>
              ) : (
                <ul className="space-y-3.5">
                  {symptoms.map((sym) => (
                    <li
                      key={sym}
                      className="flex items-start gap-3 text-sm text-ink-body sm:text-base break-words"
                    >
                      <CheckCircle2
                        className="h-5 w-5 shrink-0 text-brand mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{sym}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8 shadow-card">
              <h2 className="font-heading text-2xl font-bold text-navy mb-5">
                Chi phí dự kiến công khai
              </h2>
              {priceRows.length === 0 ? (
                <div className="py-2 text-sm text-ink-muted space-y-2">
                  <p>
                    Giá khởi điểm:{" "}
                    <strong className="font-mono text-brand">
                      {settings.showExactPrices
                        ? service.priceFrom
                        : "Báo giá sau kiểm tra miễn phí"}
                    </strong>
                  </p>
                  <p>
                    Xem thêm chi tiết tại{" "}
                    <Link
                      href="/bang-gia"
                      className="font-semibold text-brand hover:underline"
                    >
                      Bảng giá niêm yết đầy đủ
                    </Link>
                    .
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-line-subtle">
                  {priceRows.map((row) => (
                    <div
                      key={row.item}
                      className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    >
                      <span className="text-sm font-medium text-ink-body break-words">
                        {row.item}
                      </span>
                      <span className="font-mono text-sm font-bold text-brand shrink-0 tabular-nums">
                        {settings.showExactPrices
                          ? row.price
                          : "Báo giá sau kiểm tra"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <p className="mt-6 rounded-xl bg-brand-light px-4 py-3 text-xs text-ink-body">
                Đặt lịch online qua website được ưu đãi giảm ngay{" "}
                <strong className="font-mono text-brand">
                  {settings.bookingDiscount}
                </strong>{" "}
                trên hóa đơn sửa chữa.
              </p>
            </div>
          </div>

          {aeo.faqs.length > 0 && (
            <div className="border-t border-line pt-14">
              <div className="max-w-3xl mb-8">
                <h2 className="font-heading text-2xl font-bold text-navy sm:text-3xl">
                  Câu hỏi thường gặp về {service.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted sm:text-base">
                  Giải đáp nhanh chi phí, thời gian xử lý và quy trình bảo hành
                  tại TP. Buôn Ma Thuột.
                </p>
              </div>
              <FaqAccordion items={aeo.faqs} />
            </div>
          )}

          {relatedPosts.length > 0 && (
            <div className="border-t border-line pt-14">
              <div className="flex items-center justify-between gap-4 mb-8">
                <h2 className="font-heading text-2xl font-bold text-navy">
                  Kiến thức &amp; Hướng dẫn liên quan
                </h2>
                <Link
                  href="/bai-viet"
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-hover"
                >
                  <span>Xem tất cả</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {relatedPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/bai-viet/${post.slug}`}
                    className="group flex min-w-0 flex-col justify-between rounded-2xl border border-line bg-surface p-6 shadow-card transition-all hover:-translate-y-1 hover:border-brand/40"
                  >
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex rounded-full bg-brand-light px-2.5 py-0.5 font-semibold text-brand">
                          {post.category}
                        </span>
                        <span className="inline-flex items-center gap-1 text-ink-muted tabular-nums">
                          <Clock
                            className="h-3.5 w-3.5 text-brand"
                            aria-hidden="true"
                          />
                          <span>{post.readTimeMinutes} phút đọc</span>
                        </span>
                      </div>
                      <h3 className="font-heading text-lg font-bold text-navy group-hover:text-brand transition-colors break-words">
                        {post.title}
                      </h3>
                      <p className="text-sm text-ink-muted line-clamp-2 break-words">
                        {post.excerpt}
                      </p>
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand">
                      Đọc hướng dẫn{" "}
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {relatedServices.length > 0 && (
            <div className="border-t border-line pt-14">
              <div className="flex items-center justify-between gap-4 mb-8">
                <h2 className="font-heading text-2xl font-bold text-navy">
                  Các dịch vụ liên quan khác
                </h2>
                <Link
                  href="/dich-vu"
                  className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-hover"
                >
                  <span>Xem tất cả</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {relatedServices.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/dich-vu/${rel.slug}`}
                    className="group flex min-w-0 flex-col justify-between rounded-2xl border border-line bg-surface p-6 shadow-card transition-all hover:-translate-y-1 hover:border-brand/40"
                  >
                    <div className="space-y-2">
                      <span className="inline-flex rounded-full bg-brand-light px-2.5 py-1 font-mono text-xs font-semibold text-brand">
                        {settings.showExactPrices
                          ? rel.priceFrom
                          : "Kiểm tra báo giá"}
                      </span>
                      <h3 className="font-heading text-lg font-bold text-navy group-hover:text-brand transition-colors break-words">
                        {rel.title}
                      </h3>
                      <p className="text-sm text-ink-muted line-clamp-2 break-words">
                        {rel.shortDesc}
                      </p>
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-brand">
                      Xem chi tiết{" "}
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
