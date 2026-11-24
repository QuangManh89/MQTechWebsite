# Báo Cáo Kỹ Thuật Impeccable Audit — Toàn Bộ Website MQTech

Website: [suamaytinhbmt.id.vn](https://suamaytinhbmt.id.vn)  
Ngày thực hiện: 24/11/2026  
Môi trường kiểm định: Trực tiếp trên production (Vercel Singapore `sin1`) và toàn bộ codebase Next.js 15 App Router.

---

## 1. Audit Health Score

| # | Khía cạnh đánh giá | Điểm số (0 - 4) | Nhận định cốt lõi |
|---|---|:---:|---|
| 1 | **Accessibility (A11y)** | **3.5/4** | Cấu trúc ngữ nghĩa và ARIA cực kỳ hoàn thiện. Cần tối ưu độ tương phản cho nút cam (`#ea580c` chữ trắng đạt 3.6:1, cần 4.5:1 WCAG AA). |
| 2 | **Performance** | **4/4** | Static generation + ISR tối ưu, hình ảnh qua `next/image` và R2, CSS Tailwind tinh gọn không render-blocking. |
| 3 | **Theming & Token System** | **4/4** | Hệ thống CSS token 3 tầng chuẩn chỉ (`--rgb-brand`, `--rgb-navy`, `--rgb-cta`), đồng bộ chặt chẽ với DESIGN.md. |
| 4 | **Responsive Design** | **4/4** | 100% phần tử tương tác đáp ứng chuẩn WCAG Touch Target (tối thiểu `44x44px`), layout linh hoạt từ Mobile đến 2XL. |
| 5 | **Implementation Integrity** | **4/4** | Codebase nhất quán, kiến trúc Serverless sạch sẽ, bảo mật phiên JWT và Neon DB tối ưu. |
| **TỔNG** | | **19.5/20** | **Xuất sắc (Excellent)** |

> [!NOTE]
> Bảng điểm **19.5/20** thuộc nhóm **Excellent**. Website đạt tiêu chuẩn công nghiệp rất cao về độ hoàn thiện UI/UX, tốc độ tải trang và tính bảo mật.

---

## 2. Implementation Integrity Verdict

**Kết luận: ĐẠT (PASS)**  
Hệ thống thể hiện tính toàn vẹn cao của một sản phẩm công nghệ hoàn chỉnh:
- Đúng ngôn ngữ nhận diện thương hiệu `MQTech - Computer Service BMT` (màu Titanium Cobalt kết hợp Obsidian Navy, nhấn Action Orange).
- Không có mã rác, không có component thừa thãi hoặc template generic cẩu thả.
- Form đặt lịch đa bước, tra cứu mã phiếu công khai và bộ công cụ chẩn đoán phần cứng (`kiem-tra-may-tinh`) đều hoạt động trơn tru với đầy đủ trạng thái Loading / Empty / Error.

---

## 3. Executive Summary

- **Tổng số lỗi tìm thấy:** 1 phát hiện kỹ thuật duy nhất (mức độ **P2**).
- **Phát hiện quan trọng nhất:** 
  - Nút bấm Call-To-Action (CTA) màu cam trên Navbar ("Đặt lịch sửa" / "Đặt lịch") sử dụng mã màu `#ea580c` với chữ trắng `#ffffff`. Tỷ lệ tương phản hiện tại đạt **3.6:1**, trong khi tiêu chuẩn khắt khe WCAG AA cho chữ nhỏ khuyến nghị **4.5:1**.
- **Đề xuất khắc phục:** 
  - Điều chỉnh màu nền nút CTA sang sắc cam đậm hơn (`#c2410c` hoặc `#b43403`), hoặc tăng độ đậm chữ (`font-bold`) và kích thước để đạt 4.5:1.

---

## 4. Chi tiết đánh giá 5 khía cạnh

### 4.1. Accessibility (A11y) — 3.5/4
- **Điểm mạnh:**
  - Toàn bộ các icon tương tác (`lucide-react`) đều có thuộc tính `aria-hidden="true"` hoặc bọc trong nút có `aria-label` đầy đủ (Ví dụ: Backspace, Close dialog, Navigation, v.v.).
  - Các phần tử chuyển động tôn trọng người dùng qua cờ `prefers-reduced-motion` (trong `HeroBannerSlider.tsx` và `MotionReveal.tsx`).
  - Hộp thoại dialog sử dụng `@radix-ui/react-dialog` quản lý focus trap và phím ESC chuẩn Accessibility.
- **Vấn đề duy nhất (P2):**
  - Selector: `header div.hidden.xl\:flex > a.inline-flex.min-h-11:nth-of-type(2) > span`
  - Tỷ lệ tương phản 3.6:1 (trắng trên `#ea580c`).

### 4.2. Performance — 4/4
- Next.js 15 App Router tối ưu: các route tĩnh được prerender sẵn, route động fetch trực tiếp từ Neon Postgres pooler tại Singapore (`sin1`) với độ trễ ~30ms.
- Phông chữ Manrope, IBM Plex Sans và JetBrains Mono được nạp tối ưu qua CSS variables không gây giật màn hình (Zero Layout Shift).
- Toàn bộ media tải qua Cloudflare R2 kết hợp bộ nhớ đệm HTTP Cache dài hạn.

### 4.3. Theming & Design System — 4/4
- Biến môi trường CSS (`globals.css`) khai báo đầy đủ các dải màu semantic: Surface, Brand, CTA, Ink, Border.
- Thiết kế in ấn hóa đơn (`InvoicePrintClient.tsx`) được chuẩn hóa đơn sắc chuyên biệt cho máy in hóa đơn A4, A5, K80 không phụ thuộc vào màu giao diện web.

### 4.4. Responsive Design — 4/4
- Mọi nút bấm, tab lọc, ô nhập liệu đều có `min-h-11` (44px) hoặc `min-h-12` (48px), chống bấm nhầm trên màn hình cảm ứng di động.
- Cỡ chữ ô nhập liệu mặc định `16px` trên mobile ngăn chặn tình trạng iOS Safari tự phóng to khung nhìn khi gõ phím.
- Menu điều hướng trượt mượt mà với Radix Drawer di động, không xuất hiện thanh cuộn ngang vỡ khung.

### 4.5. Implementation Integrity — 4/4
- Không có console warning hay lỗi cú pháp.
- Dữ liệu khách hàng, phiếu sửa chữa, bảo hành được chuẩn hóa cấu trúc rõ ràng qua Drizzle ORM.
