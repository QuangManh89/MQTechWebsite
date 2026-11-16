import type { Metadata } from "next";
import { DeviceTestLayout } from "@/components/device-test/DeviceTestLayout";
import { MqHwTestMount } from "@/components/device-test/MqHwTestMount";
import { DeviceTestCta } from "@/components/device-test/DeviceTestCta";

export const metadata: Metadata = {
  title: "Kiểm Tra Camera / Webcam Online — Test Webcam Laptop & PC Trực Tiếp | MQTech",
  description:
    "Công cụ kiểm tra webcam máy tính và camera laptop online nguyên bản từ MQTech Buôn Ma Thuột. Xem trước luồng video, kiểm tra độ phân giải Full HD/HD và chụp ảnh chẩn đoán trực tiếp.",
  keywords: [
    "test camera",
    "test webcam online",
    "kiểm tra camera laptop",
    "webcam test",
    "test webcam pc",
    "MQTech",
  ],
};

export default function CameraTestPage() {
  return (
    <DeviceTestLayout
      title="Kiểm Tra Camera (Webcam Test)"
      description="Xem trước hình ảnh, kiểm tra độ phân giải thực và chụp ảnh thử nghiệm ống kính webcam."
    >
      <div className="space-y-6">
        <MqHwTestMount moduleId="camera" />
        <DeviceTestCta
          testName="Camera &amp; Webcam"
          hardwareHint="Camera laptop không nhận diện, hình ảnh bị mờ sương, sọc màu hoặc đèn camera sáng liên tục? MQTech nhận kiểm tra cáp màn hình webcam, thay thế camera laptop chính hãng bảo hành dài lâu tại Buôn Ma Thuột."
        />
      </div>
    </DeviceTestLayout>
  );
}
