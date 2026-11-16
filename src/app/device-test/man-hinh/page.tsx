import type { Metadata } from "next";
import { DeviceTestLayout } from "@/components/device-test/DeviceTestLayout";
import { MqHwTestMount } from "@/components/device-test/MqHwTestMount";
import { DeviceTestCta } from "@/components/device-test/DeviceTestCta";

export const metadata: Metadata = {
  title: "Kiểm Tra Màn Hình — Test Điểm Chết Dead Pixel & Hở Sáng Online | MQTech",
  description:
    "Công cụ kiểm tra màn hình máy tính và laptop online nguyên bản từ MQTech Buôn Ma Thuột. Soi điểm chết (dead pixel), điểm kẹt sáng, dải xám, độ tương phản và hở sáng góc IPS toàn màn hình.",
  keywords: [
    "test man hinh",
    "kiểm tra điểm chết màn hình",
    "dead pixel test online",
    "test hở sáng màn hình",
    "screen test",
    "MQTech",
  ],
};

export default function DisplayTestPage() {
  return (
    <DeviceTestLayout
      title="Kiểm Tra Màn Hình (Display Test)"
      description="Điểm chết, loang sáng, dải xám, lưới căn chỉnh, độ nét chữ và độ giật hình / bóng mờ (ghosting)."
    >
      <div className="space-y-6">
        <MqHwTestMount moduleId="display" />
        <DeviceTestCta
          testName="Màn Hình"
          hardwareHint="Phát hiện màn hình bị sọc chỉ, đốm sáng phản quang, chảy mực, ám màu nặng hoặc vỡ kính? MQTech chuyên thay màn hình laptop Full HD/2K/OLED zin chính hãng, lấy liền tại Buôn Ma Thuột."
        />
      </div>
    </DeviceTestLayout>
  );
}
