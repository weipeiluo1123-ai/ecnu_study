"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { ArrowLeft, Trash2, MessageSquare, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/format";

interface AdminComment {
  id: number;
  content: string;
  createdAt: string;
  postSlug: string;
  author: { id: number | null; username: string };
}

export default function AdminCommentsPage() {
  const { user, loading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState("");

  async function fetchAllComments() {
    try {
      const res = await fetch("/api/comments?postSlug=__all__");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
      setComments([]);
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    if (loading) return;
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      router.push("/auth/login");
      return;
    }
    fetchAllComments();
  }, [user, loading, router]);

  async function handleDelete(commentId: number) {
    if (!confirm("确定删除此评论？")) return;
    try {
      const res = await fetch(`/api/comments?id=${commentId}`, { method: "DELETE" });
      if (res.ok) {
        addToast("success", "评论已删除");
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      } else {
        addToast("error", "删除失败");
      }
    } catch {
      addToast("error", "网络错误");
    }
  }

  if (loading || fetching) {
    return (
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="skeleton h-8 w-48 rounded-lg" />
        <div className="skeleton h-64 mt-8 rounded-xl" />
      </div>
    );
  }

  const filtered = filter
    ? comments.filter(
        (c) =>
          c.content.toLowerCase().includes(filter.toLowerCase()) ||
          c.author.username.toLowerCase().includes(filter.toLowerCase()) ||
          c.postSlug.toLowerCase().includes(filter.toLowerCase())
      )
    : comments;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection>
        <Link
          href="/home/blog/admin"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-neon-cyan transition-colors mb-4"
        >
          <ArrowLeft size={14} />
          返回后台
        </Link>
        <div className="flex items-center gap-2">
          <MessageSquare size={24} className="text-neon-cyan" />
          <h1 className="text-3xl font-bold text-foreground">评论管理</h1>
        </div>
        <p className="mt-2 text-muted">
          共 {comments.length} 条评论
        </p>
      </AnimatedSection>

      {/* Search filter */}
      <AnimatedSection delay={0.05} className="mt-6">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="搜索评论内容、作者、文章..."
          className="w-full max-w-md bg-surface-alt border border-border rounded-lg px-4 py-2 text-sm text-foreground outline-none focus:border-neon-cyan/50 transition-colors placeholder:text-muted"
        />
      </AnimatedSection>

      {/* Comments list */}
      <AnimatedSection delay={0.1} className="mt-6">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <MessageSquare size={48} className="mx-auto text-muted/30 mb-4" />
            <p className="text-muted">
              {comments.length === 0 ? "暂无评论数据" : "未找到匹配的评论"}
            </p>
            <p className="text-sm text-muted mt-1">
              {comments.length === 0
                ? "当有用户发表评论后将在此显示"
                : "试试其他搜索关键词"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((comment) => (
              <div
                key={comment.id}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-6 h-6 rounded-full bg-neon-cyan/20 flex items-center justify-center text-[10px] text-neon-cyan font-medium shrink-0">
                        {comment.author.username.charAt(0).toUpperCase()}
                      </div>
                      {comment.author.id ? (
                        <Link
                          href={`/home/blog/users/${comment.author.id}`}
                          className="font-medium text-foreground hover:text-neon-cyan transition-colors"
                        >
                          {comment.author.username}
                        </Link>
                      ) : (
                        <span className="text-muted">{comment.author.username}</span>
                      )}
                      <span className="text-xs text-muted">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="mt-2 text-sm text-foreground line-clamp-2">
                      {comment.content}
                    </p>

                    {/* Post link */}
                    <Link
                      href={`/home/blog/posts/${comment.postSlug}`}
                      className="mt-2 inline-flex items-center gap-1 text-xs text-neon-cyan hover:underline"
                    >
                      <ExternalLink size={12} />
                      跳转到文章 /posts/{comment.postSlug}
                    </Link>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="shrink-0 p-2 text-muted hover:text-red-400 transition-colors cursor-pointer"
                    aria-label="删除评论"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </AnimatedSection>
    </div>
  );
}
