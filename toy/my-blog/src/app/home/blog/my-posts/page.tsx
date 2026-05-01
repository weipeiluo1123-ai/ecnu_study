"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { ArrowLeft, FileText, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Filter, X } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CATEGORIES, TAGS } from "@/lib/constants";

interface UserPost {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  tags: string;
  format: string;
  isPublished: boolean;
  likesCount: number;
  viewsCount: number;
  bookmarksCount: number;
  createdAt: string;
}

const ALL_CATEGORY = "__all__";

export default function MyPostsPage() {
  const { user, loading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [fetching, setFetching] = useState(true);
  const [postPage, setPostPage] = useState(1);
  const pageSize = 10;

  // Filters
  const [filterCat, setFilterCat] = useState(ALL_CATEGORY);
  const [filterTag, setFilterTag] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/home/blog/auth/login");
      return;
    }
    fetchMyPosts();
  }, [user, loading, router]);

  async function fetchMyPosts() {
    try {
      const res = await fetch(`/api/user-posts?authorId=${user!.id}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch {} finally {
      setFetching(false);
    }
  }

  // Extract unique tags from user's posts
  const userTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const p of posts) {
      try {
        const tags = JSON.parse(p.tags);
        tags.forEach((t: string) => tagSet.add(t));
      } catch {}
    }
    return Array.from(tagSet).sort();
  }, [posts]);

  // Filtered posts
  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (filterCat !== ALL_CATEGORY && p.category !== filterCat) return false;
      if (filterTag) {
        try {
          const tags = JSON.parse(p.tags);
          if (!tags.includes(filterTag)) return false;
        } catch {
          return false;
        }
      }
      return true;
    });
  }, [posts, filterCat, filterTag]);

  const paginated = filtered.slice((postPage - 1) * pageSize, postPage * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  async function deletePost(postId: number, title: string) {
    if (!confirm(`确定删除文章 "${title}"？此操作不可恢复。`)) return;
    try {
      const res = await fetch(`/api/user-posts/${postId}`, { method: "DELETE" });
      if (res.ok) {
        addToast("success", "文章已删除");
        fetchMyPosts();
      } else {
        addToast("error", "删除失败");
      }
    } catch {
      addToast("error", "网络错误");
    }
  }

  // Reset page when filters change
  useEffect(() => { setPostPage(1); }, [filterCat, filterTag]);

  if (loading || fetching) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-64 mt-8 rounded-xl" />
      </div>
    );
  }

  const tagInfo = (slug: string) => TAGS.find((t) => t.slug === slug);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection>
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/home/blog"
              className="inline-flex items-center gap-1 text-sm text-muted hover:text-neon-cyan transition-colors mb-4"
            >
              <ArrowLeft size={14} />
              返回首页
            </Link>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <FileText size={28} className="text-neon-cyan" />
              我的文章
            </h1>
            <p className="mt-2 text-muted">管理你发布的所有文章</p>
          </div>
          <Link
            href="/posts/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-cyan text-background text-sm font-medium hover:bg-neon-cyan/90 transition-colors"
          >
            <Plus size={16} />
            写文章
          </Link>
        </div>
      </AnimatedSection>

      {/* Filter bar */}
      {posts.length > 0 && (
        <AnimatedSection delay={0.05} className="mt-6">
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={14} className="text-muted" />
              <span className="text-xs font-medium text-muted">筛选</span>
              {(filterCat !== ALL_CATEGORY || filterTag) && (
                <button
                  onClick={() => { setFilterCat(ALL_CATEGORY); setFilterTag(null); }}
                  className="flex items-center gap-1 text-xs text-neon-cyan hover:underline cursor-pointer ml-auto"
                >
                  <X size={12} />
                  清除筛选
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Category filter */}
              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                className="bg-surface-alt border border-border rounded-lg px-3 py-1.5 text-xs text-foreground outline-none focus:border-neon-cyan/50 transition-colors"
              >
                <option value={ALL_CATEGORY}>全部分类</option>
                {CATEGORIES.filter((c) => posts.some((p) => p.category === c.slug)).map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>

              {/* Tag filter */}
              <div className="flex flex-wrap gap-1.5">
                {userTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setFilterTag(filterTag === tag ? null : tag)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors cursor-pointer ${
                      filterTag === tag
                        ? "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30"
                        : "bg-surface-alt text-muted border-border hover:text-foreground"
                    }`}
                  >
                    {tagInfo(tag)?.name || tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* Posts list */}
      <AnimatedSection delay={0.1} className="mt-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <FileText size={48} className="mx-auto text-muted/30 mb-4" />
            <p className="text-muted">
              {posts.length === 0 ? "还没有发布过文章" : "没有匹配的文章"}
            </p>
            {posts.length === 0 ? (
              <Link href="/posts/new" className="inline-block mt-3 text-neon-cyan hover:underline text-sm">
                开始写第一篇文章 →
              </Link>
            ) : (
              <button onClick={() => { setFilterCat(ALL_CATEGORY); setFilterTag(null); }}
                className="inline-block mt-3 text-neon-cyan hover:underline text-sm cursor-pointer">
                清除筛选
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="text-xs text-muted mb-3">
              共 {filtered.length} 篇
              {filtered.length !== posts.length && `（已筛选，共 ${posts.length} 篇）`}
            </div>
            <div className="space-y-3">
              {paginated.map((post) => (
                <div
                  key={post.id}
                  onClick={() => router.push(`/posts/${post.slug}`)}
                  className="rounded-xl border border-border bg-surface p-4 hover:border-neon-cyan/30 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground truncate">{post.title}</h3>
                        {!post.isPublished && (
                          <span className="shrink-0 text-xs px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">已下架</span>
                        )}
                        {post.format === "txt" && (
                          <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-surface-alt text-muted border border-border font-mono">TXT</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted">
                        <span>{formatDate(post.createdAt)}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-cyan/5 text-neon-cyan/70 border border-neon-cyan/10">
                          {CATEGORIES.find((c) => c.slug === post.category)?.name || post.category}
                        </span>
                        <span>❤ {post.likesCount}</span>
                        <span>👁 {post.viewsCount}</span>
                        <span>🔖 {post.bookmarksCount}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {post.id > 0 && (
                        <Link href={`/my-posts/${post.id}/edit`}
                          className="p-2 rounded-lg text-muted hover:text-neon-cyan transition-colors" title="编辑文章">
                          <Edit size={16} />
                        </Link>
                      )}
                      {post.id > 0 && (
                        <button onClick={() => deletePost(post.id, post.title)}
                          className="p-2 rounded-lg text-muted hover:text-red-400 transition-colors cursor-pointer" title="删除文章">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 mt-8">
                <button onClick={() => setPostPage((p) => Math.max(1, p - 1))} disabled={postPage <= 1}
                  className={cn("flex items-center justify-center w-9 h-9 rounded-lg border border-border text-muted hover:text-foreground hover:border-accent transition-colors cursor-pointer", postPage <= 1 && "opacity-40")}>
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPostPage(p)}
                    className={cn("flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium border transition-colors cursor-pointer",
                      p === postPage ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan" : "border-border text-muted hover:text-foreground hover:border-accent")}>
                    {p}
                  </button>
                ))}
                <button onClick={() => setPostPage((p) => Math.min(totalPages, p + 1))} disabled={postPage >= totalPages}
                  className={cn("flex items-center justify-center w-9 h-9 rounded-lg border border-border text-muted hover:text-foreground hover:border-accent transition-colors cursor-pointer", postPage >= totalPages && "opacity-40")}>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </AnimatedSection>
    </div>
  );
}
