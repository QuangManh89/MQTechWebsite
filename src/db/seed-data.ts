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
    content: `Laptop chạy chậm, quạt kêu vù vù hoặc tự động tắt ngang giữa chừng thường không phải do máy yếu đi mà do hệ thống tản nhiệt đang bị quá tải.

### 1. Quạt kêu to liên tục dù chỉ mở Word hoặc lướt Web
Khi bụi bẩn đóng thành lớp dày ở lá đồng tản nhiệt, luồng gió không thoát được ra ngoài buộc quạt phải quay ở tốc độ tối đa.

### 2. Nhiệt độ CPU luôn vượt ngưỡng 85°C - 95°C
Keo tản nhiệt gốc sau 8-12 tháng sẽ bị khô cứng, mất khả năng dẫn nhiệt. Thay keo tản nhiệt chất lượng cao như Arctic MX-6 hoặc Thermal Grizzly giúp hạ ngay 10-20°C.

### 3. Bàn phím và kê tay nóng ran khó chịu
Nhiệt không thoát qua khe gió sẽ tích tụ ngược lên phần vỏ và bàn phím, lâu ngày còn làm chai phồng pin nhanh hơn.

### 4. Máy bị tụt xung, giật lag khi chơi game hoặc xuất file
CPU có cơ chế tự giảm xung nhịp (Thermal Throttling) để tự bảo vệ khi quá nóng, khiến máy đột ngột khựng lag dù cấu hình mạnh.

### 5. Máy tự sập nguồn đột ngột
Đây là mức cảnh báo đỏ: nếu để kéo dài có thể gây chết tụ nguồn hoặc hở chân chip VGA. Hãy mang máy đến MQTech (Đường Võ Thị Sáu, P. Tân Lập, BMT) hoặc đặt lịch kỹ thuật viên đến tận nơi kiểm tra.`,
    category: "Bảo Dưỡng Phần Cứng",
    coverImage:
      "https://images.unsplash.com/photo-1721333089073-215a56fd710c?auto=format&fit=crop&w=1200&q=80",
    authorName: "Kỹ thuật MQTech BMT",
    readTimeMinutes: 4,
    featured: true,
    seoTitle: "5 Dấu Hiệu Laptop Quá Nhiệt Cần Vệ Sinh & Tra Keo Tại BMT",
    seoDescription:
      "Nhận biết sớm 5 dấu hiệu laptop quá nhiệt cần vệ sinh, tra keo tản nhiệt tại Buôn Ma Thuột để bảo vệ CPU và pin bền lâu.",
  },
  {
    title: "Cách Khắc Phục Nhanh Lỗi Màn Hình Xanh (BSOD) Trên Windows 11",
    slug: "cach-khac-phuc-loi-man-hinh-xanh-bsod-windows-11",
    excerpt:
      "Hướng dẫn từng bước kiểm tra mã lỗi STOP CODE, gỡ driver xung đột và kiểm tra RAM/SSD khi máy tính Windows 11 gặp màn hình xanh.",
    content: `Lỗi màn hình xanh (Blue Screen of Death) thường xuất hiện sau khi cập nhật Windows, cài phần mềm không tương thích hoặc do thanh RAM/SSD gặp lỗi tiếp xúc.

### Bước 1: Ghi lại mã STOP CODE
Các mã phổ biến như CRITICAL_PROCESS_DIED, MEMORY_MANAGEMENT hoặc INACCESSIBLE_BOOT_DEVICE sẽ chỉ rõ nguyên nhân nằm ở hệ điều hành, RAM hay ổ cứng.

### Bước 2: Vào Safe Mode để gỡ bản cập nhật hoặc Driver mới nhất
Nếu máy vừa cài driver card đồ họa hoặc Windows Update xong thì bị lỗi, hãy vào Safe Mode (giữ Shift + Restart) và thực hiện Roll Back Driver.

### Bước 3: Kiểm tra chân tiếp xúc RAM và sức khỏe SSD
Nếu tự thao tác không hết hoặc máy không boot vào được Windows, bạn có thể gọi Hotline MQTech 0987 482 573 để kỹ thuật viên hỗ trợ tận nhà tại Buôn Ma Thuột.`,
    category: "Thủ Thuật Windows",
    coverImage:
      "https://images.pexels.com/photos/7639355/pexels-photo-7639355.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    authorName: "Kỹ thuật MQTech BMT",
    readTimeMinutes: 5,
    featured: false,
    seoTitle: "Cách Sửa Lỗi Màn Hình Xanh Windows 11 Hiệu Quả",
    seoDescription:
      "Hướng dẫn xử lý lỗi màn hình xanh BSOD Windows 11 nhanh chóng tại nhà.",
  },
  {
    title: "Nên Nâng Cấp SSD Hay RAM Trước Để Laptop Cũ Chạy Nhanh Hơn?",
    slug: "nen-nang-cap-ssd-hay-ram-truoc-cho-laptop-cu",
    excerpt:
      "Phân tích rõ trường hợp nào cần lên SSD trước, trường hợp nào cần thêm RAM để không tốn tiền oan mà hiệu năng tăng rõ rệt.",
    content: `Nhiều khách hàng tại BMT mang laptop chạy chậm đến hỏi nên nâng RAM hay SSD. Câu trả lời phụ thuộc vào cấu hình hiện tại của máy bạn:

### 1. Nếu máy vẫn đang dùng ổ cứng cơ (HDD) -> Nâng SSD ngay lập tức
Ổ HDD truyền thống có tốc độ đọc ghi chỉ khoảng 80-120MB/s, trong khi SSD NVMe đạt từ 1.800 đến 3.500MB/s. Thay SSD giúp thời gian bật máy giảm từ 2 phút xuống còn 10-12 giây.

### 2. Nếu máy đã có SSD nhưng RAM dưới 8GB -> Nâng cấp lên 16GB RAM
Windows 11 và các trình duyệt hiện đại ngốn trung bình 5-6GB RAM ngay khi mở vài tab. Nâng lên 16GB RAM giúp bạn mở song song Chrome, Excel, phần mềm kế toán hoặc Photoshop mượt mà không giật lag.`,
    category: "Nâng Cấp Máy",
    coverImage:
      "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=1200&q=80",
    authorName: "Kỹ thuật MQTech BMT",
    readTimeMinutes: 4,
    featured: false,
    seoTitle: "Nâng Cấp SSD Hay RAM Trước Cho Laptop Chạy Nhanh Hơn?",
    seoDescription:
      "Tư vấn chọn nâng cấp SSD hoặc RAM đúng bệnh, tiết kiệm chi phí từ kỹ thuật viên MQTech BMT.",
  },
  {
    title: "Bí Quyết Bảo Vệ Pin MacBook Bền Lâu Trên 1000 Chu Kỳ Sạc",
    slug: "bi-quyet-bao-ve-pin-macbook-ben-lau",
    excerpt:
      "Những thói quen sạc pin đúng cách cho MacBook Air/Pro Intel & Apple Silicon giúp hạn chế chai pin, phồng pin và giữ hiệu năng ổn định.",
    content: `Pin MacBook chính hãng có tuổi thọ thiết kế khoảng 1000 chu kỳ sạc. Tuy nhiên nếu sử dụng sai cách trong môi trường nóng ẩm, pin có thể xuống cấp chỉ sau 1-2 năm.

### Bật Optimized Battery Charging trong macOS
Tính năng này học thói quen sử dụng của bạn và giữ mức sạc ở 80% khi bạn cắm sạc cố định tại bàn làm việc.

### Tránh để máy cạn kiệt về 0% thường xuyên
Hãy cắm sạc khi pin còn khoảng 15-20%. Việc cắm sạc liên tục khi làm việc tại văn phòng hoàn toàn an toàn vì MacBook tự ngắt dòng vào pin khi đầy 100%.`,
    category: "Cẩm Nang MacBook",
    coverImage:
      "https://images.unsplash.com/photo-1544281679-70f2022b5ced?auto=format&fit=crop&w=1200&q=80",
    authorName: "Kỹ thuật MQTech BMT",
    readTimeMinutes: 3,
    featured: false,
    seoTitle: "Cách Sạc & Bảo Vệ Pin MacBook Bền Lâu",
    seoDescription:
      "Mẹo sử dụng và sạc pin MacBook Air/Pro đúng cách từ phòng Lab MQTech.",
  },
];
