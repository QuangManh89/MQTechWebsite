export interface BannerSlide {
  id: string;
  tag: string;
  badge?: string;
  title: string;
  highlight?: string;
  description?: string;
  imageSrc: string;
  altText: string;
  href: string;
  stats?: { label: string; value: string }[];
  accentColor?: string;
  gradient?: string;
  iconName?: string;
}

export const BANNER_SLIDES: BannerSlide[] = [
  {
    id: "hardware-repair",
    tag: "Phần cứng & Sửa chữa",
    badge: "Lấy liền 30 - 60 phút",
    title: "Sửa chữa Laptop & PC",
    highlight: "Minh bạch từng linh kiện",
    description:
      "Khắc phục siêu tốc mọi sự cố phần cứng & phần mềm. Bắt đúng bệnh, báo đúng giá, quan sát trực tiếp – Lấy ngay trong ngày.",
    imageSrc: "/banner/laptoppc.webp",
    altText:
      "MQTech - Sửa chữa Laptop & PC uy tín tại Buôn Ma Thuột. Lấy liền 30-60 phút, bảo hành 6-12 tháng, miễn phí kiểm tra, hotline 0987.482.573",
    href: "#yeu-cau-dich-vu",
    stats: [
      { label: "Thời gian xử lý", value: "30 - 60 phút" },
      { label: "Bảo hành", value: "6 - 12 tháng" },
    ],
    accentColor: "#3B82F6",
    gradient: "from-blue-600/20 via-blue-950/40 to-neutral-900",
    iconName: "Laptop",
  },
  {
    id: "clean-os",
    tag: "Hệ điều hành & Phần mềm",
    badge: "Bảo toàn dữ liệu 100%",
    title: "Cài đặt Windows & Phần mềm",
    highlight: "Chuẩn sạch - Diệt sạch virus",
    description:
      "Cài đặt hệ điều hành Windows chuẩn, cập nhật driver đầy đủ, diệt virus và tối ưu tốc độ máy hoạt động mượt mà.",
    imageSrc: "/banner/win.webp",
    altText:
      "MQTech - Cài đặt Windows và phần mềm chuẩn sạch, bảo toàn dữ liệu 100%, diệt sạch virus, hotline 0987.482.573",
    href: "#yeu-cau-dich-vu",
    stats: [
      { label: "Bảo toàn dữ liệu", value: "Tuyệt đối 100%" },
      { label: "Hỗ trợ từ xa", value: "Trọn đời" },
    ],
    accentColor: "#10B981",
    gradient: "from-emerald-600/20 via-emerald-950/40 to-neutral-900",
    iconName: "Cpu",
  },
  {
    id: "hardware-upgrade",
    tag: "Chẩn đoán & Nâng cấp",
    badge: "Bảo hành 36 tháng",
    title: "Chẩn đoán & Nâng cấp phần cứng",
    highlight: "Hệ sinh thái 5 linh kiện",
    description:
      "Nâng cấp ổ cứng SSD tốc độ cao, mở rộng dung lượng RAM, thay keo tản nhiệt chuyên dụng và vệ sinh hệ thống làm mát toàn diện.",
    imageSrc: "/banner/nangcap.webp",
    altText:
      "MQTech - Chẩn đoán & nâng cấp phần cứng laptop PC tại Buôn Ma Thuột. SSD NVMe Gen 4, RAM DDR4/DDR5, keo tản nhiệt, bảo hành 36T, hotline 0987.482.573",
    href: "#yeu-cau-dich-vu",
    stats: [
      { label: "Bảo hành linh kiện", value: "36 tháng" },
      { label: "Thời gian xử lý", value: "30 - 45 phút" },
    ],
    accentColor: "#06B6D4",
    gradient: "from-cyan-600/20 via-cyan-950/40 to-neutral-900",
    iconName: "Cpu",
  },
];

export interface GuideArticle {
  id: string;
  category: "hardware" | "software" | "thermal" | "network";
  categoryLabel: string;
  title: string;
  summary: string;
  readTime: string;
  difficulty: "Dễ" | "Trung bình" | "Cần hỗ trợ kỹ thuật";
  date: string;
  views: string;
  coverImage?: string;
  content: string;
  steps: {
    number: string;
    action: string;
    detail: string;
    warning?: string;
  }[];
  quickTips: string[];
}

export const GUIDE_ARTICLES: GuideArticle[] = [
  {
    id: "liquid-spill-emergency",
    category: "hardware",
    categoryLabel: "Cấp cứu phần cứng",
    title: "5 Bước Sơ Cứu Khẩn Cấp Khi Laptop Bị Đổ Nước Hoặc Cà Phê",
    summary:
      "Xử lý sai lầm trong 10 phút đầu tiên là nguyên nhân khiến 85% laptop bị chập cháy bo mạch chủ (Mainboard). Đây là quy trình sơ cứu sống còn giúp bảo vệ linh kiện và dữ liệu cá nhân của bạn.",
    readTime: "4 phút đọc",
    difficulty: "Cần hỗ trợ kỹ thuật",
    date: "Cập nhật gần đây",
    views: "1.4k lượt xem",
    coverImage: "/cam-nang/liquid-spill-emergency.webp",
    content: `## Vì sao nước và cà phê là "kẻ thù số 1" của bo mạch laptop?

Khi chất lỏng (nước ngọt, trà, đặc biệt là cà phê có axit và đường) tràn qua bàn phím, chúng ngay lập tức len lỏi qua các khe hở và tiếp xúc với bo mạch chủ đang có dòng điện 19V chạy qua. Nước dẫn điện sẽ tạo ra các cầu nối đoản mạch (short circuit), phá hủy chip nguồn, CPU và GPU chỉ trong vài giây.

Nguy hiểm hơn, nếu chất lỏng có đường hoặc muối khoáng, quá trình oxy hóa sẽ diễn ra cực nhanh, làm mục rữa chân linh kiện và ăn mòn mạch đồng ngầm bên trong các lớp mạch PCB đa tầng.

![Quy trình tư thế chữ V ngược và nguyên tắc 3 không khi laptop vào nước](/cam-nang/liquid-spill-protocol.webp)

> [!WARNING]
> Tuyệt đối không bấm nút Shutdown trên màn hình Windows. Mỗi giây chậm trễ khi dòng điện vẫn còn chạy trong máy đều làm tăng nguy cơ nổ tụ cao áp.

### Hiểu đúng về nguyên tắc "Cắt điện triệt để"

Nguồn điện trong laptop đến từ 2 nguồn: sạc adapter cắm ngoài và viên pin gắn bên trong máy. Ngay khi rút sạc, pin vẫn tiếp tục duy trì điện áp trên đường cấp trước (Always-On Power Rails). Do đó, hành động giữ nút nguồn cưỡng bức 5 - 10 giây là bắt buộc để bo mạch chủ ngắt toàn bộ điện thế cấp cho các khối linh kiện nhạy cảm.

### Tại sao tư thế chữ V ngược (^) lại cứu sống máy tính?

Cấu tạo laptop gồm màn hình, bàn phím và bo mạch chủ nằm ngay bên dưới khay phím. Khi bạn mở máy góc 90° - 120° và úp ngược bàn phím xuống bề mặt phẳng có lót khăn mềm:
- Trọng lực sẽ kéo toàn bộ chất lỏng rơi ngược ra ngoài qua các khe phím thay vì nhỏ giọt xuống bo mạch chủ.
- Màn hình LCD được giữ tách biệt, không bị nước chảy tràn vào lớp phản quang gây ố vàng đốm sáng màn hình.

### Quy trình kỹ thuật xử lý chuyên sâu tại MQTech

Sau khi sơ cứu bước đầu tại nhà, laptop cần được kỹ thuật viên tháo rời toàn bộ linh kiện:
- **Tháo pin và đo kiểm trở kháng**: Kiểm tra xem các đường nguồn 3.3V, 5V, 1.05V có bị chạm chập hay không.
- **Tẩy rửa cặn bẩn bằng dung dịch chuyên dụng**: Sử dụng cồn Isopropyl Alcohol (IPA) 99.9% và bể rung siêu âm để đánh tan mọi vết ố, cặn đường, cà phê bám sâu dưới gầm chip BGA.
- **Sấy nhiệt chân không chuẩn 65°C**: Làm khô hoàn toàn hơi ẩm trong vòng 4 - 6 giờ trước khi cấp nguồn thử nghiệm.`,
    steps: [
      {
        number: "01",
        action: "Ngắt sạc & tắt nguồn cưỡng bức ngay lập tức",
        detail:
          "Nhấn và giữ chặt nút nguồn trong 7 - 10 giây cho đến khi toàn bộ đèn tín hiệu và quạt tắt hẳn. Không tốn thời gian bấm Start > Shutdown.",
        warning: "Tuyệt đối không cắm sạc lại trong bất kỳ trường hợp nào!",
      },
      {
        number: "02",
        action: "Rút tất cả thiết bị ngoại vi và ngắt pin",
        detail:
          "Tháo ngay lập tức chuột, USB, ổ cứng di động, thẻ nhớ SD. Nếu laptop của bạn sử dụng pin tháo rời phía sau đáy, gạt lẫy tháo pin ra ngay lập tức.",
      },
      {
        number: "03",
        action: "Úp ngược máy thành hình chữ V ngược (^)",
        detail:
          "Mở máy góc 90° - 120° và đặt úp bàn phím xuống bề mặt khăn bông khô hoặc khăn giấy thấm nước để dung dịch chảy ngược ra ngoài, không ngấm vào CPU/GPU.",
      },
      {
        number: "04",
        action: "Lau sạch bề mặt ngoài bằng khăn vi sợi",
        detail:
          "Nhẹ nhàng thấm khô các giọt nước đọng trên bàn phím, touchpad và khe tản nhiệt. Tránh miết mạnh làm nước tràn qua mép bàn phím.",
        warning: "Tuyệt đối KHÔNG dùng máy sấy tóc nóng vì nhiệt độ làm biến dạng phím và thổi nước vào sâu hơn.",
      },
      {
        number: "05",
        action: "Đưa máy đến trung tâm kiểm tra sấy khô chuyên dụng",
        detail:
          "Kỹ thuật viên cần tháo máy, vệ sinh mạch bằng dung dịch chuyên dụng và đo điện trở an toàn trước khi kích nguồn trở lại.",
      },
    ],
    quickTips: [
      "Tuyệt đối không nhét máy vào thùng gạo (bụi tinh bột chui vào quạt tản nhiệt gặp ẩm đóng bánh gây kẹt cứng)",
      "Không cố bật lại máy dù thấy bề mặt ngoài có vẻ đã khô ráo sau vài giờ",
      "Ghi nhớ loại chất lỏng (nước lọc, nước ngọt, hay cà phê có đường) để báo kỹ thuật viên xử lý dung dịch tẩy rửa phù hợp",
    ],
  },
  {
    id: "ssd-health-check",
    category: "software",
    categoryLabel: "Lưu trữ & Dữ liệu",
    title: "Cách Kiểm Tra Sức Khỏe Ổ Cứng SSD/HDD Và Nhận Biết Dấu Hiệu Sắp Hỏng",
    summary:
      "Ổ cứng bị Bad Sector hoặc cạn tuổi thọ ghi có thể khiến toàn bộ ảnh gia đình, file kế toán và tài liệu học tập biến mất vĩnh viễn. Nhận biết sớm dấu hiệu và kiểm tra định kỳ bằng công cụ S.M.A.R.T.",
    readTime: "5 phút đọc",
    difficulty: "Trung bình",
    date: "Cập nhật gần đây",
    views: "1.1k lượt xem",
    coverImage: "/cam-nang/ssd-health-check.webp",
    content: `## Sự khác biệt nguy hiểm giữa hỏng ổ HDD cơ và ổ SSD thể rắn

Với ổ cứng cơ học truyền thống (HDD), khi ổ sắp hỏng bạn thường nhận được các dấu hiệu cảnh báo vật lý rõ rệt: tiếng kêu cạch cạch phát ra từ đầu đọc, máy bị đơ chuột giật khựng liên tục, hoặc tốc độ copy file tụt về 0 KB/s.

Ngược lại, ổ thể rắn SSD sử dụng chip nhớ flash điện tử NAND. Ổ SSD có thể "chết đột tử" mà không có bất kỳ tiếng động cảnh báo nào: sáng mở máy lên vẫn dùng bình thường, nhưng đến chiều máy đã không nhận ổ đĩa hoặc báo lỗi No Bootable Device.

![Hướng dẫn đọc thông số SMART trên phần mềm CrystalDiskInfo](/cam-nang/ssd-smart-indicators.webp)

> [!TIP]
> Hãy tải phần mềm chuẩn chính hãng **CrystalDiskInfo (Standard Edition)** miễn phí để theo dõi tình trạng ổ đĩa mỗi tháng một lần.

### Giải mã các thông số S.M.A.R.T quan trọng nhất

Khi mở phần mềm CrystalDiskInfo, bạn cần chú ý đến 3 mã lỗi chỉ báo sau:

- **05 - Reallocated Sectors Count (Sector đã hoán đổi)**: Đây là số lượng sector bị lỗi vật lý mà ổ đĩa đã phải dùng vùng nhớ dự phòng để thay thế. Nếu chỉ số này lớn hơn 0 và tiếp tục tăng theo thời gian, bề mặt lưu trữ đang bị suy thoái nhanh chóng.
- **C5 - Current Pending Sector Count (Sector chờ xử lý)**: Các sector đang ở trạng thái bất ổn định, không đọc được dữ liệu. Đây là nguyên nhân hàng đầu khiến Windows bị treo 100% Disk hoặc màn hình xanh (BSOD).
- **E7 hoặc 05 (trên SSD NVMe) - Percentage Used / SSD Life Remaining**: Tỷ lệ phần trăm tuổi thọ chip nhớ còn lại dựa trên tổng dung lượng TBW (Terabytes Written) đã ghi vào ổ.

### Quy tắc sao lưu 3-2-1 bảo vệ dữ liệu vĩnh cửu

Kỹ thuật viên MQTech luôn khuyến nghị khách hàng áp dụng nguyên tắc sao lưu tiêu chuẩn quốc tế:
- **3 Bản sao dữ liệu**: 1 bản gốc đang làm việc và 2 bản sao lưu độc lập.
- **2 Loại phương tiện lưu trữ khác nhau**: Ví dụ lưu trên ổ cứng SSD laptop và 1 ổ cứng di động cắm ngoài qua cổng USB.
- **1 Bản sao lưu đặt ngoài vị trí vật lý (Off-site)**: Đồng bộ tự động lên đám mây (Google Drive, OneDrive hoặc Dropbox) để phòng ngừa rủi ro mất cắp, cháy nổ hoặc sét đánh.`,
    steps: [
      {
        number: "01",
        action: "Quan sát các dấu hiệu bất thường hằng ngày",
        detail:
          "Thời gian khởi động Windows kéo dài gấp 3 - 5 lần, mở file Excel/Word bị treo chuột, xuất hiện màn hình xanh BSOD với mã lỗi CRITICAL_PROCESS_DIED hoặc UNMOUNTABLE_BOOT_VOLUME.",
      },
      {
        number: "02",
        action: "Tải và cài đặt công cụ CrystalDiskInfo",
        detail:
          "Tải bản Standard Edition từ trang chủ chính thức. Phần mềm dung lượng nhẹ, hoàn toàn miễn phí, hỗ trợ đọc toàn diện thông số S.M.A.R.T của cả ổ SATA và NVMe.",
      },
      {
        number: "03",
        action: "Đọc trạng thái màu sắc và nhiệt độ hoạt động",
        detail:
          "Màu Xanh (Good): Ổ cứng ổn định, an tâm sử dụng. Màu Vàng (Caution): Đã có sector lỗi, cần sao lưu tài liệu ngay lập tức. Màu Đỏ (Bad): Nguy cơ hỏng hoàn toàn trong thời gian ngắn.",
        warning: "Nếu trạng thái báo Vàng (Caution), KHÔNG cài thêm phần mềm mới hoặc quét chống phân mảnh (defrag) vì sẽ làm ổ hỏng nhanh hơn.",
      },
      {
        number: "04",
        action: "Sao lưu tài liệu quan trọng và clone ổ đĩa",
        detail:
          "Ưu tiên copy các file công việc, hình ảnh kỷ niệm, chứng từ kế toán sang ổ cứng ngoài hoặc Google Drive. Sau đó nâng cấp sang ổ SSD mới và clone nguyên vẹn bản quyền Windows.",
      },
    ],
    quickTips: [
      "Ổ cứng SSD khi chứa đầy trên 85% dung lượng sẽ bị suy giảm tốc độ đọc ghi từ 30% đến 50%",
      "Tránh rút nóng đột ngột ổ cứng di động mà không bấm 'Safely Remove Hardware' ở khay hệ thống",
      "Nếu ổ đĩa báo Caution hoặc phát ra tiếng kêu cơ học lạ, hãy mang ngay đến MQTech để clone đĩa bằng thiết bị chuyên dụng trước khi chip nhớ bị khóa",
    ],
  },
  {
    id: "thermal-paste-signs",
    category: "thermal",
    categoryLabel: "Bảo dưỡng tản nhiệt",
    title: "4 Dấu Hiệu Cho Thấy Laptop Bị Quá Nhiệt & Cần Tra Keo Tản Nhiệt Ngay",
    summary:
      "Nhiệt độ CPU vượt ngưỡng 85°C làm giảm 40% hiệu năng và có thể gây rộp mạch bo mạch chủ. Đặc thù khí hậu nhiều bụi đất đỏ tại Buôn Ma Thuột khiến keo tản nhiệt nhanh khô và quạt bị nghẹt.",
    readTime: "4 phút đọc",
    difficulty: "Dễ",
    date: "Cập nhật gần đây",
    views: "1.7k lượt xem",
    coverImage: "/cam-nang/thermal-paste-signs.webp",
    content: `## Hiểm họa âm thầm từ hiện tượng Thermal Throttling (Bóp xung nhịp)

Khi bạn sử dụng laptop, CPU và GPU là hai linh kiện tỏa nhiệt lượng khổng lồ. Để bảo vệ các bóng bán dẫn siêu nhỏ khỏi bị nóng chảy, nhà sản xuất tích hợp cơ chế bảo vệ gọi là **Thermal Throttling**: khi nhiệt độ vượt ngưỡng an toàn (thường là 85°C - 90°C), chip xử lý sẽ tự động giảm xung nhịp xuống 50% hoặc thấp hơn.

Hậu quả là máy tính của bạn bắt đầu xuất hiện tình trạng giật lag, drop FPS khi chơi game, render video chậm chạp và mở ứng dụng có độ trễ lớn. Nếu nhiệt độ chạm ngưỡng cực hạn 98°C - 100°C, mạch bảo vệ sẽ ngắt nguồn khẩn cấp để chống cháy chip.

![Thang nhiệt độ CPU và nguy cơ đối với phần cứng laptop](/cam-nang/thermal-maintenance-guide.webp)

> [!NOTE]
> Tại Buôn Ma Thuột và khu vực Tây Nguyên, các hạt bụi đất đỏ Bazan mịn li ti có khả năng bám dính rất cao. Sau 6 - 9 tháng, lớp bụi này sẽ kết hợp với độ ẩm tạo thành một "tấm thảm nỉ" bít kín toàn bộ khe thoát gió của tản nhiệt đồng.

### Vì sao keo tản nhiệt nguyên bản bị khô sau 1 năm?

Keo tản nhiệt (Thermal Paste) có nhiệm vụ lấp đầy các vi kẽ hở giữa bề mặt lưng chip và ống đồng tản nhiệt, dẫn nhiệt nhanh gấp hàng trăm lần so với không khí. 
- Sau 9 - 12 tháng làm việc liên tục ở nhiệt độ cao, dung môi lỏng trong keo sẽ bay hơi, khiến keo bị khô cứng, nứt nẻ và mất hoàn toàn khả năng truyền dẫn nhiệt lượng.
- Nhiệt bị giữ lại ở nhân chip thay vì truyền ra quạt tản gió, khiến vỏ máy nóng ran nhưng quạt thổi ra gió lại chỉ thấy ấm nhẹ.

### Lựa chọn vật tư tản nhiệt chuẩn tại MQTech

Để đảm bảo hiệu quả làm mát bền bỉ, MQTech cam kết sử dụng các vật tư tản nhiệt cao cấp:
- **Keo tản nhiệt gốm Arctic MX-4 / TF8**: Không dẫn điện, an toàn tuyệt đối cho linh kiện xung quanh, độ bền ổn định lên đến 2 năm.
- **Đệm đổi pha Honeywell PTM7950**: Giải pháp làm mát tối thượng cho laptop Gaming & đồ họa hiệu năng cao, tự động chuyển sang dạng lỏng ở 45°C để lấp đầy mọi vi rãnh siêu nhỏ.
- **Dầu tra trục quạt silicon chống bụi**: Giúp cánh quạt quay êm ái, triệt tiêu tiếng rít và gia tăng tuổi thọ mô-tơ quạt.`,
    steps: [
      {
        number: "01",
        action: "Quạt tản nhiệt hú lớn liên tục ngay cả khi lướt web",
        detail:
          "Khe tản nhiệt bị bít kín bởi lớp nỉ bụi đỏ, luồng khí nóng không thể thoát ra ngoài khiến quạt phải gầm rú hết công suất 100% để bù đắp.",
      },
      {
        number: "02",
        action: "Bề mặt bàn phím hoặc chiếu nghỉ tay nóng ran",
        detail:
          "Khi chạm tay vào khu vực gần bản lề hoặc cụm phím WASD thấy nóng rát khó chịu, đây là dấu hiệu nhiệt lượng tích tụ ngược vào khung vỏ kim loại/nhựa.",
      },
      {
        number: "03",
        action: "Tự động sập nguồn đột ngột khi mở tác vụ nặng",
        detail:
          "Cơ chế Thermal Shutdown tự ngắt điện tức thì khi nhân CPU chạm 98°C - 100°C để chống nổ tụ điện và ngăn nguy cơ cháy chip xử lý.",
        warning: "Nếu máy đã tự sập nguồn do quá nhiệt, ngừng ép máy khởi động lại ngay để tránh bong chân chip bán dẫn BGA trên mainboard.",
      },
      {
        number: "04",
        action: "Thời gian sử dụng máy đã quá 9 - 12 tháng chưa bảo dưỡng",
        detail:
          "Khí hậu khô hanh và bụi mịn tại Đắk Lắk đẩy nhanh tốc độ lão hóa của keo tản nhiệt nguyên bản. Máy cần được làm sạch bụi và thay keo định kỳ.",
      },
    ],
    quickTips: [
      "Vệ sinh định kỳ 6 - 9 tháng/lần đối với laptop văn phòng, 4 - 6 tháng đối với laptop gaming và máy trạm đồ họa",
      "Kê cao đuôi laptop từ 1 - 2 cm hoặc dùng đế tản nhiệt để tạo khoảng trống thoáng khí bên dưới đáy máy",
      "Tuyệt đối không để laptop chạy trên nệm mềm, chăn bông hoặc gối vì sẽ bít kín toàn bộ cửa hút gió bên dưới",
    ],
  },
  {
    id: "lan-printer-troubleshoot",
    category: "network",
    categoryLabel: "Mạng & Máy in",
    title: "Khắc Phục Lỗi Máy In Offline & Treo Lệnh In Trong Mạng LAN Văn Phòng",
    summary:
      "Sự cố phổ biến nhất trong các văn phòng tại Buôn Ma Thuột: máy in báo 'Offline', lệnh in xếp hàng dài trong Spooler mà không chạy, hoặc mất kết nối sau khi mất điện. Hướng dẫn tự sửa trong 3 phút.",
    readTime: "5 phút đọc",
    difficulty: "Trung bình",
    date: "Cập nhật gần đây",
    views: "920 lượt xem",
    coverImage: "/cam-nang/lan-printer-troubleshoot.webp",
    content: `## Nguyên nhân cốt lõi khiến máy in mạng LAN bị mất kết nối

Trong môi trường văn phòng, nhiều máy tính cùng chia sẻ một máy in thông qua mạng WiFi hoặc dây cáp mạng LAN. Có 3 nguyên nhân chính dẫn đến tình trạng máy in bị tê liệt:
1. **Dịch vụ Print Spooler của Windows bị crash**: Khi có một tài liệu in chứa font chữ lỗi, định dạng file PDF quá nặng hoặc mất điện đột ngột trong lúc in, hàng đợi lệnh in sẽ bị kẹt cứng (hung state). Các lệnh in sau đều bị chặn lại không thể chuyển tiếp đến máy in.
2. **Xung đột địa chỉ IP do DHCP router**: Nếu máy in được cài đặt nhận IP động (DHCP), mỗi khi khởi động lại modem mạng hoặc sau một đêm mất điện, router sẽ cấp cho máy in một địa chỉ IP mới. Tuy nhiên, các máy trạm của nhân viên vẫn gửi lệnh in đến địa chỉ IP cũ, dẫn đến thông báo "Printer Offline".
3. **Chế độ 'Use Printer Offline' bị kích hoạt tự động**: Khi có sự cố rớt mạng tạm thời, Windows tự động đánh dấu máy in ở trạng thái Offline và không tự hồi phục lại khi mạng đã thông suốt.

![Sơ đồ 4 bước khắc phục triệt để lỗi máy in mạng LAN văn phòng](/cam-nang/printer-spooler-fix.webp)

> [!TIP]
> Luôn cấu hình máy in văn phòng sử dụng **Địa chỉ IP tĩnh (Static IP)** với đuôi cao (ví dụ: \`192.168.1.200\`) để modem không bao giờ cấp trùng cho điện thoại hay máy tính khác.

### Hướng dẫn dọn sạch hàng đợi in Spooler bằng tay

Nếu bấm Restart dịch vụ Print Spooler vẫn chưa xóa hết lệnh in bị kẹt, bạn có thể xóa sạch bộ đệm theo các bước sau:
- Mở Command Prompt (cmd) bằng quyền Administrator.
- Gõ lệnh: \`net stop spooler\` và nhấn Enter để dừng dịch vụ in.
- Nhấn Windows + R, gõ: \`C:\\Windows\\System32\\spool\\PRINTERS\` và xóa toàn bộ các tệp tin có đuôi \`.SHD\` và \`.SPL\` trong thư mục này.
- Quay lại cửa sổ cmd, gõ: \`net start spooler\` và nhấn Enter. Hàng đợi in sẽ được làm mới 100%.

### Khuyến nghị kết nối hạ tầng mạng văn phòng từ MQTech

- **Ưu tiên dùng cáp mạng Cat6**: Máy in dùng chung cho nhiều phòng ban nên được cắm trực tiếp vào switch mạng qua dây cáp Cat6 chống nhiễu, hạn chế dùng mạng WiFi vì sóng chập chờn sẽ gây mất gói tin khi in các tệp scan dung lượng lớn.
- **Chia sẻ qua máy chủ in ấn (Print Server)**: Đối với công ty có trên 10 máy tính, cấu hình máy in qua Print Server chuyên dụng giúp quản trị quyền in ấn, hạn chế lãng phí giấy mực và cô lập sự cố khi một máy tính cá nhân bị nhiễm virus.`,
    steps: [
      {
        number: "01",
        action: "Khởi động lại dịch vụ Print Spooler trong Windows",
        detail:
          "Nhấn tổ hợp phím Windows + R > nhập 'services.msc' > tìm dịch vụ Print Spooler > nhấp chuột phải và chọn 'Restart' để giải phóng hàng đợi in bị tắc nghẽn.",
      },
      {
        number: "02",
        action: "Tắt chế độ 'Use Printer Offline' trong Control Panel",
        detail:
          "Mở Control Panel > Devices and Printers > nhấp đúp vào biểu tượng máy in > bấm menu 'Printer' ở góc trái > bỏ chọn dòng 'Use Printer Offline'.",
      },
      {
        number: "03",
        action: "Kiểm tra địa chỉ IP thực tế của máy in",
        detail:
          "Nhấn nút Menu trên máy in và in trang Network Configuration Report để lấy địa chỉ IP hiện tại. Đảm bảo máy tính và máy in đang cùng một lớp mạng (ví dụ cùng dải 192.168.1.xxx).",
      },
      {
        number: "04",
        action: "Gán IP tĩnh (Static IP) và kiểm tra bằng lệnh Ping",
        detail:
          "Truy cập vào trang quản trị web của máy in qua trình duyệt, đổi cài đặt mạng sang Manual IP (IP tĩnh cố định). Sau đó mở cmd gõ 'ping 192.168.1.xxx' để xác nhận đường truyền thông suốt.",
        warning: "Không đặt IP tĩnh trùng với dải IP cấp cho khách hàng vãng lai để tránh tình trạng xung đột mạng (IP Conflict).",
      },
    ],
    quickTips: [
      "Bật tính năng 'Print directly to the printer' trong tab Advanced của Driver nếu bạn thường xuyên in các bản vẽ CAD hoặc file Photoshop dung lượng lớn",
      "Khởi động lại cả máy in và máy tính nếu sau khi đổi IP máy in vẫn chưa nhận diện kịp",
      "Liên hệ kỹ thuật viên MQTech để được hỗ trợ cấu hình từ xa qua UltraViewer hoặc kiểm tra hạ tầng mạng văn phòng tận nơi tại TP. Buôn Ma Thuột",
    ],
  },
];
