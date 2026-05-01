"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Toast } from "@/components/ui/Toast";
import { CATEGORIES, TAGS } from "@/lib/constants";
import { Eye, Edit3, Send, FileText, Code } from "lucide-react";
import Link from "next/link";
import { renderMarkdown } from "@/lib/markdown";

export default function NewPostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("notes");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [format, setFormat] = useState<"markdown" | "txt">("markdown");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const closeToast = useCallback(() => setToast(null), []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/user-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, description, category, tags: selectedTags, format }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "发布失败");
        setToast({ type: "error", message: data.error || "发布失败" });
      } else {
        setToast({ type: "success", message: "文章发布成功！" });
        setTimeout(() => router.push("/my-posts"), 1200);
      }
    } catch {
      setError("发布失败，请稍后重试");
      setToast({ type: "error", message: "发布失败，请稍后重试" });
    } finally {
      setLoading(false);
    }
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-muted">请先登录后再发布文章</p>
        <Link href="/auth/login" className="text-neon-cyan hover:underline mt-2 inline-block">去登录</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">发布文章</h1>
            <p className="mt-2 text-muted">分享你的技术见解</p>
          </div>
          <button
            onClick={() => setPreview(!preview)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm text-muted hover:text-foreground hover:border-neon-cyan/30 transition-colors cursor-pointer"
          >
            {preview ? <Edit3 size={16} /> : <Eye size={16} />}
            {preview ? "编辑" : "预览"}
          </button>
        </div>
      </AnimatedSection>

      {toast && <Toast type={toast.type} message={toast.message} onClose={closeToast} />}

      <AnimatedSection delay={0.1} className="mt-8">
        {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title + Category row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">标题</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-surface-alt border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-neon-cyan/50 transition-colors" placeholder="文章标题" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">分类</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-surface-alt border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-neon-cyan/50 transition-colors">
                {CATEGORIES.map((cat) => <option key={cat.slug} value={cat.slug}>{cat.name}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">摘要</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-alt border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-neon-cyan/50 transition-colors" placeholder="文章简要摘要（可选）" />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">标签</label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <button key={tag.slug} type="button" onClick={() => toggleTag(tag.slug)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                    selectedTags.includes(tag.slug)
                      ? "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30"
                      : "bg-surface-alt text-muted border-border hover:text-foreground"
                  }`}>{tag.name}</button>
              ))}
            </div>
          </div>

          {/* Content with preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-foreground">内容</label>
              {/* Format toggle */}
              <div className="flex bg-surface-alt border border-border rounded-lg p-0.5">
                <button type="button" onClick={() => { setFormat("markdown"); setPreview(false); }}
                  className={`flex items-center gap-1 px-3 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                    format === "markdown" ? "bg-neon-cyan/20 text-neon-cyan" : "text-muted hover:text-foreground"
                  }`}>
                  <Code size={12} />
                  Markdown
                </button>
                <button type="button" onClick={() => { setFormat("txt"); setPreview(false); }}
                  className={`flex items-center gap-1 px-3 py-1 text-xs rounded-md transition-colors cursor-pointer ${
                    format === "txt" ? "bg-neon-cyan/20 text-neon-cyan" : "text-muted hover:text-foreground"
                  }`}>
                  <FileText size={12} />
                  TXT
                </button>
              </div>
            </div>
            {preview ? (
              <div className="min-h-[400px] bg-surface-alt border border-border rounded-xl p-6 overflow-y-auto prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: format === "txt"
                    ? content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")
                    : renderMarkdown(content)
                }} />
            ) : (
              <textarea value={content} onChange={(e) => setContent(e.target.value)}
                rows={18}
                className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 text-foreground outline-none placeholder:text-muted focus:border-neon-cyan/50 transition-colors resize-y font-mono text-sm"
                placeholder={format === "markdown" ? "用 Markdown 写文章..." : "直接输入纯文本..."} required />
            )}
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-neon-cyan text-background font-medium hover:bg-neon-cyan/90 transition-colors disabled:opacity-50 cursor-pointer">
            <Send size={16} />
            {loading ? "发布中..." : "发布文章"}
          </button>
        </form>
      </AnimatedSection>
    </div>
  );
}
