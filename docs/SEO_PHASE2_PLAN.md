# Kế Hoạch Triển Khai SEO Giai Đoạn 2 — 8 Bài Viết Chuyên Sâu (Phần Cứng + Phần Mềm Văn Phòng)

## 1. Mục tiêu (Goal Description)
Triển khai **8 bài viết SEO mới** được chọn lọc từ dữ liệu **deep search các lỗi máy tính & phần mềm văn phòng được tìm kiếm nhiều nhất tại Việt Nam (2025–2026)**:
- **4 bài Lỗi Phần cứng & Hệ thống:** Phủ các dịch vụ biên lợi nhuận cao đang trống bài vệ tinh (`Sửa Laptop`, `Sửa PC & Build Máy Bộ`, `Sửa Máy Tính Tại Nhà BMT`).
- **4 bài Thủ thuật, Cài đặt & Sửa lỗi Phần mềm Văn phòng** (thuộc chuyên mục mới **`Thủ Thuật Văn Phòng`**): Đánh thẳng vào nhóm khách hàng văn phòng, kế toán, sinh viên — nguồn traffic tìm kiếm khổng lồ quanh năm và chuyển đổi trực tiếp sang dịch vụ `Cài Win/Phần mềm tại nhà` & `Bảo trì IT Công ty/Văn phòng BMT`.
- **Trạng thái:** Xuất bản ngay (`isPublished: true`) trên Neon PostgreSQL với ảnh bìa Unsplash/Pexels đã kiểm tra HTTP 200 (chủ tiệm có thể đổi sang ảnh chụp thật bất cứ lúc nào trên `/admin/bai-viet`).

---

## 2. Bản thiết kế chi tiết 8 bài viết (Content Blueprint)

### Nhóm A — 4 Bài Lỗi Phần Cứng & Hệ Thống (Luồng 1)

| STT | Slug & Tiêu đề đề xuất | Chuyên mục | Từ khóa chính (Deep Search) | Bảng Markdown & Điểm nhấn kỹ thuật | Hub đích (Internal Links) |
|---:|---|---|---|---|---|
| 1 | `laptop-khong-len-nguon-man-hinh-den-con-tro-chuot-bmt`<br>**Laptop Không Lên Nguồn Hoặc Màn Hình Đen Có Con Trỏ Chuột: 6 Cách Sửa Nhanh Win 10/11** | `Bảo Dưỡng Phần Cứng` | `laptop không lên nguồn`, `màn hình đen có con trỏ chuột win 11` | Bảng phân biệt lỗi phần mềm (`explorer.exe`, GPU `Win+Ctrl+Shift+B`, `Winlogon`) vs lỗi phần cứng (IC nguồn, cáp màn hình, RAM) + bảng giá tham khảo BMT | `/dich-vu/sua-laptop-windows`, `/dich-vu/sua-may-tinh-tai-nha-bmt`, `/bai-viet/man-hinh-laptop-chop-soc-kien-lam-to-bmt`, `/dat-lich` |
| 2 | `pc-bat-quat-quay-man-hinh-no-signal-bmt`<br>**PC Bật Quạt Vẫn Quay Nhưng Màn Hình Báo No Signal: 7 Nguyên Nhân & Cách Tự Kiểm Tra Tại Nhà** | `Bảo Dưỡng Phần Cứng` | `pc bật quạt quay không lên màn hình`, `sửa pc no signal bmt` | Bảng chẩn đoán theo tín hiệu đèn Debug LED / tiếng Bíp (RAM, VGA, Nguồn PSU, Mainboard, Cáp HDMI/DP) | `/dich-vu/sua-pc-va-build-may-bo`, `/dich-vu/sua-may-tinh-tai-nha-bmt`, `/bang-gia`, `/dat-lich` |
| 3 | `sua-loi-laptop-khong-bat-duoc-wifi-cham-than-vang`<br>**Laptop Không Bắt Được WiFi, Bị Chấm Than Vàng Win 10 & 11: 7 Cách Khắc Phục Hiệu Quả 100%** | `Thủ Thuật Windows` | `laptop không bắt được wifi`, `lỗi chấm than vàng wifi win 11` | Bảng lệnh Network Reset (`netsh winsock reset`, `ipconfig /flushdns`), kiểm tra Driver/Card WiFi Intel/Realtek, DNS Cloudflare `1.1.1.1` | `/dich-vu/sua-may-tinh-tai-nha-bmt`, `/dich-vu/bao-tri-it-cong-ty-phong-may`, `/bai-viet/may-loi-sau-cap-nhat-windows-cai-win-tai-nha-tan-lap`, `/dat-lich` |
| 4 | `laptop-sac-khong-vao-pin-thay-pin-laptop-bmt`<br>**Laptop Sạc Không Vào Pin (Plugged In, Not Charging): Cách Kiểm Tra Độ Chai & Bảng Giá Thay Pin BMT** | `Bảo Dưỡng Phần Cứng` | `laptop sạc không vào pin`, `thay pin laptop buôn ma thuột` | Bảng kiểm tra độ chai pin bằng lệnh `powercfg /batteryreport`, phân biệt hỏng Sạc vs hỏng Pin vs lỗi Driver ACPI + bảng giá thay pin tham khảo | `/dich-vu/sua-laptop-windows`, `/bai-viet/bi-quyet-bao-ve-pin-macbook-ben-lau`, `/bang-gia`, `/dat-lich` |

---

### Nhóm B — 4 Bài Thủ Thuật, Cài Đặt & Sửa Lỗi Phần Mềm Văn Phòng (Luồng 2)

| STT | Slug & Tiêu đề đề xuất | Chuyên mục | Từ khóa chính (Deep Search) | Bảng Markdown & Điểm nhấn kỹ thuật | Hub đích (Internal Links) |
|---:|---|---|---|---|---|
| 5 | `sua-loi-unikey-khong-go-duoc-tieng-viet-loi-font-word-excel`<br>**Sửa Lỗi Unikey Không Gõ Được Tiếng Việt, Bị Lặp Chữ & Lỗi Font (VNI/TCVN3) Trong Word, Excel** | `Thủ Thuật Văn Phòng` | `unikey không gõ được tiếng việt`, `lỗi font chữ word excel` | Bảng đối chiếu chuẩn **Font ↔ Bảng mã** (Unicode / TCVN3 `.VnTime` / VNI Windows), hướng dẫn chạy `Run as administrator`, `UniKey Toolkit (Ctrl+Shift+F6)` chuyển mã hàng loạt, tắt AutoCorrect | `/dich-vu/cai-win-10-11-phan-mem-tai-nha-bmt`, `/kiem-tra-may-tinh` (test bàn phím), `/bai-viet/dich-vu-cai-win-10-11-phan-mem-tai-nha-bmt`, `/dat-lich` |
| 6 | `sua-loi-word-excel-product-activation-failed-khong-go-duoc-chu`<br>**Sửa Lỗi Word, Excel Báo Product Activation Failed, Không Gõ Được Chữ & Tràn Trang Khi In** | `Thủ Thuật Văn Phòng` | `lỗi product activation failed word excel`, `word không gõ được chữ`, `in excel bị tràn trang` | Bảng tổng hợp 5 lỗi Office hay gặp nhất (Read-Only / Activation Failed, sai ngày giờ hệ thống, mất định dạng font khi gửi máy khác — `Embed fonts`, canh vừa 1 trang `Fit All Columns on One Page`) | `/dich-vu/cai-win-10-11-phan-mem-tai-nha-bmt`, `/bang-gia`, `/bai-viet/sua-loi-unikey-khong-go-duoc-tieng-viet-loi-font-word-excel`, `/dat-lich` |
| 7 | `sua-loi-chia-se-may-in-mang-lan-0x0000011b-0x00000709-win-11`<br>**Sửa Lỗi Không In Được, Kẹt Lệnh Print Spooler & Chia Sẻ Máy In LAN (0x0000011b, 0x00000709) Win 11** | `Thủ Thuật Văn Phòng` | `lỗi 0x0000011b win 11`, `lỗi 0x00000709 máy in`, `máy in không in được` | Bảng phân biệt lỗi **Máy chủ** (`RpcAuthnLevelPrivacyEnabled = 0`) vs **Máy trạm** (`RpcUseNamedPipeProtocol = 1`, tắt *Let Windows manage my default printer*), xóa bộ đệm `C:\Windows\System32\spool\PRINTERS`, mẹo **Local Port IP** chữa cháy tức thì | `/dich-vu/bao-tri-it-cong-ty-phong-may`, `/dich-vu/sua-may-tinh-tai-nha-bmt`, `/bang-gia`, `/dat-lich` |
| 8 | `huong-dan-cai-dat-tron-bo-phan-mem-van-phong-thiet-yeu-win-11`<br>**Hướng Dẫn Cài Đặt Trọn Bộ Phần Mềm Văn Phòng Thiết Yếu Sau Khi Cài Win / Mua Máy Mới (2026)** | `Thủ Thuật Văn Phòng` | `phần mềm cần thiết sau khi cài win`, `cài đặt phần mềm văn phòng` | Bảng checklist 10 phần mềm văn phòng & học tập chuẩn sạch (Office, Unikey/EVKey, Bộ Font Full VNI/TCVN3/UTM, Foxit PDF, WinRAR/7-Zip, Zalo PC, Chrome/Edge, Ultraviewer) + lưu ý tránh tải nhầm link quảng cáo/virus | `/dich-vu/cai-win-10-11-phan-mem-tai-nha-bmt`, `/dich-vu/nang-cap-ram-ssd-linh-kien`, `/bai-viet/dich-vu-cai-win-10-11-phan-mem-tai-nha-bmt`, `/dat-lich` |

---

## 3. Proposed Code Changes (Đồng bộ Hub ↔ Spoke cho chuyên mục mới)

### Service Detail Related Posts Matcher
#### [MODIFY] [page.tsx](file:///d:/1.Project/WWW/src/app/(public)/dich-vu/[slug]/page.tsx)
- Bổ sung từ khóa nhận diện chuyên mục **`thủ thuật văn phòng`**, **`máy in`**, **`unikey`**, **`word`**, **`excel`**, **`wifi`**, **`no-signal`**, **`pin`** vào hàm `getRelatedPostsForService`:
  - `bao-tri-it-cong-ty-phong-may`: ưu tiên mạnh bài *Chia sẻ máy in LAN 0x0000011b/0x00000709*, *Lỗi WiFi*, *Cài phần mềm văn phòng*.
  - `sua-pc-va-build-may-bo`: ưu tiên mạnh bài *PC bật quạt quay màn hình No Signal* mới tạo.
  - `cai-win-10-11-phan-mem-tai-nha-bmt`: ưu tiên mạnh bài *Trọn bộ phần mềm văn phòng*, *Sửa lỗi Word/Excel*, *Sửa lỗi Unikey*.

---

## 4. Quy chuẩn kỹ thuật & Kế hoạch Review Chéo

1. **Ràng buộc Markdown tương thích 100% với `ArticleBody.tsx`:**
   - Mọi tiêu đề `## ` / `### ` **bắt buộc** theo sau bởi 1 dòng trống (`\n\n`).
   - Mọi dòng dẫn nhập trước danh sách gạch đầu dòng `- ` **bắt buộc** ngăn cách bởi `\n\n`.
   - Mọi bảng Markdown kiểm tra đủ cột & dấu phân cách `|---|`.
   - Độ dài mỗi bài: **1.000 – 1.300 từ**, có **4 câu hỏi FAQ** cuối bài, **4–5 internal links** hợp lệ, `seoTitle` 50–65 ký tự, `seoDescription` 135–160 ký tự.
2. **Chia luồng & Review Chéo:**
   - **Luồng 1:** Soạn & xuất bản 4 bài Nhóm A (Phần cứng/Hệ thống) lên Neon DB.
   - **Luồng 2:** Soạn & xuất bản 4 bài Nhóm B (Thủ Thuật Văn Phòng) lên Neon DB + cập nhật `dich-vu/[slug]/page.tsx`.
   - **Review Chéo Độc Lập:** Kiểm tra tự động toàn bộ 19 bài trên Neon DB (11 bài cũ + 8 bài mới): 0 lỗi block Markdown, 100% link nội bộ hợp lệ, 100% ảnh bìa HTTP 200, kiểm tra `npm run build` sạch 0 lỗi.

---

## 5. Verification Plan

### Automated Verification
- Chạy script kiểm định toàn bộ 19 bài trên Neon DB (số từ, số heading, số internal link, kiểm tra broken link, kiểm tra block parser của `ArticleBody.tsx`, kiểm tra HTTP 200 của 8 ảnh bìa).
- Chạy `npm run build` kiểm tra biên dịch sạch sau khi cập nhật `dich-vu/[slug]/page.tsx`.
- Đồng bộ sang `d:\1.Project\MQTechWeb` và push lên GitHub (`master`) để Vercel tự deploy.

### Live Browser Verification
- Mở trực tiếp `https://www.suamaytinhbmt.id.vn/bai-viet` để xác nhận tab lọc **`Thủ Thuật Văn Phòng`** xuất hiện với 4 bài mới, kiểm tra hiển thị chi tiết 1 bài Văn phòng + 1 bài Phần cứng + trang `/dich-vu/bao-tri-it-cong-ty-phong-may` & `/dich-vu/sua-pc-va-build-may-bo`.
