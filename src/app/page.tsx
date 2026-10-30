import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { ServicesSection } from "@/components/home/ServicesSection";
import { WorkflowSection } from "@/components/home/WorkflowSection";
import { IntakeShellSection } from "@/components/home/IntakeShellSection";
import { Footer } from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0B] text-white">
      {/* Top Sticky Glass Navigation */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* High-Impact Dark Hero with Ambient Lighting */}
        <Hero />

        {/* Light Daylight Canvas for Core Services (6 confirmed categories) */}
        <ServicesSection />

        {/* 4-Step Transparent Repair Workflow */}
        <WorkflowSection />

        {/* Dark Intake & Guidance Console Shell */}
        <IntakeShellSection />
      </main>

      {/* Authoritative Business Footer */}
      <Footer />
    </div>
  );
}
