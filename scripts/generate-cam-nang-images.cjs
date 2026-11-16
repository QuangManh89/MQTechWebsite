const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../public/cam-nang');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Helper to escape SVG xml text
function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

async function generateAssets() {
  console.log('--- Generating Cẩm Nang Graphic Assets ---');

  // 1. Cover: Liquid Spill Emergency
  const svgSpillCover = `
  <svg width="1200" height="675" viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0F172A" />
        <stop offset="50%" stop-color="#1E1B4B" />
        <stop offset="100%" stop-color="#090D16" />
      </linearGradient>
      <linearGradient id="glowRed" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#EF4444" />
        <stop offset="100%" stop-color="#F97316" />
      </linearGradient>
      <linearGradient id="cardGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#1E293B" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#0F172A" stop-opacity="0.95" />
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000" flood-opacity="0.5"/>
      </filter>
    </defs>

    <!-- Background -->
    <rect width="1200" height="675" fill="url(#bgGrad)"/>
    
    <!-- Tech grid lines -->
    <path d="M 0 135 H 1200 M 0 270 H 1200 M 0 405 H 1200 M 0 540 H 1200" stroke="#334155" stroke-width="0.8" stroke-opacity="0.3"/>
    <path d="M 240 0 V 675 M 480 0 V 675 M 720 0 V 675 M 960 0 V 675" stroke="#334155" stroke-width="0.8" stroke-opacity="0.3"/>

    <!-- Ambient glow circle -->
    <circle cx="950" cy="337" r="280" fill="#EF4444" opacity="0.12" filter="blur(60px)"/>
    <circle cx="150" cy="150" r="180" fill="#3B82F6" opacity="0.08" filter="blur(40px)"/>

    <!-- Category Pill -->
    <rect x="70" y="70" width="220" height="38" rx="19" fill="#EF4444" fill-opacity="0.15" stroke="#EF4444" stroke-opacity="0.5" stroke-width="1.5"/>
    <circle cx="92" cy="89" r="5" fill="#EF4444"/>
    <text x="108" y="94" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#FCA5A5" letter-spacing="1">CẤP CỨU PHẦN CỨNG</text>

    <!-- Emergency Badge -->
    <rect x="306" y="70" width="210" height="38" rx="19" fill="#1E293B" stroke="#475569" stroke-width="1"/>
    <text x="326" y="94" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#94A3B8">⏱ 10 PHÚT VÀNG SƠ CỨU</text>

    <!-- Title & Headline -->
    <text x="70" y="175" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">
      Laptop Đổ Nước &amp; Cà Phê:
    </text>
    <text x="70" y="235" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="800" fill="url(#glowRed)" letter-spacing="-0.5">
      Quy Trình Sơ Cứu Chuẩn Kỹ Thuật
    </text>

    <text x="70" y="295" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="400" fill="#CBD5E1" width="550">
      Bảo vệ 100% dữ liệu và hạn chế chạm chập bo mạch chủ (Mainboard).
    </text>
    <text x="70" y="325" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">
      Hướng dẫn từ chuyên viên sửa chữa laptop MQTech Buôn Ma Thuột.
    </text>

    <!-- 3 Core Rule Cards -->
    <g transform="translate(70, 385)">
      <!-- Card 1 -->
      <g>
        <rect width="180" height="180" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5" filter="url(#shadow)"/>
        <circle cx="45" cy="45" r="22" fill="#EF4444" fill-opacity="0.15"/>
        <text x="45" y="52" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="800" fill="#EF4444" text-anchor="middle">01</text>
        <text x="25" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" fill="#FFFFFF">NGẮT ĐIỆN NGAY</text>
        <text x="25" y="132" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#94A3B8">Giữ nút nguồn 7 giây</text>
        <text x="25" y="150" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#94A3B8">Rút ngay adapter sạc</text>
      </g>
      <!-- Card 2 -->
      <g transform="translate(200, 0)">
        <rect width="180" height="180" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5" filter="url(#shadow)"/>
        <circle cx="45" cy="45" r="22" fill="#3B82F6" fill-opacity="0.15"/>
        <text x="45" y="52" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="800" fill="#60A5FA" text-anchor="middle">02</text>
        <text x="25" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" fill="#FFFFFF">ÚP CHỮ V NGƯỢC</text>
        <text x="25" y="132" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#94A3B8">Đặt bàn phím chúc xuống</text>
        <text x="25" y="150" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#94A3B8">Ngăn nước vào CPU/GPU</text>
      </g>
      <!-- Card 3 -->
      <g transform="translate(400, 0)">
        <rect width="180" height="180" rx="16" fill="url(#cardGrad)" stroke="#334155" stroke-width="1.5" filter="url(#shadow)"/>
        <circle cx="45" cy="45" r="22" fill="#F59E0B" fill-opacity="0.15"/>
        <text x="45" y="52" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="800" fill="#FBBF24" text-anchor="middle">03</text>
        <text x="25" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" fill="#FFFFFF">KHÔNG CẮM BẬT</text>
        <text x="25" y="132" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#94A3B8">Tuyệt đối không sấy nóng</text>
        <text x="25" y="150" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#94A3B8">Không nhét thùng gạo</text>
      </g>
    </g>

    <!-- Water & Alert Shield on the Right Side -->
    <g transform="translate(850, 160)">
      <polygon points="120,40 220,90 220,250 120,330 20,250 20,90" fill="#1E293B" stroke="#EF4444" stroke-width="4" filter="url(#shadow)"/>
      <polygon points="120,60 200,105 200,235 120,305 40,235 40,105" fill="#0F172A" opacity="0.8"/>
      <!-- Alert Triangle inside shield -->
      <path d="M 120 120 L 165 210 L 75 210 Z" fill="#EF4444" stroke="#FECACA" stroke-width="2"/>
      <rect x="116" y="150" width="8" height="32" rx="4" fill="#FFFFFF"/>
      <circle cx="120" cy="196" r="4.5" fill="#FFFFFF"/>
      <!-- Water Droplets -->
      <circle cx="30" cy="80" r="14" fill="#38BDF8" fill-opacity="0.6"/>
      <circle cx="210" cy="60" r="9" fill="#38BDF8" fill-opacity="0.7"/>
      <circle cx="230" cy="270" r="16" fill="#38BDF8" fill-opacity="0.5"/>
    </g>

    <!-- Bottom Brand Lockup Bar -->
    <rect x="0" y="625" width="1200" height="50" fill="#090D16" fill-opacity="0.8"/>
    <text x="70" y="656" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#38BDF8">MQTECH BUÔN MA THUỘT</text>
    <text x="260" y="656" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#64748B">• Cẩm Nang Kỹ Thuật • Hotline Hỗ Trợ 0987.482.573</text>
    <text x="1130" y="656" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#94A3B8" text-anchor="end">mqcomputech.com</text>
  </svg>
  `;

  await sharp(Buffer.from(svgSpillCover))
    .webp({ quality: 90 })
    .toFile(path.join(OUTPUT_DIR, 'liquid-spill-emergency.webp'));

  // 2. Inline Illustration: Liquid Spill Protocol (3 KHÔNG & Inverted V)
  const svgSpillProtocol = `
  <svg width="1200" height="675" viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="protoBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0F172A" />
        <stop offset="100%" stop-color="#1E293B" />
      </linearGradient>
    </defs>
    <rect width="1200" height="675" fill="url(#protoBg)"/>

    <text x="600" y="70" font-family="system-ui, -apple-system, sans-serif" font-size="30" font-weight="800" fill="#FFFFFF" text-anchor="middle">
      QUY TRÌNH TƯ THẾ CHỮ V NGƯỢC (^) VÀ NGUYÊN TẮC 3 KHÔNG
    </text>
    <text x="600" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="#94A3B8" text-anchor="middle">
      Cách chuẩn kỹ thuật giúp dung dịch thoát ra ngoài, không ngấm vào CPU, GPU và tụ điện cao áp
    </text>

    <!-- Left Box: Inverted V -->
    <g transform="translate(80, 140)">
      <rect width="500" height="460" rx="20" fill="#0B132B" stroke="#38BDF8" stroke-width="2"/>
      <rect x="30" y="30" width="180" height="34" rx="17" fill="#0284C7" fill-opacity="0.2"/>
      <text x="45" y="52" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#38BDF8">✓ TƯ THẾ THOÁT NƯỚC</text>

      <!-- Laptop Roof Shape Visual -->
      <path d="M 120 320 L 250 160 L 380 320" stroke="#38BDF8" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <line x1="80" y1="330" x2="420" y2="330" stroke="#64748B" stroke-width="4" stroke-dasharray="8 8"/>
      <text x="250" y="355" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#94A3B8" text-anchor="middle">Khăn bông mềm hoặc giấy hút ẩm bên dưới</text>

      <!-- Water flow arrows -->
      <path d="M 230 230 L 190 280 M 270 230 L 310 280" stroke="#F43F5E" stroke-width="3" stroke-dasharray="4 4"/>
      <circle cx="180" cy="295" r="5" fill="#F43F5E"/>
      <circle cx="320" cy="295" r="5" fill="#F43F5E"/>

      <text x="250" y="420" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="#F8FAFC" text-anchor="middle">
        Mở góc 90° - 120° úp ngược xuống
      </text>
      <text x="250" y="450" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#94A3B8" text-anchor="middle">
        Trọng lực kéo nước rời khỏi bàn phím, không chạm mainboard
      </text>
    </g>

    <!-- Right Box: 3 KHÔNG -->
    <g transform="translate(620, 140)">
      <rect width="500" height="460" rx="20" fill="#0B132B" stroke="#EF4444" stroke-width="2"/>
      <rect x="30" y="30" width="180" height="34" rx="17" fill="#EF4444" fill-opacity="0.2"/>
      <text x="45" y="52" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#F87171">✕ 3 ĐIỀU TUYỆT ĐỐI CẤM</text>

      <g transform="translate(40, 100)">
        <!-- Forbidden 1 -->
        <g>
          <circle cx="25" cy="25" r="22" fill="#EF4444" fill-opacity="0.15"/>
          <text x="25" y="32" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="800" fill="#EF4444" text-anchor="middle">✕</text>
          <text x="65" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="17" font-weight="700" fill="#FFFFFF">1. Không nhét vào thùng gạo</text>
          <text x="65" y="45" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#94A3B8">Bụi tinh bột chui vào quạt tản nhiệt, gặp ẩm đóng bánh làm kẹt cứng.</text>
        </g>
        <!-- Forbidden 2 -->
        <g transform="translate(0, 110)">
          <circle cx="25" cy="25" r="22" fill="#EF4444" fill-opacity="0.15"/>
          <text x="25" y="32" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="800" fill="#EF4444" text-anchor="middle">✕</text>
          <text x="65" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="17" font-weight="700" fill="#FFFFFF">2. Không dùng máy sấy tóc nóng</text>
          <text x="65" y="45" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#94A3B8">Nhiệt làm chảy phím nhựa và luồng gió thổi nước len lỏi sâu vào chip.</text>
        </g>
        <!-- Forbidden 3 -->
        <g transform="translate(0, 220)">
          <circle cx="25" cy="25" r="22" fill="#EF4444" fill-opacity="0.15"/>
          <text x="25" y="32" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="800" fill="#EF4444" text-anchor="middle">✕</text>
          <text x="65" y="22" font-family="system-ui, -apple-system, sans-serif" font-size="17" font-weight="700" fill="#FFFFFF">3. Không cắm sạc hoặc bật thử</text>
          <text x="65" y="45" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#94A3B8">Nước còn đọng gặp nguồn điện 19V sẽ nổ IC nguồn và cháy CPU tức thì.</text>
        </g>
      </g>
    </g>

    <!-- Bottom Hotline Note -->
    <text x="600" y="640" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#64748B" text-anchor="middle">
      Cần vệ sinh sấy khô chuyên dụng bằng dung dịch chuyên mạch: Gọi ngay 0987.482.573
    </text>
  </svg>
  `;

  await sharp(Buffer.from(svgSpillProtocol))
    .webp({ quality: 90 })
    .toFile(path.join(OUTPUT_DIR, 'liquid-spill-protocol.webp'));

  // 3. Cover: SSD Health Check
  const svgSsdCover = `
  <svg width="1200" height="675" viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ssdGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#022C22" />
        <stop offset="50%" stop-color="#0F172A" />
        <stop offset="100%" stop-color="#064E3B" />
      </linearGradient>
      <linearGradient id="ssdEmerald" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#10B981" />
        <stop offset="100%" stop-color="#06B6D4" />
      </linearGradient>
    </defs>
    <rect width="1200" height="675" fill="url(#ssdGrad)"/>

    <!-- Category Pill -->
    <rect x="70" y="70" width="220" height="38" rx="19" fill="#10B981" fill-opacity="0.15" stroke="#10B981" stroke-opacity="0.5" stroke-width="1.5"/>
    <circle cx="92" cy="89" r="5" fill="#10B981"/>
    <text x="108" y="94" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#6EE7B7" letter-spacing="1">LƯU TRỮ &amp; DỮ LIỆU</text>

    <!-- S.M.A.R.T Badge -->
    <rect x="306" y="70" width="230" height="38" rx="19" fill="#1E293B" stroke="#334155" stroke-width="1"/>
    <text x="326" y="94" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#94A3B8">🔍 S.M.A.R.T DIAGNOSTICS</text>

    <!-- Title & Headline -->
    <text x="70" y="175" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">
      Kiểm Tra Sức Khỏe Ổ Cứng
    </text>
    <text x="70" y="235" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="800" fill="url(#ssdEmerald)" letter-spacing="-0.5">
      SSD &amp; HDD: Dấu Hiệu Sắp Hỏng
    </text>

    <text x="70" y="295" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="400" fill="#CBD5E1">
      Nhận biết sớm Bad Sector, giảm tốc độ và cứu trọn vẹn dữ liệu cá nhân.
    </text>
    <text x="70" y="325" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">
      Sử dụng công cụ chuẩn CrystalDiskInfo đọc chỉ số TBW &amp; nhiệt độ.
    </text>

    <!-- Health Metrics Card Group -->
    <g transform="translate(70, 385)">
      <g>
        <rect width="180" height="180" rx="16" fill="#0F172A" stroke="#10B981" stroke-width="1.5"/>
        <text x="30" y="45" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#10B981">TRẠNG THÁI</text>
        <text x="30" y="95" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="900" fill="#FFFFFF">100%</text>
        <text x="30" y="130" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#34D399">GOOD (TỐT)</text>
        <text x="30" y="152" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#94A3B8">Nhiệt độ: 38°C</text>
      </g>
      <g transform="translate(200, 0)">
        <rect width="180" height="180" rx="16" fill="#0F172A" stroke="#F59E0B" stroke-width="1.5"/>
        <text x="30" y="45" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#F59E0B">CẢNH BÁO</text>
        <text x="30" y="95" font-family="system-ui, -apple-system, sans-serif" font-size="34" font-weight="900" fill="#FBBF24">CAUTION</text>
        <text x="30" y="130" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#FDE68A">BAD SECTOR</text>
        <text x="30" y="152" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#FCA5A5">Cần backup ngay</text>
      </g>
      <g transform="translate(400, 0)">
        <rect width="180" height="180" rx="16" fill="#0F172A" stroke="#06B6D4" stroke-width="1.5"/>
        <text x="30" y="45" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#06B6D4">TỐC ĐỘ ĐỌC GHI</text>
        <text x="30" y="95" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="900" fill="#FFFFFF">3500<tspan font-size="18">MB/s</tspan></text>
        <text x="30" y="130" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#38BDF8">NVMe PCIe 4.0</text>
        <text x="30" y="152" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#94A3B8">Nhanh gấp 10x HDD</text>
      </g>
    </g>

    <!-- SSD Visual M.2 Graphic on Right -->
    <g transform="translate(730, 200)">
      <rect width="400" height="250" rx="16" fill="#1E293B" stroke="#334155" stroke-width="2"/>
      <!-- Circuit pattern -->
      <line x1="30" y1="125" x2="370" y2="125" stroke="#10B981" stroke-width="1" stroke-opacity="0.3"/>
      <!-- NAND Chips -->
      <rect x="50" y="60" width="80" height="130" rx="6" fill="#0F172A" stroke="#475569" stroke-width="1.5"/>
      <text x="90" y="130" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#94A3B8" text-anchor="middle">NAND 3D</text>
      
      <rect x="150" y="60" width="80" height="130" rx="6" fill="#0F172A" stroke="#475569" stroke-width="1.5"/>
      <text x="190" y="130" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#94A3B8" text-anchor="middle">NAND 3D</text>

      <rect x="250" y="80" width="70" height="90" rx="6" fill="#064E3B" stroke="#10B981" stroke-width="1.5"/>
      <text x="285" y="130" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" fill="#6EE7B7" text-anchor="middle">CONTROLLER</text>

      <!-- Golden Pins -->
      <rect x="350" y="90" width="30" height="70" rx="2" fill="#F59E0B"/>
      
      <!-- Label -->
      <text x="200" y="225" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#94A3B8" text-anchor="middle">MQTECH SOLID STATE DRIVE • HIGH ENDURANCE</text>
    </g>

    <!-- Bottom Brand Lockup Bar -->
    <rect x="0" y="625" width="1200" height="50" fill="#090D16" fill-opacity="0.8"/>
    <text x="70" y="656" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#10B981">MQTECH BUÔN MA THUỘT</text>
    <text x="260" y="656" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#64748B">• Kiểm Tra &amp; Cứu Dữ Liệu Ổ Cứng • Hotline 0987.482.573</text>
    <text x="1130" y="656" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#94A3B8" text-anchor="end">mqcomputech.com</text>
  </svg>
  `;

  await sharp(Buffer.from(svgSsdCover))
    .webp({ quality: 90 })
    .toFile(path.join(OUTPUT_DIR, 'ssd-health-check.webp'));

  // 4. Inline Illustration: SSD SMART Indicators
  const svgSsdSmart = `
  <svg width="1200" height="675" viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="smartBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0F172A" />
        <stop offset="100%" stop-color="#111827" />
      </linearGradient>
    </defs>
    <rect width="1200" height="675" fill="url(#smartBg)"/>

    <text x="600" y="70" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF" text-anchor="middle">
      HƯỚNG DẪN ĐỌC THÔNG SỐ S.M.A.R.T TRÊN CRYSTALDISKINFO
    </text>
    <text x="600" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="15" fill="#94A3B8" text-anchor="middle">
      3 mã định danh sống còn quyết định ổ đĩa của bạn còn an toàn hay sắp hỏng hoàn toàn
    </text>

    <!-- Table Container -->
    <g transform="translate(80, 140)">
      <rect width="1040" height="380" rx="16" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>

      <!-- Header row -->
      <rect x="0" y="0" width="1040" height="55" rx="16" fill="#0F172A"/>
      <text x="40" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#94A3B8">ID</text>
      <text x="100" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#94A3B8">TÊN THÔNG SỐ S.M.A.R.T</text>
      <text x="440" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#94A3B8">Ý NGHĨA KỸ THUẬT</text>
      <text x="820" y="34" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#94A3B8">HÀNH ĐỘNG CẦN LÀM</text>

      <!-- Row 1: 05 Reallocated Sectors Count -->
      <line x1="0" y1="55" x2="1040" y2="55" stroke="#334155" stroke-width="1"/>
      <text x="40" y="100" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="800" fill="#EF4444">05</text>
      <text x="100" y="95" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="#FFFFFF">Reallocated Sectors Count</text>
      <text x="100" y="118" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#64748B">Số sector hỏng đã được hoán đổi</text>
      <text x="440" y="95" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#E2E8F0">Bề mặt đĩa từ (HDD) hoặc chip flash (SSD) đã bị suy thoái vật lý.</text>
      <text x="440" y="118" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#F87171">Chỉ số này tăng liên tục báo hiệu ổ sắp chết.</text>
      <rect x="820" y="80" width="180" height="34" rx="8" fill="#EF4444" fill-opacity="0.2"/>
      <text x="910" y="102" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#F87171" text-anchor="middle">Sao lưu ngay trong ngày</text>

      <!-- Row 2: C5 Current Pending Sector Count -->
      <line x1="0" y1="150" x2="1040" y2="150" stroke="#334155" stroke-width="1"/>
      <text x="40" y="195" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="800" fill="#F59E0B">C5</text>
      <text x="100" y="190" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="#FFFFFF">Current Pending Sector Count</text>
      <text x="100" y="213" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#64748B">Sector chờ xử lý hoặc nghi ngờ lỗi</text>
      <text x="440" y="190" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#E2E8F0">Các sector không đọc được dữ liệu, làm treo đơ máy (100% Disk).</text>
      <text x="440" y="213" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#FBBF24">Gây hiện tượng màn hình xanh BSOD khi Windows đọc trúng.</text>
      <rect x="820" y="175" width="180" height="34" rx="8" fill="#F59E0B" fill-opacity="0.2"/>
      <text x="910" y="197" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#FBBF24" text-anchor="middle">Clone đĩa sang SSD mới</text>

      <!-- Row 3: E7 SSD Life Left -->
      <line x1="0" y1="245" x2="1040" y2="245" stroke="#334155" stroke-width="1"/>
      <text x="40" y="290" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="800" fill="#10B981">E7</text>
      <text x="100" y="285" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="#FFFFFF">SSD Life Left / TBW Remaining</text>
      <text x="100" y="308" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#64748B">Tuổi thọ chip nhớ NAND còn lại</text>
      <text x="440" y="285" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#E2E8F0">Tuổi thọ phần trăm của SSD. Nếu còn &gt; 80%: Rất tốt.</text>
      <text x="440" y="308" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#34D399">Nếu tụt dưới 20%: Tốc độ ghi tụt giảm nghiêm trọng.</text>
      <rect x="820" y="270" width="180" height="34" rx="8" fill="#10B981" fill-opacity="0.2"/>
      <text x="910" y="292" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#34D399" text-anchor="middle">Theo dõi định kỳ 3 tháng</text>
    </g>

    <!-- Bottom Tip: 3-2-1 Rule -->
    <g transform="translate(80, 550)">
      <rect width="1040" height="75" rx="12" fill="#0F172A" stroke="#475569" stroke-width="1"/>
      <text x="30" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" fill="#38BDF8">QUY TẮC SAO LƯU 3-2-1 BẢO VỆ DỮ LIỆU:</text>
      <text x="380" y="42" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#CBD5E1">
        3 bản sao • 2 loại phương tiện (SSD + Ổ cứng ngoài) • 1 bản lưu trên Cloud (Drive/OneDrive)
      </text>
    </g>
  </svg>
  `;

  await sharp(Buffer.from(svgSsdSmart))
    .webp({ quality: 90 })
    .toFile(path.join(OUTPUT_DIR, 'ssd-smart-indicators.webp'));

  // 5. Cover: Thermal Paste Signs
  const svgThermalCover = `
  <svg width="1200" height="675" viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="thermalBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1C1917" />
        <stop offset="50%" stop-color="#292524" />
        <stop offset="100%" stop-color="#0C0A09" />
      </linearGradient>
      <linearGradient id="flameGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#F59E0B" />
        <stop offset="100%" stop-color="#EF4444" />
      </linearGradient>
    </defs>
    <rect width="1200" height="675" fill="url(#thermalBg)"/>

    <!-- Ambient glow circle -->
    <circle cx="950" cy="337" r="280" fill="#F59E0B" opacity="0.1" filter="blur(60px)"/>

    <!-- Category Pill -->
    <rect x="70" y="70" width="220" height="38" rx="19" fill="#F59E0B" fill-opacity="0.15" stroke="#F59E0B" stroke-opacity="0.5" stroke-width="1.5"/>
    <circle cx="92" cy="89" r="5" fill="#F59E0B"/>
    <text x="108" y="94" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#FCD34D" letter-spacing="1">BẢO DƯỠNG &amp; TẢN NHIỆT</text>

    <!-- Badge -->
    <rect x="306" y="70" width="230" height="38" rx="19" fill="#292524" stroke="#44403C" stroke-width="1"/>
    <text x="326" y="94" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#D6D3D1">❄ HẠ 15°C - 25°C NHIỆT ĐỘ</text>

    <!-- Title & Headline -->
    <text x="70" y="175" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">
      4 Dấu Hiệu Laptop Bị Quá Nhiệt
    </text>
    <text x="70" y="235" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="800" fill="url(#flameGrad)" letter-spacing="-0.5">
      Khô Keo Tản Nhiệt Cần Vệ Sinh
    </text>

    <text x="70" y="295" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="400" fill="#E7E5E4">
      Quạt hú to liên tục, máy giật lag, tự động sập nguồn chống cháy CPU.
    </text>
    <text x="70" y="325" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="400" fill="#A8A29E">
      Đặc thù bụi đỏ Buôn Ma Thuột khiến keo nhanh khô và bít kín khe thoát gió.
    </text>

    <!-- 4 Signs Cards Grid -->
    <g transform="translate(70, 385)">
      <g>
        <rect width="180" height="180" rx="16" fill="#1C1917" stroke="#44403C" stroke-width="1.5"/>
        <circle cx="45" cy="45" r="22" fill="#F59E0B" fill-opacity="0.15"/>
        <text x="45" y="52" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" fill="#F59E0B" text-anchor="middle">01</text>
        <text x="25" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" fill="#FFFFFF">QUẠT HÚ TO</text>
        <text x="25" y="132" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#A8A29E">Quay 100% công suất</text>
        <text x="25" y="150" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#A8A29E">Ngay cả khi chỉ lướt web</text>
      </g>
      <g transform="translate(200, 0)">
        <rect width="180" height="180" rx="16" fill="#1C1917" stroke="#44403C" stroke-width="1.5"/>
        <circle cx="45" cy="45" r="22" fill="#EF4444" fill-opacity="0.15"/>
        <text x="45" y="52" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" fill="#EF4444" text-anchor="middle">02</text>
        <text x="25" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" fill="#FFFFFF">NÓNG RÁT TAY</text>
        <text x="25" y="132" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#A8A29E">Bàn phím &amp; chiếu nghỉ</text>
        <text x="25" y="150" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#A8A29E">Nhiệt tích tụ vỏ máy</text>
      </g>
      <g transform="translate(400, 0)">
        <rect width="180" height="180" rx="16" fill="#1C1917" stroke="#44403C" stroke-width="1.5"/>
        <circle cx="45" cy="45" r="22" fill="#F97316" fill-opacity="0.15"/>
        <text x="45" y="52" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" fill="#F97316" text-anchor="middle">03</text>
        <text x="25" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" fill="#FFFFFF">TỰ SẬP NGUỒN</text>
        <text x="25" y="132" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#A8A29E">CPU chạm 98°C</text>
        <text x="25" y="150" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#A8A29E">Tự ngắt chống cháy</text>
      </g>
    </g>

    <!-- Cooling System Visual on Right -->
    <g transform="translate(730, 180)">
      <rect width="400" height="280" rx="20" fill="#292524" stroke="#57534E" stroke-width="2"/>
      
      <!-- Copper Heatpipes -->
      <path d="M 60 140 C 140 140, 200 80, 280 80" stroke="#F59E0B" stroke-width="16" stroke-linecap="round" fill="none"/>
      <path d="M 60 180 C 140 180, 200 120, 280 120" stroke="#F59E0B" stroke-width="16" stroke-linecap="round" fill="none"/>
      <text x="180" y="55" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#FBBF24">ỐNG ĐỒNG NGUYÊN CHẤT</text>

      <!-- CPU Die with Paste -->
      <rect x="250" y="150" width="110" height="95" rx="8" fill="#1C1917" stroke="#78716C" stroke-width="2"/>
      <circle cx="305" cy="197" r="26" fill="#94A3B8" stroke="#CBD5E1" stroke-width="2"/>
      <text x="305" y="202" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="800" fill="#1E293B" text-anchor="middle">ARCTIC MX-4</text>

      <!-- Fan Blower -->
      <circle cx="90" cy="160" r="50" fill="#1C1917" stroke="#44403C" stroke-width="3"/>
      <path d="M 90 120 L 90 200 M 50 160 L 130 160" stroke="#0284C7" stroke-width="3"/>
      <text x="90" y="240" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#38BDF8" text-anchor="middle">QUẠT TẢN KHÍ</text>
    </g>

    <!-- Bottom Brand Lockup Bar -->
    <rect x="0" y="625" width="1200" height="50" fill="#0C0A09" fill-opacity="0.8"/>
    <text x="70" y="656" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#F59E0B">MQTECH BUÔN MA THUỘT</text>
    <text x="260" y="656" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#78716C">• Vệ Sinh Tra Keo Tản Nhiệt Cao Cấp • Hotline 0987.482.573</text>
    <text x="1130" y="656" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#A8A29E" text-anchor="end">mqcomputech.com</text>
  </svg>
  `;

  await sharp(Buffer.from(svgThermalCover))
    .webp({ quality: 90 })
    .toFile(path.join(OUTPUT_DIR, 'thermal-paste-signs.webp'));

  // 6. Inline Illustration: Thermal Maintenance Guide (Temperature zones)
  const svgThermalGuide = `
  <svg width="1200" height="675" viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="675" fill="#18181B"/>

    <text x="600" y="70" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF" text-anchor="middle">
      THANG NHIỆT ĐỘ CPU VÀ NGUY CƠ ĐỐI VỚI PHẦN CỨNG LAPTOP
    </text>
    <text x="600" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="15" fill="#A1A1AA" text-anchor="middle">
      Keo tản nhiệt nguyên bản khô nứt sau 9-12 tháng làm giảm 40% hiệu năng xử lý (Thermal Throttling)
    </text>

    <!-- 4 Temperature Bars -->
    <g transform="translate(80, 150)">
      <!-- Zone 1: < 65 C (Safe) -->
      <g>
        <rect width="240" height="320" rx="16" fill="#27272A" stroke="#10B981" stroke-width="2"/>
        <rect x="0" y="0" width="240" height="60" rx="16" fill="#065F46"/>
        <text x="120" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#34D399" text-anchor="middle">DƯỚI 65°C</text>
        <text x="120" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="#FFFFFF" text-anchor="middle">HOÀN HẢO</text>
        <text x="25" y="145" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#D1D5DB">• Máy hoạt động êm ái</text>
        <text x="25" y="175" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#D1D5DB">• Quạt quay ở mức thấp</text>
        <text x="25" y="205" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#D1D5DB">• Tác vụ văn phòng, lướt web</text>
        <text x="25" y="235" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#D1D5DB">• Pin dùng được lâu nhất</text>
        <rect x="25" y="265" width="190" height="30" rx="6" fill="#10B981" fill-opacity="0.2"/>
        <text x="120" y="285" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#6EE7B7" text-anchor="middle">Trạng thái lý tưởng</text>
      </g>

      <!-- Zone 2: 65 - 80 C (Moderate) -->
      <g transform="translate(260, 0)">
        <rect width="240" height="320" rx="16" fill="#27272A" stroke="#38BDF8" stroke-width="2"/>
        <rect x="0" y="0" width="240" height="60" rx="16" fill="#0369A1"/>
        <text x="120" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#7DD3FC" text-anchor="middle">65°C - 80°C</text>
        <text x="120" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="#FFFFFF" text-anchor="middle">ỔN ĐỊNH TẢI NẶNG</text>
        <text x="25" y="145" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#D1D5DB">• Render video, đồ họa</text>
        <text x="25" y="175" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#D1D5DB">• Gaming mức trung bình</text>
        <text x="25" y="205" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#D1D5DB">• Quạt bắt đầu tăng tốc</text>
        <text x="25" y="235" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#D1D5DB">• Hệ thống tản nhiệt còn tốt</text>
        <rect x="25" y="265" width="190" height="30" rx="6" fill="#38BDF8" fill-opacity="0.2"/>
        <text x="120" y="285" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#38BDF8" text-anchor="middle">Nhiệt độ chấp nhận được</text>
      </g>

      <!-- Zone 3: 85 - 95 C (Danger) -->
      <g transform="translate(520, 0)">
        <rect width="240" height="320" rx="16" fill="#27272A" stroke="#F59E0B" stroke-width="2"/>
        <rect x="0" y="0" width="240" height="60" rx="16" fill="#B45309"/>
        <text x="120" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#FDE68A" text-anchor="middle">85°C - 95°C</text>
        <text x="120" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="#FFFFFF" text-anchor="middle">NGUY HIỂM</text>
        <text x="25" y="145" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#D1D5DB">• CPU tự bóp xung nhịp</text>
        <text x="25" y="175" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#D1D5DB">• Máy bị drop FPS, giật khựng</text>
        <text x="25" y="205" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#D1D5DB">• Keo tản nhiệt đã khô đặc</text>
        <text x="25" y="235" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#D1D5DB">• Cần vệ sinh ngay</text>
        <rect x="25" y="265" width="190" height="30" rx="6" fill="#F59E0B" fill-opacity="0.2"/>
        <text x="120" y="285" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#FBBF24" text-anchor="middle">Bắt đầu suy giảm tuổi thọ</text>
      </g>

      <!-- Zone 4: > 95 C (Critical) -->
      <g transform="translate(780, 0)">
        <rect width="240" height="320" rx="16" fill="#27272A" stroke="#EF4444" stroke-width="2"/>
        <rect x="0" y="0" width="240" height="60" rx="16" fill="#991B1B"/>
        <text x="120" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#FECACA" text-anchor="middle">TRÊN 95°C</text>
        <text x="120" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="#FFFFFF" text-anchor="middle">SẬP NGUỒN CẤP</text>
        <text x="25" y="145" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#D1D5DB">• Thermal Shutdown bảo vệ</text>
        <text x="25" y="175" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#D1D5DB">• Nguy cơ nổ tụ nguồn CPU</text>
        <text x="25" y="205" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#D1D5DB">• Bong chân chip BGA</text>
        <text x="25" y="235" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#D1D5DB">• Chai phồng pin do nhiệt</text>
        <rect x="25" y="265" width="190" height="30" rx="6" fill="#EF4444" fill-opacity="0.2"/>
        <text x="120" y="285" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="#F87171" text-anchor="middle">Dừng sử dụng khẩn cấp</text>
      </g>
    </g>

    <!-- Bottom Notice -->
    <g transform="translate(80, 500)">
      <rect width="1020" height="110" rx="14" fill="#27272A" stroke="#3F3F46" stroke-width="1.5"/>
      <text x="30" y="35" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" fill="#FBBF24">
        KHUYẾN CÁO BẢO DƯỠNG ĐỊNH KỲ TỪ KỸ THUẬT VIÊN MQTECH BUÔN MA THUỘT:
      </text>
      <text x="30" y="65" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#E4E4E7">
        • Laptop văn phòng: Vệ sinh tra keo định kỳ mỗi 6 - 9 tháng/lần.
      </text>
      <text x="30" y="90" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#E4E4E7">
        • Laptop Gaming &amp; Đồ họa: Vệ sinh tra keo mỗi 4 - 6 tháng/lần với keo gốm Arctic MX-4 hoặc đệm đổi pha Honeywell PTM7950.
      </text>
    </g>
  </svg>
  `;

  await sharp(Buffer.from(svgThermalGuide))
    .webp({ quality: 90 })
    .toFile(path.join(OUTPUT_DIR, 'thermal-maintenance-guide.webp'));

  // 7. Cover: LAN Printer Troubleshoot
  const svgPrinterCover = `
  <svg width="1200" height="675" viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lanBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#020617" />
        <stop offset="50%" stop-color="#1E1B4B" />
        <stop offset="100%" stop-color="#0F172A" />
      </linearGradient>
      <linearGradient id="indigoCyan" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#6366F1" />
        <stop offset="100%" stop-color="#06B6D4" />
      </linearGradient>
    </defs>
    <rect width="1200" height="675" fill="url(#lanBg)"/>

    <!-- Category Pill -->
    <rect x="70" y="70" width="220" height="38" rx="19" fill="#6366F1" fill-opacity="0.15" stroke="#6366F1" stroke-opacity="0.5" stroke-width="1.5"/>
    <circle cx="92" cy="89" r="5" fill="#818CF8"/>
    <text x="108" y="94" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700" fill="#C7D2FE" letter-spacing="1">MẠNG LAN &amp; MÁY IN</text>

    <!-- Badge -->
    <rect x="306" y="70" width="240" height="38" rx="19" fill="#1E1B4B" stroke="#4338CA" stroke-width="1"/>
    <text x="326" y="94" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#A5B4FC">🖨 SỬA LỖI SPOOLER &amp; IP</text>

    <!-- Title & Headline -->
    <text x="70" y="175" font-family="system-ui, -apple-system, sans-serif" font-size="44" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">
      Khắc Phục Lỗi Máy In Offline
    </text>
    <text x="70" y="235" font-family="system-ui, -apple-system, sans-serif" font-size="42" font-weight="800" fill="url(#indigoCyan)" letter-spacing="-0.5">
      Treo Lệnh In Mạng LAN Văn Phòng
    </text>

    <text x="70" y="295" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="400" fill="#E2E8F0">
      Xóa sạch hàng đợi kẹt lệnh, khởi động lại Spooler và cấu hình IP tĩnh.
    </text>
    <text x="70" y="325" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="400" fill="#94A3B8">
      Giải pháp tin cậy cho văn phòng, doanh nghiệp và kế toán tại Buôn Ma Thuột.
    </text>

    <!-- 3 Action Cards -->
    <g transform="translate(70, 385)">
      <g>
        <rect width="180" height="180" rx="16" fill="#0F172A" stroke="#334155" stroke-width="1.5"/>
        <circle cx="45" cy="45" r="22" fill="#6366F1" fill-opacity="0.15"/>
        <text x="45" y="52" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" fill="#818CF8" text-anchor="middle">01</text>
        <text x="25" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" fill="#FFFFFF">PRINT SPOOLER</text>
        <text x="25" y="132" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#94A3B8">services.msc</text>
        <text x="25" y="150" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#94A3B8">Restart xóa lệnh kẹt</text>
      </g>
      <g transform="translate(200, 0)">
        <rect width="180" height="180" rx="16" fill="#0F172A" stroke="#334155" stroke-width="1.5"/>
        <circle cx="45" cy="45" r="22" fill="#06B6D4" fill-opacity="0.15"/>
        <text x="45" y="52" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" fill="#22D3EE" text-anchor="middle">02</text>
        <text x="25" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" fill="#FFFFFF">ĐẶT IP TĨNH</text>
        <text x="25" y="132" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#94A3B8">Static IP cố định</text>
        <text x="25" y="150" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#94A3B8">Tránh nhảy IP DHCP</text>
      </g>
      <g transform="translate(400, 0)">
        <rect width="180" height="180" rx="16" fill="#0F172A" stroke="#334155" stroke-width="1.5"/>
        <circle cx="45" cy="45" r="22" fill="#10B981" fill-opacity="0.15"/>
        <text x="45" y="52" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="800" fill="#34D399" text-anchor="middle">03</text>
        <text x="25" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" fill="#FFFFFF">TẮT OFFLINE</text>
        <text x="25" y="132" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#94A3B8">Use Printer Offline</text>
        <text x="25" y="150" font-family="system-ui, -apple-system, sans-serif" font-size="12" fill="#94A3B8">Bỏ chọn dòng cảnh báo</text>
      </g>
    </g>

    <!-- Network & Printer Topology Visual on Right -->
    <g transform="translate(730, 190)">
      <rect width="400" height="260" rx="16" fill="#1E1B4B" stroke="#4338CA" stroke-width="2"/>
      
      <!-- Router Icon / Box -->
      <rect x="50" y="50" width="80" height="50" rx="8" fill="#0F172A" stroke="#6366F1" stroke-width="2"/>
      <circle cx="70" cy="75" r="4" fill="#10B981"/>
      <circle cx="90" cy="75" r="4" fill="#38BDF8"/>
      <circle cx="110" cy="75" r="4" fill="#F59E0B"/>
      <text x="90" y="125" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#C7D2FE" text-anchor="middle">ROUTER / SWITCH</text>

      <!-- Connecting Lines -->
      <line x1="130" y1="75" x2="270" y2="75" stroke="#38BDF8" stroke-width="3" stroke-dasharray="6 6"/>
      
      <!-- Printer Box -->
      <rect x="270" y="40" width="90" height="70" rx="8" fill="#0F172A" stroke="#10B981" stroke-width="2"/>
      <rect x="285" y="55" width="60" height="20" rx="3" fill="#334155"/>
      <rect x="295" y="80" width="40" height="6" rx="2" fill="#10B981"/>
      <text x="315" y="125" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="700" fill="#34D399" text-anchor="middle">192.168.1.200</text>

      <!-- Status Ping -->
      <rect x="50" y="170" width="310" height="60" rx="10" fill="#020617" stroke="#334155" stroke-width="1"/>
      <text x="70" y="195" font-family="monospace" font-size="12" fill="#10B981">ping 192.168.1.200 -t</text>
      <text x="70" y="215" font-family="monospace" font-size="12" fill="#94A3B8">Reply from 192.168.1.200: bytes=32 time&lt;1ms</text>
    </g>

    <!-- Bottom Brand Lockup Bar -->
    <rect x="0" y="625" width="1200" height="50" fill="#020617" fill-opacity="0.8"/>
    <text x="70" y="656" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#818CF8">MQTECH BUÔN MA THUỘT</text>
    <text x="260" y="656" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#64748B">• Hỗ Trợ Kỹ Thuật Mạng LAN &amp; Máy In Từ Xa • Hotline 0987.482.573</text>
    <text x="1130" y="656" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#94A3B8" text-anchor="end">mqcomputech.com</text>
  </svg>
  `;

  await sharp(Buffer.from(svgPrinterCover))
    .webp({ quality: 90 })
    .toFile(path.join(OUTPUT_DIR, 'lan-printer-troubleshoot.webp'));

  // 8. Inline Illustration: Printer Spooler & IP Fix Workflow
  const svgPrinterFix = `
  <svg width="1200" height="675" viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="675" fill="#0B132B"/>

    <text x="600" y="70" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF" text-anchor="middle">
      SƠ ĐỒ 4 BƯỚC KHẮC PHỤC TRIỆT ĐỂ LỖI MÁY IN MẠNG LAN
    </text>
    <text x="600" y="105" font-family="system-ui, -apple-system, sans-serif" font-size="15" fill="#94A3B8" text-anchor="middle">
      Tự xử lý tại chỗ trong 3 phút không cần chờ đợi kỹ thuật viên đến tận nơi
    </text>

    <!-- 4 Step Boxes Horizontally -->
    <g transform="translate(60, 150)">
      <!-- Step 1 -->
      <g>
        <rect width="250" height="340" rx="16" fill="#1C2541" stroke="#3B82F6" stroke-width="2"/>
        <rect x="0" y="0" width="250" height="60" rx="16" fill="#1E3A8A"/>
        <text x="125" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="800" fill="#93C5FD" text-anchor="middle">BƯỚC 1</text>
        <text x="125" y="100" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="#FFFFFF" text-anchor="middle">RESTART SPOOLER</text>
        <text x="25" y="145" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#CBD5E1">1. Nhấn Windows + R</text>
        <text x="25" y="175" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#CBD5E1">2. Nhập: services.msc</text>
        <text x="25" y="205" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#CBD5E1">3. Tìm "Print Spooler"</text>
        <text x="25" y="235" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#CBD5E1">4. Chuột phải &gt; Restart</text>
        <rect x="20" y="270" width="210" height="45" rx="8" fill="#0B132B"/>
        <text x="125" y="297" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" fill="#60A5FA" text-anchor="middle">Xóa sạch các lệnh in bị kẹt</text>
      </g>

      <!-- Step 2 -->
      <g transform="translate(275, 0)">
        <rect width="250" height="340" rx="16" fill="#1C2541" stroke="#06B6D4" stroke-width="2"/>
        <rect x="0" y="0" width="250" height="60" rx="16" fill="#0E7490"/>
        <text x="125" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="800" fill="#A5F3FC" text-anchor="middle">BƯỚC 2</text>
        <text x="125" y="100" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="#FFFFFF" text-anchor="middle">BỎ "USE OFFLINE"</text>
        <text x="25" y="145" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#CBD5E1">1. Mở Control Panel</text>
        <text x="25" y="175" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#CBD5E1">2. Devices &amp; Printers</text>
        <text x="25" y="205" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#CBD5E1">3. Mở hàng đợi máy in</text>
        <text x="25" y="235" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#CBD5E1">4. Bỏ tick "Use Offline"</text>
        <rect x="20" y="270" width="210" height="45" rx="8" fill="#0B132B"/>
        <text x="125" y="297" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" fill="#22D3EE" text-anchor="middle">Kích hoạt trạng thái Ready</text>
      </g>

      <!-- Step 3 -->
      <g transform="translate(550, 0)">
        <rect width="250" height="340" rx="16" fill="#1C2541" stroke="#10B981" stroke-width="2"/>
        <rect x="0" y="0" width="250" height="60" rx="16" fill="#047857"/>
        <text x="125" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="800" fill="#6EE7B7" text-anchor="middle">BƯỚC 3</text>
        <text x="125" y="100" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="#FFFFFF" text-anchor="middle">ĐẶT IP TĨNH MÁY IN</text>
        <text x="25" y="145" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#CBD5E1">1. Vào trang quản trị máy in</text>
        <text x="25" y="175" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#CBD5E1">2. Chọn Network &gt; IPv4</text>
        <text x="25" y="205" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#CBD5E1">3. Chuyển DHCP &gt; Manual</text>
        <text x="25" y="235" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#CBD5E1">4. Gán đuôi cao (.200+)</text>
        <rect x="20" y="270" width="210" height="45" rx="8" fill="#0B132B"/>
        <text x="125" y="297" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" fill="#34D399" text-anchor="middle">Tránh xung đột địa chỉ IP</text>
      </g>

      <!-- Step 4 -->
      <g transform="translate(825, 0)">
        <rect width="250" height="340" rx="16" fill="#1C2541" stroke="#F59E0B" stroke-width="2"/>
        <rect x="0" y="0" width="250" height="60" rx="16" fill="#B45309"/>
        <text x="125" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="800" fill="#FDE68A" text-anchor="middle">BƯỚC 4</text>
        <text x="125" y="100" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="700" fill="#FFFFFF" text-anchor="middle">KIỂM TRA PING LAN</text>
        <text x="25" y="145" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#CBD5E1">1. Mở Command Prompt</text>
        <text x="25" y="175" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#CBD5E1">2. Gõ: ping [IP máy in]</text>
        <text x="25" y="205" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#CBD5E1">3. Nếu timeout: kiểm tra dây</text>
        <text x="25" y="235" font-family="system-ui, -apple-system, sans-serif" font-size="13" fill="#CBD5E1">4. In trang Test Page</text>
        <rect x="20" y="270" width="210" height="45" rx="8" fill="#0B132B"/>
        <text x="125" y="297" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" fill="#FBBF24" text-anchor="middle">Xác nhận đường truyền thông</text>
      </g>
    </g>

    <!-- Support Bar -->
    <g transform="translate(60, 520)">
      <rect width="1075" height="90" rx="14" fill="#1C2541" stroke="#334155" stroke-width="1.5"/>
      <text x="30" y="38" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="700" fill="#38BDF8">
        HỖ TRỢ CẤU HÌNH TỪ XA QUA ULTRAVIEWER / ANYDESK:
      </text>
      <text x="30" y="65" font-family="system-ui, -apple-system, sans-serif" font-size="14" fill="#CBD5E1">
        Nếu văn phòng gặp mô hình mạng phức tạp (VLAN, đa dải subnet, máy chủ in server), kỹ thuật viên MQTech sẵn sàng kết nối hỗ trợ ngay. Hotline: 0987.482.573
      </text>
    </g>
  </svg>
  `;

  // Fallback direct sharp rendering
  await sharp(Buffer.from(svgPrinterFix))
    .webp({ quality: 90 })
    .toFile(path.join(OUTPUT_DIR, 'printer-spooler-fix.webp'));

  // Run Headless Chrome renderer for 100% perfect Vietnamese typography with Google Fonts Be Vietnam Pro
  const { execSync } = require('child_process');
  const chromeScript = path.join(__dirname, 'render_cam_nang_chrome.py');
  if (fs.existsSync(chromeScript)) {
    try {
      console.log('Rendering typography via Headless Chrome & Be Vietnam Pro...');
      execSync(`python "${chromeScript}"`, { stdio: 'inherit' });
    } catch (e) {
      console.warn('Chrome renderer notice:', e.message);
    }
  }

  console.log('--- Successfully Generated All 8 Cẩm Nang Assets in public/cam-nang/ ---');
}

generateAssets().catch((err) => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
