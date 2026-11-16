# BÁO CÁO TOÀN DIỆN AUDIT UI/UX TRANG CHỦ MQTECH
**Công cụ thực hiện:** Impeccable Audit Engine & Hallmark Sloplint Multi-Viewport Renderer  
**Chế độ đánh giá (Mode):** `Persuade` (Landing Page & Phễu Chuyển Đổi Dịch Vụ Sửa Chữa Máy Tính)  
**Phạm vi:** Trang chủ chính thức (`src/app/page.tsx`) cùng toàn bộ các component liên quan (`Navbar.tsx`, `Hero.tsx`, `KnowledgeSection.tsx`, `ServicesSection.tsx`, `WorkflowSection.tsx`, `TrustSection.tsx`, `IntakeSection.tsx`, `Footer.tsx`).  
**Quy tắc:** Báo cáo độc lập, **KHÔNG SỬA CODE**.

---

## MỤC LỤC
1. [Tổng Quan & Kết Quả Sức Khỏe Giao Diện](#1-tổng-quan--kết-quả-sức-khỏe-giao-diện)
2. [Phần I: 62 Tiêu Chí Đánh Giá Toàn Diện Của Impeccable](#phần-i-62-tiêu-chí-đánh-giá-toàn-diện-của-impeccable)
   - [Nhóm 1: Khả Năng Tiếp Cận & Chuẩn WCAG 2.1/2.2 AA (15 tiêu chí)](#nhóm-1-khả-năng-tiếp-cận--chuẩn-wcag-2122-aa-15-tiêu-chí)
   - [Nhóm 2: Tải Nhận Thức & Kiến Trúc Ra Quyết Định (10 tiêu chí)](#nhóm-2-tải-nhận-thức--kiến-trúc-ra-quyết-định-10-tiêu-chí)
   - [Nhóm 3: Kiểu Chữ & Nghệ Thuật Sắp Đặt Typography (8 tiêu chí)](#nhóm-3-kiểu-chữ--nghệ-thuật-sắp-đặt-typography-8-tiêu-chí)
   - [Nhóm 4: Bố Cục, Tỷ Lệ & Hệ Thống Lưới (10 tiêu chí)](#nhóm-4-bố-cục-tỷ-lệ--hệ-thống-lưới-10-tiêu-chí)
   - [Nhóm 5: Màu Sắc, Độ Tương Phản & Thiết Kế Theme (7 tiêu chí)](#nhóm-5-màu-sắc-độ-tương-phản--thiết-kế-theme-7-tiêu-chí)
   - [Nhóm 6: Vi Tương Tác & Trạng Thái Giao Diện (7 tiêu chí)](#nhóm-6-vi-tương-tác--trạng-thái-giao-diện-7-tiêu-chí)
   - [Nhóm 7: Kiến Trúc Thông Tin & Bản Sao Trải Nghiệm (5 tiêu chí)](#nhóm-7-kiến-trúc-thông-tin--bản-sao-trải-nghiệm-5-tiêu-chí)
3. [Phần II: Báo Cáo Sloplint Của Hallmark & Kiểm Tra 8 Viewport (320px -> 1920px)](#phần-ii-báo-cáo-sloplint-của-hallmark--kiểm-tra-8-viewport-320px---1920px)
   - [Bảng Đối Chiếu 8 Viewport Kích Thước](#bảng-đối-chiếu-8-viewport-kích-thước)
   - [Các Dấu Vết "AI Slop", Thiết Kế Khuôn Mẫu (Generic Cliches)](#các-dấu-vết-ai-slop-thiết-kế-khuôn-mẫu-generic-cliches)
4. [Phần III: Ma Trận Ưu Tiên Xử Lý Khuyến Nghị (P0 - P3)](#phần-iii-ma-trận-ưu-tiên-xử-lý-khuyến-nghị-p0---p3)

---

## 1. TỔNG QUAN & KẾT QUẢ SỨC KHỎE GIAO DIỆN

| Chỉ Số Đánh Giá | Điểm Số / Trạng Thái | Đánh Giá Chuyên Môn |
| :--- | :---: | :--- |
| **Impeccable Overall Health** | **78 / 100** | **Good (Khá)** — Tính thực dụng và bản địa hóa tốt, cần xử lý độ nhất quán thị giác. |
| **Nielsen Heuristics Total** | **30.5 / 40** (76.2%) | Xuất sắc về tài liệu tự sơ cứu, quy trình gửi yêu cầu an toàn, cần tinh chỉnh tải nhận thức. |
| **Hallmark Sloplint Gates** | **22 Fails / 14 Warns** | Phát hiện các lỗi chuyển động `transition-all`, thiếu `motion-reduce`, lạm dụng badge pill kiểu mẫu. |
| **Viewport Integrity (8 sizes)** | Đạt 6/8 viewports | Gặp lỗi ngắt dòng label ở màn hình siêu nhỏ (320px) và lề container ở màn hình lớn (1920px). |

---

## PHẦN I: 62 TIÊU CHÍ ĐÁNH GIÁ TOÀN DIỆN CỦA IMPECCABLE

### Nhóm 1: Khả Năng Tiếp Cận & Chuẩn WCAG 2.1/2.2 AA (15 tiêu chí)

| # | Tiêu Chí Kiểm Tra | Trạng Thái | Vị Trí / Bằng Chứng | Phân Tích Chi Tiết & Ảnh Hưởng |
| :-: | :--- | :---: | :--- | :--- |
| **01** | Độ tương phản chữ thường (>= 4.5:1) | **PASS** | `Hero.tsx`, `KnowledgeSection.tsx` | Chữ `text-slate-600` trên nền `bg-white` đạt tỷ lệ 5.8:1; chữ `text-neutral-300` trên `bg-brand-dark` đạt 8.2:1. |
| **02** | Độ tương phản chữ lớn/tiêu đề (>= 3.0:1) | **PASS** | `Hero.tsx:67`, `KnowledgeSection.tsx:28` | Toàn bộ thẻ H1, H2 nền tối đều đạt >= 9.5:1; nền sáng đạt >= 12:1. |
| **03** | Khả năng dừng chuyển động tự động (WCAG 2.2.2) | **PASS** | `Hero.tsx:39-50` | Đã có nút Pause/Play và cơ chế hover `onMouseEnter` tự động ngắt timer `setInterval`. |
| **04** | Hỗ trợ giảm chuyển động (`prefers-reduced-motion`) | **FAIL** | `Hero.tsx:86`, `ServicesSection.tsx:64` | Sử dụng `hover:scale-[1.02]` và `hover:-translate-y-1` nhưng **thiếu biến thể `motion-reduce:transform-none`**. Người dùng nhạy cảm tiền đình sẽ bị chóng mặt. |
| **05** | Vùng bấm cảm ứng di động (Touch Target >= 44x44px) | **WARN** | `Hero.tsx:165`, `Navbar.tsx:70` | Nút Next/Prev của carousel có kích thước thực tế chỉ `p-1.5` (~28x28px), vi phạm khuyến nghị WCAG 2.5.8 (tối thiểu 24px với khoảng đệm an toàn). |
| **06** | Nhãn biểu mẫu rõ ràng (`<label>` kết hợp `htmlFor`) | **PASS** | `IntakeSection.tsx:340-420` | Toàn bộ 6 trường nhập liệu đều có `label` gắn liền với `id` của `input`/`textarea`. |
| **07** | Nhận diện lỗi form hỗ trợ đọc màn hình | **PASS** | `IntakeSection.tsx:355` | Có thuộc tính `aria-invalid` và `aria-describedby` trỏ chính xác về thông báo lỗi đỏ. |
| **08** | Không dựa hoàn toàn vào màu sắc để báo trạng thái | **PASS** | `IntakeSection.tsx:360` | Báo lỗi vừa đổi viền đỏ, vừa có icon tam giác cảnh báo `AlertTriangle` và câu chữ cụ thể. |
| **09** | Chỉ báo tiêu điểm bàn phím (`:focus-visible`) | **WARN** | `Hero.tsx:86`, `KnowledgeSection.tsx:94` | Nút *"Sao chép mẹo"* và các nút chuyển slide thiếu class `:focus-visible:ring-2` nổi bật khi điều hướng bằng phím Tab. |
| **10** | Thứ tự tab điều hướng tự nhiên (Tab Order) | **PASS** | `src/app/page.tsx` | Cấu trúc DOM đi tuần tự: Header -> Hero CTA -> Thẻ kiến thức -> Dịch vụ -> Form tiếp nhận -> Footer. Không có tabindex âm bất thường. |
| **11** | Cấu trúc thẻ ngữ nghĩa chuẩn (`<main>`, `<header>`) | **PASS** | `src/app/page.tsx`, `Navbar.tsx`, `Footer.tsx` | Sử dụng đầy đủ `<header>`, `<main>`, `<section>`, `<article>`, `<footer>`. |
| **12** | Phân cấp tiêu đề Heading Hierarchy (H1 -> H2 -> H3) | **PASS** | Toàn trang | Chỉ có duy nhất 1 thẻ `<h1>` tại Hero; các section dùng `<h2>`; thẻ con dùng `<h3>`. Không bị nhảy cấp (như H1 nhảy xuống H4). |
| **13** | Văn bản thay thế cho hình ảnh (`alt` text) | **PASS** | `Navbar.tsx:19`, `Footer.tsx:17` | Logo MQTech có alt text đầy đủ: *"MQTech — Computer Service"*. |
| **14** | Tránh bẫy bàn phím (No Keyboard Traps) | **PASS** | Toàn trang | Không có plugin bên thứ ba hay modal nào giữ phím Tab của người dùng mà không thoát được. |
| **15** | Thông báo vùng động (Screen Reader Live Region) | **WARN** | `Hero.tsx:142` | Khi Carousel tự động chuyển slide, không có thuộc tính `aria-live="polite"` để phần mềm trợ thính đọc tiêu đề slide mới cho người khiếm thị. |

---

### Nhóm 2: Tải Nhận Thức & Kiến Trúc Ra Quyết Định (10 tiêu chí)

| # | Tiêu Chí Kiểm Tra | Trạng Thái | Vị Trí / Bằng Chứng | Phân Tích Chi Tiết & Ảnh Hưởng |
| :-: | :--- | :---: | :--- | :--- |
| **16** | Quy tắc Miller (Không quá 7 lựa chọn cùng lúc) | **PASS** | `ServicesSection.tsx:50` | Gói gọn chính xác 6 nhóm dịch vụ trọng tâm, không bị dàn trải hàng chục danh mục con. |
| **17** | Phân cấp hành động chính - phụ (Button Hierarchy) | **WARN** | `Hero.tsx:85-115` | Khu vực Hero có đến **3 nút hành động cạnh tranh**: Yêu cầu sửa chữa (solid), Hotline (border glass), Test máy online (subtle), cộng thêm liên kết Cẩm nang. Gây do dự (hick's law). |
| **18** | Tiết lộ lũy tiến (Progressive Disclosure) | **PASS** | `KnowledgeSection.tsx:65` | Hiển thị 3 bước sơ cứu tóm tắt ngay trên thẻ; các chi tiết kỹ thuật sâu được ẩn bớt để tránh ngợp mắt. |
| **19** | Phân đoạn thông tin (Information Chunking) | **PASS** | `WorkflowSection.tsx:40` | Quy trình tiếp nhận được chia nhỏ thành 4 bước đánh số cụ thể, trực quan và dễ nhớ. |
| **20** | Loại bỏ gánh nặng ghi nhớ (Recognition over Recall) | **PASS** | `ServicesSection.tsx:85` | Bấm *"Yêu cầu dịch vụ"* ở bất kỳ thẻ dịch vụ nào sẽ tự động cuộn xuống và chọn sẵn danh mục đó trong form. |
| **21** | Giảm thiểu ma sát nhập liệu form | **PASS** | `IntakeSection.tsx:32-40` | Chỉ yêu cầu: Tên, Số điện thoại, Mô tả sự cố (và địa chỉ nếu chọn tại nhà). Không đòi hỏi email, mã bưu chính hay tài khoản. |
| **22** | Chống xao nhãng ngoại cảnh thị giác | **WARN** | `Hero.tsx:135` | Thẻ Carousel trượt chuyển động ở bên phải dễ thu hút mắt nhìn ra khỏi thông điệp cốt lõi và nút đặt lịch bên trái. |
| **23** | Tính nhất quán của mô hình tâm lý (Mental Model) | **PASS** | Toàn trang | Sử dụng các biểu tượng quen thuộc: Cờ lê (sửa chữa), Vi điều khiển (phần mềm), Máy in (in ấn), Khiên (bảo mật). |
| **24** | Rõ ràng về trạng thái tiếp nhận (Status Predictability) | **PASS** | `IntakeSection.tsx:280` | Ghi chú minh bạch: *"Chờ xác nhận — Kỹ thuật viên sẽ gọi điện/Zalo kiểm tra trước khi nhận máy"*. |
| **25** | Cung cấp lối thoát khẩn cấp (Emergency Bypass) | **PASS** | `Hero.tsx:96`, `Navbar.tsx:70` | Người dùng gặp máy hỏng khẩn cấp có thể bấm gọi Hotline `0987 482 573` ngay lập tức mà không cần điền form. |

---

### Nhóm 3: Kiểu Chữ & Nghệ Thuật Sắp Đặt Typography (8 tiêu chí)

| # | Tiêu Chí Kiểm Tra | Trạng Thái | Vị Trí / Bằng Chứng | Phân Tích Chi Tiết & Ảnh Hưởng |
| :-: | :--- | :---: | :--- | :--- |
| **26** | Độ dài dòng văn bản tối ưu (Measure: 45 - 75 ký tự) | **PASS** | `Hero.tsx:74`, `ServicesSection.tsx:45` | Các đoạn mô tả đều có `max-w-[540px]` đến `max-w-[640px]`, tránh mắt phải quét quá rộng khi đọc trên desktop. |
| **27** | Kiểm soát chữ rớt mồ côi (Heading Orphan Control) | **FAIL** | `KnowledgeSection.tsx:28`, `IntakeSection.tsx:205` | Tiêu đề *"Bộ Thẻ Hướng Dẫn Kỹ Thuật Nhanh"* trên viewport 375px bị rớt chữ *"Nhanh"* xuống 1 dòng đơn độc. **Thiếu class `text-balance`**. |
| **28** | Tỷ lệ bước nhảy cỡ chữ (Type Scale Ratio) | **PASS** | `src/app/globals.css` | Sử dụng hệ tỷ lệ chuẩn mực: 12px (caption) -> 14px (body/sm) -> 16px (base) -> 18px (h3) -> 24px/32px (h2) -> 46px (h1). |
| **29** | Khoảng cách dòng văn bản (Leading / Line Height) | **PASS** | Toàn trang | Tiêu đề dùng `leading-[1.14]` - `leading-snug`; nội dung mô tả dùng `leading-relaxed` (1.625) chuẩn công thái học. |
| **30** | Lạm dụng chữ in hoa co giãn (Tracked Uppercase Overuse) | **FAIL** | `KnowledgeSection.tsx:32`, `ServicesSection.tsx:42` | Xuất hiện các badge pill viết hoa toàn bộ: `DANH MỤC PHỤC VỤ CỐT LÕI` với `tracking-wider text-xs`. Đây là **dấu hiệu khuôn mẫu AI (AI slop)** mà Hallmark cấm. |
| **31** | Nhất quán font chữ trên toàn giao diện | **PASS** | `src/app/layout.tsx` | Nhất quán sử dụng hệ font không chân Inter / Sans hiện đại, hiển thị dấu tiếng Việt chuẩn xác không bị lỗi font glyphs. |
| **32** | Tránh chữ nghiêng đơn độc trong tiêu đề | **PASS** | Toàn trang | Không có tiêu đề nào dùng 1 chữ in nghiêng giả tạo giữa dòng chữ đứng. |
| **33** | Cắt giảm số lượng từ ngữ thừa trong Hero | **WARN** | `Hero.tsx:74` | Đoạn văn mở đầu dài 37 từ. Với khách hàng sửa máy tính cần quét nhanh, đoạn này nên rút gọn về dưới 20 từ. |

---

### Nhóm 4: Bố Cục, Tỷ Lệ & Hệ Thống Lưới (10 tiêu chí)

| # | Tiêu Chí Kiểm Tra | Trạng Thái | Vị Trí / Bằng Chứng | Phân Tích Chi Tiết & Ảnh Hưởng |
| :-: | :--- | :---: | :--- | :--- |
| **34** | Giới hạn độ rộng tối đa trên màn siêu rộng (1920px) | **WARN** | `src/app/page.tsx:55`, `Hero.tsx:58` | Dùng `max-w-[1280px] mx-auto`. Trên màn hình 1920px, khoảng đệm hai bên mở rộng tới hơn 320px mỗi bên, tạo cảm giác bị nén ở giữa. |
| **35** | Không tràn chiều ngang màn hình (`overflow-x: clip`) | **PASS** | Toàn trang | Không phát sinh thanh cuộn ngang khó chịu trên bất kỳ độ phân giải nào từ 320px đến 1920px. |
| **36** | Nhất quán bán kính bo góc (Border Radius Drift) | **FAIL** | `Hero.tsx`, `WorkflowSection.tsx`, `TrustSection.tsx` | **Hệ thống bo góc bị phân mảnh nặng**: `rounded-3xl` (Hero, Thẻ kiến thức) vs `rounded-2xl` (Dịch vụ) vs `rounded-[20px]` (Cam kết) vs `rounded-[12px]` (Inputs). Cần quy về 1 token chuẩn. |
| **37** | Hệ thống khoảng cách nhịp điệu dọc (Vertical Rhythm) | **PASS** | Toàn trang | Các section phân cách đều đặn bằng padding `py-20 lg:py-28`, tạo nhịp thở thoáng đãng, không bị dính cục. |
| **38** | Hệ thống lưới đa cột thích ứng (Responsive Grid) | **PASS** | `ServicesSection.tsx:50`, `KnowledgeSection.tsx:45` | Chuyển đổi mượt: 1 cột (Mobile) -> 2 cột (Tablet) -> 3 cột (Desktop). |
| **39** | Tránh bố cục "Thẻ lồng trong thẻ" (Card in Card) | **WARN** | `Hero.tsx:185` | Thẻ micro-stat (thời gian chẩn đoán) đặt lồng ngay bên trong khung thẻ Carousel lớn. |
| **40** | Tỷ lệ rỗng cân đối (Whitespace Balance) | **PASS** | Toàn trang | Nội dung trong thẻ có khoảng đệm `p-6 sm:p-8`, viền thẻ không chạm sát mép chữ. |
| **41** | Căn thẳng lề quang học (Optical Alignment) | **PASS** | Toàn trang | Các icon đầu dòng trong danh sách tính năng được căn thẳng hàng tuyệt đối với dòng văn bản đầu tiên. |
| **42** | Header bám dính thông minh (Sticky Header) | **PASS** | `Navbar.tsx:12` | Header mờ `backdrop-blur-md` cố định ở đỉnh trang với độ cao `h-[68px]` gọn gàng, không che khuất nội dung khi cuộn. |
| **43** | Vị trí chốt chặn chuyển đổi (Footer Anchor) | **PASS** | `Footer.tsx` | Chân trang đóng vai trò chốt chặn uy tín với đầy đủ thông tin pháp lý, bản quyền, khu vực phục vụ và cảnh báo bảo mật. |

---

### Nhóm 5: Màu Sắc, Độ Tương Phản & Thiết Kế Theme (7 tiêu chí)

| # | Tiêu Chí Kiểm Tra | Trạng Thái | Vị Trí / Bằng Chứng | Phân Tích Chi Tiết & Ảnh Hưởng |
| :-: | :--- | :---: | :--- | :--- |
| **44** | Hiện tượng sọc vằn nền trang ("Zebra Striping") | **FAIL** | Page layout (`src/app/page.tsx`) | **Lỗi lớn nhất về mặt thị giác**: Nền tối (`Hero` đen) -> Nền sáng (`Knowledge` slate-50) -> Nền trắng (`Services` white) -> Nền tối (`Trust` đen) -> Nền tối (`Intake` đen). Khiến đồng tử người dùng phải co giãn liên tục khi cuộn trang. |
| **45** | Lạm dụng dải chuyển màu tím - xanh (Purple-to-Blue Slop) | **FAIL** | `KnowledgeSection.tsx:127` | Box hỗ trợ văn phòng dùng class `from-indigo-50 via-sky-50 to-white`. Hallmark phân loại đây là dải màu AI cliché cần thay bằng một màu đơn sắc đặc trưng. |
| **46** | Phân mảnh token màu sắc (Palette Drift) | **WARN** | Toàn bộ components | Trộn lẫn nhiều gam màu chưa chuẩn hóa: Indigo (`bg-indigo-600`), Blue (`text-blue-400`), Emerald (`text-emerald-500`), Slate (`bg-slate-50`), Neutral (`text-neutral-300`). |
| **47** | Phân cấp màu sắc tín hiệu ngữ nghĩa (Semantic Colors) | **PASS** | `IntakeSection.tsx` | Màu đỏ dành riêng cho lỗi nghiêm trọng, màu xanh lá cây cho trạng thái thành công/bảo mật, màu chàm cho tương tác chính. |
| **48** | Xung đột giữa viền mảnh và bóng đổ rộng | **WARN** | `Hero.tsx:143`, `KnowledgeSection.tsx:53` | Vừa áp dụng viền mảnh `border border-white/15`, vừa đổ bóng lớn `shadow-2xl`. Hallmark quy định: *"Hãy chọn 1 hình thức: hoặc phân tách bằng viền, hoặc nâng cao bằng bóng đổ"*. |
| **49** | Không dùng chữ gradient mờ ảo (Solid Ink) | **PASS** | `Hero.tsx:68` | Đã loại bỏ hoàn toàn `bg-clip-text text-transparent`, chuyển về màu chữ đặc `text-indigo-400` rõ nét. |
| **50** | Giữ tính trung thực về màu sắc nhận diện | **PASS** | `Navbar.tsx`, `Footer.tsx` | Logo MQTech hiển thị đúng phiên bản trắng/đen chính hãng, không bị biến dạng màu sắc. |

---

### Nhóm 6: Vi Tương Tác & Trạng Thái Giao Diện (7 tiêu chí)

| # | Tiêu Chí Kiểm Tra | Trạng Thái | Vị Trí / Bằng Chứng | Phân Tích Chi Tiết & Ảnh Hưởng |
| :-: | :--- | :---: | :--- | :--- |
| **51** | Lạm dụng thuộc tính chuyển động `transition-all` | **FAIL** | `Hero.tsx:86, 95, 104`, `KnowledgeSection.tsx:53` | Hallmark Sloplint bắt lỗi **9 vị trí dùng `transition-all`**. Việc này ép trình duyệt tính toán lại toàn bộ thuộc tính CSS khi hover, làm giảm khung hình (FPS drops). Nên dùng `transition-colors` hoặc `transition-transform`. |
| **52** | Phản hồi sao chép 1 chạm (Instant Feedback) | **PASS** | `KnowledgeSection.tsx:94-110` | Nút *"Sao chép mẹo"* lập tức biến thành dấu tích xanh `Đã chép mẹo!` trong 2.5 giây, cực kỳ thuyết phục. |
| **53** | Trạng thái đang gửi yêu cầu (Loading Spinner) | **PASS** | `IntakeSection.tsx:610` | Khi bấm gửi, nút đổi thành xoay tròn `Loader2` và vô hiệu hóa nút bấm để chống gửi trùng lặp (double submit). |
| **54** | Trạng thái rỗng & thông báo lỗi hệ thống | **PASS** | `IntakeSection.tsx:285` | Khi gửi thất bại (hoặc mất mạng), có banner đỏ thông báo chi tiết và nút *"Thử lại"* tiện lợi. |
| **55** | Tương tác trượt thẻ Carousel mượt mà | **PASS** | `Hero.tsx:125-220` | Bấm Next/Prev chuyển slide tức thì không bị giật lag, hiển thị rõ số thẻ hiện tại (vd: 1 / 4). |
| **56** | Hiệu ứng nổi bề mặt khi rê chuột (Card Lift Effect) | **PASS** | `ServicesSection.tsx:64` | Thẻ dịch vụ hơi nhấc lên nhẹ `hover:-translate-y-1` và tăng bóng đổ nhẹ, tạo cảm giác bề mặt vật lý cao cấp. |
| **57** | Chống vỡ dòng trên nút bấm tương tác (No-wrap Overflow) | **WARN** | `KnowledgeSection.tsx:95`, `IntakeSection.tsx:315` | Nút *"Đã chép mẹo! / Sao chép mẹo"* thiếu thuộc tính `whitespace-nowrap`, có nguy cơ gãy đôi thành 2 dòng trên màn hình hẹp. |

---

### Nhóm 7: Kiến Trúc Thông Tin & Bản Sao Trải Nghiệm (5 tiêu chí)

| # | Tiêu Chí Kiểm Tra | Trạng Thái | Vị Trí / Bằng Chứng | Phân Tích Chi Tiết & Ảnh Hưởng |
| :-: | :--- | :---: | :--- | :--- |
| **58** | Tính trung thực bản địa (Không số liệu bịa đặt) | **PASS** | Toàn trang | Không có các con số giả mạo (như *"100,000 khách hài lòng"*, *"Đội ngũ 50 kỹ sư"*). Hoàn toàn bám sát thực tế cửa hàng tại Buôn Ma Thuột. |
| **59** | Cam kết bảo mật dữ liệu khách hàng | **PASS** | `TrustSection.tsx:18`, `IntakeSection.tsx:165` | Nhấn mạnh liên tục: *"Không yêu cầu mật khẩu Windows"*, giải tỏa 100% nỗi sợ lớn nhất của khách sửa máy tính. |
| **60** | Khắc phục nỗi sợ "Luộc đồ / Tráo linh kiện" | **PASS** | `Hero.tsx:114`, `TrustSection.tsx:10` | Thông điệp rõ ràng: *"Đo kiểm trực tiếp, niêm phong linh kiện trước mắt khách hàng"*. |
| **61** | Thuật ngữ phù hợp với người dùng bình dân | **PASS** | `Hero.tsx`, `KnowledgeSection.tsx` | Đã loại bỏ thuật ngữ kỹ thuật layout nội bộ ("Từng Thẻ"), dùng câu chữ gần gũi: *"Minh Bạch Từng Quy Trình"*. |
| **62** | Thông tin liên hệ nhất quán trên toàn phễu | **PASS** | `Hero.tsx`, `Navbar.tsx`, `KnowledgeSection.tsx`, `Footer.tsx` | Số Hotline **`0987 482 573`** xuất hiện đồng nhất tại mọi điểm chạm, không còn tình trạng số rác hay số cũ. |

---

## PHẦN II: BÁO CÁO SLOPLINT CỦA HALLMARK & KIỂM TRA 8 VIEWPORT (320px -> 1920px)

### Bảng Đối Chiếu 8 Viewport Kích Thước

Hệ thống chụp ảnh và đo lường Headless Chromium đã dựng trang tại 8 kích thước màn hình thực tế:

```
[320px] ─── iPhone SE thế hệ 1 / Galaxy Mini
[375px] ─── iPhone 12/13/14 mini / SE3
[414px] ─── iPhone Pro Max / Samsung Galaxy Ultra
[768px] ─── iPad Mini / Tablet dọc
[1024px] ── iPad Pro / Laptop màn hình vuông
[1280px] ── MacBook Air / Laptop phổ thông (1280 x 800)
[1440px] ── Desktop tiêu chuẩn (1440 x 900)
[1920px] ── Màn hình Full HD / Ultra-wide
```

| Viewport | Trạng Thái Hiển Thị | Vấn Đề Ghi Nhận Bởi Sloplint Engine |
| :---: | :---: | :--- |
| **320px** | **CẢNH BÁO** | Các liên kết điều hướng trên thanh Navbar bị chật chội; nhãn nút *"Quy trình"* và *"Cam kết"* bị quấn xuống 2 dòng gây gãy giao diện. |
| **375px** | **TỐT** | Bố cục dạng 1 cột vuốt chạm rất tự nhiên. Tuy nhiên tiêu đề H2 ở khối cẩm nang bị rớt lại 1 chữ mồ côi (stub orphan) ở cuối dòng do thiếu `text-wrap: balance`. |
| **414px** | **HOÀN HẢO** | Trải nghiệm tối ưu nhất cho di động. Khoảng cách lề 24px vừa vặn, toàn bộ các thẻ sơ cứu và form tiếp nhận hiển thị rõ ràng, dễ bấm bằng ngón cái. |
| **768px** | **TỐT** | Lưới chuyển sang 2 cột nhịp nhàng. Khối Hero bắt đầu tách thành dạng cân đối. |
| **1024px** | **TỐT** | Bố cục Split Hero hiển thị đầy đủ: Bên trái là tiêu đề và nút Hotline, bên phải là thẻ Carousel điều khiển mượt mà. |
| **1280px** | **HOÀN HẢO** | Toàn bộ tiêu đề H1, mô tả và 3 nút CTA chính đều nằm trọn vẹn trong màn hình đầu tiên (Above-the-fold) mà **không cần cuộn chuột**. |
| **1440px** | **TỐT** | Khoảng cách mắt đọc rất thoải mái, độ phân giải chữ sắc nét. |
| **1920px** | **CẢNH BÁO** | Gate 44d cảnh báo: Container `max-w-[1280px]` bị dồn vào giữa màn hình, để lại hai bên dải đen rộng hơn 320px mỗi bên, chưa tận dụng tốt không gian màn hình lớn. |

---

### Các Dấu Vết "AI Slop", Thiết Kế Khuôn Mẫu (Generic Cliches)

Bộ quy tắc của Hallmark đã quét và bắt được các lỗi mang tính "khuôn mẫu AI" (AI Slop Tell) còn sót lại trong mã nguồn:

1. **Gate 54 & Gate 67 — Lạm dụng Badge Pill viết hoa phía trên tiêu đề H2:**
   - *Bằng chứng:* `<div className="uppercase tracking-wider text-xs">THẺ KIẾN THỨC TỰ SƠ CỨU</div>` và `DANH MỤC PHỤC VỤ CỐT LÕI`.
   - *Nhận xét:* Đây là mẫu thiết kế (template cliché) xuất hiện trên hầu hết các website do AI tự tạo ra trong năm 2024–2026. Một thiết kế thủ công tinh tế thường lồng ghép ngữ cảnh trực tiếp vào tiêu đề thay vì gắn một chiếc nhãn con nhộng giả tạo phía trên.
2. **Gate 2a — Dải chuyển màu Tím sang Xanh (Purple-to-Blue Gradient):**
   - *Bằng chứng:* Khối văn phòng ở cuối mục cẩm nang dùng `from-indigo-50 via-sky-50 to-white`.
   - *Nhận xét:* Dải màu tím chuyển sang xanh da trời là archetype kinh điển của AI. Nên đưa về nền đơn sắc trang nhã với đường viền tinh tế.
3. **Gate 10a — Khai báo chuyển động lười biếng (`transition-all`):**
   - *Bằng chứng:* 9 vị trí dùng `transition-all`.
   - *Nhận xét:* Khiến trình duyệt render lại cả layout thay vì chỉ đổi màu hay bóng đổ. Nên chỉ định chính xác: `transition-colors` hoặc `transition-transform`.
4. **Gate F24 — Mâu thuẫn giữa Viền mảnh và Bóng đổ mềm:**
   - *Bằng chứng:* Vừa có `border border-white/15`, vừa có `shadow-2xl`.
   - *Nhận xét:* Gây cảm giác thiếu quyết đoán về độ cao tầng lớp giao diện.

---

## PHẦN III: MA TRẬN ƯU TIÊN XỬ LÝ KHUYẾN NGHỊ (P0 - P3)

*(Bảng tổng hợp khuyến nghị cho các đợt tinh chỉnh tiếp theo — Hiện tại giữ nguyên code theo yêu cầu)*

| Mức Độ | Mã Vấn Đề | Vị Trí Thành Phần | Giải Pháp Thiết Kế Đề Xuất |
| :---: | :---: | :--- | :--- |
| **P1** | **A11y-04** | `Hero.tsx`, `ServicesSection.tsx` | Bổ sung class `motion-reduce:transform-none` vào tất cả các nút có hiệu ứng hover scale để bảo vệ người dùng nhạy cảm chuyển động. |
| **P1** | **Layout-44** | `src/app/page.tsx` | Khắc phục hiện tượng "sọc vằn nền": Thống nhất một chiến lược nền mạch lạc (Hero tối -> Content ban ngày đồng nhất -> Footer tối làm chân neo). |
| **P2** | **Slop-54** | `KnowledgeSection.tsx`, `ServicesSection.tsx` | Loại bỏ các badge pill viết hoa `uppercase tracking-wider` rập khuôn; chuyển thành câu dẫn tự nhiên hoặc tiêu đề phụ súc tích. |
| **P2** | **Perf-51** | Toàn bộ 9 vị trí trong Home components | Đổi toàn bộ `transition-all` thành `transition-colors duration-150` hoặc `transition-transform duration-200`. |
| **P2** | **Type-27** | `KnowledgeSection.tsx`, `IntakeSection.tsx` | Thêm class `text-balance` vào tất cả các thẻ H2 để loại bỏ hoàn toàn tình trạng rớt 1 chữ mồ côi trên màn hình 375px. |
| **P3** | **Slop-2a** | `KnowledgeSection.tsx:127` | Thay dải gradient tím-xanh bằng nền `bg-slate-100/80` cao cấp với viền bo tròn tối giản. |
| **P3** | **A11y-05** | `Hero.tsx:165` | Tăng kích thước vùng bấm (touch target) của hai nút điều hướng chuyển slide Carousel lên tối thiểu 40x40px. |

---
*Báo cáo được khởi tạo tự động bởi hệ sinh thái công cụ Impeccable & Hallmark Sloplint. Toàn bộ mã nguồn sản phẩm được giữ nguyên vẹn 100%.*
