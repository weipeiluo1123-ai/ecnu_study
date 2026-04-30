"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/format";

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  author: {
    id: number;
    username: string;
    avatar: string | null;
  };
}

interface Props {
  postSlug: string;
}

export function CommentSection({ postSlug }: Props) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?postSlug=${postSlug}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
      // silent
    } finally {
      setFetching(false);
    }
  }, [postSlug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function handleSubmit() {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postSlug, content: content.trim() }),
      });
      if (res.ok) {
        setContent("");
        fetchComments();
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(commentId: number) {
    if (!confirm("确定删除这条评论？")) return;
    try {
      await fetch(`/api/comments?id=${commentId}`, { method: "DELETE" });
      fetchComments();
    } catch {
      // silent
    }
  }

  return (
    <div className="mt-12 pt-8 border-t border-border">
      <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
        <MessageSquare size={18} />
        评论 ({comments.length})
      </h3>

      {/* Comment form */}
      {user ? (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3 text-sm text-muted">
            <span>评论作为</span>
            <span className="text-neon-cyan font-medium">{user.username}</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的想法..."
            rows={3}
            className="w-full bg-surface-alt border border-border rounded-xl px-4 py-3 text-foreground outline-none placeholder:text-muted focus:border-neon-cyan/50 transition-colors resize-none"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSubmit}
              disabled={loading || !content.trim()}
              className="px-5 py-2 rounded-lg bg-neon-cyan text-background text-sm font-medium hover:bg-neon-cyan/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? "提交中..." : "发表评论"}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-4 rounded-xl bg-surface-alt border border-border text-center text-sm text-muted">
          <Link href="/auth/login" className="text-neon-cyan hover:underline">
            登录
          </Link>
          {" 后即可评论"}
        </div>
      )}

      {/* Comments list */}
      {fetching ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted text-center py-8">暂无评论，来写第一条吧</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="rounded-xl bg-surface-alt border border-border p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-neon-cyan/20 flex items-center justify-center text-xs text-neon-cyan font-medium">
                    {comment.author.username ? comment.author.username.charAt(0).toUpperCase() : "?"}
                  </div>
                  {comment.author.id ? (
                    <Link
                      href={`/users/${comment.author.id}`}
                      className="text-sm font-medium text-foreground hover:text-neon-cyan transition-colors"
                    >
                      {comment.author.username}
                    </Link>
                  ) : (
                    <span className="text-sm text-muted">
                      {comment.author.username || "已注销"}
                    </span>
                  )}
                  <span className="text-xs text-muted">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                {(user?.id === comment.author.id || user?.role === "admin") && comment.author.id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-muted hover:text-red-400 transition-colors cursor-pointer"
                    aria-label="删除评论"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
