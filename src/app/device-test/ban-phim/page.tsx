import type { Metadata } from "next";
import { DeviceTestLayout } from "@/components/device-test/DeviceTestLayout";
import { MqHwTestMount } from "@/components/device-test/MqHwTestMount";
import { DeviceTestCta } from "@/components/device-test/DeviceTestCta";

export const metadata: Metadata = {
  title: "Kiểm Tra Bàn Phím Online — Test Keyboard Laptop & PC Chuẩn US ANSI | MQTech",
  description:
    "Công cụ kiểm tra bàn phím online nguyên bản từ MQTech Buôn Ma Thuột. Chẩn đoán phím liệt, kẹt phím, dính phím và kiểm tra tính năng anti-ghosting đa phím cho laptop và máy tính bàn.",
  keywords: [
    "test ban phim",
    "kiểm tra bàn phím online",
    "keyboard tester online",
    "test phím laptop",
    "phím liệt",
    "ghosting bàn phím",
    "MQTech",
  ],
};

export default function KeyboardTestPage() {
  return (
    <DeviceTestLayout
      title="Kiểm Tra Bàn Phím (Keyboard Test)"
      description="Bố cục US ANSI cho PC và MacBook. Mỗi phím nhấn sẽ sáng lên, phát hiện kẹt phím và kiểm tra rollover đa phím."
    >
      <div className="space-y-6">
        <MqHwTestMount moduleId="keyboard" />
        <DeviceTestCta
          testName="Bàn Phím"
          hardwareHint="Phát hiện phím liệt, gõ bị dính chữ (chattering), đổ nước vào phím hoặc chập mạch bàn phím laptop? Kỹ thuật viên MQTech hỗ trợ thay bàn phím zin bảo hành 6 - 12 tháng tại Buôn Ma Thuột."
        />
      </div>
    </DeviceTestLayout>
  );
}
