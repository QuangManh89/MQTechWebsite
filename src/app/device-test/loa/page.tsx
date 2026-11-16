import type { Metadata } from "next";
import { DeviceTestLayout } from "@/components/device-test/DeviceTestLayout";
import { MqHwTestMount } from "@/components/device-test/MqHwTestMount";
import { DeviceTestCta } from "@/components/device-test/DeviceTestCta";

export const metadata: Metadata = {
  title: "Kiểm Tra Loa Máy Tính — Test Loa Trái Phải Stereo & Tần Số Âm Thanh | MQTech",
  description:
    "Công cụ kiểm tra loa máy tính và laptop online nguyên bản từ MQTech Buôn Ma Thuột. Kiểm tra tách kênh stereo loa trái (L), loa phải (R), quét tần số 20Hz - 20,000Hz và phát hiện rè loa.",
  keywords: [
    "test loa",
    "test loa trai phai",
    "speaker test online",
    "kiểm tra loa rè",
    "stereo sound test",
    "frequency sweep test",
    "MQTech",
  ],
};

export default function SpeakerTestPage() {
  return (
    <DeviceTestLayout
      title="Kiểm Tra Loa (Speaker Test)"
      description="Quét dải trầm, bổng và phát các bản nhạc mẫu, kiểm tra kênh trái, phải và độ rè màng loa."
    >
      <div className="space-y-6">
        <MqHwTestMount moduleId="speaker" />
        <DeviceTestCta
          testName="Loa &amp; Âm Thanh"
          hardwareHint="Loa laptop bị rè, mất tiếng một bên, âm thanh nhỏ bất thường hoặc cắm tai nghe không nhận? MQTech nhận thay loa laptop chính hãng, vệ sinh màng loa và sửa IC âm thanh tại Buôn Ma Thuột."
        />
      </div>
    </DeviceTestLayout>
  );
}
