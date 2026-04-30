"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { CATEGORIES, TAGS } from "@/lib/constants";
import { Eye, Edit3, Send } from "lucide-react";
import Link from "next/link";

function renderMarkdown(md: string): string {
  let html = md
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold text-foreground mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-foreground mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-foreground mt-6 mb-3">$1</h1>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="bg-surface-alt px-1.5 py-0.5 rounded text-neon-cyan text-sm font-mono">$1</code>')
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-surface-alt border border-border rounded-xl p-4 my-3 overflow-x-auto"><code class="text-sm font-mono text-foreground">$2</code></pre>')
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="my-4 rounded-xl max-w-full" />')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-neon-cyan hover:underline">$1</a>')
    .replace(/^- (.+)$/gm, '<li class="text-muted ml-4 list-disc">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="text-muted ml-4 list-decimal">$1</li>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-2 border-neon-cyan/30 pl-4 my-2 text-muted italic">$1</blockquote>')
    .replace(/^---$/gm, '<hr class="my-6 border-border" />')
    .replace(/\n\n/g, '</p><p class="text-muted leading-relaxed mb-3">')
    .replace(/\n/g, '<br />');

  if (!html.startsWith("<h") && !html.startsWith("<pre") && !html.startsWith("<blockquote") && !html.startsWith("<li") && !html.startsWith("<hr")) {
    html = '<p class="text-muted leading-relaxed mb-3">' + html + '</p>';
  }
  return html;
}

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/user-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, description, category, tags: selectedTags }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "发布失败");
      } else {
        router.push("/posts");
      }
    } catch {
      setError("发布失败，请稍后重试");
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
            <label className="block text-sm font-medium text-foreground mb-1">内容 (Markdown)</label>
            {preview ? (
              <div className="min-h-[400px] bg-surface-alt border border-border rounded-xl p-6 overflow-y-auto prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />
            ) : (
              <textarea value={content} onChange={(e) => setContent(e.target.value)}
                rows={18}
                className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 text-foreground outline-none placeholder:text-muted focus:border-neon-cyan/50 transition-colors resize-y font-mono text-sm"
                placeholder="用 Markdown 写文章..." required />
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
