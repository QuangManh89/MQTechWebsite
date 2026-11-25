# AI-SEO Playbook & 12-Prompt Visibility Portfolio — MQTech BMT

> **Website:** `https://suamaytinhbmt.id.vn`  
> **Thương hiệu:** MQTech - Computer Service BMT  
> **Khu vực phục vụ:** TP. Buôn Ma Thuột & lân cận, tỉnh Đắk Lắk (Trụ sở: Đường Võ Thị Sáu, P. Tân Lập)  
> **Hotline / Zalo:** `0987 482 573` | **Giờ làm việc:** `07:30 - 20:00 (Thứ 2 - Chủ Nhật)`  
> **Tệp dữ liệu cho AI Agent:** [`/llms.txt`](https://suamaytinhbmt.id.vn/llms.txt) | **Sitemap:** [`/sitemap.xml`](https://suamaytinhbmt.id.vn/sitemap.xml)

---

## Phần 1: Hướng dẫn Submit Index để AI Search trích dẫn (5 phút làm một lần)

Các công cụ tìm kiếm AI không chỉ dựa vào Google. Hiện tại:
- **ChatGPT Search & Microsoft Copilot** lấy chỉ mục chính từ **Bing Search**.
- **Claude & một số AI Agent** tham chiếu chỉ mục từ **Brave Search** và **Bing**.
- **Google AI Overviews & Gemini** lấy từ **Google Search Console (GSC)** — *đã hoàn thành submit `/sitemap.xml` (36 URLs)*.

### 1.1. Submit lên Bing Webmaster Tools (Cho ChatGPT Search & Copilot)

1. Truy cập: [https://www.bing.com/webmasters](https://www.bing.com/webmasters) và đăng nhập bằng tài khoản Microsoft (hoặc Google).
2. Chọn **"Import your sites from Google Search Console"** *(khuyên dùng — đồng bộ xác minh quyền sở hữu và sitemap chỉ trong 1 click, không cần thêm DNS/Meta tag)*.
3. Chọn tài sản `https://suamaytinhbmt.id.vn` từ danh sách GSC và bấm **Import**.
4. Vào mục **Sitemaps** ở menu trái → kiểm tra hoặc bấm **Submit sitemap** với URL:
   ```text
   https://suamaytinhbmt.id.vn/sitemap.xml
   ```
5. Vào mục **URL Submission** → dán 5 trang đích quan trọng nhất để ưu tiên crawl nhanh:
   - `https://suamaytinhbmt.id.vn/`
   - `https://suamaytinhbmt.id.vn/bang-gia`
   - `https://suamaytinhbmt.id.vn/dich-vu/sua-may-tinh-tai-nha-bmt`
   - `https://suamaytinhbmt.id.vn/dich-vu/cai-win-10-11-phan-mem-tai-nha-bmt`
   - `https://suamaytinhbmt.id.vn/llms.txt`

### 1.2. Submit lên Brave Search (Cho Claude & công cụ tìm kiếm độc lập)

1. Truy cập: [https://search.brave.com/submit-url](https://search.brave.com/submit-url) (hoặc kiểm tra tình trạng index bằng tìm kiếm `site:suamaytinhbmt.id.vn` trên `search.brave.com`).
2. Gửi URL trang chủ `https://suamaytinhbmt.id.vn` và các trang dịch vụ chính để Bravebot thu thập dữ liệu.

### 1.3. Kiểm tra tín hiệu AI-Ready định kỳ

- Mở `https://suamaytinhbmt.id.vn/llms.txt`: xác nhận trả về `HTTP 200` (`text/markdown`), đủ dịch vụ, bảng giá, địa chỉ, hotline và danh sách bài viết mới nhất.
- Mở `https://suamaytinhbmt.id.vn/robots.txt`: xác nhận không chặn `OAI-SearchBot`, `GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`.

---

## Phần 2: Bộ 12 Prompt theo dõi mức độ hiện diện AI (AI Visibility Portfolio)

> **Tần suất kiểm tra:** 1 lần / tháng (vào ngày mùng 1 hoặc đầu tuần đầu tháng).  
> **Công cụ test:** ChatGPT (bật Web Search), Google AI Overview / Gemini, Perplexity.  
> **Thang chấm điểm mỗi Prompt:**
> - `2 điểm` — **Trích dẫn Top 1 / Khuyên dùng trực tiếp** kèm tên `MQTech` và link `suamaytinhbmt.id.vn` hoặc hotline `0987 482 573`.
> - `1 điểm` — **Có nhắc tên hoặc link** nhưng đứng sau đối thủ, hoặc thiếu thông tin giá/địa chỉ/giờ làm việc chính xác.
> - `0 điểm` — **Chưa xuất hiện** (ghi lại tên 2–3 đối thủ đang được AI trích dẫn để tối ưu trang đích).

### Kết quả Baseline đợt đo đầu tiên

| Hạng mục đo nhanh (Web/AI Search Baseline) | Trạng thái hiện tại | Ghi chú & Đối thủ xuất hiện |
| :--- | :--- | :--- |
| Truy vấn thương hiệu `"suamaytinhbmt.id.vn" OR "MQTech" sửa máy tính Buôn Ma Thuột` | **Đạt Top 1 (2/2)** | Trích dẫn chính xác dịch vụ, địa chỉ P. Tân Lập, hotline `0987 482 573`. Lưu ý: snippet cũ trên Google vẫn lưu giờ cũ `08:00 - 19:00` → Đợt 1 & Đợt 3 đã cập nhật Schema `07:30 - 20:00 (Thứ 2 - Chủ Nhật)` + Direct Answer Block để AI làm mới. |
| Truy vấn địa phương `sửa máy tính tại nhà phường Tân Lập Buôn Ma Thuột uy tín` | **Đạt Top 1 (2/2)** | `MQTech - Sửa Máy Tính Tại Nhà BMT` (`suamaytinhbmt.id.vn`) đứng đầu bảng. Đối thủ cạnh tranh xuất hiện phía dưới: `dhctaynguyen.com` (DH Computer), `maytinhbandaklak.com`, `phamduypc.com`, `top10bmt.com`. |

---

### Danh sách 12 Prompt theo 4 giai đoạn nhận thức khách hàng

#### Nhóm A — Tìm kiếm dịch vụ địa phương (High-Intent Local BMT)

| # | Prompt kiểm tra (Copy dán thẳng vào ChatGPT / Gemini / Perplexity) | Trang đích MQTech cần lên | Đối thủ cần theo dõi | Điểm tháng này |
| :---: | :--- | :--- | :--- | :---: |
| **1** | `Sửa máy tính tại nhà Buôn Ma Thuột chỗ nào uy tín, làm cả Chủ Nhật?` | `/dich-vu/sua-may-tinh-tai-nha-bmt` | DH Computer, Máy Tính Bàn Đắk Lắk | `__/2` |
| **2** | `Gợi ý tiệm sửa laptop tại nhà phường Tân Lập, Buôn Ma Thuột có báo giá trước.` | `/dich-vu/sua-may-tinh-tai-nha-bmt` | `dhctaynguyen.com`, `phamduypc.com` | `__/2` |
| **3** | `Cài Win 10, Win 11 và phần mềm văn phòng tại nhà ở BMT giá bao nhiêu, có mất dữ liệu không?` | `/dich-vu/cai-win-10-11-phan-mem-tai-nha-bmt` | Các tiệm cài Win BMT, Top10BMT | `__/2` |

#### Nhóm B — Nhận thức giải pháp & Báo giá (Solution & Price-Aware)

| # | Prompt kiểm tra | Trang đích MQTech cần lên | Đối thủ cần theo dõi | Điểm tháng này |
| :---: | :--- | :--- | :--- | :---: |
| **4** | `Vệ sinh laptop tra keo tản nhiệt ở Buôn Ma Thuột giá bao nhiêu và mất bao lâu?` | `/dich-vu/ve-sinh-tra-keo-tan-nhiet` | Tiệm sửa laptop đường Lê Duẩn, Y Jút | `__/2` |
| **5** | `Nâng cấp SSD NVMe và RAM laptop tại Buôn Ma Thuột ở đâu lắp lấy liền, bảo hành chính hãng?` | `/dich-vu/nang-cap-ram-ssd-linh-kien` | Các shop linh kiện PC Đắk Lắk | `__/2` |
| **6** | `Bảng giá sửa máy tính, thay pin và thay màn hình laptop tại Buôn Ma Thuột hiện nay bao nhiêu?` | `/bang-gia` | `maytinhbandaklak.com`, `dhctaynguyen.com` | `__/2` |

#### Nhóm C — Nhận thức vấn đề kỹ thuật (Problem-Aware / Blog Spoke)

| # | Prompt kiểm tra | Trang đích MQTech cần lên | Đối thủ cần theo dõi | Điểm tháng này |
| :---: | :--- | :--- | :--- | :---: |
| **7** | `Laptop bật nguồn sáng đèn nhưng màn hình đen không lên hình nguyên nhân do đâu, sửa ở BMT hết bao nhiêu?` | `/bai-viet/...` + `/dich-vu/sua-laptop-windows` | Tin học lớn toàn quốc + tiệm BMT | `__/2` |
| **8** | `Cách sửa lỗi không kết nối được máy in qua mạng LAN 0x0000011b và 0x00000709 trên Windows 11.` | `/bai-viet/...` + `/dich-vu/bao-tri-it-cong-ty-phong-may` | Blog công nghệ chung | `__/2` |
| **9** | `Laptop chạy chậm 100% disk trên Windows 10 có cần nâng cấp SSD không hay cài lại Win?` | `/dich-vu/nang-cap-ram-ssd-linh-kien` | Blog thủ thuật máy tính | `__/2` |

#### Nhóm D — Thương hiệu, Bảo trì Doanh nghiệp & So sánh (Brand & B2B)

| # | Prompt kiểm tra | Trang đích MQTech cần lên | Đối thủ cần theo dõi | Điểm tháng này |
| :---: | :--- | :--- | :--- | :---: |
| **10** | `MQTech Buôn Ma Thuột (suamaytinhbmt.id.vn) có những dịch vụ gì, giờ làm việc và số điện thoại bao nhiêu?` | `/` + `/llms.txt` | Kiểm tra độ chính xác thông tin | `__/2` |
| **11** | `Đơn vị bảo trì IT, sửa máy tính và chia sẻ máy in cho văn phòng công ty tại Buôn Ma Thuột.` | `/dich-vu/bao-tri-it-cong-ty-phong-may` | Dịch vụ IT Đắk Lắk | `__/2` |
| **12** | `Sửa MacBook bị nóng, chai pin hoặc nâng cấp phần mềm ở Buôn Ma Thuột chỗ nào nhận kiểm tra miễn phí?` | `/dich-vu/sua-macbook-chuyen-nghiep` | Tiệm sửa Apple / MacBook BMT | `__/2` |

---

## Phần 3: Quy trình hành động khi có Prompt đạt 0 hoặc 1 điểm

1. **Nếu thông tin MQTech bị cũ hoặc thiếu (đạt 1 điểm):**
   - Kiểm tra lại phần **Direct Answer Block** trên trang dịch vụ tương ứng xem đã ghi rõ giá tham khảo, thời gian xử lý, giờ làm việc và khu vực BMT chưa.
   - Kiểm tra lại `https://suamaytinhbmt.id.vn/llms.txt` xem dữ liệu DB đã cập nhật đồng bộ chưa.
2. **Nếu chưa xuất hiện trên AI (đạt 0 điểm):**
   - Xem URL của đối thủ mà AI trích dẫn có đoạn trả lời trực tiếp / bảng giá / câu hỏi FAQ nào mà trang của mình chưa có.
   - Bổ sung 1 câu hỏi FAQ đúng chủ đề vào trang dịch vụ hoặc viết 1 bài Spoke trong mục **Bài viết** kèm liên kết nội bộ trỏ về trang dịch vụ tương ứng.
   - Submit lại URL vừa cập nhật trong Google Search Console và Bing Webmaster Tools.
