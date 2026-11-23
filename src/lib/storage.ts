import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

let cachedR2Client: S3Client | null = null;

function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_PUBLIC_URL
  );
}

function getR2Client(): S3Client {
  if (!cachedR2Client) {
    cachedR2Client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    });
  }
  return cachedR2Client;
}

export async function uploadImageAsset(
  buffer: Buffer,
  originalName: string,
  mimeType: string
): Promise<{ url: string; provider: "r2" | "local" }> {
  const safeExt =
    path.extname(originalName).toLowerCase() ||
    (mimeType === "image/png"
      ? ".png"
      : mimeType === "image/webp"
      ? ".webp"
      : mimeType === "image/avif"
      ? ".avif"
      : ".jpg");
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${safeExt}`;

  if (isR2Configured()) {
    const client = getR2Client();
    const key = `mqtech/${fileName}`;
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    const baseUrl = process.env.R2_PUBLIC_URL!.replace(/\/$/, "");
    return { url: `${baseUrl}/${key}`, provider: "r2" };
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, fileName), buffer);
  return { url: `/uploads/${fileName}`, provider: "local" };
}
