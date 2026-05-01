"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { ArrowLeft, Save, Eye, Edit3, FileText, Code } from "lucide-react";
import Link from "next/link";
import { CATEGORIES, TAGS } from "@/lib/constants";
import { renderMarkdown } from "@/lib/markdown";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("notes");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [fetching, setFetching] = useState(true);
  const [preview, setPreview] = useState(false);
  const [format, setFormat] = useState<"markdown" | "txt">("markdown");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/auth/login");
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
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/user-posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, description, category, tags: selectedTags, isPublished, format }),
      });
      if (res.ok) {
        setSuccess("保存成功！");
      } else {
        const data = await res.json();
        setError(data.error || "保存失败");
      }
    } catch {
      setError("网络错误");
    } finally {
      setSaving(false);
    }
  }

  function toggleTag(tag: string) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }

  if (loading || fetching) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-96 mt-8 rounded-xl" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-muted">文章不存在或无权访问</p>
        <Link href="/my-posts" className="text-neon-cyan hover:underline mt-2 inline-block">返回我的文章</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection>
        <Link
          href="/my-posts"
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
          <button
            onClick={() => setPreview(!preview)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm text-muted hover:text-foreground hover:border-neon-cyan/30 transition-colors cursor-pointer"
          >
            {preview ? <Edit3 size={16} /> : <Eye size={16} />}
            {preview ? "编辑" : "预览"}
          </button>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1} className="mt-8">
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-neon-green/10 border border-neon-green/20 text-neon-green text-sm">{success}</div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Title + Publish toggle row */}
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-1">标题</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-surface-alt border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-neon-cyan/50 transition-colors"
                required
              />
            </div>
            <div className="shrink-0 pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={e => setIsPublished(e.target.checked)}
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
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-surface-alt border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-neon-cyan/50 transition-colors"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.slug} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">标签</label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(tag => (
                <button
                  key={tag.slug}
                  type="button"
                  onClick={() => toggleTag(tag.slug)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors cursor-pointer ${
                    selectedTags.includes(tag.slug)
                      ? "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30"
                      : "bg-surface-alt text-muted border-border hover:text-foreground"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">摘要</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-surface-alt border border-border rounded-xl px-4 py-2.5 text-foreground outline-none focus:border-neon-cyan/50 transition-colors"
              placeholder="文章简要摘要..."
            />
          </div>

          {/* Content with preview toggle */}
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
                }}
              />
            ) : (
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={20}
                className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 text-foreground outline-none placeholder:text-muted focus:border-neon-cyan/50 transition-colors resize-y font-mono text-sm"
                placeholder={format === "markdown" ? "用 Markdown 写文章..." : "直接输入纯文本..."}
              />
            )}
          </div>

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
              href="/my-posts"
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
