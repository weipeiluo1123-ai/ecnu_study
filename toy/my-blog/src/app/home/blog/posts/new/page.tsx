"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { MarkdownEditor, loadDraft, clearDraft } from "@/components/ui/MarkdownEditor";
import { CATEGORIES, TAGS } from "@/lib/constants";
import { Send, FileText, X } from "lucide-react";
import Link from "next/link";

export default function NewPostPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addToast } = useToast();
  const draftKey = user ? `new-post-${user.id}` : undefined;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("notes");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [format, setFormat] = useState<"markdown" | "txt">("markdown");
  const [loading, setLoading] = useState(false);

  // Restore draft on mount (per-user scoped)
  useEffect(() => {
    if (!draftKey) return;
    const draft = loadDraft(draftKey);
    if (draft) {
      setContent(draft.content);
      setFormat(draft.format);
    }
  }, [draftKey]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/user-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, description, category, tags: selectedTags, format }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast("error", data.error || "发布失败");
      } else {
        if (draftKey) clearDraft(draftKey);
        addToast("success", "文章发布成功！");
        setTimeout(() => router.push("/home/blog/my-posts"), 1200);
      }
    } catch {
      addToast("error", "发布失败，请稍后重试");
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
        <FileText size={48} className="mx-auto text-muted/30 mb-4" />
        <p className="text-muted">请先登录后再发布文章</p>
        <Link href="/auth/login" className="text-neon-cyan hover:underline mt-3 inline-block">
          去登录
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <FileText size={28} className="text-neon-cyan" />
          发布文章
        </h1>
        <p className="mt-2 text-muted">
          分享你的技术见解 — 支持 Markdown 表格、任务列表、代码块等
        </p>
      </AnimatedSection>

      <AnimatedSection delay={0.1} className="mt-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title + Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-surface-alt border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-neon-cyan/50 transition-colors"
                placeholder="文章标题"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">分类</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-surface-alt border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-neon-cyan/50 transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">摘要</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-alt border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-neon-cyan/50 transition-colors"
              placeholder="文章简要摘要（可选，留空将自动取标题前 100 字）"
            />
          </div>

          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">标签</label>
              {selectedTags.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedTags([])}
                  className="text-xs text-muted hover:text-neon-cyan transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <X size={12} />
                  清除全部
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-[120px] overflow-y-auto">
              {TAGS.map((tag) => {
                const active = selectedTags.includes(tag.slug);
                return (
                  <button
                    key={tag.slug}
                    type="button"
                    onClick={() => toggleTag(tag.slug)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                      active
                        ? "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30"
                        : "bg-surface-alt text-muted border-border hover:text-foreground"
                    }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Editor */}
          <MarkdownEditor
            content={content}
            onChange={setContent}
            format={format}
            onFormatChange={setFormat}
            draftKey={draftKey}
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-neon-cyan text-background font-medium hover:bg-neon-cyan/90 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Send size={16} />
            {loading ? "发布中..." : "发布文章"}
          </button>
        </form>
      </AnimatedSection>
    </div>
  );
}
