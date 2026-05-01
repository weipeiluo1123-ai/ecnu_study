"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { MarkdownEditor } from "@/components/ui/MarkdownEditor";
import { ArrowLeft, Save, FileText, X } from "lucide-react";
import Link from "next/link";
import { CATEGORIES, TAGS } from "@/lib/constants";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("notes");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(true);
  const [format, setFormat] = useState<"markdown" | "txt">("markdown");
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/home/blog/auth/login");
      return;
    }
    loadPost();
  }, [user, loading, router, id]);

  async function loadPost() {
    try {
      const res = await fetch(`/api/user-posts/${id}`);
      if (!res.ok) {
        if (res.status === 404 || res.status === 403) setNotFound(true);
        return;
      }
      const data = await res.json();
      const post = data.post;
      setTitle(post.title);
      setContent(post.content);
      setDescription(post.description || "");
      setCategory(post.category || "notes");
      setSelectedTags(post.tags ? JSON.parse(post.tags) : []);
      setFormat(post.format === "txt" ? "txt" : "markdown");
      setIsPublished(post.isPublished);
    } catch {
      setNotFound(true);
    } finally {
      setFetching(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/user-posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          description,
          category,
          tags: selectedTags,
          isPublished,
          format,
        }),
      });
      if (res.ok) {
        addToast("success", "保存成功！");
        setTimeout(() => router.push("/home/blog/my-posts"), 1200);
      } else {
        const data = await res.json();
        addToast("error", data.error || "保存失败");
      }
    } catch {
      addToast("error", "网络错误");
    } finally {
      setSaving(false);
    }
  }

  function toggleTag(tag: string) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  if (loading || fetching) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-96 mt-8 rounded-xl" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <FileText size={48} className="mx-auto text-muted/30 mb-4" />
        <p className="text-muted">文章不存在或无权访问</p>
        <Link href="/home/blog/my-posts" className="text-neon-cyan hover:underline mt-3 inline-block">
          返回我的文章
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection>
        <Link
          href="/home/blog/my-posts"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-neon-cyan transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          返回我的文章
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText size={24} className="text-neon-cyan" />
            编辑文章
          </h1>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1} className="mt-8">
        <form onSubmit={handleSave} className="space-y-5">
          {/* Title + Publish toggle */}
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-1">标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-surface-alt border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-neon-cyan/50 transition-colors"
                required
              />
            </div>
            <div className="shrink-0 pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-surface-alt accent-neon-cyan"
                />
                <span className="text-sm text-muted">已发布</span>
              </label>
            </div>
          </div>

          {/* Category */}
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

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">摘要</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-alt border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-neon-cyan/50 transition-colors"
              placeholder="文章简要摘要..."
            />
          </div>

          {/* Content Editor */}
          <MarkdownEditor
            content={content}
            onChange={setContent}
            format={format}
            onFormatChange={setFormat}
            draftKey={`edit-post-${id}`}
          />

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-neon-cyan text-background font-medium hover:bg-neon-cyan/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Save size={16} />
              {saving ? "保存中..." : "保存修改"}
            </button>
            <Link
              href="/home/blog/my-posts"
              className="px-4 py-2.5 rounded-xl border border-border text-sm text-muted hover:text-foreground transition-colors"
            >
              取消
            </Link>
          </div>
        </form>
      </AnimatedSection>
    </div>
  );
}
