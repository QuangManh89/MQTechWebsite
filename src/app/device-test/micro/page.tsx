import type { Metadata } from "next";
import { DeviceTestLayout } from "@/components/device-test/DeviceTestLayout";
import { MqHwTestMount } from "@/components/device-test/MqHwTestMount";
import { DeviceTestCta } from "@/components/device-test/DeviceTestCta";

export const metadata: Metadata = {
  title: "Kiểm Tra Microphone Online — Test Mic & Thu Âm Thử Laptop, PC | MQTech",
  description:
    "Công cụ kiểm tra microphone máy tính và laptop online nguyên bản từ MQTech Buôn Ma Thuột. Đo cường độ âm thanh thời gian thực (dBFS), thu âm thử nghiệm 5 giây và nghe lại chất lượng âm thanh.",
  keywords: [
    "test micro",
    "test mic online",
    "microphone test",
    "kiểm tra mic laptop",
    "thu am test mic",
    "MQTech",
  ],
};

export default function MicrophoneTestPage() {
  return (
    <DeviceTestLayout
      title="Kiểm Tra Microphone (Mic Test)"
      description="Đo mức âm theo thời gian thực, ghi âm 5 giây và nghe lại để kiểm tra chất lượng thu âm."
    >
      <div className="space-y-6">
        <MqHwTestMount moduleId="microphone" />
        <DeviceTestCta
          testName="Microphone"
          hardwareHint="Microphone laptop nói người khác không nghe thấy, âm thanh bị rè, nghẹt tiếng hoặc chập chờn khi gọi Zalo/Zoom/Meet? MQTech nhận kiểm tra cáp micro, thay cụm micro webcam chính hãng lấy ngay tại BMT."
        />
      </div>
    </DeviceTestLayout>
  );
}
