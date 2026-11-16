import type { Metadata, Viewport } from "next";
import { FloatingContactHub } from "@/components/layout/FloatingContactHub";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://mqtech.fly.dev"),
  title: "MQTech — Dịch Vụ Sửa Chữa Máy Tính & IT Chuyên Nghiệp | Buôn Ma Thuột",
  description:
    "MQTech cung cấp dịch vụ sửa chữa máy tính, laptop, phần cứng, mạng LAN/Wi-Fi và hỗ trợ IT doanh nghiệp uy tín tại Buôn Ma Thuột và lân cận.",
  keywords: [
    "sửa máy tính Buôn Ma Thuột",
    "sửa laptop BMT",
    "sửa máy tính Tân Lập Buôn Ma Thuột",
    "sửa laptop Nguyễn Văn Cừ BMT",
    "cài win tại nhà Buôn Ma Thuột",
    "sửa máy in văn phòng BMT",
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
    images: [
      {
        url: "/logo/mq-tech-avatar.png",
        width: 1024,
        height: 1024,
        alt: "MQTech — Computer Service",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-brand-dark text-white selection:bg-blue-500/30 selection:text-white">
        {children}
        <FloatingContactHub />
      </body>
    </html>
  );
}
