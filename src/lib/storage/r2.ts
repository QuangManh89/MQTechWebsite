/**
 * MQTech Cloudflare R2 Media & Storage Module (Three Distinct Buckets Architecture)
 * 
 * BUCKET TOPOLOGY (Physical Separation):
 * 1. mqtech-media-staging: PUBLIC access only for approved marketing/service media.
 * 2. mqtech-attachments-staging: STRICTLY PRIVATE. Customer equipment photos, invoices, serials.
 *    NO r2.dev domain, NO public custom domain. Accessible ONLY via authenticated admin presigned GET.
 * 3. mqtech-db-backups-staging: STRICTLY PRIVATE. Encrypted database dumps only.
 * 
 * SECURITY PRINCIPLES:
 * - Direct-to-bucket client uploads (bypasses Next.js server memory, protecting 256MB Machine).
 * - Restrictive MIME allowlist (JPEG, PNG, WebP, AVIF). Strictly rejects SVG and binaries.
 * - Enforces file size limits (default 5MB).
 * - Cryptographically random unique object keys.
 * - Standard AWS S3 SigV4 presigned PUT & GET URL generation using Node.js crypto (zero external dependencies).
 * - Exact CORS policy specification for Cloudflare R2 bucket.
 */

import { createHmac, createHash, randomUUID } from "node:crypto";
import { getAppConfig } from "../env.ts";
import type { Article } from "../db/types.ts";

export type MediaVisibility = "PUBLIC" | "PRIVATE";
export type MediaCategory = "MARKETING" | "SERVICE_ASSET" | "CUSTOMER_ATTACHMENT";

export const DEFAULT_MEDIA_BUCKET = "mqtech-media-staging";
export const DEFAULT_ATTACHMENTS_BUCKET = "mqtech-attachments-staging";
export const DEFAULT_BACKUPS_BUCKET = "mqtech-db-backups-staging";

export const ALLOWED_MEDIA_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export const FORBIDDEN_MIME_TYPES = new Set([
  "image/svg+xml",
  "application/x-executable",
  "application/javascript",
  "text/html",
  "application/zip",
]);

export const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export interface MediaUploadRequest {
  fileName: string;
  contentType: string;
  sizeBytes: number;
  visibility?: MediaVisibility;
  category?: MediaCategory;
}

export interface MediaUploadValidation {
  valid: boolean;
  error?: string;
  sanitizedFileName?: string;
  extension?: string;
  visibility: MediaVisibility;
  category: MediaCategory;
  targetBucket: string;
}

export interface PresignedPutResult {
  uploadUrl: string;
  objectKey: string;
  mediaId: string;
  bucketName: string;
  publicUrl: string | null;
  visibility: MediaVisibility;
  category: MediaCategory;
  expiresInSeconds: number;
}

/**
 * Standard CORS configuration for Cloudflare R2 buckets.
 * Restricts origin strictly to the approved staging/production host.
 */
export const R2_CORS_CONFIGURATION = {
  rules: [
    {
      AllowedOrigins: [
        "https://mqtech.fly.dev",
        ...(process.env.NODE_ENV !== "production" ? ["http://localhost:3000", "http://127.0.0.1:3000"] : []),
      ],
      AllowedMethods: ["GET", "PUT", "HEAD"],
      AllowedHeaders: ["content-type", "x-amz-date", "x-amz-content-sha256", "authorization"],
      ExposeHeaders: ["ETag"],
      MaxAgeSeconds: 3600,
    },
  ],
};

/**
 * Determines the target bucket based on category and visibility.
 * Enforces physical bucket separation:
 * - CUSTOMER_ATTACHMENT or PRIVATE -> mqtech-attachments-staging (private)
 * - MARKETING / SERVICE_ASSET with PUBLIC -> mqtech-media-staging (public)
 */
export function getR2BucketForUpload(category: MediaCategory, visibility: MediaVisibility): string {
  const config = getAppConfig();
  if (category === "CUSTOMER_ATTACHMENT" || visibility === "PRIVATE") {
    return config.r2AttachmentsBucket;
  }
  return config.r2MediaBucket;
}

/**
 * Asserts that a bucket is allowed to have public access.
 * Throws security exception if bucket is attachments or backups.
 */
export function assertBucketPublicAccessAllowed(bucketName: string): void {
  const config = getAppConfig();
  if (
    bucketName === config.r2AttachmentsBucket ||
    bucketName === config.r2BackupBucket ||
    bucketName.includes("attachment") ||
    bucketName.includes("backup")
  ) {
    throw new Error(
      `Security Violation: Public access is strictly forbidden on private bucket '${bucketName}'.`
    );
  }
}

/**
 * Validates media upload request against security and privacy rules.
 */
export function validateMediaUpload(
  request: MediaUploadRequest,
  maxSize: number = DEFAULT_MAX_FILE_SIZE
): MediaUploadValidation {
  const { fileName, contentType, sizeBytes } = request;
  const category: MediaCategory = request.category || "CUSTOMER_ATTACHMENT";
  
  // Enforce Privacy Boundary: Customer attachments default to and MUST remain PRIVATE
  const visibility: MediaVisibility =
    category === "CUSTOMER_ATTACHMENT" ? "PRIVATE" : (request.visibility || "PUBLIC");

  const targetBucket = getR2BucketForUpload(category, visibility);

  if (!fileName || typeof fileName !== "string") {
    return { valid: false, error: "Tên tệp không hợp lệ.", visibility, category, targetBucket };
  }

  // Reject path traversal and control characters
  if (/[/\\]|\.\./.test(fileName) || /[\x00-\x1F]/.test(fileName)) {
    return {
      valid: false,
      error: "Tên tệp chứa ký tự không hợp lệ hoặc cố gắng path traversal.",
      visibility,
      category,
      targetBucket,
    };
  }

  const normalizedMime = (contentType || "").toLowerCase().trim();

  // Explicit SVG and dangerous format rejection
  if (FORBIDDEN_MIME_TYPES.has(normalizedMime) || normalizedMime.includes("svg")) {
    return {
      valid: false,
      error: "Định dạng SVG và các định dạng thực thi bị nghiêm cấm để phòng chống tấn công Stored XSS.",
      visibility,
      category,
      targetBucket,
    };
  }

  // Strict MIME allowlist check
  if (!ALLOWED_MEDIA_MIME_TYPES.has(normalizedMime)) {
    return {
      valid: false,
      error: `Định dạng tệp không được hỗ trợ (${normalizedMime}). Chỉ chấp nhận JPEG, PNG, WebP, AVIF.`,
      visibility,
      category,
      targetBucket,
    };
  }

  // File size validation
  if (!sizeBytes || typeof sizeBytes !== "number" || sizeBytes <= 0) {
    return { valid: false, error: "Kích thước tệp không hợp lệ.", visibility, category, targetBucket };
  }

  if (sizeBytes > maxSize) {
    const maxMb = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `Dung lượng tệp vượt quá giới hạn cho phép (${maxMb}MB).`,
      visibility,
      category,
      targetBucket,
    };
  }

  const expectedExt = MIME_TO_EXT[normalizedMime] || "bin";
  const baseName = fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40);
  const sanitizedFileName = `${baseName}.${expectedExt}`;

  return {
    valid: true,
    sanitizedFileName,
    extension: expectedExt,
    visibility,
    category,
    targetBucket,
  };
}

/**
 * Generates structured, unique object key for R2 storage.
 * - Private attachments: attachments/YYYY/MM/<mediaId>-<sanitizedName>.<ext>
 * - Public media: media/YYYY/MM/<mediaId>-<sanitizedName>.<ext>
 */
export function generateMediaObjectKey(
  sanitizedFileName: string,
  options?: {
    visibility?: MediaVisibility;
    category?: MediaCategory;
    date?: Date;
  }
): {
  mediaId: string;
  objectKey: string;
  bucketName: string;
} {
  const mediaId = randomUUID();
  const date = options?.date || new Date();
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const isPrivate = options?.visibility === "PRIVATE" || options?.category === "CUSTOMER_ATTACHMENT";
  const prefix = isPrivate ? "attachments" : "media";
  const objectKey = `${prefix}/${year}/${month}/${mediaId}-${sanitizedFileName}`;
  const bucketName = getR2BucketForUpload(options?.category || "CUSTOMER_ATTACHMENT", options?.visibility || (isPrivate ? "PRIVATE" : "PUBLIC"));

  return { mediaId, objectKey, bucketName };
}

/**
 * Builds public URL for displaying media assets.
 * Strictly returns null for:
 * 1. Any object in mqtech-attachments-staging or mqtech-db-backups-staging bucket.
 * 2. Any object with visibility: PRIVATE.
 * 3. Any object key starting with attachments/ or backups/.
 */
export function buildMediaPublicUrl(
  objectKey: string,
  optionsOrVisibility?:
    | {
        bucketName?: string;
        visibility?: MediaVisibility;
        customBaseUrl?: string;
      }
    | MediaVisibility,
  legacyBaseUrl?: string
): string | null {
  const config = getAppConfig();
  let bucket = config.r2MediaBucket;
  let visibility: MediaVisibility = "PUBLIC";
  let customBaseUrl: string | undefined;

  if (typeof optionsOrVisibility === "string") {
    visibility = optionsOrVisibility;
    customBaseUrl = legacyBaseUrl;
  } else if (optionsOrVisibility && typeof optionsOrVisibility === "object") {
    bucket = optionsOrVisibility.bucketName || config.r2MediaBucket;
    visibility = optionsOrVisibility.visibility || "PUBLIC";
    customBaseUrl = optionsOrVisibility.customBaseUrl;
  }

  // Bucket-level and object-level isolation guard
  if (
    bucket === config.r2AttachmentsBucket ||
    bucket === config.r2BackupBucket ||
    bucket.includes("attachment") ||
    bucket.includes("backup") ||
    visibility === "PRIVATE" ||
    objectKey.startsWith("attachments/") ||
    objectKey.startsWith("backups/")
  ) {
    return null;
  }

  const baseUrl = (customBaseUrl || config.mediaPublicBaseUrl || "").replace(/\/+$/, "");

  if (!baseUrl) {
    return `/${objectKey}`;
  }

  return `${baseUrl}/${objectKey}`;
}

/**
 * S3 Signature Version 4 helper functions (Pure Node.js crypto, zero dependencies).
 */
function hmac(key: Buffer | string, data: string): Buffer {
  return createHmac("sha256", key).update(data, "utf8").digest();
}

function hash(data: string): string {
  return createHash("sha256").update(data, "utf8").digest("hex");
}

export function getSignatureKey(
  secretKey: string,
  dateStamp: string,
  regionName: string,
  serviceName: string
): Buffer {
  const kDate = hmac("AWS4" + secretKey, dateStamp);
  const kRegion = hmac(kDate, regionName);
  const kService = hmac(kRegion, serviceName);
  const kSigning = hmac(kService, "aws4_request");
  return kSigning;
}

/**
 * Generates standard AWS S3 SigV4 Presigned PUT URL for Cloudflare R2 direct client upload.
 */
export function generateR2PresignedPutUrl(options: {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  objectKey: string;
  contentType: string;
  expiresInSeconds?: number;
  date?: Date;
}): string {
  const {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    objectKey,
    contentType,
    expiresInSeconds = 900, // 15 minutes default
    date = new Date(),
  } = options;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error("Missing required R2 credentials or bucket configuration.");
  }

  // Backup bucket cannot receive client presigned PUT uploads
  const config = getAppConfig();
  if (bucketName === config.r2BackupBucket || bucketName.includes("backup")) {
    throw new Error("Security Violation: Direct client PUT is strictly forbidden on backup bucket.");
  }

  const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const region = "auto";
  const service = "s3";

  const host = `${accountId}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${bucketName}/${encodeURI(objectKey)}`;
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

  // Query parameters in alphabetical order
  const queryParams = [
    `X-Amz-Algorithm=AWS4-HMAC-SHA256`,
    `X-Amz-Credential=${encodeURIComponent(`${accessKeyId}/${credentialScope}`)}`,
    `X-Amz-Date=${amzDate}`,
    `X-Amz-Expires=${expiresInSeconds}`,
    `X-Amz-SignedHeaders=${encodeURIComponent("content-type;host")}`,
  ];

  const canonicalQueryString = queryParams.join("&");

  // Headers must be lowercase and sorted
  const canonicalHeaders = `content-type:${contentType.toLowerCase()}\nhost:${host}\n`;
  const signedHeaders = "content-type;host";
  const payloadHash = "UNSIGNED-PAYLOAD";

  const canonicalRequest = [
    "PUT",
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    hash(canonicalRequest),
  ].join("\n");

  const signingKey = getSignatureKey(secretAccessKey, dateStamp, region, service);
  const signature = createHmac("sha256", signingKey).update(stringToSign, "utf8").digest("hex");

  return `https://${host}${canonicalUri}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
}

/**
 * Generates standard AWS S3 SigV4 Presigned GET URL for viewing private customer attachments.
 * Used exclusively by authenticated administrator sessions with short expiration (default 300s).
 */
export function generateR2PresignedGetUrl(options: {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  objectKey: string;
  expiresInSeconds?: number;
  date?: Date;
}): string {
  const {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    objectKey,
    expiresInSeconds = 300, // 5 minutes default
    date = new Date(),
  } = options;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    throw new Error("Missing required R2 credentials or bucket configuration.");
  }

  // Backup bucket access is strictly forbidden through generic attachment GET helper
  const config = getAppConfig();
  if (bucketName === config.r2BackupBucket || bucketName.includes("backup")) {
    throw new Error("Security Violation: Generic presigned GET is strictly forbidden on backup bucket.");
  }

  const amzDate = date.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const region = "auto";
  const service = "s3";

  const host = `${accountId}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${bucketName}/${encodeURI(objectKey)}`;
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

  // Query parameters in alphabetical order
  const queryParams = [
    `X-Amz-Algorithm=AWS4-HMAC-SHA256`,
    `X-Amz-Credential=${encodeURIComponent(`${accessKeyId}/${credentialScope}`)}`,
    `X-Amz-Date=${amzDate}`,
    `X-Amz-Expires=${expiresInSeconds}`,
    `X-Amz-SignedHeaders=host`,
  ];

  const canonicalQueryString = queryParams.join("&");

  // Headers for GET request
  const canonicalHeaders = `host:${host}\n`;
  const signedHeaders = "host";
  const payloadHash = "UNSIGNED-PAYLOAD";

  const canonicalRequest = [
    "GET",
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    hash(canonicalRequest),
  ].join("\n");

  const signingKey = getSignatureKey(secretAccessKey, dateStamp, region, service);
  const signature = createHmac("sha256", signingKey).update(stringToSign, "utf8").digest("hex");

  return `https://${host}${canonicalUri}?${canonicalQueryString}&X-Amz-Signature=${signature}`;
}

// ==============================================================================
// Article & Media Publishing Helpers (3-Bucket Architecture: mqtech-media-staging)
// ==============================================================================

declare global {
  var __mqtechDevR2Store: Map<string, string> | undefined;
}

if (!globalThis.__mqtechDevR2Store) {
  globalThis.__mqtechDevR2Store = new Map();
}

const devR2Store = globalThis.__mqtechDevR2Store;

/**
 * Generates an SEO-clean object key for an article image within mqtech-media-staging.
 * Pattern: articles/images/YYYY/MM/<mediaId>-<sanitizedFileName>
 */
export function generateArticleImageObjectKey(
  sanitizedFileName: string,
  options?: { date?: Date }
): {
  mediaId: string;
  objectKey: string;
  bucketName: string;
} {
  const mediaId = randomUUID();
  const date = options?.date || new Date();
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const objectKey = `articles/images/${year}/${month}/${mediaId}-${sanitizedFileName}`;
  const config = getAppConfig();
  const bucketName = config.r2MediaBucket;

  return { mediaId, objectKey, bucketName };
}

/**
 * Generates the standardized object key for an article's JSON bundle.
 * Pattern: articles/posts/<slug>.json
 */
export function generateArticlePostObjectKey(slug: string): string {
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
  return `articles/posts/${cleanSlug}.json`;
}

/**
 * Saves a full article object into Cloudflare R2 (mqtech-media-staging).
 * Uses direct S3 SigV4 PUT when live credentials exist, or dev fallback store in development/testing.
 */
export async function putR2ArticleObject(
  slug: string,
  articleData: Article
): Promise<{ success: boolean; objectKey: string; publicUrl: string | null }> {
  const objectKey = generateArticlePostObjectKey(slug);
  const config = getAppConfig();
  const bucketName = config.r2MediaBucket;
  const payload = JSON.stringify(articleData, null, 2);

  // In live staging/production with configured credentials
  if (config.r2AccountId && config.r2AccessKeyId && config.r2SecretAccessKey) {
    try {
      const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
      const dateStamp = amzDate.slice(0, 8);
      const host = `${config.r2AccountId}.r2.cloudflarestorage.com`;
      const canonicalUri = `/${bucketName}/${encodeURI(objectKey)}`;
      const payloadHash = hash(payload);

      const canonicalHeaders = `content-type:application/json; charset=utf-8\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
      const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
      const canonicalRequest = ["PUT", canonicalUri, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
      const credentialScope = `${dateStamp}/auto/s3/aws4_request`;
      const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, hash(canonicalRequest)].join("\n");
      const signingKey = getSignatureKey(config.r2SecretAccessKey, dateStamp, "auto", "s3");
      const signature = createHmac("sha256", signingKey).update(stringToSign, "utf8").digest("hex");
      const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${config.r2AccessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

      const res = await fetch(`https://${host}${canonicalUri}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Host": host,
          "x-amz-content-sha256": payloadHash,
          "x-amz-date": amzDate,
          "Authorization": authorizationHeader,
        },
        body: payload,
      });

      if (!res.ok) {
        console.warn(`R2 PUT article returned status ${res.status}: ${res.statusText}`);
      }
    } catch (err) {
      console.warn("Live R2 PUT article failed, continuing with fallback persistence:", err);
    }
  }

  // Always update dev store for instant local consistency
  devR2Store.set(objectKey, payload);

  const publicUrl = buildMediaPublicUrl(objectKey, {
    bucketName,
    visibility: "PUBLIC",
  });

  return { success: true, objectKey, publicUrl };
}

/**
 * Retrieves an article object from Cloudflare R2 (mqtech-media-staging).
 */
export async function getR2ArticleObject(slug: string): Promise<Article | null> {
  const objectKey = generateArticlePostObjectKey(slug);
  const config = getAppConfig();
  const bucketName = config.r2MediaBucket;

  // Try dev store first for fast local development
  if (devR2Store.has(objectKey)) {
    try {
      const data = JSON.parse(devR2Store.get(objectKey)!);
      return data as Article;
    } catch {
      // Ignored
    }
  }

  // If live credentials exist, fetch from R2
  if (config.r2AccountId && config.r2AccessKeyId && config.r2SecretAccessKey) {
    try {
      const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
      const dateStamp = amzDate.slice(0, 8);
      const host = `${config.r2AccountId}.r2.cloudflarestorage.com`;
      const canonicalUri = `/${bucketName}/${encodeURI(objectKey)}`;
      const payloadHash = "UNSIGNED-PAYLOAD";

      const canonicalHeaders = `host:${host}\nx-amz-date:${amzDate}\n`;
      const signedHeaders = "host;x-amz-date";
      const canonicalRequest = ["GET", canonicalUri, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
      const credentialScope = `${dateStamp}/auto/s3/aws4_request`;
      const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, hash(canonicalRequest)].join("\n");
      const signingKey = getSignatureKey(config.r2SecretAccessKey, dateStamp, "auto", "s3");
      const signature = createHmac("sha256", signingKey).update(stringToSign, "utf8").digest("hex");
      const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${config.r2AccessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

      const res = await fetch(`https://${host}${canonicalUri}`, {
        method: "GET",
        headers: {
          Host: host,
          "x-amz-date": amzDate,
          Authorization: authorizationHeader,
        },
      });

      if (res.ok) {
        const json = await res.json();
        return json as Article;
      }
    } catch (err) {
      console.warn("Live R2 GET article failed:", err);
    }
  }

  return null;
}

/**
 * Deletes an article JSON object from R2 (mqtech-media-staging).
 */
export async function deleteR2ArticleObject(slug: string): Promise<boolean> {
  const objectKey = generateArticlePostObjectKey(slug);
  devR2Store.delete(objectKey);

  const config = getAppConfig();
  if (config.r2AccountId && config.r2AccessKeyId && config.r2SecretAccessKey) {
    try {
      const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
      const dateStamp = amzDate.slice(0, 8);
      const host = `${config.r2AccountId}.r2.cloudflarestorage.com`;
      const canonicalUri = `/${config.r2MediaBucket}/${encodeURI(objectKey)}`;
      const payloadHash = "UNSIGNED-PAYLOAD";

      const canonicalHeaders = `host:${host}\nx-amz-date:${amzDate}\n`;
      const signedHeaders = "host;x-amz-date";
      const canonicalRequest = ["DELETE", canonicalUri, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
      const credentialScope = `${dateStamp}/auto/s3/aws4_request`;
      const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, hash(canonicalRequest)].join("\n");
      const signingKey = getSignatureKey(config.r2SecretAccessKey, dateStamp, "auto", "s3");
      const signature = createHmac("sha256", signingKey).update(stringToSign, "utf8").digest("hex");
      const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${config.r2AccessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

      await fetch(`https://${host}${canonicalUri}`, {
        method: "DELETE",
        headers: {
          Host: host,
          "x-amz-date": amzDate,
          Authorization: authorizationHeader,
        },
      });
    } catch {
      // Ignored
    }
  }

  return true;
}

export function clearDevR2Store(): void {
  devR2Store.clear();
}

