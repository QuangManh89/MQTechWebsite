# BÁO CÁO PHÂN TÍCH UI/UX WEBSITE MKTECHVN.COM (REA ANALYSIS)
**Mục tiêu:** Phân tích giao diện, trải nghiệm người dùng (UI/UX) và kiến trúc thiết kế của `https://mktechvn.com/vi`, từ đó đề xuất giải pháp cải tiến cho website MQTech.
**Nguyên tắc thực hiện:** Báo cáo phân tích chuyên sâu — **KHÔNG can thiệp mã nguồn website hiện có**.

---

## I. TỔNG QUAN VỀ KIẾN TRÚC & CÔNG NGHỆ CỦA MKTECH

Thông qua phân tích kỹ thuật (REA - Reverse Engineering Architecture) trên gói bundle và mã nguồn tĩnh đã build của `mktechvn.com`:

| Thành phần | Đặc tả kỹ thuật |
| :--- | :--- |
| **Framework** | Next.js (App Router, prerender tĩnh `X-Nextjs-Prerender: 1`) |
| **Compiler & Bundler** | Next.js Turbopack (`turbopack-1jakfsxl-ut-w.js`) |
| **Hosting & CDN** | Vercel Edge Network (`Server: Vercel`, `Set-Cookie: NEXT_LOCALE=vi`) |
| **Hệ thống CSS** | Tailwind CSS v4 / modern utility styling (`mktech_style.css`, ~74 KB) |
| **Typography** | Inter + System font kết hợp Monospace (`SFMono-Regular, Menlo, Monaco`) |
| **Iconography** | Lucide Icons (nét mảnh `stroke-width="2"`, kích thước chuẩn `size-4` và `size-5`) |
| **Tối ưu văn bản** | Áp dụng `text-balance` cho tiêu đề và `text-pretty` cho đoạn văn bản |

---

## II. PHÂN TÍCH CHI TIẾT DESIGN SYSTEM & UI/UX CỦA MKTECH

### 1. Bảng màu (Color Palette & Dark Surface)
MKTech sử dụng bảng màu tối trường phái **Obsidian Minimalism** rất tinh tế:
* **Màu nền cấp 1 (Base Dark):** `#000000` (đen tuyệt đối ở Navbar và Footer) phối hợp với `#0a0a0a` (Zinc-950) ở nền chính.
* **Màu thẻ & Container (Surface):** Sử dụng các lớp phủ bán trong suốt `bg-white/[0.02]` đến `bg-white/[0.05]` cùng đường viền mảnh `border-white/10`.
* **Màu chữ chính:** `#fafafa` (Zinc-50) và `#ffffff` với độ tương phản đạt chuẩn WCAG AAA (>14:1).
* **Màu chữ phụ & chú thích:** `#a1a1a1` (Zinc-400) và `#737373` (Zinc-500) mang lại cảm giác dịu mắt, không gây mỏi thị giác.
* **Điểm nhấn màu (Accent Glow):** Mỗi dự án được gán một màu ambient glow mờ ở góc thẻ (`opacity-60 blur-[100px]`):
  - Dự án 1: Hồng đào pastel (`bg-rose-400/20`, chữ `#ffa2ae`)
  - Dự án 2: Xanh lơ cyan (`bg-cyan-400/20`, chữ `#53eafd`)
  - Dự án 3: Vàng hổ phách (`bg-amber-400/20`, chữ `#ffd236`)

### 2. Hệ thống Typography (Kiểu chữ phân tầng rõ rệt)
* **Kích thước tiêu đề lớn, dứt khoát:** H1 đạt `text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight`.
* **Ứng dụng Monospace thông minh:** MKTech dùng font monospace cho các thông số phụ như:
  - Chỉ số thứ tự (`01`, `02`)
  - Ngày tháng (`28.10.2026`, `29.10.2026`)
  - Phiên bản (`v1.2.2`) và số liệu (`102 lượt tải`)
  - Tên nhãn danh mục với khoảng cách chữ dãn rộng (`tracking-[0.2em] font-mono text-xs uppercase`)
* **Hiệu quả UX:** Giúp người xem phân biệt ngay đâu là thông điệp cảm xúc và đâu là dữ liệu kỹ thuật thực tế.

---

## III. GIẢI MÃ CẤU TRÚC 5 KHỐI NỘI DUNG CHÍNH CỦA MKTECH

### 1. Thanh điều hướng (Header / Navbar)
* **Vị trí & Hiệu ứng:** `fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl`.
* **Cấu trúc:**
  - Logo dạng vuông bo góc (`rounded-[7px]`) đặt trên đế màu trắng (`bg-[#fff]`), giúp biểu tượng luôn nổi bật trên nền đen.
  - Menu chỉ có 3 mục cốt lõi: **Dự án (`#projects`)**, **Nhật ký (`#log`)**, **Ủng hộ (`/vi/support`)**.
  - Bộ chuyển đổi ngôn ngữ Việt / Anh (`/vi` ↔ `/en`) cực kỳ tối giản ở góc phải.

### 2. Khu vực Hero (Lời tuyên ngôn ngắn gọn, giàu sức nặng)
* **Pill trạng thái:** `<span class="size-1.5 rounded-full bg-emerald-300"></span> iPhone · Android · Mac · Windows`
* **Tiêu đề chính (H1):**
  > *"MKTech — Ứng dụng nhỏ, làm tốt một việc."*
* **Đoạn mô tả ngắn:**
  > *"Ứng dụng cho điện thoại và máy tính. Dễ dùng, cẩn thận với dữ liệu của bạn, và được cải thiện dần theo góp ý."*
* **UX Copywriting:** Hoàn toàn không dùng từ ngữ quảng cáo sáo rỗng ("hàng đầu", "số 1", "đỉnh cao"). Cách diễn đạt mộc mạc, khiêm tốn nhưng tạo sự tin tưởng rất cao.

### 3. Khối giới thiệu sản phẩm / Dịch vụ (`#projects`)
* **Thiết kế thẻ lớn (Showcase Card):**
  - Kích thước thẻ lớn `rounded-[24px]` với viền `border-white/10`, hover chuyển sang `border-white/20`.
  - **Dải thông tin trên cùng (Top Metric Strip):** Gồm số thứ tự (`01`), phân loại (`Máy tính · Tiện ích`), phiên bản (`v1.2.2`), số lượt tải (`102 lượt tải`) và ngày cập nhật.
  - **Nội dung thẻ:** Tên app lớn + Badge trạng thái (`Mới`) + Đoạn mô tả thao tác nhanh trong 2 câu + Nút tải/xem chi tiết.

### 4. Khối nguyên tắc làm việc (`#principles`)
* **Bố cục 4 cột:** `grid sm:grid-cols-2 lg:grid-cols-4 gap-4`.
* **Thiết kế từng thẻ nguyên tắc:**
  - Hộp icon vuông nhỏ gọn (`size-11`) màu đen viền trắng nhẹ, chứa icon nét cyan.
  - Hiệu ứng nhấc nhẹ khi di chuột: `hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.05]`.
  - 4 nguyên tắc cốt lõi:
    1. *Nhỏ gọn, tập trung* (Mỗi app làm một việc và làm cho tốt).
    2. *Dữ liệu ở lại với bạn* (Tôn trọng quyền riêng tư dữ liệu).
    3. *Làm riêng cho từng nền tảng* (Không làm đại trà qua loa).
    4. *Lắng nghe góp ý* (Cải tiến từ người dùng thực).

### 5. Khối nhật ký phát hành (`#log` - Changelog Timeline)
* **Thiết kế dòng thời gian dọc:** `border-l border-white/10 pl-6 sm:pl-8`.
* **Trực quan hóa trạng thái:**
  - Nút tròn nét đứt viền xám đại diện cho bản kế hoạch sắp tới: *Dự án tiếp theo*.
  - Nút tròn đặc có màu (hồng, xanh, vàng) đại diện cho các phiên bản đã phát hành kèm ngày tháng và link xem chi tiết.

---

## IV. ĐÁNH GIÁ ƯU ĐIỂM & NHƯỢC ĐIỂM CỦA MKTECH

### Ưu điểm vượt trội:
1. **Tính chân thật và sự khiêm tốn (Humility & Transparency):** Không dùng mỹ từ thổi phồng, tạo sự thiện cảm và uy tín tự nhiên.
2. **Hệ thống phân cấp thị giác (Visual Hierarchy) mẫu mực:** Tiêu đề to, dữ liệu phụ nhỏ và dùng font mono, khoảng cách thở (whitespace) rất thoáng.
3. **Thẻ sản phẩm giàu thông tin nhưng không bị ngộp:** Nhờ dải Top Metric Strip gom gọn các thông số phụ lên mép trên.
4. **Trải nghiệm trên điện thoại (Mobile UX):** Gọn gàng, cuộn trang mượt mà, không có hiệu ứng nhảy giật layout.

### Điểm hạn chế cần lưu ý:
1. **Tông màu quá tối:** Phù hợp với cộng đồng lập trình viên và người dùng công nghệ trẻ; có thể hơi thiếu độ tươi sáng nếu áp dụng cho dịch vụ phục vụ khách hàng đại chúng tại địa phương.
2. **Kêu gọi hành động (CTA) khá trầm:** MKTech là trang cá nhân/indie developer nên không đặt nặng phễu bán hàng. Đối với MQTech là cơ sở dịch vụ sửa chữa máy tính, CTA cần nổi bật và dễ bấm gọi điện/Zalo hơn.

---

## V. ĐỀ XUẤT ÁP DỤNG VÀO WEBSITE MQTECH HIỆN CÓ

Dựa trên những ưu điểm xuất sắc của MKTech, chúng ta có thể chắt lọc và "chuyển ngữ" sang mô hình dịch vụ sửa chữa máy tính tại Buôn Ma Thuột của MQTech như sau:

### 1. Nâng cấp Hero Banner theo triết lý "Làm tốt một việc"
* **Badge trạng thái đầu trang:**
  - *Thay vì:* Nhiều dòng chữ tiếp thị.
  - *Học tập MKTech:* `<span class="size-1.5 rounded-full bg-emerald-400"></span> Buôn Ma Thuột · Sửa tại tiệm &amp; Tận nơi`
* **Thông điệp chính (Headline):**
  - *Đề xuất:* **"MQTech — Kỹ thuật chuẩn xác, làm đúng một việc."**
  - *Mô tả phụ:* *"Khắc phục dứt điểm sự cố máy tính, laptop và mạng nội bộ tại Buôn Ma Thuột. Kiểm tra rõ ràng, báo giá trước khi sửa, bảo vệ dữ liệu cá nhân của bạn."*

### 2. Thiết kế lại 6 Thẻ Dịch Vụ theo phong cách "Project Showcase Card"
* Mỗi dịch vụ (Laptop, Windows, Phần cứng, Máy in, Wi-Fi, Doanh nghiệp) sẽ có một thẻ card lớn với:
  - **Dải thông số trên cùng (Metric Strip):**
    - `01` · `Phần Cứng` · `Kiểm tra: 15-30 phút` · `Bảo hành: 12-36T`
  - **Ambient Glow riêng biệt ở góc thẻ:**
    - Sửa Laptop & PC: Glow xanh dương dịu
    - Cài đặt Windows: Glow xanh ngọc lục bảo
    - Nâng cấp phần cứng: Glow cam đất / hổ phách
    - Mạng & Máy in: Glow tím lavender
  - **Nút hành động:** "Đặt lịch dịch vụ này" kèm liên kết nhanh đến form tiếp nhận.

### 3. Chuẩn hóa Khối Cam Kết "4 Không" theo Khối Nguyên Tắc (Principles)
* Chuyển khối cam kết thành 4 thẻ vuông bo góc đẹp mắt:
  1. **Không luộc đồ / tráo linh kiện:** Khách trực tiếp ký tên lên từng món trước khi nhận máy.
  2. **Không xâm phạm dữ liệu:** Giữ trọn sự riêng tư của khách hàng.
  3. **Không báo giá khống:** Báo đúng bệnh, khách đồng ý mới tiến hành.
  4. **Không chối từ bảo hành:** Trách nhiệm nghiêm túc sau khi sửa.

### 4. Đưa "Nhật Ký Kỹ Thuật" (Technical Service Log) vào website
* Thay vì chỉ là danh sách dịch vụ tĩnh, học tập khối `#log` của MKTech để làm một dòng thời gian:
  - Cập nhật các ca xử lý tiêu biểu (ví dụ: *Nâng cấp cụm tản nhiệt Laptop Gaming*, *Cứu dữ liệu ổ cứng hỏng cơ*, *Thi công mạng Wi-Fi văn phòng*).
  - Khẳng định năng lực thực tế, tay nghề thật và con người thật tại địa phương.

---

## VI. KẾT LUẬN & ĐỀ XUẤT HÀNH ĐỘNG

1. **Về mặt thiết kế:** Phong cách của `mktechvn.com` rất hiện đại, sang trọng và chuẩn mực quốc tế. Đây là nguồn tham khảo lý tưởng để hoàn thiện một concept UI mới hoặc nâng cấp giao diện chính thức của MQTech.
2. **Về quy trình:** Hiện tại báo cáo đã lưu tại [`audit/MKTECH_UI_UX_ANALYSIS_REPORT.md`](file:///d:/1.Project/MQTechWeb/audit/MKTECH_UI_UX_ANALYSIS_REPORT.md). **Website hiện tại chưa bị thay đổi bất kỳ dòng code nào** theo đúng yêu cầu của bạn.
3. **Bước tiếp theo:** Khi bạn xem qua báo cáo này, nếu bạn muốn:
   - Dựng thêm một **Concept 4 (Phong cách MKTech Dark Minimalist)** để so sánh với 3 concept trước đó;
   - Hoặc kết hợp các yếu tố của MKTech (như dải thông số trên đầu card, khối nguyên tắc 4 cột) vào **Concept 3** vừa đổi màu, xin vui lòng cho biết để tiến hành!
