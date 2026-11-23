import nodemailer from "nodemailer";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface NotificationMessage {
  title: string;
  lines: string[];
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function dispatchNotification(
  msg: NotificationMessage
): Promise<{ telegramSent: boolean; emailSent: boolean; errors: string[] }> {
  const errors: string[] = [];
  let telegramSent = false;
  let emailSent = false;

  const settingsRows = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, 1))
    .limit(1);
  const settings = settingsRows[0];
  if (!settings) return { telegramSent, emailSent, errors };

  const botToken = settings.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || "";
  const chatId = settings.telegramChatId || process.env.TELEGRAM_CHAT_ID || "";

  if (settings.enableTelegram && botToken && chatId) {
    try {
      const safeTitle = escapeHtml(msg.title);
      const safeLines = msg.lines.map((l) => escapeHtml(l)).join("\n");
      const text = `<b>${safeTitle}</b>\n\n${safeLines}`;
      const res = await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(8000),
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: "HTML",
          }),
        }
      );
      if (!res.ok) {
        errors.push(`Telegram error: ${res.status}`);
      } else {
        telegramSent = true;
      }
    } catch (err) {
      errors.push(
        `Telegram exception: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  const smtpHost = settings.smtpHost || process.env.SMTP_HOST || "";
  const smtpUser = settings.smtpUser || process.env.SMTP_USER || "";
  const smtpPass = settings.smtpPass || process.env.SMTP_PASS || "";
  const mailTo = settings.notifyEmailTo || settings.email;

  if (settings.enableEmail && smtpHost && smtpUser && smtpPass && mailTo) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: settings.smtpPort || 587,
        secure: (settings.smtpPort || 587) === 465,
        auth: { user: smtpUser, pass: smtpPass },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 10000,
      });

      const safeTitle = escapeHtml(msg.title);
      const safeListItems = msg.lines
        .map((l) => `<li>${escapeHtml(l)}</li>`)
        .join("");

      await transporter.sendMail({
        from: `"${settings.brandName.replace(/"/g, "")}" <${smtpUser}>`,
        to: mailTo,
        subject: `[${settings.brandName}] ${msg.title}`,
        text: `${msg.title}\n\n${msg.lines.join("\n")}`,
        html: `<div style="font-family:sans-serif;line-height:1.6;color:#0f172a">
          <h2 style="color:#2563eb">${safeTitle}</h2>
          <ul>${safeListItems}</ul>
        </div>`,
      });
      emailSent = true;
    } catch (err) {
      errors.push(
        `Email exception: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  return { telegramSent, emailSent, errors };
}
