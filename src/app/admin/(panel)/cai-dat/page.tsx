"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BellRing,
  KeyRound,
  RefreshCw,
  Save,
  Shield,
  Trash2,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import type { SiteSetting } from "@/db/schema";
import { ConfirmDialog } from "@/components/ui/ModalDialog";
import { BackupManagerSection } from "@/components/admin/BackupManagerSection";

interface AdminAccountRow {
  id: number;
  email: string;
  name: string;
  role: "ADMIN" | "EDITOR";
  createdAt: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<SiteSetting | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  // Account & Role Management state
  const [accounts, setAccounts] = useState<AdminAccountRow[]>([]);
  const [newAccountEmail, setNewAccountEmail] = useState("");
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountPassword, setNewAccountPassword] = useState("");
  const [newAccountRole, setNewAccountRole] = useState<"EDITOR" | "ADMIN">("EDITOR");
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState<AdminAccountRow | null>(null);
  const [resetPwUserId, setResetPwUserId] = useState<number | null>(null);
  const [resetPwValue, setResetPwValue] = useState("");

  const loadAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.users || []);
      }
    } catch {
      // Ignore silent error if not loaded yet
    }
  }, []);

  const loadSettings = useCallback(async () => {
    setLoadError(null);
    try {
      const res = await fetch("/api/admin/settings");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (res.status === 403) {
        router.replace("/admin/bai-viet");
        return;
      }
      if (!res.ok) {
        setLoadError("Không thể tải cấu hình hệ thống.");
        return;
      }
      const data = await res.json();
      setSettings(data.settings);
    } catch {
      setLoadError("Mất kết nối máy chủ khi tải cấu hình.");
    }
  }, [router]);

  useEffect(() => {
    void loadSettings();
    void loadAccounts();
  }, [loadSettings, loadAccounts]);

  async function handleCreateAccount() {
    if (!newAccountEmail.trim() || !newAccountName.trim() || newAccountPassword.length < 6) {
      toast.error("Vui lòng nhập Email, Tên hiển thị và Mật khẩu tối thiểu 6 ký tự.");
      return;
    }
    setCreatingAccount(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newAccountEmail.trim(),
          name: newAccountName.trim(),
          password: newAccountPassword,
          role: newAccountRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Không thể tạo tài khoản.");
        return;
      }
      toast.success(`Đã tạo tài khoản ${data.user.email} (${data.user.role === "EDITOR" ? "Biên tập viên" : "Admin"})`);
      setNewAccountEmail("");
      setNewAccountName("");
      setNewAccountPassword("");
      setNewAccountRole("EDITOR");
      await loadAccounts();
    } catch {
      toast.error("Lỗi kết nối khi tạo tài khoản.");
    } finally {
      setCreatingAccount(false);
    }
  }

  async function handleResetUserPassword(userId: number) {
    if (resetPwValue.length < 6) {
      toast.error("Mật khẩu mới cần ít nhất 6 ký tự.");
      return;
    }
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, password: resetPwValue }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Không thể đổi mật khẩu.");
        return;
      }
      toast.success("Đã cập nhật mật khẩu cho tài khoản.");
      setResetPwUserId(null);
      setResetPwValue("");
    } catch {
      toast.error("Lỗi mạng khi đổi mật khẩu.");
    }
  }

  async function handleDeleteAccount(id: number) {
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Không thể xóa tài khoản.");
        return;
      }
      toast.success("Đã xóa tài khoản.");
      await loadAccounts();
    } catch {
      toast.error("Lỗi mạng khi xóa tài khoản.");
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    if (newPassword && newPassword.length < 6) {
      toast.error("Mật khẩu mới cần ít nhất 6 ký tự.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, newPassword }),
      });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setNewPassword("");
        toast.success("Đã lưu toàn bộ cấu hình website!");
      } else {
        toast.error("Không thể lưu cấu hình");
      }
    } catch {
      toast.error("Lỗi kết nối mạng khi lưu cấu hình");
    } finally {
      setSaving(false);
    }
  }

  async function handleTestNotify() {
    setTesting(true);
    try {
      const res = await fetch("/api/admin/settings", { method: "POST" });
      const data = await res.json();
      if (data.telegramSent || data.emailSent) {
        toast.success(
          `Đã gửi thử: ${data.telegramSent ? "Telegram OK" : ""} ${
            data.emailSent ? "Email OK" : ""
          }`.trim()
        );
      } else {
        toast.error(
          data.errors?.[0] ||
            "Chưa bật hoặc chưa điền đủ Bot Token / SMTP để gửi thử (hãy bấm Lưu tất cả trước khi gửi thử)."
        );
      }
    } catch {
      toast.error("Lỗi mạng khi gửi thử thông báo.");
    } finally {
      setTesting(false);
    }
  }

  if (loadError) {
    return (
      <div
        role="alert"
        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-status-danger-line bg-status-danger-bg p-5 text-sm text-status-danger-ink"
      >
        <span className="inline-flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-status-danger-ink" aria-hidden="true" />
          {loadError}
        </span>
        <button
          type="button"
          onClick={() => void loadSettings()}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-status-danger-solid px-4 py-2 text-xs font-semibold text-ink-inverse hover:bg-status-danger-hover"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Thử lại</span>
        </button>
      </div>
    );
  }

  if (!settings) {
    return <p className="text-sm text-ink-muted">Đang tải cấu hình...</p>;
  }

  return (
    <div className="max-w-4xl space-y-8">
      <form onSubmit={handleSave} className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy">
            Cài đặt Thương hiệu &amp; Thông báo
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Thay đổi tên thương hiệu, hotline, tên miền và kênh báo lịch tự
            động.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-ink-inverse shadow-sm hover:bg-brand-hover disabled:opacity-60"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          <span>{saving ? "Đang lưu..." : "Lưu tất cả"}</span>
        </button>
      </div>

      {/* Thương hiệu & Liên hệ */}
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-card space-y-4 text-sm">
        <h2 className="font-heading text-lg font-bold text-navy">
          1. Thông tin thương hiệu &amp; Địa điểm BMT
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="settingBrandName"
              className="block text-xs font-semibold text-ink-muted mb-1"
            >
              Tên thương hiệu
            </label>
            <input
              id="settingBrandName"
              maxLength={100}
              value={settings.brandName}
              onChange={(e) =>
                setSettings({ ...settings, brandName: e.target.value })
              }
              className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5"
            />
          </div>
          <div>
            <label
              htmlFor="settingSubTagline"
              className="block text-xs font-semibold text-ink-muted mb-1"
            >
              Định vị phụ dưới Logo
            </label>
            <input
              id="settingSubTagline"
              maxLength={120}
              value={settings.subTagline}
              onChange={(e) =>
                setSettings({ ...settings, subTagline: e.target.value })
              }
              className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="settingSlogan"
            className="block text-xs font-semibold text-ink-muted mb-1"
          >
            Slogan
          </label>
          <input
            id="settingSlogan"
            maxLength={200}
            value={settings.slogan}
            onChange={(e) =>
              setSettings({ ...settings, slogan: e.target.value })
            }
            className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="settingHotline"
              className="block text-xs font-semibold text-ink-muted mb-1"
            >
              Hotline
            </label>
            <input
              id="settingHotline"
              maxLength={25}
              value={settings.hotline}
              onChange={(e) =>
                setSettings({ ...settings, hotline: e.target.value })
              }
              className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 font-mono"
            />
          </div>
          <div>
            <label
              htmlFor="settingPrefix"
              className="block text-xs font-semibold text-ink-muted mb-1"
            >
              Tiền tố mã phiếu
            </label>
            <input
              id="settingPrefix"
              maxLength={10}
              value={settings.ticketPrefix}
              onChange={(e) =>
                setSettings({ ...settings, ticketPrefix: e.target.value })
              }
              className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 font-mono uppercase"
            />
          </div>
          <div>
            <label
              htmlFor="settingDiscount"
              className="block text-xs font-semibold text-ink-muted mb-1"
            >
              Ưu đãi đặt online
            </label>
            <input
              id="settingDiscount"
              maxLength={40}
              value={settings.bookingDiscount}
              onChange={(e) =>
                setSettings({ ...settings, bookingDiscount: e.target.value })
              }
              className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 font-mono"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="settingAddress"
              className="block text-xs font-semibold text-ink-muted mb-1"
            >
              Địa chỉ cửa hàng
            </label>
            <input
              id="settingAddress"
              maxLength={250}
              value={settings.address}
              onChange={(e) =>
                setSettings({ ...settings, address: e.target.value })
              }
              className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5"
            />
          </div>
          <div>
            <label
              htmlFor="settingSiteUrl"
              className="block text-xs font-semibold text-ink-muted mb-1"
            >
              Tên miền chính thức (VD: https://mqtechbmt.vn)
            </label>
            <input
              id="settingSiteUrl"
              type="url"
              maxLength={150}
              value={settings.siteUrl}
              onChange={(e) =>
                setSettings({ ...settings, siteUrl: e.target.value })
              }
              placeholder="https://..."
              className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="settingHours"
              className="block text-xs font-semibold text-ink-muted mb-1"
            >
              Giờ mở cửa
            </label>
            <input
              id="settingHours"
              maxLength={150}
              value={settings.workingHours}
              onChange={(e) =>
                setSettings({ ...settings, workingHours: e.target.value })
              }
              className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="settingReceivedCount"
                className="block text-xs font-semibold text-ink-muted mb-1"
              >
                Ca tiếp nhận hôm nay
              </label>
              <input
                id="settingReceivedCount"
                type="number"
                min={0}
                value={settings.todayReceivedCount}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    todayReceivedCount: Number(e.target.value),
                  })
                }
                className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 font-mono"
              />
            </div>
            <div>
              <label
                htmlFor="settingSlotsLeft"
                className="block text-xs font-semibold text-ink-muted mb-1"
              >
                Slot trống còn lại
              </label>
              <input
                id="settingSlotsLeft"
                type="number"
                min={0}
                value={settings.todaySlotsLeft}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    todaySlotsLeft: Number(e.target.value),
                  })
                }
                className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 pt-2">
          <label className="inline-flex min-h-11 items-center gap-2 font-semibold text-navy">
            <input
              type="checkbox"
              checked={settings.isOpen}
              onChange={(e) =>
                setSettings({ ...settings, isOpen: e.target.checked })
              }
            />
            <span>Hiển thị trạng thái Đang mở cửa</span>
          </label>
          <label className="inline-flex min-h-11 items-center gap-2 font-semibold text-navy">
            <input
              type="checkbox"
              checked={settings.showExactPrices}
              onChange={(e) =>
                setSettings({ ...settings, showExactPrices: e.target.checked })
              }
            />
            <span>Hiển thị con số giá cụ thể trên web</span>
          </label>
        </div>
      </div>

      {/* Telegram & Email */}
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-card space-y-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-lg font-bold text-navy">
            2. Thông báo tức thì Telegram Bot &amp; Email
          </h2>
          <button
            type="button"
            disabled={testing}
            onClick={() => void handleTestNotify()}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-brand px-4 py-2 text-xs font-semibold text-brand hover:bg-brand-light disabled:opacity-60"
          >
            <BellRing className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{testing ? "Đang gửi..." : "Gửi thử thông báo"}</span>
          </button>
        </div>

        <label className="inline-flex min-h-11 items-center gap-2 font-semibold text-navy">
          <input
            type="checkbox"
            checked={settings.enableTelegram}
            onChange={(e) =>
              setSettings({ ...settings, enableTelegram: e.target.checked })
            }
          />
          <span>Bật thông báo Telegram Bot khi có khách đặt lịch</span>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="settingTgToken"
              className="block text-xs font-semibold text-ink-muted mb-1"
            >
              Telegram Bot Token
            </label>
            <input
              id="settingTgToken"
              placeholder="123456789:ABCdef..."
              value={settings.telegramBotToken}
              onChange={(e) =>
                setSettings({ ...settings, telegramBotToken: e.target.value })
              }
              className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 font-mono text-xs"
            />
          </div>
          <div>
            <label
              htmlFor="settingTgChat"
              className="block text-xs font-semibold text-ink-muted mb-1"
            >
              Telegram Chat ID
            </label>
            <input
              id="settingTgChat"
              placeholder="-100123456789"
              value={settings.telegramChatId}
              onChange={(e) =>
                setSettings({ ...settings, telegramChatId: e.target.value })
              }
              className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 font-mono text-xs"
            />
          </div>
        </div>

        <label className="inline-flex min-h-11 items-center gap-2 font-semibold text-navy pt-2">
          <input
            type="checkbox"
            checked={settings.enableEmail}
            onChange={(e) =>
              setSettings({ ...settings, enableEmail: e.target.checked })
            }
          />
          <span>Bật thông báo qua Email SMTP</span>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="settingSmtpHost"
              className="block text-xs font-semibold text-ink-muted mb-1"
            >
              SMTP Host
            </label>
            <input
              id="settingSmtpHost"
              placeholder="smtp.gmail.com"
              value={settings.smtpHost}
              onChange={(e) =>
                setSettings({ ...settings, smtpHost: e.target.value })
              }
              className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 text-xs"
            />
          </div>
          <div>
            <label
              htmlFor="settingNotifyEmail"
              className="block text-xs font-semibold text-ink-muted mb-1"
            >
              Email nhận thông báo
            </label>
            <input
              id="settingNotifyEmail"
              type="email"
              placeholder="manhquang89@gmail.com"
              value={settings.notifyEmailTo}
              onChange={(e) =>
                setSettings({ ...settings, notifyEmailTo: e.target.value })
              }
              className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 text-xs"
            />
          </div>
          <div>
            <label
              htmlFor="settingSmtpUser"
              className="block text-xs font-semibold text-ink-muted mb-1"
            >
              SMTP User
            </label>
            <input
              id="settingSmtpUser"
              placeholder="email@gmail.com"
              value={settings.smtpUser}
              onChange={(e) =>
                setSettings({ ...settings, smtpUser: e.target.value })
              }
              className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 text-xs"
            />
          </div>
          <div>
            <label
              htmlFor="settingSmtpPass"
              className="block text-xs font-semibold text-ink-muted mb-1"
            >
              SMTP App Password
            </label>
            <input
              id="settingSmtpPass"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••••••"
              value={settings.smtpPass}
              onChange={(e) =>
                setSettings({ ...settings, smtpPass: e.target.value })
              }
              className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Cấu hình SEO & Google Webmaster */}
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-card space-y-4 text-sm">
        <div>
          <h2 className="font-heading text-lg font-bold text-navy">
            3. Cấu hình SEO, Google Search Console &amp; Bản đồ Google Maps
          </h2>
          <p className="text-xs text-ink-muted mt-1">
            Kết nối trực tiếp website với Google Search Console, Google Analytics 4 và bản đồ định vị tại TP. Buôn Ma Thuột mà không cần chỉnh sửa mã nguồn.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="settingGoogleVerification"
              className="block text-xs font-semibold text-ink-muted mb-1"
            >
              Google Search Console Verification (Mã hoặc thẻ &lt;meta&gt;)
            </label>
            <input
              id="settingGoogleVerification"
              type="text"
              placeholder='VD: xYz123... hoặc dán nguyên thẻ <meta name="google-site-verification" ... />'
              value={settings.googleSiteVerification ?? ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  googleSiteVerification: e.target.value,
                })
              }
              className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 font-mono text-xs"
            />
          </div>
          <div>
            <label
              htmlFor="settingGa4Id"
              className="block text-xs font-semibold text-ink-muted mb-1"
            >
              Mã Google Analytics 4 (Measurement ID)
            </label>
            <input
              id="settingGa4Id"
              type="text"
              placeholder="VD: G-XXXXXXXXXX"
              value={settings.googleAnalyticsId ?? ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  googleAnalyticsId: e.target.value,
                })
              }
              className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 font-mono text-xs"
            />
          </div>
          <div className="sm:col-span-2">
            <label
              htmlFor="settingMapsEmbed"
              className="block text-xs font-semibold text-ink-muted mb-1"
            >
              Mã nhúng Google Maps (Dán link embed hoặc nguyên thẻ &lt;iframe&gt; từ Google Maps)
            </label>
            <input
              id="settingMapsEmbed"
              type="text"
              placeholder='VD: https://www.google.com/maps/embed?pb=... hoặc dán thẻ <iframe src="..." ...>'
              value={settings.googleMapsEmbedUrl ?? ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  googleMapsEmbedUrl: e.target.value,
                })
              }
              className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 font-mono text-xs"
            />
            <p className="text-[11px] text-ink-subtle mt-1">
              Mở Google Maps → Chọn vị trí cửa hàng MQTech → Chia sẻ → Nhúng bản đồ → Sao chép HTML rồi dán vào ô trên.
            </p>
          </div>
        </div>
      </div>

      {/* Đổi mật khẩu Admin */}
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-card space-y-3 text-sm">
        <h2 className="font-heading text-lg font-bold text-navy">
          4. Bảo mật tài khoản Admin
        </h2>
        <div>
          <label
            htmlFor="settingNewPass"
            className="block text-xs font-semibold text-ink-muted mb-1"
          >
            Đổi mật khẩu mới (để trống nếu giữ nguyên)
          </label>
          <input
            id="settingNewPass"
            type="password"
            minLength={6}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Tối thiểu 6 ký tự"
            className="min-h-11 w-full max-w-md rounded-xl border border-line px-3.5 py-2.5"
          />
        </div>
      </div>
      </form>

      {/* 5. Quản lý tài khoản & Phân quyền (Admin / Biên tập viên) */}
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-card space-y-5 text-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-lg font-bold text-navy flex items-center gap-2">
              <Shield className="h-5 w-5 text-brand" aria-hidden="true" />
              <span>5. Quản lý tài khoản &amp; Phân quyền (Admin / Biên tập viên)</span>
            </h2>
            <p className="text-xs text-ink-muted mt-1">
              Tài khoản <strong>Biên tập viên (EDITOR)</strong> chỉ truy cập được mục <em>Bài viết SEO</em> và <em>Dịch vụ</em> (được thêm/sửa bài, chặn quyền xóa bài cũ và ẩn toàn bộ Đơn hàng, Bảng giá, Cài đặt).
            </p>
          </div>
        </div>

        {/* Form tạo tài khoản mới */}
        <div className="rounded-xl border border-line bg-surface-subtle p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-1.5">
            <UserPlus className="h-4 w-4 text-brand" aria-hidden="true" />
            <span>Tạo tài khoản mới</span>
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="newAccName" className="block text-[11px] font-semibold text-ink-muted mb-1">
                Tên hiển thị *
              </label>
              <input
                id="newAccName"
                type="text"
                placeholder="VD: CTV Viết Bài BMT"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label htmlFor="newAccEmail" className="block text-[11px] font-semibold text-ink-muted mb-1">
                Email đăng nhập *
              </label>
              <input
                id="newAccEmail"
                type="email"
                placeholder="vietbai@suamaytinhbmt.id.vn"
                value={newAccountEmail}
                onChange={(e) => setNewAccountEmail(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label htmlFor="newAccPass" className="block text-[11px] font-semibold text-ink-muted mb-1">
                Mật khẩu (≥ 6 ký tự) *
              </label>
              <input
                id="newAccPass"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                value={newAccountPassword}
                onChange={(e) => setNewAccountPassword(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label htmlFor="newAccRole" className="block text-[11px] font-semibold text-ink-muted mb-1">
                Phân quyền
              </label>
              <select
                id="newAccRole"
                value={newAccountRole}
                onChange={(e) => setNewAccountRole(e.target.value === "ADMIN" ? "ADMIN" : "EDITOR")}
                className="min-h-11 w-full rounded-xl border border-line bg-surface px-3 py-2 text-xs font-medium"
              >
                <option value="EDITOR">Biên tập viên (Chỉ viết bài &amp; dịch vụ)</option>
                <option value="ADMIN">Admin chính (Toàn quyền)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              disabled={creatingAccount}
              onClick={() => void handleCreateAccount()}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 py-2 text-xs font-semibold text-ink-inverse shadow-sm hover:bg-brand-hover disabled:opacity-60"
            >
              <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{creatingAccount ? "Đang tạo..." : "Tạo tài khoản"}</span>
            </button>
          </div>
        </div>

        {/* Danh sách tài khoản hiện có */}
        <div className="space-y-2.5">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex flex-col gap-3 rounded-xl border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-heading font-bold text-navy">{acc.name}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      acc.role === "EDITOR"
                        ? "bg-brand-light text-brand"
                        : "bg-status-success-bg text-status-success-ink"
                    }`}
                  >
                    {acc.role === "EDITOR" ? "Biên tập viên (Bài viết & Dịch vụ)" : "Admin chính"}
                  </span>
                </div>
                <p className="font-mono text-xs text-ink-muted truncate">{acc.email}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {resetPwUserId === acc.id ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="password"
                      placeholder="Mật khẩu mới..."
                      value={resetPwValue}
                      onChange={(e) => setResetPwValue(e.target.value)}
                      className="min-h-10 w-36 rounded-lg border border-line px-2.5 py-1.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => void handleResetUserPassword(acc.id)}
                      className="min-h-10 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-ink-inverse hover:bg-brand-hover"
                    >
                      Lưu
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setResetPwUserId(null);
                        setResetPwValue("");
                      }}
                      className="min-h-10 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-ink-muted hover:text-navy"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setResetPwUserId(acc.id);
                      setResetPwValue("");
                    }}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-navy hover:border-brand hover:text-brand"
                  >
                    <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Đổi MK</span>
                  </button>
                )}

                {acc.role === "EDITOR" && (
                  <button
                    type="button"
                    aria-label={`Xóa tài khoản ${acc.email}`}
                    onClick={() => setDeletingAccount(acc)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink-subtle hover:bg-status-danger-bg hover:text-status-danger-ink"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <BackupManagerSection />

      <ConfirmDialog
        open={Boolean(deletingAccount)}
        onOpenChange={(open) => {
          if (!open) setDeletingAccount(null);
        }}
        title="Xóa tài khoản này?"
        description={
          deletingAccount
            ? `Tài khoản ${deletingAccount.email} (${deletingAccount.name}) sẽ không còn đăng nhập được vào trang quản trị.`
            : ""
        }
        confirmLabel="Xác nhận xóa"
        onConfirm={async () => {
          if (deletingAccount) {
            await handleDeleteAccount(deletingAccount.id);
            setDeletingAccount(null);
          }
        }}
      />
    </div>
  );
}
