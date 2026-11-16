import type { Metadata } from "next";
import { DeviceTestLayout } from "@/components/device-test/DeviceTestLayout";
import { MqHwTestMount } from "@/components/device-test/MqHwTestMount";
import { DeviceTestCta } from "@/components/device-test/DeviceTestCta";

export const metadata: Metadata = {
  title: "Đo Hiệu Năng CPU & GPU Online — Benchmark & Stress Test Máy Tính | MQTech",
  description:
    "Công cụ đo hiệu năng và kiểm tra tải nhiệt CPU, GPU máy tính online nguyên bản từ MQTech Buôn Ma Thuột. Sử dụng thuật toán tính toán đa luồng Web Workers và đồ họa WebGL2 chấm điểm hiệu năng.",
  keywords: [
    "benchmark máy tính online",
    "test cpu online",
    "stress test gpu",
    "đo hiệu năng máy tính",
    "kiểm tra tản nhiệt laptop",
    "MQTech",
  ],
};

export default function BenchmarkTestPage() {
  return (
    <DeviceTestLayout
      title="Đo Hiệu Năng CPU &amp; GPU (Benchmark)"
      description="Đo hiệu năng CPU, GPU bằng thuật toán song song (Web Workers + WebGL2): kiểm tra tải nhiệt và benchmark."
    >
      <div className="space-y-6">
        <MqHwTestMount moduleId="benchmark" />
        <DeviceTestCta
          testName="CPU, GPU &amp; Tản Nhiệt"
          hardwareHint="Máy tính chạy chậm, đơ lag, quạt kêu rít to, sập nguồn đột ngột khi mở game hoặc phần mềm nặng? MQTech cung cấp dịch vụ vệ sinh máy tính tra keo tản nhiệt gốm/kim loại cao cấp và nâng cấp RAM/SSD giá tốt tại BMT."
        />
      </div>
    </DeviceTestLayout>
  );
}
