"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  UploadCloud,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  Eye,
  Clock,
  Layers,
  Sparkles,
  Loader2,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import type { Article, ArticleCategory, ArticleStatus, ArticleStep } from "@/lib/db/types";
import { ARTICLE_CATEGORIES, slugify, type CreateArticleDTO } from "@/lib/validations/article";

export function AdminArticlesManager() {
  // List States
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [page, setPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Editor Modal States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [editorSuccess, setEditorSuccess] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<ArticleCategory>("hardware");
  const [readTime, setReadTime] = useState("4 phút đọc");
  const [difficulty, setDifficulty] = useState<"Dễ" | "Trung bình" | "Cần hỗ trợ kỹ thuật">("Trung bình");
  const [status, setStatus] = useState<ArticleStatus>("PUBLISHED");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [steps, setSteps] = useState<ArticleStep[]>([]);
  const [quickTips, setQuickTips] = useState<string[]>([]);

  // Image Upload States
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Articles List
  useEffect(() => {
    let cancelled = false;

    async function fetchArticles() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        if (selectedCategory) params.set("category", selectedCategory);
        if (selectedStatus) params.set("status", selectedStatus);
        params.set("page", page.toString());
        params.set("pageSize", "10");

        const res = await fetch(`/api/admin/articles?${params.toString()}`);
        if (!res.ok) throw new Error("Không thể tải danh sách bài viết.");
        const json = await res.json();

        if (!cancelled && json.success) {
          setArticles(json.data.items);
          setTotalCount(json.data.total);
        }
      } catch (err) {
        console.error("Error loading articles:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchArticles();

    return () => {
      cancelled = true;
    };
  }, [search, selectedCategory, selectedStatus, page, refreshTrigger]);

  // Open Editor for Creating New Article
  const handleOpenNew = () => {
    setEditingArticleId(null);
    setTitle("");
    setSlug("");
    setSummary("");
    setContent(
      "## Hướng dẫn xử lý chi tiết\n\nNêu rõ các hiện tượng thường gặp và nguyên nhân kỹ thuật...\n\n### Những lưu ý an toàn\n\n- Luôn ngắt sạc trước khi thao tác\n- Không dùng máy sấy nóng"
    );
    setCategory("hardware");
    setReadTime("4 phút đọc");
    setDifficulty("Trung bình");
    setStatus("PUBLISHED");
    setCoverImageUrl("");
    setSteps([
      {
        number: "01",
        action: "Ngắt nguồn & tắt máy khẩn cấp",
        detail: "Giữ phím nguồn 5-10 giây để ngắt mạch điện tức thì.",
      },
    ]);
    setQuickTips(["Không cắm lại sạc khi chưa được kiểm tra bo mạch"]);
    setEditorError(null);
    setEditorSuccess(null);
    setUploadError(null);
    setIsEditorOpen(true);
  };

  // Open Editor for Editing Existing Article
  const handleOpenEdit = (art: Article) => {
    setEditingArticleId(art.id);
    setTitle(art.title);
    setSlug(art.slug);
    setSummary(art.summary);
    setContent(art.content || art.summary);
    setCategory(art.category);
    setReadTime(art.readTime);
    setDifficulty(art.difficulty);
    setStatus(art.status);
    setCoverImageUrl(art.coverImageUrl || "");
    setSteps(art.steps && art.steps.length > 0 ? art.steps : []);
    setQuickTips(art.quickTips && art.quickTips.length > 0 ? art.quickTips : []);
    setEditorError(null);
    setEditorSuccess(null);
    setUploadError(null);
    setIsEditorOpen(true);
  };

  // Auto-generate slug when title changes (if creating new)
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingArticleId) {
      setSlug(slugify(val));
    }
  };

  // Direct Upload to Cloudflare R2
  const handleImageFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadError(null);
    setUploadProgress(10);

    try {
      // 1. Request SigV4 Presigned PUT URL from our server
      const presignRes = await fetch("/api/admin/media/presign-put", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          sizeBytes: file.size,
        }),
      });

      if (!presignRes.ok) {
        const errJson = await presignRes.json();
        throw new Error(errJson.error || "Không thể khởi tạo phiên tải lên R2.");
      }

      const { uploadUrl, publicUrl, uploadMode } = await presignRes.json();
      setUploadProgress(40);

      // 2. Perform direct PUT upload
      if (uploadMode === "R2_DIRECT") {
        const r2UploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        if (!r2UploadRes.ok) {
          throw new Error("Lỗi khi tải tệp nhị phân trực tiếp lên Cloudflare R2.");
        }
      } else {
        // Mock direct upload in local dev
        await fetch(uploadUrl, {
          method: "PUT",
          body: file,
        });
      }

      setUploadProgress(100);
      setCoverImageUrl(publicUrl);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Tải ảnh thất bại.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Step builder handlers
  const handleAddStep = () => {
    const nextNum = String(steps.length + 1).padStart(2, "0");
    setSteps([...steps, { number: nextNum, action: "", detail: "" }]);
  };

  const handleUpdateStep = (index: number, field: keyof ArticleStep, value: string) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  // Quick Tip handlers
  const handleAddTip = () => {
    setQuickTips([...quickTips, ""]);
  };

  const handleUpdateTip = (index: number, value: string) => {
    const updated = [...quickTips];
    updated[index] = value;
    setQuickTips(updated);
  };

  const handleRemoveTip = (index: number) => {
    setQuickTips(quickTips.filter((_, i) => i !== index));
  };

  // Save Article (Create or Update)
  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setEditorError(null);
    setEditorSuccess(null);

    const payload: CreateArticleDTO = {
      title,
      slug,
      summary,
      content,
      category,
      readTime,
      difficulty,
      status,
      coverImageUrl: coverImageUrl || undefined,
      steps: steps.filter((s) => s.action.trim()),
      quickTips: quickTips.filter((t) => t.trim()),
    };

    try {
      const url = editingArticleId
        ? `/api/admin/articles/${editingArticleId}`
        : "/api/admin/articles";
      const method = editingArticleId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Lưu bài viết không thành công.");
      }

      setEditorSuccess(
        editingArticleId
          ? "Đã cập nhật bài viết thành công trên Cloudflare R2 & CSDL!"
          : "Đã xuất bản bài viết mới thành công lên Cloudflare R2 & CSDL!"
      );

      // Refresh list
      setRefreshTrigger((prev) => prev + 1);

      setTimeout(() => {
        setIsEditorOpen(false);
      }, 1200);
    } catch (err) {
      setEditorError(err instanceof Error ? err.message : "Lỗi lưu bài viết.");
    } finally {
      setSaving(false);
    }
  };

  // Delete Article
  const handleDeleteArticle = async (art: Article) => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa bài viết "${art.title}"?\nThao tác này sẽ xóa vĩnh viễn cả đối tượng trên Cloudflare R2 và cơ sở dữ liệu.`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/articles/${art.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error || "Xóa bài viết thất bại.");
        return;
      }

      setRefreshTrigger((prev) => prev + 1);
    } catch {
      alert("Lỗi kết nối khi xóa bài viết.");
    }
  };

  // Stats Counters
  const publishedCount = articles.filter((a) => a.status === "PUBLISHED").length;
  const draftCount = articles.filter((a) => a.status === "DRAFT").length;
  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Stats Bar */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-surface-dark-border bg-surface-dark-card p-4">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Tổng bài viết</span>
            <FileText className="h-4 w-4 text-blue-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-white">{totalCount}</div>
          <div className="text-[11px] text-neutral-500 mt-1">Lưu trữ trên R2</div>
        </div>

        <div className="rounded-xl border border-surface-dark-border bg-surface-dark-card p-4">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Đã xuất bản</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">{publishedCount}</div>
          <div className="text-[11px] text-neutral-500 mt-1">Hiển thị công khai</div>
        </div>

        <div className="rounded-xl border border-surface-dark-border bg-surface-dark-card p-4">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Bản nháp</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400">{draftCount}</div>
          <div className="text-[11px] text-neutral-500 mt-1">Chờ biên tập</div>
        </div>

        <div className="rounded-xl border border-surface-dark-border bg-surface-dark-card p-4">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-medium">Tổng lượt đọc</span>
            <Eye className="h-4 w-4 text-sky-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-sky-400">{totalViews}</div>
          <div className="text-[11px] text-neutral-500 mt-1">Lượt xem thực tế</div>
        </div>
      </div>

      {/* Action & Filter Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-surface-dark-border bg-surface-dark-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tiêu đề, tóm tắt..."
              className="w-full rounded-lg border border-surface-dark-border bg-surface-dark-elevated py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-surface-dark-border bg-surface-dark-elevated px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
          >
            <option value="">Tất cả chuyên mục</option>
            {Object.entries(ARTICLE_CATEGORIES).map(([key, item]) => (
              <option key={key} value={key}>
                {item.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-lg border border-surface-dark-border bg-surface-dark-elevated px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PUBLISHED">Đã xuất bản</option>
            <option value="DRAFT">Bản nháp</option>
          </select>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => setRefreshTrigger((prev) => prev + 1)}
            className="rounded-lg border border-surface-dark-border bg-surface-dark-elevated p-2 text-neutral-400 hover:text-white transition-colors"
            title="Tải lại danh sách bài viết"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Create Button */}
        <button
          type="button"
          onClick={handleOpenNew}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Viết bài mới</span>
        </button>
      </div>

      {/* Articles Table */}
      <div className="overflow-hidden rounded-xl border border-surface-dark-border bg-surface-dark-card">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-neutral-400">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500 mr-2" />
            <span>Đang tải danh sách bài viết từ Cloudflare R2 & CSDL...</span>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center text-center text-neutral-400">
            <FileText className="h-10 w-10 text-neutral-600 mb-2" />
            <p className="text-sm font-medium text-neutral-300">Chưa có bài viết nào phù hợp.</p>
            <p className="text-xs text-neutral-500 mt-1">Bấm &quot;Viết bài mới&quot; để đăng bài hướng dẫn đầu tiên.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-surface-dark-border bg-white/[0.02] text-neutral-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Bài viết & Ảnh bìa</th>
                  <th className="py-3 px-4">Chuyên mục</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Lượt xem</th>
                  <th className="py-3 px-4">Ngày đăng</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-dark-border/50 text-neutral-300">
                {articles.map((art) => (
                  <tr key={art.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 max-w-md">
                      <div className="flex items-center gap-3">
                        {art.coverImageUrl ? (
                          <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-neutral-900">
                            <Image
                              src={art.coverImageUrl}
                              alt={art.title}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="grid h-12 w-16 shrink-0 place-items-center rounded-lg border border-white/10 bg-neutral-800 text-neutral-500">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-white line-clamp-1">{art.title}</div>
                          <div className="text-[11px] font-mono text-neutral-500 line-clamp-1 mt-0.5">
                            /{art.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-medium text-blue-400 border border-blue-500/20">
                        {art.categoryLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {art.status === "PUBLISHED" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span>Xuất bản</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-500/10 px-2.5 py-0.5 text-[11px] font-medium text-neutral-400 border border-neutral-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" />
                          <span>Bản nháp</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-neutral-400">
                        <Eye className="h-3.5 w-3.5 text-neutral-500" />
                        <span>{art.views || 0}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-neutral-400 text-[11.5px]">
                      {new Date(art.publishedAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/cam-nang/${art.slug}`}
                          target="_blank"
                          className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white transition-colors"
                          title="Xem trang hiển thị công khai"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(art)}
                          className="rounded-lg p-1.5 text-blue-400 hover:bg-blue-500/10 transition-colors"
                          title="Chỉnh sửa bài viết"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteArticle(art)}
                          className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Xóa bài viết và tệp R2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalCount > 10 && (
          <div className="flex items-center justify-between border-t border-surface-dark-border px-4 py-3 text-xs text-neutral-400">
            <span>
              Trang {page} / {Math.ceil(totalCount / 10)} (Tổng {totalCount} bài viết)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-surface-dark-border bg-surface-dark-elevated px-2.5 py-1 text-xs text-neutral-300 hover:text-white disabled:opacity-40"
              >
                Trước
              </button>
              <button
                type="button"
                disabled={page * 10 >= totalCount}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-surface-dark-border bg-surface-dark-elevated px-2.5 py-1 text-xs text-neutral-300 hover:text-white disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Editor Modal Drawer */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-surface-dark-border bg-surface-dark-card shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-surface-dark-border px-6 py-4 bg-brand-dark">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">
                  {editingArticleId ? "Chỉnh sửa bài viết" : "Viết bài cẩm nang mới"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="rounded-lg p-1 text-neutral-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveArticle} className="flex-1 overflow-y-auto p-6 space-y-6">
              {editorError && (
                <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{editorError}</span>
                </div>
              )}

              {editorSuccess && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{editorSuccess}</span>
                </div>
              )}

              {/* Title & Slug */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Tiêu đề bài viết <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="VD: Cấp cứu Laptop bị vào nước hoặc đổ cà phê"
                    className="w-full rounded-lg border border-surface-dark-border bg-surface-dark-elevated px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Đường dẫn tĩnh (Slug) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="VD: cap-cuu-laptop-vao-nuoc"
                    className="w-full rounded-lg border border-surface-dark-border bg-surface-dark-elevated px-3 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Category, Read Time, Difficulty & Status */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Chuyên mục
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ArticleCategory)}
                    className="w-full rounded-lg border border-surface-dark-border bg-surface-dark-elevated px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  >
                    {Object.entries(ARTICLE_CATEGORIES).map(([key, item]) => (
                      <option key={key} value={key}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Thời gian đọc
                  </label>
                  <input
                    type="text"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    placeholder="VD: 4 phút đọc"
                    className="w-full rounded-lg border border-surface-dark-border bg-surface-dark-elevated px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Độ khó
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Article["difficulty"])}
                    className="w-full rounded-lg border border-surface-dark-border bg-surface-dark-elevated px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="Dễ">Dễ</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Cần hỗ trợ kỹ thuật">Cần hỗ trợ kỹ thuật</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Trạng thái xuất bản
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                    className="w-full rounded-lg border border-surface-dark-border bg-surface-dark-elevated px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="PUBLISHED">Xuất bản công khai</option>
                    <option value="DRAFT">Lưu bản nháp</option>
                  </select>
                </div>
              </div>

              {/* Cover Image Upload to Cloudflare R2 */}
              <div className="rounded-xl border border-surface-dark-border bg-surface-dark-elevated p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <ImageIcon className="h-4 w-4 text-blue-400" />
                      <span>Ảnh bìa bài viết (Cloudflare R2: mqtech-media-staging)</span>
                    </span>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Chỉ chấp nhận JPEG, PNG, WebP, AVIF $\le$ 5MB. Tải lên trực tiếp qua SigV4 PUT.
                    </p>
                  </div>

                  {coverImageUrl && (
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl("")}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Xóa ảnh bìa
                    </button>
                  )}
                </div>

                {uploadError && (
                  <div className="text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">
                    {uploadError}
                  </div>
                )}

                {coverImageUrl ? (
                  <div className="flex items-center gap-4">
                    <div className="relative h-24 w-36 overflow-hidden rounded-lg border border-white/15 bg-neutral-900">
                      <Image
                        src={coverImageUrl}
                        alt="Preview"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                    <div className="text-xs text-neutral-400 space-y-1">
                      <div className="font-semibold text-white">Ảnh đã tải lên R2</div>
                      <div className="font-mono text-[11px] break-all text-neutral-500">{coverImageUrl}</div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-600 p-6 hover:border-blue-400 hover:bg-white/[0.02] cursor-pointer transition-colors text-center"
                  >
                    <UploadCloud className="h-8 w-8 text-neutral-400 mb-2" />
                    <span className="text-xs font-medium text-neutral-300">
                      Bấm để chọn ảnh từ máy tính hoặc kéo thả vào đây
                    </span>
                    <span className="text-[11px] text-neutral-500 mt-1">Định dạng JPEG, PNG, WebP, AVIF</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="hidden"
                      onChange={handleImageFileSelected}
                    />
                  </div>
                )}

                {uploadingImage && (
                  <div className="space-y-1 pt-2">
                    <div className="flex justify-between text-[11px] text-neutral-400">
                      <span>Đang tải tệp lên Cloudflare R2...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-neutral-700 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Đoạn tóm tắt (Lead Summary) <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Mô tả ngắn gọn về vấn đề và giải pháp để thu hút độc giả và hiển thị trên kết quả tìm kiếm..."
                  className="w-full rounded-lg border border-surface-dark-border bg-surface-dark-elevated p-3 text-xs text-white placeholder-neutral-500 outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              {/* Step-by-step Checklist Builder */}
              <div className="rounded-xl border border-surface-dark-border bg-surface-dark-elevated p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-blue-400" />
                    <span className="text-xs font-semibold text-white">
                      Checklist sơ cứu từng bước (Hiển thị nổi bật trên thẻ bài viết)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Thêm bước</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {steps.map((st, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 rounded-lg border border-surface-dark-border bg-surface-dark-card p-3"
                    >
                      <input
                        type="text"
                        value={st.number}
                        onChange={(e) => handleUpdateStep(i, "number", e.target.value)}
                        className="w-12 rounded border border-surface-dark-border bg-surface-dark-elevated px-2 py-1.5 text-center font-mono text-xs text-blue-400 font-bold outline-none"
                      />
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={st.action}
                          onChange={(e) => handleUpdateStep(i, "action", e.target.value)}
                          placeholder="Hành động cốt lõi (VD: Ngắt nguồn sạc & tắt nguồn cưỡng bức)"
                          className="w-full rounded border border-surface-dark-border bg-surface-dark-elevated px-2.5 py-1 text-xs text-white placeholder-neutral-500 outline-none"
                        />
                        <input
                          type="text"
                          value={st.detail}
                          onChange={(e) => handleUpdateStep(i, "detail", e.target.value)}
                          placeholder="Chi tiết cách làm..."
                          className="w-full rounded border border-surface-dark-border bg-surface-dark-elevated px-2.5 py-1 text-xs text-neutral-300 placeholder-neutral-500 outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveStep(i)}
                        className="p-1 text-neutral-500 hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Tips */}
              <div className="rounded-xl border border-surface-dark-border bg-surface-dark-elevated p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-semibold text-white">Mẹo nhanh 1 chạm (Quick Tips)</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTip}
                    className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Thêm mẹo</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {quickTips.map((tip, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tip}
                        onChange={(e) => handleUpdateTip(i, e.target.value)}
                        placeholder="VD: Không nhét máy vào thùng gạo vì bụi gạo làm kẹt quạt"
                        className="flex-1 rounded border border-surface-dark-border bg-surface-dark-card px-3 py-1.5 text-xs text-white placeholder-neutral-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveTip(i)}
                        className="p-1 text-neutral-500 hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Markdown Content */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  Nội dung chi tiết bài viết (Định dạng Markdown) <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Soạn thảo nội dung bài viết kỹ thuật chi tiết bằng cú pháp Markdown (hỗ trợ ## tiêu đề, danh sách, đoạn văn...)"
                  className="w-full rounded-lg border border-surface-dark-border bg-surface-dark-elevated p-3 text-xs text-white placeholder-neutral-500 font-mono leading-relaxed outline-none focus:border-blue-500"
                />
              </div>

              {/* Form Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-dark-border">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="rounded-lg border border-surface-dark-border px-4 py-2 text-xs font-semibold text-neutral-300 hover:bg-white/5 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors disabled:opacity-60"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{editingArticleId ? "Cập nhật bài viết lên R2" : "Xuất bản bài viết lên R2"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
