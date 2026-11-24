export const SEED_SERVICES = [
  {
    title: "Sửa Máy Tính Tại Nhà BMT",
    slug: "sua-may-tinh-tai-nha-bmt",
    category: "onsite-it",
    shortDesc:
      "Kỹ thuật viên có mặt tận nhà/cơ quan tại TP. Buôn Ma Thuột trong 30 phút. Cài Win, sửa mạng, khắc phục lỗi phần cứng, kiểm tra miễn phí.",
    description:
      "Dịch vụ sửa máy tính tại nhà Buôn Ma Thuột giúp bạn không phải tháo dỡ máy cồng kềnh hay chờ đợi. Kỹ thuật viên MQTech mang đầy đủ thiết bị kiểm tra, linh kiện thay thế tận nơi tại các phường Tân Lập, Tân Lợi, Tự An, Thành Công, Ea Tam và vùng lân cận BMT.",
    priceFrom: "Chỉ từ 100.000đ",
    warranty: "1 - 12 tháng",
    duration: "30 - 60 phút",
    imageUrl:
      "https://images.unsplash.com/photo-1721332154191-ba5f1534266e?auto=format&fit=crop&w=1200&q=80",
    symptomsJson: JSON.stringify([
      "Máy tính không lên nguồn, bật chỉ quay quạt rồi tắt",
      "Lỗi màn hình xanh BSOD, treo logo Windows, khởi động chậm",
      "Máy không nhận WiFi, mất mạng LAN hoặc chia sẻ máy in nội bộ lỗi",
      "Cần cài đặt Windows 10/11 bản chuẩn, Office, phần mềm đồ họa tại nhà",
      "Lỗi phát sinh đột ngột cần kỹ thuật xử lý gấp trong ngày tại BMT",
    ]),
    servicePricesJson: JSON.stringify([
      { item: "Kiểm tra & chẩn đoán lỗi tại nhà (nội thành BMT)", price: "Miễn phí khi sửa / 50.000đ phí đi lại" },
      { item: "Cài đặt Windows 10/11 + Driver + Office cơ bản tận nơi", price: "150.000đ" },
      { item: "Khắc phục lỗi mạng LAN, WiFi, chia sẻ máy in văn phòng", price: "120.000đ" },
      { item: "Thay nguồn PSU / RAM / Ổ cứng SSD tận nhà", price: "Theo giá linh kiện (miễn phí công)" },
    ]),
    featured: true,
    sortOrder: 1,
  },
  {
    title: "Sửa Chữa Laptop Windows Chuyên Sâu",
    slug: "sua-laptop-windows",
    category: "laptop-macbook",
    shortDesc:
      "Mất nguồn, sọc màn hình, hỏng bàn phím, gãy bản lề, lỗi mainboard — xử lý tận gốc chuẩn phòng Lab, khách quan sát trực tiếp.",
    description:
      "MQTech chuyên sửa chữa phần cứng các dòng Laptop Dell, HP, Asus, Lenovo, Acer, MSI. Từ thay màn hình, bàn phím, pin lấy liền đến sửa nguồn, nạp BIOS và hàn chip trên bo mạch chủ với thiết bị chuyên dụng.",
    priceFrom: "Chỉ từ 250.000đ",
    warranty: "3 - 12 tháng",
    duration: "45 phút - 4 giờ",
    imageUrl:
      "https://images.pexels.com/photos/7639355/pexels-photo-7639355.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    symptomsJson: JSON.stringify([
      "Laptop cắm sạc không vào điện, chớp đèn nguồn rồi tắt",
      "Màn hình bị sọc ngang dọc, đốm sáng, tối đen hoặc vỡ kính",
      "Bàn phím bị liệt nút, kẹt phím hoặc tự nhảy ký tự",
      "Gãy bản lề, bung vỏ nhựa khi gập mở máy",
      "Pin chai nhanh, báo ảo hoặc phồng pin làm cấn trackpad",
    ]),
    servicePricesJson: JSON.stringify([
      { item: "Sửa lỗi nguồn / IC sạc / lỗi mạch mainboard Laptop", price: "Chỉ từ 350.000đ" },
      { item: "Thay bàn phím Laptop (lấy ngay 30 phút)", price: "Chỉ từ 280.000đ" },
      { item: "Thay màn hình Laptop HD / FHD / IPS", price: "Chỉ từ 950.000đ" },
      { item: "Gia cố, phục hồi bản lề & vỏ Laptop gãy", price: "Chỉ từ 250.000đ" },
    ]),
    featured: false,
    sortOrder: 2,
  },
  {
    title: "Sửa MacBook Air / Pro Chuyên Nghiệp",
    slug: "sua-macbook-chuyen-nghiep",
    category: "laptop-macbook",
    shortDesc:
      "MacBook Intel & Apple Silicon M1/M2/M3: sửa nguồn, thay pin chuẩn dung lượng, thay màn hình Retina, cứu máy vào nước.",
    description:
      "Xử lý an toàn, chính xác các bệnh thường gặp trên MacBook Air và MacBook Pro tại Buôn Ma Thuột. Linh kiện chất lượng cao, giữ nguyên độ hoàn thiện thẩm mỹ và bảo hành 1 đổi 1 rõ ràng.",
    priceFrom: "Chỉ từ 550.000đ",
    warranty: "3 - 12 tháng",
    duration: "1 - 4 giờ",
    imageUrl:
      "https://images.unsplash.com/photo-1544281679-70f2022b5ced?auto=format&fit=crop&w=1200&q=80",
    symptomsJson: JSON.stringify([
      "MacBook không lên nguồn, không nhận sạc Type-C / MagSafe",
      "Màn hình Retina bị sọc, đứt cáp đèn nền hoặc loang mực",
      "Pin báo Service Recommended, tụt pin nhanh hoặc phù vỏ",
      "Bàn phím dính nước, liệt hàng phím hoặc trackpad không bấm được",
    ]),
    servicePricesJson: JSON.stringify([
      { item: "Sửa nguồn / xử lý MacBook dính nước siêu âm", price: "Chỉ từ 650.000đ" },
      { item: "Thay Pin MacBook Air / Pro chất lượng cao", price: "Chỉ từ 1.150.000đ" },
      { item: "Thay cụm màn hình / tấm nền Retina", price: "Báo giá theo đời máy" },
      { item: "Cài đặt macOS sạch, phần mềm đồ họa / văn phòng", price: "200.000đ" },
    ]),
    featured: false,
    sortOrder: 3,
  },
  {
    title: "Sửa PC & Build Máy Bộ Theo Yêu Cầu",
    slug: "sua-pc-va-build-may-bo",
    category: "pc-build",
    shortDesc:
      "Sửa lỗi mainboard, VGA, nguồn PSU; tư vấn lắp ráp PC Gaming, Đồ họa, Văn phòng tối ưu hiệu năng trên từng đồng ngân sách.",
    description:
      "Dù bạn cần sửa chiếc PC văn phòng bỗng dưng không xuất hình hay muốn dựng dàn máy Gaming / Render 3D / Kế toán mới tinh tại Đắk Lắk, MQTech đều tư vấn linh kiện chính hãng, đi dây gọn gàng, test stress kỹ trước khi bàn giao.",
    priceFrom: "Chỉ từ 150.000đ",
    warranty: "3 - 36 tháng",
    duration: "30 phút - 2 giờ",
    imageUrl:
      "https://images.pexels.com/photos/7639374/pexels-photo-7639374.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    symptomsJson: JSON.stringify([
      "PC bật quạt vẫn quay nhưng màn hình báo No Signal",
      "Máy tự sập nguồn khi chơi game hoặc chạy tác vụ nặng",
      "Cần build dàn PC Gaming / Thiết kế / Văn phòng tối ưu chi phí",
      "Lỗi card đồ họa VGA, nóng chip, kêu to hoặc sọc hình",
    ]),
    servicePricesJson: JSON.stringify([
      { item: "Chẩn đoán lỗi PC & vệ sinh tiếp xúc khe RAM/VGA", price: "100.000đ (Miễn phí khi sửa)" },
      { item: "Thay nguồn PSU / Mainboard / Card màn hình", price: "Theo linh kiện chính hãng" },
      { item: "Công lắp ráp, đi dây thẩm mỹ & cài đặt full bộ PC mới", price: "Miễn phí khi mua trọn bộ tại MQTech" },
    ]),
    featured: false,
    sortOrder: 4,
  },
  {
    title: "Vệ Sinh & Tra Keo Tản Nhiệt Chuẩn Lab",
    slug: "ve-sinh-tra-keo-tan-nhiet",
    category: "clean-upgrade",
    shortDesc:
      "Hạ nhiệt 10-20°C chỉ sau 35 phút. Sử dụng keo tản nhiệt hiệu năng cao Thermal Grizzly / MX-6, làm sạch quạt & khe tản.",
    description:
      "Bụi bẩn và keo tản nhiệt khô cứng là nguyên nhân số 1 khiến Laptop/PC chạy chậm, quạt rú to và dễ chết chip VGA/CPU. Quy trình vệ sinh 12 bước tại MQTech giúp máy mát êm như mới xuất xưởng.",
    priceFrom: "Chỉ từ 120.000đ",
    warranty: "1 tháng",
    duration: "30 - 45 phút",
    imageUrl:
      "https://images.unsplash.com/photo-1721333089073-215a56fd710c?auto=format&fit=crop&w=1200&q=80",
    symptomsJson: JSON.stringify([
      "Quạt tản nhiệt kêu to bất thường dù chỉ lướt web nhẹ",
      "Kê tay hoặc đáy máy nóng ran, máy tự giảm xung (tụt FPS)",
      "Máy tự tắt đột ngột sau 15-30 phút sử dụng liên tục",
      "Đã hơn 6-12 tháng chưa vệ sinh bảo dưỡng định kỳ",
    ]),
    servicePricesJson: JSON.stringify([
      { item: "Vệ sinh Laptop văn phòng + Tra keo Arctic MX-4 / MX-6", price: "120.000đ" },
      { item: "Vệ sinh Laptop Gaming / MacBook + Keo Thermal Grizzly", price: "180.000đ" },
      { item: "Vệ sinh PC để bàn + đi lại dây + tra keo CPU/VGA", price: "150.000đ" },
    ]),
    featured: false,
    sortOrder: 5,
  },
  {
    title: "Nâng Cấp RAM, Ổ Cứng SSD & Linh Kiện",
    slug: "nang-cap-ram-ssd-linh-kien",
    category: "clean-upgrade",
    shortDesc:
      "Tăng tốc máy tính cũ gấp 5 lần với SSD NVMe / SATA và nâng RAM chuẩn bus. Sao lưu dữ liệu cũ giữ nguyên 100%.",
    description:
      "Không cần tốn hàng chục triệu mua máy mới khi chiếc laptop hay PC của bạn vẫn chạy tốt phần cứng nền tảng. MQTech kiểm tra miễn phí khe cắm hỗ trợ, tư vấn đúng chuẩn RAM/SSD chính hãng bảo hành 36 tháng.",
    priceFrom: "Chỉ từ 380.000đ",
    warranty: "36 tháng (1 đổi 1)",
    duration: "20 - 40 phút",
    imageUrl:
      "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1200&q=80",
    symptomsJson: JSON.stringify([
      "Máy khởi động mất 2-3 phút, mở ứng dụng hay bị Not Responding",
      "Đang dùng ổ cứng HDD cũ, ổ C thường xuyên báo đầy đỏ",
      "Mở nhiều tab Chrome hoặc file Excel lớn bị đơ giật vì thiếu RAM",
    ]),
    servicePricesJson: JSON.stringify([
      { item: "Nâng cấp SSD 256GB SATA / NVMe chính hãng (kèm cài Win/chuyển dữ liệu)", price: "Chỉ từ 550.000đ" },
      { item: "Nâng cấp SSD 512GB NVMe tốc độ cao", price: "Chỉ từ 950.000đ" },
      { item: "Nâng cấp RAM 8GB / 16GB DDR4 - DDR5", price: "Chỉ từ 420.000đ" },
    ]),
    featured: false,
    sortOrder: 6,
  },
  {
    title: "Bảo Trì Hệ Thống IT Công Ty & Phòng Máy BMT",
    slug: "bao-tri-it-cong-ty-phong-may",
    category: "onsite-it",
    shortDesc:
      "Hợp đồng bảo trì định kỳ cho văn phòng, doanh nghiệp, quán net, trường học tại Đắk Lắk. Hỗ trợ từ xa & có mặt nhanh.",
    description:
      "Giải pháp phòng IT thuê ngoài tiết kiệm chi phí cho doanh nghiệp tại Buôn Ma Thuột: bảo dưỡng định kỳ hàng tháng, tối ưu mạng nội bộ, máy in, camera và xử lý sự cố ưu tiên trong 30 phút.",
    priceFrom: "Từ 80.000đ / máy / tháng",
    warranty: "Cam kết SLA",
    duration: "Theo lịch định kỳ",
    imageUrl:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    symptomsJson: JSON.stringify([
      "Văn phòng không có nhân viên IT chuyên trách khi máy tính, máy in trục trặc",
      "Mạng LAN nội bộ chậm, chập chờn ảnh hưởng tiến độ làm việc",
      "Cần vệ sinh, kiểm tra định kỳ dàn PC công ty hoặc phòng net",
    ]),
    servicePricesJson: JSON.stringify([
      { item: "Gói bảo trì văn phòng 5 - 15 máy (hỗ trợ từ xa + kiểm tra định kỳ)", price: "Chỉ từ 800.000đ / tháng" },
      { item: "Gói bảo trì doanh nghiệp / phòng máy 15 - 40 máy", price: "Báo giá theo quy mô" },
      { item: "Xử lý sự cố đột xuất lẻ theo lượt tại văn phòng BMT", price: "150.000đ / lượt" },
    ]),
    featured: false,
    sortOrder: 7,
  },
];

export const SEED_PRICING = [
  // Laptop & MacBook
  { tabCategory: "laptop-macbook", serviceName: "Kiểm tra, chẩn đoán lỗi phần cứng chuyên sâu", priceText: "Miễn phí", duration: "15 - 30 phút", warranty: "Không phát sinh phí", sortOrder: 1 },
  { tabCategory: "laptop-macbook", serviceName: "Sửa mạch nguồn / IC sạc / Lỗi không lên hình Laptop", priceText: "Chỉ từ 350.000đ", duration: "2 - 4 giờ", warranty: "3 - 6 tháng", sortOrder: 2 },
  { tabCategory: "laptop-macbook", serviceName: "Thay bàn phím Laptop Windows (Dell, HP, Asus, Lenovo...)", priceText: "Chỉ từ 280.000đ", duration: "30 - 45 phút", warranty: "6 - 12 tháng", sortOrder: 3 },
  { tabCategory: "laptop-macbook", serviceName: "Thay Pin Laptop chính hãng / OEM chuẩn dung lượng", priceText: "Chỉ từ 450.000đ", duration: "20 - 30 phút", warranty: "6 - 12 tháng", sortOrder: 4 },
  { tabCategory: "laptop-macbook", serviceName: "Thay màn hình Laptop FHD IPS / Tần số quét cao", priceText: "Chỉ từ 950.000đ", duration: "30 - 60 phút", warranty: "6 - 12 tháng", sortOrder: 5 },
  { tabCategory: "laptop-macbook", serviceName: "Sửa nguồn MacBook Air / Pro (Intel & M1/M2/M3)", priceText: "Chỉ từ 650.000đ", duration: "Trong ngày", warranty: "3 - 6 tháng", sortOrder: 6 },
  { tabCategory: "laptop-macbook", serviceName: "Thay Pin MacBook Air / Pro chuẩn Apple", priceText: "Chỉ từ 1.150.000đ", duration: "45 - 60 phút", warranty: "6 - 12 tháng", sortOrder: 7 },

  // PC & Build Máy Bộ
  { tabCategory: "pc-build", serviceName: "Kiểm tra, test linh kiện PC (Nguồn, RAM, Main, VGA)", priceText: "Miễn phí tại tiệm", duration: "20 phút", warranty: "Báo đúng bệnh", sortOrder: 1 },
  { tabCategory: "pc-build", serviceName: "Sửa lỗi Mainboard PC không nhận RAM / không xuất hình", priceText: "Chỉ từ 200.000đ", duration: "1 - 3 giờ", warranty: "3 tháng", sortOrder: 2 },
  { tabCategory: "pc-build", serviceName: "Thay thế nguồn máy tính PSU công suất thực (450W - 750W)", priceText: "Chỉ từ 550.000đ", duration: "30 phút", warranty: "36 tháng", sortOrder: 3 },
  { tabCategory: "pc-build", serviceName: "Tư vấn & lắp ráp PC Văn phòng / Học tập tối ưu", priceText: "Chỉ từ 5.500.000đ", duration: "1 - 2 giờ", warranty: "12 - 36 tháng", sortOrder: 4 },
  { tabCategory: "pc-build", serviceName: "Tư vấn & Build PC Gaming / Đồ họa đi dây gọn gàng", priceText: "Theo cấu hình", duration: "2 - 3 giờ", warranty: "36 tháng chính hãng", sortOrder: 5 },

  // Vệ sinh & Nâng cấp
  { tabCategory: "clean-upgrade", serviceName: "Vệ sinh Laptop văn phòng + Tra keo Arctic MX-4 / MX-6", priceText: "120.000đ", duration: "35 phút", warranty: "1 tháng", sortOrder: 1 },
  { tabCategory: "clean-upgrade", serviceName: "Vệ sinh Laptop Gaming / MacBook + Keo Thermal Grizzly", priceText: "180.000đ", duration: "45 phút", warranty: "1 tháng", sortOrder: 2 },
  { tabCategory: "clean-upgrade", serviceName: "Vệ sinh PC để bàn + Tra keo CPU + Dọn dây", priceText: "150.000đ", duration: "40 phút", warranty: "1 tháng", sortOrder: 3 },
  { tabCategory: "clean-upgrade", serviceName: "Nâng cấp SSD 256GB (kèm cài Win & giữ nguyên dữ liệu)", priceText: "Chỉ từ 550.000đ", duration: "30 - 45 phút", warranty: "36 tháng", sortOrder: 4 },
  { tabCategory: "clean-upgrade", serviceName: "Nâng cấp SSD 512GB NVMe Gen3/Gen4 tốc độ cao", priceText: "Chỉ từ 950.000đ", duration: "30 - 45 phút", warranty: "36 tháng", sortOrder: 5 },
  { tabCategory: "clean-upgrade", serviceName: "Nâng cấp RAM 8GB / 16GB DDR4 - DDR5 chính hãng", priceText: "Chỉ từ 420.000đ", duration: "15 phút", warranty: "36 tháng", sortOrder: 6 },

  // Sửa tận nhà & Bảo trì IT
  { tabCategory: "onsite-it", serviceName: "Cài đặt Windows 10/11 + Driver + Office tại nhà BMT", priceText: "150.000đ", duration: "45 phút", warranty: "Hỗ trợ từ xa 1 tháng", sortOrder: 1 },
  { tabCategory: "onsite-it", serviceName: "Cài phần mềm đồ họa / kỹ thuật (AutoCAD, Photoshop, AI...) tận nơi", priceText: "150.000đ - 250.000đ", duration: "45 - 60 phút", warranty: "Hỗ trợ cài lại lỗi", sortOrder: 2 },
  { tabCategory: "onsite-it", serviceName: "Sửa lỗi mạng LAN, WiFi nội bộ, chia sẻ máy in văn phòng BMT", priceText: "120.000đ", duration: "30 - 45 phút", warranty: "1 tháng", sortOrder: 3 },
  { tabCategory: "onsite-it", serviceName: "Vệ sinh & sửa phần cứng cơ bản tại nhà (thay RAM/SSD/PSU)", priceText: "Chỉ từ 150.000đ", duration: "45 phút", warranty: "Theo linh kiện", sortOrder: 4 },
  { tabCategory: "onsite-it", serviceName: "Bảo trì IT định kỳ cho Công ty / Văn phòng / Phòng máy", priceText: "Từ 80.000đ / máy", duration: "Theo tháng", warranty: "Cam kết SLA 30 phút", sortOrder: 5 },
];

export const SEED_POSTS = [
  {
    title: "5 Dấu Hiệu Laptop Cần Vệ Sinh & Tra Keo Tản Nhiệt Ngay Tại BMT",
    slug: "5-dau-hieu-laptop-can-ve-sinh-tra-keo-tan-nhiet",
    excerpt:
      "Thời tiết Tây Nguyên nhiều bụi mịn khiến khe tản nhiệt laptop dễ bít tắc sau 6 tháng. Nhận biết sớm 5 dấu hiệu quá nhiệt để tránh hư chip CPU/VGA tốn tiền triệu.",
    content: `Thời tiết Tây Nguyên nhiều bụi mịn khiến khe tản nhiệt laptop tại Buôn Ma Thuột dễ bít tắc sau 6–12 tháng sử dụng. Khi laptop chạy chậm, quạt kêu to hoặc tự tắt ngang, nguyên nhân chủ yếu là hệ thống tản nhiệt đang quá tải.

Nhận biết sớm **5 dấu hiệu laptop cần vệ sinh và tra keo tản nhiệt** dưới đây giúp bạn tránh hư chip CPU/VGA tốn tiền triệu và giữ pin bền hơn.

## 5 Dấu Hiệu Cảnh Báo Laptop Đang Quá Nhiệt Cần Vệ Sinh Ngay

### 1. Quạt kêu to liên tục dù chỉ mở Word hoặc lướt web

Khi bụi và xơ vải đóng mảng dày ở lá đồng tản nhiệt, khí nóng không thoát ra được. Mainboard buộc đẩy quạt quay tối đa (3.500–5.000 RPM), gây tiếng ồn lớn và nhanh mòn trục quạt.

### 2. Nhiệt độ CPU và GPU thường xuyên vượt 85°C – 95°C

Keo tản nhiệt gốc sau 8–12 tháng sẽ khô cứng, mất khả năng dẫn nhiệt từ chip sang ống đồng. Nếu đo bằng HWMonitor thấy CPU ở chế độ nghỉ trên 60°C và tác vụ nhẹ đã vọt lên 85°C–95°C, máy cần thay keo ngay. Dùng keo Arctic MX-6 hoặc Thermal Grizzly giúp hạ ngay **10°C – 20°C**.

### 3. Bàn phím, chiếu nghỉ tay và đáy máy nóng ran

Nhiệt ứ đọng trong khung máy sẽ lan ngược lên mặt phím và cụm pin lithium-ion, khiến pin nhanh chai hoặc phồng làm cấn trackpad. Tại Buôn Ma Thuột, khe hở ấm trong máy còn dễ thu hút côn trùng — xem thêm [ca thật kiến làm tổ trong màn hình laptop tại BMT](/bai-viet/man-hinh-laptop-chop-soc-kien-lam-to-bmt) để thấy tầm quan trọng của việc bảo dưỡng định kỳ.

### 4. Máy tụt xung, giật lag khi làm việc hoặc chơi game

CPU và GPU hiện đại có cơ chế tự bảo vệ **Thermal Throttling**: khi nhiệt chạm ngưỡng 95°C–100°C, máy tự ép xung xuống thấp để tránh cháy chip, làm tụt FPS, render chậm hoặc khựng lag. Nếu máy chậm bất thường, bạn xem thêm bài [laptop chạy chậm phải làm sao tại Tân Lập BMT](/bai-viet/laptop-chay-cham-phai-lam-sao-tan-lap-bmt) để kiểm tra đúng nguyên nhân.

### 5. Laptop tự sập nguồn đột ngột sau 15–30 phút sử dụng

Đây là **mức cảnh báo đỏ**. Khi cảm biến nhiệt phải ngắt nguồn khẩn cấp mà người dùng vẫn cố bật lại liên tục, tụ nguồn, MOSFET và chân chip VGA rất dễ hở mạch hoặc chập cháy. Nếu để lâu ngày, chi phí sửa mainboard hoặc đóng lại chip sẽ cao gấp nhiều lần so với một lần bảo dưỡng định kỳ.

Ngoài ra, bạn cũng nên kiểm tra thói quen sử dụng hằng ngày: không đặt laptop lên chăn, nệm hoặc mặt bàn phủ khăn dễ bịt khe hút gió dưới đáy máy. Khi làm việc nhiều giờ liên tục, kê nhẹ phần đuôi máy lên 1–2 cm bằng đế tản nhiệt nhôm sẽ giúp luồng khí lưu thông tốt hơn đáng kể.

## Bảng Đánh Giá Nhiệt Độ & Chi Phí Vệ Sinh Laptop Tại BMT

| Mức nhiệt độ CPU | Triệu chứng thường gặp | Mức độ rủi ro | Giải pháp & Giá tham khảo tại MQTech |
| :--- | :--- | :---: | :--- |
| **45°C – 65°C** | Quạt êm, vỏ mát, hiệu năng ổn định | An toàn | Vệ sinh định kỳ mỗi 6–12 tháng |
| **66°C – 80°C** | Quạt kêu rõ khi mở nhiều tab, ấm phím | Trung bình | Vệ sinh laptop văn phòng + keo Arctic MX-4/MX-6: **120.000đ** |
| **81°C – 92°C** | Quạt rú to, tụt xung khi chạy đồ họa/game | Cao | Vệ sinh laptop Gaming / MacBook + keo Thermal Grizzly: **180.000đ** |
| **Trên 93°C** | Nóng ran mặt phím, giật lag, tự sập nguồn | Nguy hiểm | Vệ sinh gấp + kiểm tra quạt & ống đồng: **120.000đ – 180.000đ** |

Xem chi tiết quy trình 12 bước tại trang [dịch vụ vệ sinh và tra keo tản nhiệt chuẩn Lab](/dich-vu/ve-sinh-tra-keo-tan-nhiet) hoặc đối chiếu toàn bộ hạng mục tại [bảng giá sửa máy tính MQTech BMT](/bang-gia).

## Quy Trình Vệ Sinh Laptop Chuẩn Lab Tại MQTech BMT

Khách hàng quan sát trực tiếp toàn bộ quá trình thao tác:

- **Đo nhiệt độ trước khi làm**: Kiểm tra nhiệt CPU/GPU và tốc độ quạt để đối chiếu kết quả.
- **Làm sạch bụi khe gió và cánh quạt**: Tẩy mảng bụi ở lá đồng, vệ sinh và tra dầu trục quạt nếu kêu rè.
- **Tẩy keo cũ & tra keo chính hãng**: Lau sạch bằng dung dịch IPA, tra keo Arctic MX-6 hoặc Thermal Grizzly vừa đủ.
- **Test stress & bảo hành điện tử**: Đo lại nhiệt độ sau lắp ráp và cấp phiếu bảo hành điện tử tra cứu tại \`suamaytinhbmt.id.vn/tra-cuu\`.

## Câu Hỏi Thường Gặp

**1. Bao lâu nên vệ sinh laptop và tra keo tản nhiệt một lần?**

Tại Buôn Ma Thuột, laptop văn phòng nên vệ sinh mỗi **9–12 tháng/lần**; laptop Gaming hoặc chạy đồ họa nặng nên làm mỗi **6 tháng/lần**.

**2. Vệ sinh laptop tại MQTech mất bao lâu? Có để máy qua đêm không?**

Chỉ mất **30–45 phút**, bạn ngồi xem trực tiếp và lấy máy ngay, không cần gửi qua đêm.

**3. Vệ sinh máy có làm mất dữ liệu không?**

Hoàn toàn không. Quá trình vệ sinh không đụng chạm ổ cứng nên dữ liệu an toàn 100%.

**4. MQTech có hỗ trợ vệ sinh laptop tận nhà tại BMT không?**

Có. Bạn có thể ghé tiệm hoặc [đặt lịch kỹ thuật viên đến tận nhà tại BMT](/dat-lich) trong 15–30 phút (ưu tiên P. Tân Lập, P. Tân An và toàn nội thành).

---

**MQTech – Computer Service Buôn Ma Thuột:**

- **Địa chỉ:** Đường Võ Thị Sáu, P. Tân Lập, TP. Buôn Ma Thuột, Đắk Lắk
- **Hotline / Zalo:** 0987 482 573
- **Tra cứu bảo hành điện tử:** suamaytinhbmt.id.vn/tra-cuu`,
    category: "Bảo Dưỡng Phần Cứng",
    coverImage:
      "https://images.unsplash.com/photo-1721333089073-215a56fd710c?auto=format&fit=crop&w=1200&q=80",
    authorName: "Kỹ thuật MQTech BMT",
    readTimeMinutes: 6,
    featured: true,
    seoTitle: "5 Dấu Hiệu Laptop Cần Vệ Sinh & Tra Keo Tản Nhiệt Tại BMT",
    seoDescription:
      "Nhận biết 5 dấu hiệu laptop quá nhiệt cần vệ sinh, tra keo tản nhiệt Arctic MX-6 tại Buôn Ma Thuột. Hạ nhiệt 10-20°C trong 35 phút tại MQTech BMT.",
  },
  {
    title: "Cách Khắc Phục Nhanh Lỗi Màn Hình Xanh (BSOD) Trên Windows 11",
    slug: "cach-khac-phuc-loi-man-hinh-xanh-bsod-windows-11",
    excerpt:
      "Hướng dẫn từng bước kiểm tra mã lỗi STOP CODE, gỡ driver xung đột và kiểm tra RAM/SSD khi máy tính Windows 11 gặp màn hình xanh.",
    content: `Lỗi màn hình xanh (**BSOD – Blue Screen of Death**) trên Windows 11 khiến máy đột ngột dừng mọi tác vụ, hiển thị mã lỗi tiếng Anh rồi tự khởi động lại. Thực chất đây là cơ chế tự bảo vệ của Windows nhằm ngăn hư hại sâu hơn cho dữ liệu và phần cứng.

Dưới đây là hướng dẫn từ kỹ thuật viên MQTech Buôn Ma Thuột giúp bạn đọc đúng **STOP CODE** và tự xử lý lỗi màn hình xanh Windows 11 từng bước an toàn tại nhà.

## Bảng Tra Cứu Các Mã STOP CODE Windows 11 Phổ Biến

Hãy chụp ảnh lại dòng **Stop code** ở góc dưới màn hình xanh để khoanh vùng đúng nguyên nhân:

| Mã STOP CODE thường gặp | Nguyên nhân chính | Hướng xử lý ưu tiên |
| :--- | :--- | :--- |
| **CRITICAL_PROCESS_DIED** | Tệp hệ thống Windows hỏng, xung đột phần mềm hoặc lỗi update | Chạy \`sfc /scannow\`, gỡ bản Windows Update mới nhất |
| **MEMORY_MANAGEMENT** | Thanh RAM lỗi, lỏng chân tiếp xúc hoặc không tương thích | Vệ sinh chân RAM, chạy Windows Memory Diagnostic |
| **INACCESSIBLE_BOOT_DEVICE** | Sai chuẩn boot (AHCI/VMD), lỏng cáp SSD hoặc ổ cứng lỗi | Kiểm tra BIOS/UEFI và đo sức khỏe SSD |
| **VIDEO_TDR_FAILURE** | Driver card đồ họa (NVIDIA/AMD/Intel) xung đột hoặc quá nhiệt | Vào Safe Mode gỡ sạch driver VGA và cài bản ổn định |
| **IRQL_NOT_LESS_OR_EQUAL** | Driver thiết bị lỗi thời hoặc phần mềm diệt virus xung đột | Roll back driver mới cài, gỡ phần mềm diệt virus bên thứ 3 |
| **BAD_SYSTEM_CONFIG_INFO** | Registry lỗi do tắt máy đột ngột lúc đang cập nhật | Dùng System Restore hoặc Startup Repair trong WinRE |

## Hướng Dẫn 5 Bước Khắc Phục Lỗi Màn Hình Xanh Windows 11

### Bước 1: Ngắt kết nối thiết bị ngoại vi không cần thiết

Rút toàn bộ USB, ổ cứng di động, máy in và hub chuyển đổi Type-C ra khỏi máy. Nhiều trường hợp xung đột nguồn hoặc driver từ hub USB giá rẻ cũng gây màn hình xanh liên tục lúc khởi động.

### Bước 2: Khởi động vào Safe Mode (Chế độ an toàn)

Nếu máy còn vào được màn hình đăng nhập, giữ phím **Shift** + bấm **Restart** → **Troubleshoot** → **Advanced options** → **Startup Settings** → **Restart** → nhấn phím **4** (hoặc **F4**). Nếu máy kẹt vòng lặp khởi động, tắt/bật nguồn 3 lần liên tiếp ở logo Windows để vào môi trường khôi phục WinRE.

### Bước 3: Gỡ bản cập nhật Windows hoặc Driver vừa cài

Vào **Settings** → **Windows Update** → **Update history** → **Uninstall updates** để gỡ bản vá gần nhất. Tương tự, mở **Device Manager** → *Display adapters* hoặc *Network adapters* → **Properties** → **Roll Back Driver**. Nếu lỗi phát sinh ngay sau khi nâng cấp hệ điều hành, xem thêm hướng dẫn [máy lỗi sau cập nhật Windows tại Tân Lập BMT](/bai-viet/may-loi-sau-cap-nhat-windows-cai-win-tai-nha-tan-lap).

### Bước 4: Quét và sửa tệp hệ thống bằng Command Prompt

Mở **Command Prompt** với quyền Administrator và chạy lần lượt 2 lệnh:

- \`DISM /Online /Cleanup-Image /RestoreHealth\`
- \`sfc /scannow\`

Chờ hoàn tất 100% rồi khởi động lại máy để kiểm tra.

### Bước 5: Kiểm tra RAM và sức khỏe ổ cứng SSD

Với các mã lỗi như *MEMORY_MANAGEMENT*, nhấn **Windows + R**, gõ \`mdsched.exe\` để kiểm tra RAM tích hợp sẵn. Nếu dùng PC hoặc laptop dễ mở nắp đáy, vệ sinh chân đồng thanh RAM bằng gôm trắng mềm cũng xử lý được nhiều ca lỗi tiếp xúc.

## Khi Nào Nên Gọi Kỹ Thuật Viên Hỗ Trợ Tận Nhà?

Không nên cài đè Windows liên tục khi chưa sao lưu file hoặc khi máy báo lỗi ổ cứng (\`INACCESSIBLE_BOOT_DEVICE\`), tránh mất dữ liệu quan trọng trên ổ C. Lúc này hãy liên hệ [dịch vụ sửa máy tính tại nhà BMT](/dich-vu/sua-may-tinh-tai-nha-bmt) để kỹ thuật viên kiểm tra RAM, đo sức khỏe SSD và sao lưu dữ liệu an toàn.

Nếu hệ điều hành đã lỗi nặng không thể khôi phục, phương án dứt điểm nhất là [dịch vụ cài Win 10/11 & phần mềm tại nhà BMT](/dich-vu/cai-win-10-11-phan-mem-tai-nha-bmt) từ bộ ISO sạch chính hãng Microsoft, hoàn tất trong 30–45 phút kèm bảo hành điện tử tra cứu tại \`suamaytinhbmt.id.vn/tra-cuu\`.

## Câu Hỏi Thường Gặp

**1. Bị màn hình xanh Windows 11 có mất dữ liệu không?**

Lỗi BSOD không tự xóa file đã lưu, chỉ mất nội dung đang mở chưa kịp lưu. Nếu lỗi do ổ SSD sắp hỏng, cần sao lưu dữ liệu ngay khi còn truy cập được.

**2. Lỗi màn hình xanh có bắt buộc phải cài lại Windows không?**

Không. Khoảng 50% trường hợp chỉ do xung đột driver, bản cập nhật lỗi hoặc lỏng chân RAM — xử lý đúng điểm là máy chạy lại bình thường.

**3. Sửa lỗi màn hình xanh tại nhà BMT giá bao nhiêu?**

Kỹ thuật viên MQTech có mặt sau 15–30 phút, kiểm tra và báo giá rõ trước khi làm. Cài lại Win bản sạch + driver chuẩn trọn gói chỉ **150.000đ** (bảo hành 30 ngày).

**4. Làm sao đặt lịch nhanh khi máy không vào được mạng?**

Gọi hoặc nhắn Zalo **0987 482 573**, hoặc dùng điện thoại [đặt lịch sửa máy tính online tại MQTech](/dat-lich) để kỹ thuật viên liên hệ trong 5 phút.

---

**MQTech – Sửa Máy Tính & Cài Win Tận Nơi Buôn Ma Thuột:**

- **Địa chỉ:** Đường Võ Thị Sáu, P. Tân Lập, TP. Buôn Ma Thuột, Đắk Lắk
- **Hotline / Zalo:** 0987 482 573
- **Tra cứu bảo hành:** suamaytinhbmt.id.vn/tra-cuu`,
    category: "Thủ Thuật Windows",
    coverImage:
      "https://images.pexels.com/photos/7639355/pexels-photo-7639355.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    authorName: "Kỹ thuật MQTech BMT",
    readTimeMinutes: 6,
    featured: false,
    seoTitle: "Cách Khắc Phục Lỗi Màn Hình Xanh BSOD Windows 11 Tại Nhà",
    seoDescription:
      "Hướng dẫn đọc mã STOP CODE và khắc phục lỗi màn hình xanh BSOD Windows 11 từng bước tại nhà. Hỗ trợ cài Win, sửa lỗi tận nơi BMT tại MQTech.",
  },
  {
    title: "Nên Nâng Cấp SSD Hay RAM Trước Để Laptop Cũ Chạy Nhanh Hơn?",
    slug: "nen-nang-cap-ssd-hay-ram-truoc-cho-laptop-cu",
    excerpt:
      "Phân tích rõ trường hợp nào cần lên SSD trước, trường hợp nào cần thêm RAM để không tốn tiền oan mà hiệu năng tăng rõ rệt.",
    content: `Nhiều khách hàng tại Buôn Ma Thuột mang laptop dùng 3–5 năm đến MQTech hỏi: *"Máy khởi động chậm, mở Chrome hay Excel hay đơ, giờ **nên nâng cấp SSD hay RAM trước** để tiết kiệm chi phí?"*

Chọn đúng linh kiện cần nâng cấp giúp laptop cũ nhanh lên rõ rệt chỉ với vài trăm nghìn đồng. Dưới đây là hướng dẫn tự kiểm tra và chọn nâng cấp chuẩn xác theo cấu hình máy của bạn.

## Cách Tự Kiểm Tra Máy Đang Nghẽn Ở Ổ Cứng Hay RAM

Nhấn **Ctrl + Shift + Esc** để mở **Task Manager** → chọn tab **Performance** và quan sát lúc máy chậm:

- **Cột Disk luôn 95% – 100%** (loại ổ *HDD*): Cổ chai ở ổ cứng — nâng cấp SSD là ưu tiên số 1.
- **Cột Memory luôn trên 85% – 95%** (máy đã dùng *SSD*): Máy thiếu RAM — nâng thêm RAM sẽ hết giật lag đa nhiệm.
- **Cả Disk và Memory đều thấp nhưng quạt kêu to**: Có thể máy quá nhiệt hoặc lỗi Windows — xem thêm bài [7 nguyên nhân laptop chạy chậm tại Tân Lập BMT](/bai-viet/laptop-chay-cham-phai-lam-sao-tan-lap-bmt) trước khi mua linh kiện.

## Bảng So Sánh HDD, SSD SATA, SSD NVMe & RAM 8GB/16GB

| Linh kiện nâng cấp | Tốc độ / Thông số thực tế | Phù hợp với nhu cầu nào? | Mức độ cải thiện |
| :--- | :--- | :--- | :--- |
| **Ổ cứng cơ HDD (Cũ)** | Đọc/ghi 80 – 120 MB/s | Chỉ nên dùng lưu trữ dữ liệu phụ | Bật máy 1–3 phút, hay 100% Disk |
| **SSD SATA 2.5 inch** | Đọc/ghi 500 – 550 MB/s | Laptop đời cũ không có khe M.2 | Nhanh gấp **4–5 lần** HDD, bật máy 15 giây |
| **SSD M.2 NVMe Gen3/4** | Đọc/ghi 2.000 – 5.000 MB/s | Laptop có khe M.2 NVMe, đồ họa, kỹ thuật | Nhanh gấp **15–30 lần** HDD, bật máy 8–10 giây |
| **RAM 8GB** | Đủ tác vụ văn phòng cơ bản | Học sinh, sinh viên, Word, Excel nhẹ | Tạm đủ cho Windows 10/11 |
| **RAM 16GB (Dual Channel)** | Băng thông gấp đôi khi lắp 2 thanh | Kế toán, 20+ tab Chrome, Photoshop, AutoCAD | Đa nhiệm cực mượt, không reload tab |

## Trường Hợp 1: Nâng Cấp SSD Trước (Nếu Máy Đang Dùng HDD)

Nếu laptop vẫn chạy Windows trên ổ cơ HDD, **hãy nâng SSD ngay lập tức**. Dù lắp 16GB RAM, ổ HDD ~100 MB/s vẫn khiến Windows khởi động mất 2 phút và mở phần mềm phải chờ xoay vòng.

Khi lên SSD 256GB hoặc 512GB chính hãng:

- Thời gian khởi động giảm từ 2 phút xuống **10–15 giây**.
- Mở Word, Excel, MISA, Chrome gần như tức thì.
- Chống sốc tốt hơn hẳn ổ đĩa cơ khi mang đi học, đi làm.

## Trường Hợp 2: Nâng Cấp RAM Trước (Khi Máy Đã Có SSD)

Phần lớn laptop đời mới đã có sẵn SSD 256GB/512GB nhưng chỉ lắp **4GB hoặc 8GB RAM**. Riêng Windows 11 đã chiếm gần 4GB RAM khi khởi động; mở thêm Chrome nhiều tab, Zalo và Excel nặng là máy lập tức tràn RAM.

- **Đang dùng 4GB RAM**: Nên nâng lên tối thiểu **8GB** hoặc **12GB/16GB**.
- **Đang dùng 8GB RAM (1 thanh)**: Lắp thêm 1 thanh 8GB cùng Bus để chạy **Dual Channel 16GB**, vừa mượt đa nhiệm vừa tăng 15–25% hiệu năng đồ họa tích hợp.

## Lưu Ý Trước Khi Nâng Cấp Linh Kiện Laptop

1. **Kiểm tra khe cắm hỗ trợ**: Một số mẫu máy mỏng nhẹ hàn chết RAM trên mainboard hoặc chỉ có 1 khe RAM duy nhất, nên cần kiểm tra đúng mã máy trước khi chọn mua thanh RAM mới.
2. **Chọn đúng chuẩn Bus RAM và giao tiếp SSD**: Lắp sai chuẩn DDR3/DDR4/DDR5 hoặc mua SSD M.2 NVMe cho khe chỉ hỗ trợ M.2 SATA sẽ khiến máy không nhận linh kiện.
3. **Chọn linh kiện chính hãng bảo hành 36 tháng**: Tránh SSD/RAM trôi nổi giá rẻ dễ gây lỗi màn hình xanh, tụt tốc độ hoặc mất dữ liệu đột ngột sau vài tháng sử dụng.
4. **Giữ nguyên 100% dữ liệu**: Tại [dịch vụ nâng cấp RAM, ổ cứng SSD & linh kiện MQTech](/dich-vu/nang-cap-ram-ssd-linh-kien), kỹ thuật viên hỗ trợ chuyển nguyên Windows hoặc cài sạch, bảo toàn dữ liệu. Bạn cũng có thể tự test bàn phím, màn hình, loa, mic qua công cụ [kiểm tra phần cứng máy tính online](/kiem-tra-may-tinh) miễn phí.

## Câu Hỏi Thường Gặp

**1. Nâng cấp SSD và RAM tại BMT giá bao nhiêu?**

Tại MQTech, RAM 8GB DDR4 chính hãng chỉ từ **420.000đ**, SSD 256GB (kèm cài Win & giữ dữ liệu) chỉ từ **550.000đ**, bảo hành **36 tháng (1 đổi 1)**. Xem chi tiết tại [bảng giá nâng cấp linh kiện BMT](/bang-gia).

**2. Thời gian nâng cấp mất bao lâu? Có làm tận nhà không?**

Lắp RAM mất 10–15 phút, nâng SSD và cài đặt mất 30–45 phút. MQTech hỗ trợ lắp tận nhà tại Buôn Ma Thuột miễn phí công lắp.

**3. Ổ HDD cũ tháo ra có tận dụng được không?**

Được! Bạn có thể lắp vào **Box ổ cứng di động USB 3.0** hoặc khay **Caddy Bay** làm ổ lưu trữ ảnh, video rất tiết kiệm.

**4. Làm sao biết máy tôi nâng tối đa được bao nhiêu RAM và lắp được NVMe không?**

Gửi model máy (hoặc chụp tem mặt đáy) qua Zalo **0987 482 573** hoặc [đặt lịch kiểm tra miễn phí tại MQTech](/dat-lich) để nhận tư vấn và báo giá trong 2 phút.

---

**MQTech – Trung Tâm Nâng Cấp & Sửa Laptop Uy Tín Buôn Ma Thuột:**

- **Địa chỉ:** Đường Võ Thị Sáu, P. Tân Lập, TP. Buôn Ma Thuột, Đắk Lắk
- **Hotline / Zalo:** 0987 482 573
- **Tra cứu bảo hành điện tử:** suamaytinhbmt.id.vn/tra-cuu`,
    category: "Nâng Cấp Máy",
    coverImage:
      "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1200&q=80",
    authorName: "Kỹ thuật MQTech BMT",
    readTimeMinutes: 6,
    featured: false,
    seoTitle: "Nên Nâng Cấp SSD Hay RAM Trước Cho Laptop Cũ? Tư Vấn BMT",
    seoDescription:
      "So sánh chi tiết HDD, SSD SATA, NVMe và RAM 8GB/16GB theo nhu cầu thực tế. Tư vấn nâng cấp SSD hay RAM trước cho laptop cũ chuẩn xác tại MQTech BMT.",
  },
  {
    title: "Bí Quyết Bảo Vệ Pin MacBook Bền Lâu Trên 1000 Chu Kỳ Sạc",
    slug: "bi-quyet-bao-ve-pin-macbook-ben-lau",
    excerpt:
      "Những thói quen sạc pin đúng cách cho MacBook Air/Pro Intel & Apple Silicon giúp hạn chế chai pin, phồng pin và giữ hiệu năng ổn định.",
    content: `Pin lithium-polymer trên các dòng MacBook Air và MacBook Pro có tuổi thọ thiết kế khoảng **1.000 chu kỳ sạc (Cycle Count)** trước khi dung lượng tối đa giảm dưới 80%. Tuy nhiên tại phòng Lab MQTech Buôn Ma Thuột, nhiều chiếc MacBook mới dùng 1,5–2 năm đã báo *Service Recommended* hoặc phồng pin do thói quen sạc sai cách và nhiệt độ cao.

Áp dụng đúng các bí quyết dưới đây sẽ giúp pin MacBook bền bỉ 4–5 năm, giữ hiệu năng ổn định và hạn chế tối đa nguy cơ phồng pin.

## Hiểu Đúng Về Chu Kỳ Sạc (Cycle Count) Trên MacBook

**1 chu kỳ sạc** được Apple tính khi bạn tiêu thụ đủ tổng cộng **100% dung lượng pin** (cộng dồn nhiều lần, không phải cứ cắm sạc là tính 1 chu kỳ). Ví dụ hôm nay dùng 50% rồi sạc đầy, ngày mai dùng tiếp 50% rồi sạc đầy mới tính là 1 chu kỳ.

Cách kiểm tra nhanh: bấm biểu tượng **Apple ()** → giữ phím **Option** chọn **System Information** → mục **Power** để xem *Cycle Count* và *Maximum Capacity*.

## Bảng Ngưỡng Sức Khỏe Pin & Thói Quen Sạc (Intel vs Apple Silicon)

| Tiêu chí / Ngưỡng pin | MacBook Intel (2016 – 2020) | MacBook Apple Silicon (M1 / M2 / M3) | Khuyến nghị kỹ thuật MQTech |
| :--- | :--- | :--- | :--- |
| **Dung lượng 90% – 100%** | Hoạt động tốt, chú ý tản nhiệt | Thời lượng pin cao (10–15 tiếng) | Luôn bật *Optimized Battery Charging* |
| **Dung lượng 80% – 89%** | Tụt pin nhanh hơn khi chạy nặng | Vẫn đáp ứng trọn 1 ngày làm việc | Tránh xả dưới 15%, giữ máy mát |
| **Dưới 80% / >1000 chu kỳ** | Dễ sập nguồn ảo ở mức 20–30% | Báo *Service Recommended* | Lên kế hoạch thay pin chuẩn dung lượng |
| **Cắm sạc liên tục tại bàn** | Sinh nhiệt cao, cần kê thoáng đáy | Quản lý điện tốt, tự dùng nguồn trực tiếp | An toàn nếu dùng sạc zin & máy mát |
| **Tản nhiệt ảnh hưởng pin** | Quạt bám bụi làm nóng pin nhanh | MacBook Air không quạt, dễ nóng trên nệm | Vệ sinh định kỳ (dòng có quạt), đặt bàn phẳng |

## 5 Thói Quen Vàng Giúp Pin MacBook Bền Trên 1.000 Chu Kỳ

### 1. Bật tính năng Optimized Battery Charging trong macOS

Vào **System Settings** → **Battery** → biểu tượng **(i)** ở *Battery Health* và bật **Optimized Battery Charging**. macOS sẽ học thói quen sử dụng, giữ mức pin ở **80%** khi cắm sạc cố định tại văn phòng và chỉ nạp 100% trước lúc bạn rút sạc.

### 2. Cắm sạc làm việc thoải mái, nhưng tránh để cạn về 0%

Khi pin đầy 100%, mạch nguồn MacBook tự ngắt dòng vào pin và chuyển sang dùng điện trực tiếp từ củ sạc. Vì vậy vừa cắm sạc vừa làm việc giúp **giảm chu kỳ sạc**. Ngược lại, dùng cạn về 0% sập nguồn mới sạc là nguyên nhân hàng đầu làm chai cell pin. Hãy cắm sạc khi pin còn khoảng **20%**.

### 3. Giữ máy luôn mát mẻ

Nhiệt độ cao làm phồng pin nhanh nhất. Tránh đặt MacBook trên chăn gối hoặc bỏ máy đang Sleep trong cốp xe giữa trời nắng Buôn Ma Thuột. Với MacBook Pro có quạt tản nhiệt, nên dùng [dịch vụ vệ sinh và tra keo tản nhiệt định kỳ](/dich-vu/ve-sinh-tra-keo-tan-nhiet) mỗi 12 tháng để máy mát êm và bảo vệ pin.

### 4. Dùng củ sạc và cáp chính hãng đúng công suất

Sạc trôi nổi dễ gây dao động điện áp, chết IC sạc trên mainboard và phồng pin. Hãy dùng củ sạc Apple hoặc chuẩn USB-PD uy tín (Anker, Ugreen...) đúng công suất khuyến nghị (30W–35W cho MacBook Air, 67W–140W cho MacBook Pro).

### 5. Giữ pin ở mức 50% khi không dùng dài ngày

Nếu cất máy trên 2 tuần không dùng, hãy đưa pin về mức **50%**, chọn *Shut Down* và bảo quản nơi khô ráo.

## Khi Nào Cần Thay Pin MacBook Ngay?

Hãy đưa máy đến [dịch vụ sửa MacBook chuyên nghiệp tại BMT](/dich-vu/sua-macbook-chuyen-nghiep) nếu thấy các dấu hiệu:

- Trackpad cứng khó bấm, mặt đáy kênh hoặc gập màn hình không khít (pin đã phồng).
- Báo *Service Recommended*, dung lượng dưới 75% hoặc tụt pin sập nguồn đột ngột.

Tại MQTech, thay pin MacBook Air/Pro chuẩn dung lượng giá chỉ từ **1.150.000đ**, bảo hành 1 đổi 1 từ 6–12 tháng, tra cứu bảo hành điện tử tại \`suamaytinhbmt.id.vn/tra-cuu\`. Xem thêm tại [bảng giá sửa MacBook MQTech BMT](/bang-gia).

## Câu Hỏi Thường Gặp

**1. Vừa cắm sạc vừa dùng MacBook cả ngày có chai pin không?**

Không. Khi đạt 100% (hoặc 80% với Optimized Battery Charging), máy tự lấy điện trực tiếp từ bộ sạc, giúp tiết kiệm chu kỳ sạc.

**2. Thay pin MacBook tại MQTech BMT mất bao lâu?**

Chỉ **45–60 phút**, khách hàng quan sát trực tiếp và lấy máy ngay trong buổi.

**3. Pin MacBook phồng nhẹ có nên dùng tiếp không?**

Tuyệt đối không. Pin phồng có thể làm vỡ trackpad, cong mainboard hoặc tiềm ẩn rủi ro chập cháy. Cần tháo và thay pin sớm.

**4. Đặt lịch kiểm tra và thay pin MacBook tại BMT như thế nào?**

Bạn có thể [đặt lịch kiểm tra MacBook miễn phí tại MQTech](/dat-lich) hoặc nhắn mã máy (Axxxx ở mặt đáy) qua Zalo **0987 482 573** để nhận báo giá ngay.

---

**MQTech – Phòng Lab Sửa MacBook & Laptop Uy Tín Buôn Ma Thuột:**

- **Địa chỉ:** Đường Võ Thị Sáu, P. Tân Lập, TP. Buôn Ma Thuột, Đắk Lắk
- **Hotline / Zalo:** 0987 482 573
- **Tra cứu bảo hành điện tử:** suamaytinhbmt.id.vn/tra-cuu`,
    category: "Cẩm Nang MacBook",
    coverImage:
      "https://images.unsplash.com/photo-1544281679-70f2022b5ced?auto=format&fit=crop&w=1200&q=80",
    authorName: "Kỹ thuật MQTech BMT",
    readTimeMinutes: 6,
    featured: false,
    seoTitle: "Bí Quyết Bảo Vệ Pin MacBook Bền Lâu Trên 1000 Chu Kỳ Sạc",
    seoDescription:
      "Hướng dẫn cách sạc và bảo vệ pin MacBook Air/Pro Intel & Apple Silicon M1/M2/M3 bền trên 1000 chu kỳ, tránh chai phồng pin từ phòng Lab MQTech BMT.",
  },
];
