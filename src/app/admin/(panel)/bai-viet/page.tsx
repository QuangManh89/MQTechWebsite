"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Check,
  Copy,
  Edit3,
  Eye,
  Heading2,
  Image as ImageIcon,
  Images,
  List,
  Plus,
  Quote,
  RefreshCw,
  Save,
  Star,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import type { Post } from "@/db/schema";
import { ConfirmDialog, ModalDialog } from "@/components/ui/ModalDialog";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { useAdminRole } from "@/components/admin/AdminShell";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

interface GalleryItem {
  url: string;
  caption?: string;
  name?: string;
}

export default function AdminPostsPage() {
  const router = useRouter();
  const userRole = useAdminRole();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Post> | null>(null);
  const [deletingTarget, setDeletingTarget] = useState<Post | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editorTab, setEditorTab] = useState<"edit" | "preview">("edit");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/posts");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) {
        setLoadError("Không thể tải danh sách bài viết.");
        return;
      }
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      setLoadError("Mất kết nối máy chủ khi tải bài viết.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  // Gallery items for current editing post
  const currentGallery: GalleryItem[] = useMemo(() => {
    if (!editing?.galleryImages) return [];
    try {
      const parsed = JSON.parse(editing.galleryImages);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [editing?.galleryImages]);

  const updateGallery = (items: GalleryItem[]) => {
    if (!editing) return;
    setEditing({
      ...editing,
      galleryImages: JSON.stringify(items),
    });
  };

  // Upload single cover image
  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error("Ảnh vượt quá giới hạn 5MB. Vui lòng nén ảnh trước khi tải lên.");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        // Update cover and also add to gallery if not present
        const newCoverUrl = data.url;
        const existsInGallery = currentGallery.some((item) => item.url === newCoverUrl);
        const updatedGallery = existsInGallery
          ? currentGallery
          : [
              ...currentGallery,
              {
                url: newCoverUrl,
                caption: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
                name: file.name,
              },
            ];

        setEditing({
          ...editing,
          coverImage: newCoverUrl,
          galleryImages: JSON.stringify(updatedGallery),
        });
        toast.success(`Đã tải ảnh bìa (${data.provider})`);
      } else {
        toast.error(data.error || "Upload thất bại");
      }
    } catch {
      toast.error("Lỗi kết nối mạng khi tải ảnh.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  // Upload multiple images into Article Media Tray
  async function handleBatchUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0 || !editing) return;

    for (let i = 0; i < files.length; i++) {
      if (files[i].size > MAX_UPLOAD_BYTES) {
        toast.error(`Ảnh "${files[i].name}" vượt quá 5MB. Vui lòng nén ảnh trước khi tải lên.`);
        return;
      }
    }

    setUploading(true);
    try {
      const fd = new FormData();
      for (let i = 0; i < files.length; i++) {
        fd.append("files", files[i]);
      }
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok) {
        const uploadedList: Array<{ url: string; name: string; provider: string }> =
          data.urls || (data.url ? [{ url: data.url, name: "Ảnh tải lên", provider: data.provider }] : []);

        const newItems: GalleryItem[] = uploadedList.map((item) => ({
          url: item.url,
          caption: item.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
          name: item.name,
        }));

        const updated = [...currentGallery, ...newItems];
        updateGallery(updated);

        // If coverImage is empty, auto-set first uploaded as coverImage
        if (!editing.coverImage && newItems[0]?.url) {
          setEditing((prev) => (prev ? { ...prev, coverImage: newItems[0].url } : null));
        }

        toast.success(`Đã tải lên ${newItems.length} ảnh lên Cloudflare R2!`);
      } else {
        toast.error(data.error || "Upload thất bại");
      }
    } catch {
      toast.error("Lỗi kết nối mạng khi tải ảnh.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  // Insert text / markdown at cursor position
  const insertTextAtCursor = (textToInsert: string) => {
    const textarea = document.getElementById("postContent") as HTMLTextAreaElement | null;
    if (!textarea || !editing) {
      setEditing((prev) =>
        prev
          ? {
              ...prev,
              content: (prev.content || "") + textToInsert,
            }
          : null
      );
      return;
    }
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const currentVal = editing.content || "";
    const newVal =
      currentVal.substring(0, start) + textToInsert + currentVal.substring(end);
    setEditing({ ...editing, content: newVal });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + textToInsert.length,
        start + textToInsert.length
      );
    }, 50);
  };

  const insertImageMarkdown = (item: GalleryItem) => {
    const altText = item.caption || item.name || "Hình ảnh minh họa";
    insertTextAtCursor(`\n\n![${altText}](${item.url})\n\n`);
    toast.success("Đã chèn ảnh vào nội dung bài viết");
  };

  const setAsCover = (url: string) => {
    if (!editing) return;
    setEditing({ ...editing, coverImage: url });
    toast.success("Đã đặt làm ảnh bìa bài viết");
  };

  const copyUrl = (url: string) => {
    void navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    toast.success("Đã sao chép link ảnh");
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const removeFromGallery = (url: string) => {
    const updated = currentGallery.filter((item) => item.url !== url);
    updateGallery(updated);
    toast.success("Đã xóa ảnh khỏi kho bài viết");
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const isNew = !editing.id;
      const res = await fetch("/api/admin/posts", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (res.ok) {
        toast.success(isNew ? "Đã đăng bài viết" : "Đã cập nhật bài viết");
        setEditing(null);
        await load();
      } else {
        toast.error("Không thể lưu bài viết. Kiểm tra Slug không bị trùng.");
      }
    } catch {
      toast.error("Lỗi kết nối mạng khi lưu bài viết.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deletingTarget) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/posts?id=${deletingTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Đã xóa bài viết");
        setDeletingTarget(null);
        await load();
      } else {
        toast.error("Không thể xóa bài viết.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-navy">
            Quản lý Bài viết SEO &amp; Kiến thức
          </h1>
          <p className="text-sm text-ink-muted mt-0.5">
            Viết bài chia sẻ kỹ thuật, hướng dẫn sửa chữa máy tính kèm nhiều hình ảnh trực quan tại Buôn Ma Thuột.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing({
              title: "",
              slug: "",
              category: "Thủ Thuật Windows",
              excerpt: "",
              content: "",
              coverImage:
                "https://images.unsplash.com/photo-1721333089073-215a56fd710c?auto=format&fit=crop&w=1000&q=80",
              galleryImages: "[]",
              authorName: "Kỹ thuật MQTech BMT",
              readTimeMinutes: 5,
              featured: false,
              isPublished: true,
              seoTitle: "",
              seoDescription: "",
            });
            setEditorTab("edit");
          }}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-ink-inverse hover:bg-brand-hover shadow-sm"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Viết bài mới</span>
        </button>
      </div>

      {loadError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-status-danger-line bg-status-danger-bg p-4 text-sm text-status-danger-ink"
        >
          <span className="inline-flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-status-danger-ink" aria-hidden="true" />
            {loadError}
          </span>
          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-status-danger-solid px-4 py-2 text-xs font-semibold text-ink-inverse hover:bg-status-danger-hover"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Thử lại</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-line bg-surface p-10 text-center text-sm text-ink-muted">
          Đang tải danh sách bài viết...
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface p-10 text-center text-sm text-ink-muted">
          Chưa có bài viết nào được tạo. Hãy bấm Viết bài mới để bắt đầu xây dựng chuyên mục Kiến thức SEO.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {posts.map((post) => {
            let galleryCount = 0;
            try {
              if (post.galleryImages) {
                const arr = JSON.parse(post.galleryImages);
                if (Array.isArray(arr)) galleryCount = arr.length;
              }
            } catch {}

            return (
              <div
                key={post.id}
                className="flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-all hover:border-brand/40"
              >
                <div className="flex gap-4 p-5 min-w-0">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    width={224}
                    height={192}
                    loading="lazy"
                    decoding="async"
                    className="h-24 w-28 shrink-0 rounded-xl object-cover bg-surface-muted border border-line"
                  />
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-semibold text-brand">
                        {post.category}
                      </span>
                      {galleryCount > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-surface-subtle px-2 py-0.5 text-[11px] font-medium text-ink-muted border border-line">
                          <Images className="h-3 w-3 text-brand" />
                          <span>{galleryCount} ảnh</span>
                        </span>
                      )}
                    </div>
                    <h2 className="font-heading text-base font-bold text-navy line-clamp-2 break-words">
                      {post.title}
                    </h2>
                    <p className="text-xs text-ink-muted line-clamp-2 break-words">
                      {post.excerpt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-line-subtle px-5 py-2.5 bg-surface-subtle/50">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(post);
                      setEditorTab("edit");
                    }}
                    className="min-h-11 rounded-lg px-2 text-xs font-semibold text-brand hover:underline"
                  >
                    Chỉnh sửa &amp; Hình ảnh
                  </button>
                  {userRole === "ADMIN" && (
                    <button
                      type="button"
                      aria-label={`Xóa bài viết ${post.title}`}
                      onClick={() => setDeletingTarget(post)}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink-subtle hover:bg-status-danger-bg hover:text-status-danger-ink"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Edit / Create Modal */}
      <ModalDialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        title={editing?.id ? "Chỉnh sửa bài viết & Thư viện ảnh" : "Đăng bài viết mới"}
        description="Soạn thảo nội dung kỹ thuật, tải lên nhiều hình ảnh và tối ưu hóa SEO."
        maxWidthClass="max-w-4xl"
      >
        {editing && (
          <form onSubmit={handleSave} className="space-y-5 text-sm">
            {/* Title & Slug */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="postTitle"
                  className="block text-xs font-semibold text-ink-muted mb-1"
                >
                  Tiêu đề bài viết *
                </label>
                <input
                  id="postTitle"
                  required
                  maxLength={200}
                  placeholder="Vệ Sinh Laptop Đúng Chuẩn Tránh Cháy Chip..."
                  value={editing.title || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, title: e.target.value })
                  }
                  className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 text-base sm:text-sm focus:border-brand focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="postSlug"
                  className="block text-xs font-semibold text-ink-muted mb-1"
                >
                  Slug URL *
                </label>
                <input
                  id="postSlug"
                  required
                  maxLength={200}
                  placeholder="ve-sinh-laptop-dung-chuan"
                  value={editing.slug || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, slug: e.target.value })
                  }
                  className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 font-mono text-xs focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            {/* Category, Author, Read time */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="postCategory"
                  className="block text-xs font-semibold text-ink-muted mb-1"
                >
                  Chuyên mục *
                </label>
                <input
                  id="postCategory"
                  required
                  maxLength={80}
                  value={editing.category || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, category: e.target.value })
                  }
                  className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 text-base sm:text-sm focus:border-brand focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="postAuthor"
                  className="block text-xs font-semibold text-ink-muted mb-1"
                >
                  Tác giả
                </label>
                <input
                  id="postAuthor"
                  maxLength={80}
                  value={editing.authorName || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, authorName: e.target.value })
                  }
                  className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 text-base sm:text-sm focus:border-brand focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="postReadMinutes"
                  className="block text-xs font-semibold text-ink-muted mb-1"
                >
                  Số phút đọc
                </label>
                <input
                  id="postReadMinutes"
                  type="number"
                  min={1}
                  max={60}
                  value={editing.readTimeMinutes || 5}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      readTimeMinutes: Number(e.target.value),
                    })
                  }
                  className="min-h-11 w-full rounded-xl border border-line px-3.5 py-2.5 text-base sm:text-sm focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            {/* Cover Image row */}
            <div className="rounded-2xl border border-line bg-surface-subtle/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="postCoverImage"
                  className="block text-xs font-semibold text-ink-muted"
                >
                  Ảnh bìa bài viết chính (Cover Image) *
                </label>
                <span className="text-[11px] text-ink-muted">Tối đa 5MB / file</span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  id="postCoverImage"
                  required
                  placeholder="https://..."
                  value={editing.coverImage || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, coverImage: e.target.value })
                  }
                  className="min-h-11 flex-1 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-xs focus:border-brand focus:outline-none"
                />
                <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-xs font-semibold text-navy hover:bg-surface-muted transition-colors">
                  <Upload className="h-4 w-4 text-brand" aria-hidden="true" />
                  <span>{uploading ? "Đang tải..." : "Tải ảnh bìa R2"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleCoverUpload}
                  />
                </label>
              </div>
            </div>

            {/* ARTICLE MEDIA TRAY (Kho ảnh bài viết) */}
            <div className="rounded-2xl border border-brand/20 bg-brand-light/10 p-4 sm:p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Images className="h-5 w-5 text-brand" aria-hidden="true" />
                  <div>
                    <h3 className="font-heading text-sm font-bold text-navy">
                      Kho ảnh bài viết (Media Tray)
                    </h3>
                    <p className="text-xs text-ink-muted">
                      Tải lên nhiều ảnh minh họa cùng lúc lên Cloudflare R2 để chèn vào nội dung.
                    </p>
                  </div>
                </div>

                <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-brand px-4 py-2 text-xs font-semibold text-ink-inverse hover:bg-brand-hover shadow-sm transition-colors">
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  <span>{uploading ? "Đang tải ảnh..." : "+ Tải lên nhiều ảnh (R2)"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={handleBatchUpload}
                    disabled={uploading}
                  />
                </label>
              </div>

              {currentGallery.length === 0 ? (
                <div className="rounded-xl border border-dashed border-line bg-surface p-6 text-center text-xs text-ink-muted">
                  Chưa có ảnh phụ nào trong bài viết. Bấm nút <strong>+ Tải lên nhiều ảnh</strong> để thêm sơ đồ, ảnh chụp màn hình hoặc hình ảnh thực tế sửa chữa.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 max-h-[300px] overflow-y-auto pr-1">
                  {currentGallery.map((item, idx) => {
                    const isCover = editing.coverImage === item.url;
                    return (
                      <div
                        key={idx}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-line bg-surface shadow-xs p-2.5 space-y-2"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-surface-muted border border-line-subtle">
                          <img
                            src={item.url}
                            alt={item.caption || "Ảnh minh họa"}
                            className="h-full w-full object-cover"
                          />
                          {isCover && (
                            <span className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                              <Star className="h-2.5 w-2.5 fill-current" />
                              <span>Ảnh bìa</span>
                            </span>
                          )}
                        </div>

                        <div className="space-y-1">
                          <p className="text-[11px] font-medium text-navy truncate" title={item.name || item.url}>
                            {item.name || `Ảnh ${idx + 1}`}
                          </p>
                          <div className="grid grid-cols-2 gap-1.5 pt-1">
                            <button
                              type="button"
                              onClick={() => insertImageMarkdown(item)}
                              title="Chèn mã ảnh vào nội dung"
                              className="inline-flex min-h-[34px] items-center justify-center gap-1 rounded-lg bg-brand-light px-2 py-1 text-[11px] font-semibold text-brand hover:bg-brand-light/80 transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Chèn vào bài</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setAsCover(item.url)}
                              title="Đặt làm ảnh đại diện bài viết"
                              className="inline-flex min-h-[34px] items-center justify-center gap-1 rounded-lg border border-line bg-surface px-2 py-1 text-[11px] font-medium text-ink-muted hover:border-brand/40 hover:text-brand transition-colors"
                            >
                              <Star className="h-3 w-3" />
                              <span>Đặt làm bìa</span>
                            </button>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-line-subtle">
                            <button
                              type="button"
                              onClick={() => copyUrl(item.url)}
                              className="inline-flex items-center gap-1 text-[10px] text-ink-muted hover:text-navy"
                            >
                              {copiedUrl === item.url ? (
                                <>
                                  <Check className="h-3 w-3 text-emerald-600" />
                                  <span className="text-emerald-600">Đã copy link</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>Copy URL</span>
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFromGallery(item.url)}
                              className="text-[10px] text-status-danger-ink hover:underline"
                            >
                              Xóa khỏi kho
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Excerpt */}
            <div>
              <label
                htmlFor="postExcerpt"
                className="block text-xs font-semibold text-ink-muted mb-1"
              >
                Tóm tắt ngắn (Excerpt) *
              </label>
              <textarea
                id="postExcerpt"
                required
                rows={2}
                maxLength={500}
                placeholder="Tóm tắt 1-2 câu nêu bật vấn đề kỹ thuật để kích thích người đọc..."
                value={editing.excerpt || ""}
                onChange={(e) =>
                  setEditing({ ...editing, excerpt: e.target.value })
                }
                className="w-full rounded-xl border border-line px-3.5 py-2.5 text-base sm:text-sm focus:border-brand focus:outline-none"
              />
            </div>

            {/* Content Editor Toolbar & Tabs */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditorTab("edit")}
                    className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      editorTab === "edit"
                        ? "bg-navy text-ink-inverse"
                        : "text-ink-muted hover:bg-surface-subtle"
                    }`}
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Soạn thảo nội dung</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab("preview")}
                    className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      editorTab === "preview"
                        ? "bg-navy text-ink-inverse"
                        : "text-ink-muted hover:bg-surface-subtle"
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Xem trước (Preview)</span>
                  </button>
                </div>

                {/* Quick markdown insert tools (only show in edit tab) */}
                {editorTab === "edit" && (
                  <div className="flex items-center gap-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => insertTextAtCursor("\n\n### Tiêu đề mục...\n\n")}
                      title="Chèn Tiêu đề H2"
                      className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1 text-xs text-ink-muted hover:border-brand/40 hover:text-brand"
                    >
                      <Heading2 className="h-3 w-3" />
                      <span>H2</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertTextAtCursor("\n\n> Lưu ý kỹ thuật quan trọng: ...\n\n")}
                      title="Chèn Hộp ghi chú / Lưu ý"
                      className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1 text-xs text-ink-muted hover:border-brand/40 hover:text-brand"
                    >
                      <Quote className="h-3 w-3" />
                      <span>Ghi chú</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => insertTextAtCursor("\n\n- Điểm lưu ý 1\n- Điểm lưu ý 2\n- Điểm lưu ý 3\n\n")}
                      title="Chèn danh sách gạch đầu dòng"
                      className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1 text-xs text-ink-muted hover:border-brand/40 hover:text-brand"
                    >
                      <List className="h-3 w-3" />
                      <span>Danh sách</span>
                    </button>
                  </div>
                )}
              </div>

              {editorTab === "edit" ? (
                <div>
                  <textarea
                    id="postContent"
                    required
                    rows={9}
                    placeholder="Nội dung bài viết. Bạn có thể bấm nút 'Chèn vào bài' ở kho ảnh trên để chèn ảnh ![mô tả](url) vào đây..."
                    value={editing.content || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, content: e.target.value })
                    }
                    className="w-full rounded-xl border border-line p-3.5 font-mono text-xs leading-relaxed focus:border-brand focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-ink-muted">
                    Hỗ trợ cú pháp Markdown: <code>### Tiêu đề</code>, <code>![Mô tả ảnh](https://...)</code>, <code>&gt; Ghi chú</code>, <code>- Gạch đầu dòng</code>.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-line bg-surface p-4 max-h-[420px] overflow-y-auto">
                  <ArticleBody
                    content={editing.content || "*Chưa có nội dung soạn thảo*"}
                    coverImage={editing.coverImage || ""}
                    title={editing.title || "Tiêu đề bài viết xem trước"}
                    galleryImagesJson={editing.galleryImages}
                  />
                </div>
              )}
            </div>

            {/* SEO Settings */}
            <div className="grid gap-3 sm:grid-cols-2 rounded-xl bg-surface-subtle p-4">
              <div>
                <label
                  htmlFor="postSeoTitle"
                  className="block text-xs font-semibold text-ink-muted mb-1"
                >
                  SEO Title (tùy chọn)
                </label>
                <input
                  id="postSeoTitle"
                  maxLength={120}
                  placeholder="Tiêu đề hiển thị kết quả tìm kiếm Google"
                  value={editing.seoTitle || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, seoTitle: e.target.value })
                  }
                  className="min-h-11 w-full rounded-xl border border-line bg-surface px-3.5 py-2 text-xs focus:border-brand focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="postSeoDesc"
                  className="block text-xs font-semibold text-ink-muted mb-1"
                >
                  SEO Description (tùy chọn)
                </label>
                <input
                  id="postSeoDesc"
                  maxLength={250}
                  placeholder="Mô tả tóm tắt hiển thị dưới tiêu đề Google"
                  value={editing.seoDescription || ""}
                  onChange={(e) =>
                    setEditing({ ...editing, seoDescription: e.target.value })
                  }
                  className="min-h-11 w-full rounded-xl border border-line bg-surface px-3.5 py-2 text-xs focus:border-brand focus:outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving || uploading}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-brand py-3 font-semibold text-ink-inverse hover:bg-brand-hover shadow-md transition-all disabled:opacity-60"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              <span>{saving ? "Đang lưu..." : "Lưu bài viết"}</span>
            </button>
          </form>
        )}
      </ModalDialog>

      <ConfirmDialog
        open={Boolean(deletingTarget)}
        onOpenChange={(open) => {
          if (!open) setDeletingTarget(null);
        }}
        title="Xóa bài viết này?"
        description={`Bài viết "${deletingTarget?.title ?? ""}" sẽ bị xóa khỏi chuyên mục Kiến thức.`}
        loading={saving}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
