---
name: "MQTech - Computer Service BMT"
description: "Hệ thống thiết kế kỹ thuật minh bạch cho dịch vụ sửa chữa Laptop, MacBook, PC & bảo trì IT tận nơi tại Buôn Ma Thuột."
colors:
  titanium-cobalt: "#2563eb"
  cobalt-deep: "#1d4ed8"
  electric-cyan: "#38bdf8"
  cobalt-wash: "#eff6ff"
  cobalt-mist: "#dbeafe"
  obsidian-navy: "#0b1120"
  navy-surface: "#0f172a"
  navy-border: "#1e293b"
  canvas-white: "#ffffff"
  bento-page: "#f2f5f9"
  action-orange: "#c2410c"
  action-orange-hover: "#9a3412"
  bench-subtle: "#f2f5f9"
  bench-muted: "#e8eef6"
  slate-ink: "#0f172a"
  slate-body: "#2b384e"
  slate-muted: "#475569"
  slate-placeholder: "#5b6b82"
  navy-ice-muted: "#c7d6eb"
  border-hairline: "#dde5f0"
  emerald-verified: "#047857"
  amber-pending: "#b45309"
  rose-alert: "#be123c"
typography:
  display:
    fontFamily: "Manrope, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "3.5rem"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Manrope, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Manrope, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "-0.01em"
  body:
    fontFamily: "IBM Plex Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "0em"
  label:
    fontFamily: "IBM Plex Sans, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0em"
  mono:
    fontFamily: "JetBrains Mono, Menlo, monospace"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0em"
  print-invoice:
    fontFamily: "Be Vietnam Pro, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0em"
rounded:
  md: "8px"
  lg: "12px"
  xl: "16px"
  pill: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "80px"
components:
  button-primary:
    backgroundColor: "{colors.titanium-cobalt}"
    textColor: "{colors.canvas-white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.cobalt-deep}"
    textColor: "{colors.canvas-white}"
  button-secondary:
    backgroundColor: "{colors.canvas-white}"
    textColor: "{colors.obsidian-navy}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
    height: "48px"
  chip-filter:
    backgroundColor: "{colors.canvas-white}"
    textColor: "{colors.slate-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "10px 16px"
    height: "44px"
  chip-filter-active:
    backgroundColor: "{colors.titanium-cobalt}"
    textColor: "{colors.canvas-white}"
  input-field:
    backgroundColor: "{colors.canvas-white}"
    textColor: "{colors.obsidian-navy}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "12px 16px"
    height: "48px"
  card-surface:
    backgroundColor: "{colors.canvas-white}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.xl}"
    padding: "24px"
---

# Design System: MQTech - Computer Service BMT

## Overview

**Creative North Star: "The Transparent Precision Bench"**

MQTech BMT được thiết kế như một bàn kỹ thuật phần cứng sáng rõ, ngăn nắp và trung thực. Khách hàng tìm đến dịch vụ sửa máy tính khi thiết bị làm việc gặp sự cố khẩn cấp; giao diện phải truyền tải ngay sự bình tĩnh, tay nghề chuẩn xác và cam kết báo đúng giá trước khi chạm vào ốc vít. Không gian nền sáng chiếm chủ đạo để bảng giá, triệu chứng lỗi và mã bảo hành điện tử đọc rõ tức thì dưới ánh sáng ngoài trời hay màn hình di động.

Màu nhấn Titanium Cobalt lấy trực tiếp từ biểu trưng hình học `MQ` chỉ xuất hiện ở các điểm quyết định hành động (Đặt lịch, Gọi Hotline, Mã phiếu sửa chữa), đối trọng với khối nền Obsidian Navy vững chãi dành riêng cho khu vực chứng thực uy tín và chân trang. Mọi chi tiết trang trí thừa — nhãn phụ chữ hoa lặp lại trên tiêu đề, chấm nhấp nháy vô hạn, bóng phát sáng màu trên nền tối — đều bị loại bỏ để nhường chỗ cho thông tin kỹ thuật xác thực.

**Key Characteristics:**
- Bề mặt sáng chuẩn phòng Lab kết hợp điểm nhấn Titanium Cobalt sắc nét từ bộ nhận diện gốc `edition-2-cobalt`.
- Cặp chữ hình học hiện đại (`Outfit`) cho tiêu đề và chữ nhân văn kỹ thuật (`IBM Plex Sans` hỗ trợ đầy đủ dấu tiếng Việt) cho văn bản đọc dài.
- Chữ đơn cách (`JetBrains Mono` bật `tabular-nums`) dành riêng cho mã phiếu `MQ-YYYY-XXXX`, số điện thoại và con số báo giá.
- Tương tác chuẩn công thái học cảm ứng (`>= 44x44px`), tôn trọng vùng an toàn iOS và có vòng focus bàn phím rõ nét.

## Colors

Bảng màu kết hợp độ tin cậy cơ khí của xanh Cobalt kim loại với hệ trung tính lạnh sắc nét, khóa cố định ở chế độ sáng (`color-scheme: light`) để tối ưu khả năng đọc bảng giá và tra cứu phiếu.

### Primary
- **Titanium Cobalt** (`--raw-cobalt`): Màu hành động chính cho nút Đặt lịch, nút Gọi ngay, trạng thái tab đang chọn và vòng focus bàn phím.
- **Deep Cobalt** (`--raw-cobalt-hover`): Trạng thái hover và nhấn giữ của các nút hành động chính.
- **Cobalt Wash** (`--raw-cobalt-light`): Nền dịu cho huy hiệu giá khởi điểm, khung icon ngữ nghĩa và thẻ tóm tắt mã phiếu.
- **Cobalt Mist** (`--raw-cobalt-soft`): Lớp chuyển sắc nền nhẹ nhàng ở đầu trang chủ.

### Secondary
- **Obsidian Navy** (`--raw-obsidian`): Khối nền tương phản sâu cho phần Đánh giá khách hàng, biểu ngữ CTA cuối trang, thanh điều hướng quản trị `/admin` và Footer.
- **Electric Cyan** (`--raw-cyan`): Điểm nhấn sáng dành riêng cho icon và con số ưu đãi nằm trên bề mặt tối Obsidian Navy.

### Neutral
- **Canvas White** (`--surface-canvas`): Nền chính của trang và bề mặt thẻ thông tin.
- **Bench Subtle** (`--surface-subtle`): Nền phân tách nhẹ giữa các phân đoạn nội dung liên tiếp và đầu trang con.
- **Bench Muted** (`--surface-muted`): Nền khung chờ ảnh và nhãn phụ trung tính.
- **Slate Ink** (`--text-primary`): Màu chữ tiêu đề và nội dung chính có độ tương phản cao.
- **Slate Muted** (`--text-secondary`): Màu chữ mô tả phụ đảm bảo chuẩn tương phản WCAG AA (`>= 4.5:1`) trên cả nền trắng và nền xám nhạt.
- **Slate Placeholder** (`--text-placeholder`): Màu chữ gợi ý trong ô nhập liệu đạt chuẩn đọc rõ.
- **Hairline Border** (`--border-default`): Đường viền mảnh `1px` định hình ranh giới thẻ, bảng giá và trường biểu mẫu.

### Semantic Status
- **Verified Emerald**: Biểu thị trạng thái mở cửa, hoàn tất đặt lịch và thời hạn bảo hành còn hiệu lực.
- **Pending Amber**: Biểu thị phiếu sửa chữa hoặc câu hỏi mới đang chờ kỹ thuật viên xác nhận.
- **Alert Rose**: Biểu thị thông báo lỗi nhập liệu trực tiếp và xác nhận thao tác xóa trong quản trị.

### Named Rules
**The Cobalt Signal Rule.** Titanium Cobalt chỉ dành cho phần tử tương tác được, con số giá niêm yết và mã phiếu sửa chữa; không tô tràn Cobalt lên các mảng nền lớn gây mỏi mắt.

**The Dark-Surface Shadow Rule.** Trên nền tối Obsidian Navy, nút bấm chỉ dùng bóng đổ đen tự nhiên (`rgba(0,0,0,0.25)`), tuyệt đối không phát quầng sáng màu xanh neon xung quanh nút.

**The Hardware Plate Exception (`/kiem-tra-may-tinh`).** Bàn phím cơ full-size ANSI 104 phím trong `KeyboardTester.tsx` (thuộc công cụ chẩn đoán `/kiem-tra-may-tinh`) là ngoại lệ có chủ đích sử dụng tấm nền than chì tối (dark charcoal mechanical plate) mô phỏng khung phím vật lý thực tế để tối ưu độ tương phản cho từng keycap và trạng thái phím đang nhấn/đã kiểm tra.

## Typography

**Display & Headline Font:** Outfit (với dự phòng `-apple-system, BlinkMacSystemFont, sans-serif`)
**Body Font:** IBM Plex Sans (hỗ trợ bộ ký tự tiếng Việt đầy đủ)
**Label/Mono Font:** JetBrains Mono (dành riêng cho dữ liệu định lượng và mã định danh)
**Print Invoice Font:** Be Vietnam Pro (tải riêng theo tuyến `/admin/in-hoa-don/[id]`, không nạp trên các trang công khai, nhằm đảm bảo dấu tiếng Việt sắc nét trên khổ in A4, A5 và giấy nhiệt K80)

**Character:** Sự kết hợp giữa nét hình học dứt khoát của `Outfit` ở cấp tiêu đề và cấu trúc chữ mở, rõ dấu tiếng Việt của `IBM Plex Sans` mang lại cảm giác vừa chuyên môn vừa gần gũi, dễ đọc nhanh trên điện thoại.

### Hierarchy
- **Display** (Bold `700`, `2.25rem–3.5rem`, line-height `1.12`): Tiêu đề chính Hero trang chủ, cân bằng dòng tự động (`text-wrap: balance`).
- **Headline** (Bold `700`, `1.875rem–2.25rem`, line-height `1.2`): Tiêu đề cấp trang (`h1` trang con) và tiêu đề phân khu (`h2`).
- **Title** (Bold `700`, `1.125rem–1.25rem`, line-height `1.35`): Tiêu đề thẻ dịch vụ, hạng mục thiết bị và hộp thoại quản trị.
- **Body** (Regular `400`, `1rem`, line-height `1.65`): Nội dung mô tả và bài viết kỹ thuật, giới hạn độ rộng dòng `65–72ch` để mắt không bị mỏi khi đọc dài.
- **Label** (SemiBold `600`, `0.875rem`, line-height `1.4`): Nhãn trường biểu mẫu, chữ trong nút bấm và thanh điều hướng.
- **Mono Data** (Bold `700`, `0.875rem–1.5rem`, `font-variant-numeric: tabular-nums`): Mã phiếu `MQ-2026-XXXX`, số Hotline, đơn giá VNĐ và số lượng slot tiếp nhận.

### Named Rules
**The Self-Sufficient Heading Rule.** Mọi tiêu đề `h1` và `h2` phải tự đứng vững bằng ý nghĩa của chính nó; không đặt nhãn phụ chữ hoa trang trí (kicker/eyebrow) phía trên tiêu đề, và dùng đường dẫn Breadcrumb thực thụ ở đầu các trang con.

**The Monospace Discipline Rule.** Chỉ sử dụng `JetBrains Mono` cho mã phiếu, số điện thoại, thời량/con số đo đạc và đơn giá; không dùng chữ đơn cách để trang trí câu văn thông thường.

## Layout

Hệ thống sử dụng khung chứa trung tâm rộng tối đa `1280px` (`max-w-7xl`) với lề ngang thích ứng (`16px` trên di động, `24px` trên máy tính bảng, `32px` trên máy tính bàn). Các trang đọc chuyên sâu như Chi tiết bài viết và Tra cứu bảo hành thu hẹp khung chứa về `896px` (`max-w-4xl`) và văn bản bài đọc về `68ch`.

- **Nhịp khoảng cách dọc**: Các phân khu chính cách nhau `64px` trên di động và `96px` trên màn hình lớn, xen kẽ nhẹ nhàng giữa nền trắng (`--surface-canvas`) và nền xám phòng Lab (`--surface-subtle`).
- **Thích ứng di động**: Chuyển về lưới 1 cột dưới `768px`, bảng giá rộng đặt trong khung cuộn ngang độc lập, và thanh liên hệ nhanh chuyển thành thanh neo cố định dưới đáy màn hình có bù vùng an toàn `env(safe-area-inset-bottom)`.

## Elevation & Depth

Hệ thống kết hợp viền mảnh cấu trúc `1px` với bóng đổ khuếch tán nhẹ mang sắc tối tự nhiên của Obsidian Navy thay vì xám thuần. Ở trạng thái nghỉ, thẻ nằm êm trên bề mặt; khi di chuột trên thiết bị có con trỏ, thẻ nâng nhẹ `-4px` kèm bóng đổ sâu hơn.

### Shadow Vocabulary
- **Resting Card** (`0 4px 20px -4px rgba(11, 17, 32, 0.06)`): Độ nổi mặc định cho thẻ dịch vụ, khung biểu mẫu và bảng giá.
- **Interactive Hover** (`0 20px 40px -12px rgba(11, 17, 32, 0.14)`): Phản hồi nâng thẻ khi di chuột vào thẻ liên kết dịch vụ hoặc bài viết.
- **Primary CTA Lift** (`0 10px 24px -6px rgba(37, 99, 235, 0.32)`): Độ sâu dưới nút hành động chính đặt trên nền sáng.

### Named Rules
**The Structural Border First Rule.** Mọi thẻ trên nền sáng luôn có viền mảnh `1px solid var(--border-default)` để giữ ranh giới sắc nét ngay cả trên màn hình độ tương phản thấp; bóng đổ chỉ đóng vai trò bổ trợ chiều sâu.

## Shapes

Ngôn ngữ hình khối phân biệt rõ ràng giữa **hành động** và **vật chứa nội dung**:
- **Dạng viên thuốc tròn (`9999px`)**: Dành cho tất cả các nút hành động chính/phụ, chip lọc danh mục và huy hiệu trạng thái để tạo cảm giác thân thiện, dễ chạm.
- **Bo góc vừa (`12px`)**: Dành cho toàn bộ ô nhập liệu (`input`, `select`, `textarea`), nút chọn thiết bị và khung chứa icon `44x44px`.
- **Bo góc lớn (`16px`)**: Dành cho thẻ dịch vụ, khung biểu mẫu từng bước, hộp thoại Radix Dialog và khối banner cuối trang.

## Components

### Buttons
Nút bấm chắc chắn, vùng chạm tối thiểu `44px–48px`, phản hồi nhấn xúc giác thu nhẹ `scale(0.985)`.
- **Shape:** Viên thuốc (`9999px`) cho CTA điều hướng và gửi biểu mẫu; bo góc (`12px`) cho nút lựa chọn trong biểu mẫu.
- **Primary:** Nền Titanium Cobalt, chữ trắng SemiBold, nâng nhẹ khi hover sang Deep Cobalt.
- **Secondary:** Nền trắng, viền `2px` Obsidian Navy (ở Hero) hoặc `1px` Hairline Border (ở tác vụ phụ), đổi sang nền tối chữ trắng khi hover.
- **Hover / Focus:** Hiển thị vòng `:focus-visible` `2px` Titanium Cobalt tách biệt `2px` khi điều hướng bằng bàn phím.

### Chips
Dùng để lọc danh mục Dịch vụ, chuyển Tab Bảng giá và lọc chuyên mục Bài viết.
- **Style:** Cao tối thiểu `44px`, bo tròn `9999px`, viền `1px` khi chưa chọn.
- **State:** Trạng thái đang chọn (`aria-pressed="true"` hoặc `data-state="active"`) chuyển sang nền Titanium Cobalt chữ trắng đồng nhất.

### Cards / Containers
Khung chứa thông tin dịch vụ, cam kết nghề nghiệp và thiết bị phòng Lab.
- **Corner Style:** Bo góc `16px` (`rounded-2xl`).
- **Background:** Canvas White trên nền xám nhạt, hoặc ngược lại để phân tách rõ lớp.
- **Bố cục Icon & Tiêu đề:** Icon đặt ngang hàng (`side-by-side`) cạnh khối tiêu đề và mô tả, không xếp chồng hộp icon lẻ loi phía trên tiêu đề.
- **Internal Padding:** `24px` tiêu chuẩn, mở rộng `32px` cho biểu mẫu chính.

### Inputs / Fields
Trường nhập liệu ưu tiên tốc độ điền thông tin trên điện thoại mà không gây phóng to khung nhìn iOS.
- **Style:** Cao tối thiểu `48px`, bo góc `12px`, cỡ chữ `16px` trên mobile (`14px` từ tablet trở lên), viền `1px` Hairline Border.
- **Focus:** Giữ nguyên vòng outline `2px` Titanium Cobalt kết hợp quầng sáng mảnh `4px` (`rgba(37, 99, 235, 0.28)`), không bao giờ ẩn mất tín hiệu focus bàn phím.
- **Error / Disabled:** Đổi viền sang Alert Rose kèm dòng giải thích lỗi cụ thể gắn `role="alert"` và `aria-describedby` ngay dưới trường.

### Navigation
Thanh điều hướng dính (`sticky top-0`) nền trắng mờ nhẹ `backdrop-blur-md`, hiển thị Logo hình học `MQ` bên trái, các mục định tuyến chính ở giữa (với `aria-current="page"`), nút Hotline + Đặt lịch bên phải. Trên màn hình nhỏ chuyển thành ngăn kéo điều hướng đóng mở bằng nút `44x44px` hỗ trợ phím `Escape`, đi kèm thanh liên hệ nhanh 4 nút cố định dưới đáy màn hình.

### Electronic Ticket Lookup Card
Thành phần đặc trưng của MQTech BMT trên trang `/tra-cuu`: hiển thị mã phiếu `MQ-YYYY-XXXX` bằng chữ đơn cách nổi bật, huy hiệu trạng thái quy trình sửa chữa 6 cấp độ, thông tin thiết bị, chi phí dự kiến, hạn bảo hành điện tử và ghi chú trực tiếp từ kỹ thuật viên.

## Do's and Don'ts

### Do:
- **Do** giữ cỡ chữ tối thiểu `16px` trên màn hình di động cho mọi `<input>`, `<select>`, `<textarea>` để ngăn trình duyệt iOS Safari tự động phóng to làm lệch bố cục.
- **Do** dùng component `ResponsiveImage` có `srcSet`, `sizes`, `width` và `height` tường minh cho mọi hình ảnh dịch vụ và bài viết để đạt `CLS = 0`.
- **Do** hiển thị vòng `:focus-visible` `2px` rõ nét trên tất cả phần tử tương tác và ô biểu mẫu, đồng thời bổ sung khoảng đệm `env(safe-area-inset-bottom)` cho thanh tác vụ đáy di động.
- **Do** dùng `Breadcrumb` điều hướng thực tế ở đầu trang con thay cho nhãn trang trí.

### Don't:
- **Don't** đặt dòng chữ phụ in hoa (kicker / eyebrow chip) nằm riêng phía trên thẻ `h1` hoặc `h2`.
- **Don't** xếp chồng hộp icon vuông nhỏ phía trên tiêu đề thẻ theo khuôn mẫu lặp lại (`icon-tile-stack`); hãy đặt icon ngang hàng với nội dung.
- **Don't** dùng hiệu ứng nhấp nháy vô hạn (`animate-pulse`, `animate-ping`) trên các chấm trạng thái tĩnh hoặc tạo bóng phát sáng màu trên nền tối `bg-navy`.
- **Don't** dùng hộp thoại `window.confirm()` / `window.alert()` mặc định của trình duyệt; luôn sử dụng `ModalDialog` và `ConfirmDialog` chuẩn Radix.
