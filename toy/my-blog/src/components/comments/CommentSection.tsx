"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, Trash2, Reply } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { EmojiPicker } from "@/components/ui/EmojiPicker";

interface CommentAuthor {
  id: number | null;
  username: string;
  avatar: string | null;
}

interface CommentData {
  id: number;
  content: string;
  createdAt: string;
  postSlug: string;
  parentId: number | null;
  author: CommentAuthor;
}

interface CommentNode extends CommentData {
  replies: CommentNode[];
}

interface Props {
  postSlug: string;
}

function renderCommentContent(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="bg-surface-alt px-1 py-0.5 rounded text-neon-cyan text-xs font-mono">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-neon-cyan hover:underline" target="_blank">$1</a>')
    .replace(/\n/g, "<br>");
}

function buildTree(comments: CommentData[]): CommentNode[] {
  const map = new Map<number, CommentNode>();
  const roots: CommentNode[] = [];

  for (const c of comments) {
    map.set(c.id, { ...c, replies: [] });
  }
  for (const node of map.values()) {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

function CommentItem({
  comment,
  user,
  onReply,
  onDelete,
  replyTo,
}: {
  comment: CommentNode;
  user: any;
  onReply: (id: number, username: string) => void;
  onDelete: (id: number) => void;
  replyTo: { id: number; username: string } | null;
}) {
  const isReplyingHere = replyTo?.id === comment.id;
  const [replyContent, setReplyContent] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  return (
    <div>
      <div className="rounded-xl bg-surface-alt border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-neon-cyan/20 flex items-center justify-center text-xs text-neon-cyan font-medium shrink-0">
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
              <span className="text-sm text-muted">{comment.author.username || "已注销"}</span>
            )}
            <span className="text-xs text-muted">{formatDate(comment.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            {user && (
              <button
                onClick={() => onReply(comment.id, comment.author.username)}
                className="p-1.5 rounded-lg text-muted hover:text-neon-cyan hover:bg-surface transition-colors cursor-pointer"
                title="回复"
              >
                <Reply size={14} />
              </button>
            )}
            {(user?.id === comment.author.id || user?.role === "admin") && comment.author.id && (
              <button
                onClick={() => onDelete(comment.id)}
                className="p-1.5 rounded-lg text-muted hover:text-red-400 hover:bg-surface transition-colors cursor-pointer"
                title="删除"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
        <p
          className="text-sm text-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderCommentContent(comment.content) }}
        />
      </div>

      {/* Inline reply form */}
      {isReplyingHere && user && (
        <div className="ml-8 mt-2 mb-2">
          <div className="flex items-center gap-2 mb-2 text-xs text-muted">
            <Reply size={12} />
            <span>
              回复 <span className="text-neon-cyan font-medium">{comment.author.username}</span>
            </span>
            <button
              onClick={() => onReply(0, "")}
              className="text-muted hover:text-foreground underline cursor-pointer"
            >
              取消
            </button>
          </div>
          <div className="flex gap-2">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={2}
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-neon-cyan/50 transition-colors resize-none"
              placeholder={`回复 @${comment.author.username}...`}
            />
            <div className="flex flex-col gap-1">
              <EmojiPicker onSelect={(emoji) => setReplyContent((p) => p + emoji)} />
              <button
                onClick={async () => {
                  if (!replyContent.trim()) return;
                  setReplyLoading(true);
                  try {
                    const res = await fetch("/api/comments", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        postSlug: comment.postSlug,
                        content: replyContent.trim(),
                        parentId: comment.id,
                      }),
                    });
                    if (res.ok) {
                      setReplyContent("");
                      onReply(0, ""); // close reply form
                      // Trigger refresh from parent
                      window.dispatchEvent(new CustomEvent("refresh-comments"));
                    }
                  } finally {
                    setReplyLoading(false);
                  }
                }}
                disabled={replyLoading || !replyContent.trim()}
                className="p-1.5 rounded-lg bg-neon-cyan text-background hover:bg-neon-cyan/90 transition-colors disabled:opacity-50 cursor-pointer"
                title="发送"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nested replies */}
      {comment.replies.length > 0 && (
        <div className="ml-8 mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              user={user}
              onReply={onReply}
              onDelete={onDelete}
              replyTo={replyTo}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection({ postSlug }: Props) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [replyTo, setReplyTo] = useState<{ id: number; username: string } | null>(null);

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

  // Listen for refresh events from reply submissions
  useEffect(() => {
    const handler = () => fetchComments();
    window.addEventListener("refresh-comments", handler);
    return () => window.removeEventListener("refresh-comments", handler);
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
    if (!confirm("确定删除这条评论及其所有回复？")) return;
    try {
      await fetch(`/api/comments?id=${commentId}`, { method: "DELETE" });
      fetchComments();
    } catch {
      // silent
    }
  }

  const tree = buildTree(comments);

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
          <div className="flex gap-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="写下你的想法... 支持 **加粗** `代码` [链接](url)"
              rows={3}
              className="flex-1 bg-surface-alt border border-border rounded-xl px-4 py-3 text-foreground outline-none placeholder:text-muted focus:border-neon-cyan/50 transition-colors resize-none"
            />
            <div className="flex flex-col gap-1 pt-1">
              <EmojiPicker onSelect={(emoji) => setContent((p) => p + emoji)} />
            </div>
          </div>
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
          <Link href="/auth/login" className="text-neon-cyan hover:underline">登录</Link>
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
          {tree.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              user={user}
              onReply={(id, username) => setReplyTo(replyTo?.id === id ? null : { id, username })}
              onDelete={handleDelete}
              replyTo={replyTo}
            />
          ))}
        </div>
      )}
    </div>
  );
}
