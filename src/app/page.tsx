import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { KnowledgeSection } from "@/components/home/KnowledgeSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { WorkflowSection } from "@/components/home/WorkflowSection";
import { TrustSection } from "@/components/home/TrustSection";
import { IntakeSection } from "@/components/home/IntakeSection";
import { Footer } from "@/components/layout/Footer";
import { articleRepo } from "@/lib/db/article-repository";

export default async function HomePage() {
  const { items: latestArticles } = await articleRepo.listPublishedArticles({ pageSize: 3 });

  // Schema.org LocalBusiness / ComputerRepairService Structured Data
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "ComputerRepairService",
    "@id": "https://mqcomputech.com/#localbusiness",
    name: "MQTech — Sửa Chữa Máy Tính & Laptop Buôn Ma Thuột",
    alternateName: ["MQTech Computer Service", "Sửa máy tính Buôn Ma Thuột MQTech", "Sửa laptop Tân Lập BMT"],
    url: "https://mqcomputech.com",
    sameAs: [
      "https://www.facebook.com/suamaytinhbmt/"
    ],
    telephone: "+84987482573",
    logo: "https://mqcomputech.com/logo/mq-tech-avatar-512.png",
    image: "https://mqcomputech.com/banner/laptoppc.webp",
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Hẻm 4, số nhà 13/2 Võ Thị Sáu",
      addressLocality: "Phường Tân Lập",
      addressRegion: "Thành phố Buôn Ma Thuột",
      addressCountry: "VN",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "08:00",
        closes: "18:30",
      },
    ],
    areaServed: [
      {
        "@type": "AdministrativeArea",
        name: "Phường Tân Lập",
        containedIn: {
          "@type": "City",
          name: "Thành phố Buôn Ma Thuột",
        },
      },
      {
        "@type": "City",
        name: "Thành phố Buôn Ma Thuột",
      },
      {
        "@type": "AdministrativeArea",
        name: "Tỉnh Đắk Lắk",
      },
    ],
    serviceArea: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: 12.6865,
        longitude: 108.0645,
      },
      geoRadius: 15000,
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Dịch vụ sửa chữa công nghệ MQTech",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Sửa chữa Laptop & PC để bàn lấy liền",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Cài đặt Windows chuẩn sạch & diệt virus tận nơi",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Chẩn đoán nâng cấp SSD & RAM bảo toàn dữ liệu",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Bảo trì máy in & hệ thống mạng LAN văn phòng",
          },
        },
      ],
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-brand-dark text-white selection:bg-blue-600 selection:text-white">
      {/* Schema.org LocalBusiness JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />

      {/* Top Sticky Glass Navigation */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* Concept 7 Split Hero with Floating Card Carousel */}
        <Hero />

        {/* Concept 7 Knowledge Cards & Step Checklist */}
        <KnowledgeSection initialArticles={latestArticles} />

        {/* Core Services (6 confirmed categories) */}
        <ServicesSection />

        {/* 4-Step Transparent Repair Workflow */}
        <WorkflowSection />

        {/* Principles & Privacy Commitments */}
        <TrustSection />

        {/* Dual-Mode Service Request Intake Flow */}
        <IntakeSection />
      </main>

      {/* Authoritative Business Footer */}
      <Footer />
    </div>
  );
}
