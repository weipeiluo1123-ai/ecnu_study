"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { ArrowLeft, FileText, Plus, Edit, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/format";

interface UserPost {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  isPublished: boolean;
  likesCount: number;
  viewsCount: number;
  bookmarksCount: number;
  createdAt: string;
}

export default function MyPostsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    fetchMyPosts();
  }, [user, loading, router]);

  async function deletePost(postId: number, title: string) {
    if (!confirm(`确定删除文章 "${title}"？此操作不可恢复。`)) return;
    try {
      const res = await fetch(`/api/user-posts/${postId}`, { method: "DELETE" });
      if (res.ok) fetchMyPosts();
    } catch {}
  }

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

  if (loading || fetching) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-64 mt-8 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection>
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/"
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

      <AnimatedSection delay={0.1} className="mt-8">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <FileText size={48} className="mx-auto text-muted/30 mb-4" />
            <p className="text-muted">还没有发布过文章</p>
            <Link
              href="/posts/new"
              className="inline-block mt-3 text-neon-cyan hover:underline text-sm"
            >
              开始写第一篇文章 →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post, i) => (
              <div
                key={post.id}
                className="rounded-xl border border-border bg-surface p-4 hover:border-neon-cyan/30 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground truncate">{post.title}</h3>
                      {!post.isPublished && (
                        <span className="shrink-0 text-xs px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                          已下架
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted">
                      <span>{formatDate(post.createdAt)}</span>
                      <span>❤ {post.likesCount}</span>
                      <span>👁 {post.viewsCount}</span>
                      <span>🔖 {post.bookmarksCount}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/posts/${post.slug}`}
                      className="p-2 rounded-lg text-muted hover:text-neon-cyan transition-colors"
                      title="查看文章"
                    >
                      <ExternalLink size={16} />
                    </Link>
                    <Link
                      href={`/my-posts/${post.id}/edit`}
                      className="p-2 rounded-lg text-muted hover:text-neon-cyan transition-colors"
                      title="编辑文章"
                    >
                      <Edit size={16} />
                    </Link>
                    <button
                      onClick={() => deletePost(post.id, post.title)}
                      className="p-2 rounded-lg text-muted hover:text-red-400 transition-colors cursor-pointer"
                      title="删除文章"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </AnimatedSection>
    </div>
  );
}
