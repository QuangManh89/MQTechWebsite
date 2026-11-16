export interface DeviceTestMeta {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  iconName: string;
  path: string;
  badge?: string;
}

export const DEVICE_TESTS: DeviceTestMeta[] = [
  {
    id: "keyboard",
    title: "Kiểm Tra Bàn Phím (Keyboard Test)",
    shortTitle: "Bàn Phím",
    description: "Bố cục US ANSI cho PC và MacBook. Mỗi phím nhấn sẽ sáng lên, phát hiện kẹt phím và kiểm tra rollover đa phím.",
    iconName: "Keyboard",
    path: "/device-test/ban-phim",
    badge: "Phổ biến",
  },
  {
    id: "display",
    title: "Kiểm Tra Màn Hình (Display Test)",
    shortTitle: "Màn Hình",
    description: "Soi điểm chết (dead pixel), loang sáng, ám màu, dải xám, lưới căn chỉnh và độ giật hình bóng mờ.",
    iconName: "Monitor",
    path: "/device-test/man-hinh",
    badge: "Chuẩn xác",
  },
  {
    id: "speaker",
    title: "Kiểm Tra Loa (Speaker Test)",
    shortTitle: "Loa & Âm Thanh",
    description: "Quét dải trầm, bổng và phát các bản nhạc mẫu, kiểm tra kênh trái, phải và độ rè màng loa.",
    iconName: "Volume2",
    path: "/device-test/loa",
  },
  {
    id: "microphone",
    title: "Kiểm Tra Microphone (Mic Test)",
    shortTitle: "Microphone",
    description: "Đo mức âm theo thời gian thực (dBFS), ghi âm 5 giây và nghe lại để kiểm tra chất lượng thu âm.",
    iconName: "Mic",
    path: "/device-test/micro",
  },
  {
    id: "camera",
    title: "Kiểm Tra Camera (Webcam Test)",
    shortTitle: "Camera",
    description: "Xem trước hình ảnh, kiểm tra độ phân giải thực và chụp ảnh thử nghiệm ống kính webcam.",
    iconName: "Camera",
    path: "/device-test/camera",
  },
  {
    id: "benchmark",
    title: "Đo Hiệu Năng CPU & GPU (Benchmark)",
    shortTitle: "Benchmark",
    description: "Đo hiệu năng CPU, GPU bằng thuật toán song song (Web Workers + WebGL2): kiểm tra tải nhiệt và benchmark.",
    iconName: "Cpu",
    path: "/device-test/benchmark",
    badge: "Stress Test",
  },
];
