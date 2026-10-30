import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "MQTech — Dịch Vụ Sửa Chữa Máy Tính & IT Chuyên Nghiệp | Buôn Ma Thuột",
  description:
    "MQTech cung cấp dịch vụ sửa chữa máy tính, laptop, phần cứng, mạng LAN/Wi-Fi và hỗ trợ IT doanh nghiệp uy tín tại Buôn Ma Thuột và lân cận.",
  keywords: [
    "sửa máy tính Buôn Ma Thuột",
    "sửa laptop BMT",
    "cài đặt máy tính Buôn Ma Thuột",
    "sửa chữa phần cứng máy tính",
    "hỗ trợ IT văn phòng Buôn Ma Thuột",
    "MQTech",
  ],
  authors: [{ name: "MQTech — Computer Service" }],
  openGraph: {
    title: "MQTech — Dịch Vụ Sửa Chữa Máy Tính & IT Chuyên Nghiệp | Buôn Ma Thuột",
    description:
      "MQTech cung cấp dịch vụ sửa chữa máy tính, laptop, phần cứng, mạng LAN/Wi-Fi và hỗ trợ IT doanh nghiệp uy tín tại Buôn Ma Thuột và lân cận.",
    type: "website",
    locale: "vi_VN",
    siteName: "MQTech — Computer Service",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#0A0A0B] text-white selection:bg-[#3B82F6]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
