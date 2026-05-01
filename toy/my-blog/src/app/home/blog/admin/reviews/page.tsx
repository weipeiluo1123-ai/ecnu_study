"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { ArrowLeft, CheckCircle, XCircle, Eye, EyeOff, Trash2, Crown, Shield, User, ExternalLink } from "lucide-react";
import Link from "next/link";

interface NameChangeRequest {
  id: number;
  userId: number;
  oldName: string;
  newName: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt: string | null;
}

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
  authorId: number;
  authorName: string | null;
}

export default function AdminReviewsPage() {
  const { user, loading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [nameRequests, setNameRequests] = useState<NameChangeRequest[]>([]);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeTab, setActiveTab] = useState<"names" | "posts">("names");

  const fetchData = useCallback(async () => {
    try {
      const [nameRes, postsRes] = await Promise.all([
        fetch("/api/name-change"),
        fetch("/api/admin/posts"),
      ]);

      if (nameRes.ok) {
        const nameData = await nameRes.json();
        setNameRequests(nameData.requests || []);
      }
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.posts || []);
      }
    } catch {
      // silent
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      router.push("/auth/login");
      return;
    }
    fetchData();
  }, [user, loading, router, fetchData]);

  async function reviewNameRequest(requestId: number, action: "approve" | "reject") {
    const res = await fetch("/api/name-change", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, action }),
    });
    if (res.ok) fetchData();
  }

  async function togglePostPublish(postId: number, current: boolean) {
    const res = await fetch("/api/admin/posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, isPublished: !current }),
    });
    if (res.ok) fetchData();
  }

  async function deletePost(postId: number, title: string) {
    if (!confirm(`确定删除文章 "${title}"？此操作不可恢复。`)) return;
    const res = await fetch(`/api/admin/posts?id=${postId}`, { method: "DELETE" });
    if (res.ok) {
      addToast("success", "文章已删除");
      fetchData();
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

  const pendingRequests = nameRequests.filter((r) => r.status === "pending");

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
        <h1 className="text-3xl font-bold text-foreground">审核管理</h1>
        <p className="mt-2 text-muted">管理改名请求和用户文章</p>
      </AnimatedSection>

      {/* Tabs */}
      <AnimatedSection delay={0.05} className="mt-6">
        <div className="flex gap-1 p-1 rounded-lg bg-surface-alt border border-border w-fit">
          <button
            onClick={() => setActiveTab("names")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === "names"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            改名审核
            {pendingRequests.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-amber-400/20 text-amber-400">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === "posts"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            文章管理
            <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-surface-alt text-muted">
              {posts.length}
            </span>
          </button>
        </div>
      </AnimatedSection>

      {/* Name Change Requests */}
      {activeTab === "names" && (
        <AnimatedSection delay={0.1} className="mt-6">
          {nameRequests.length === 0 ? (
            <div className="text-center py-12 text-muted">暂无改名记录</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted font-medium">用户</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">原用户名</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">新用户名</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">状态</th>
                    <th className="text-left py-3 px-4 text-muted font-medium">时间</th>
                    <th className="text-right py-3 px-4 text-muted font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {nameRequests.map((req) => (
                    <tr key={req.id} className="border-b border-border hover:bg-surface-alt/50 transition-colors">
                      <td className="py-3 px-4">
                        <Link
                          href={`/users/${req.userId}`}
                          className="flex items-center gap-2 text-foreground hover:text-neon-cyan transition-colors"
                        >
                          <User size={14} className="text-muted" />
                          <span>UID {req.userId}</span>
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-muted">{req.oldName}</td>
                      <td className="py-3 px-4 text-foreground font-medium">{req.newName}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                          req.status === "pending"
                            ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                            : req.status === "approved"
                            ? "bg-neon-green/10 text-neon-green border border-neon-green/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {req.status === "pending" ? "待审核" : req.status === "approved" ? "已通过" : "已驳回"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted">
                        {new Date(req.createdAt).toLocaleString("zh-CN")}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {req.status === "pending" && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => reviewNameRequest(req.id, "approve")}
                              className="p-1.5 rounded-md text-muted hover:text-neon-green transition-colors cursor-pointer"
                              title="批准"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => reviewNameRequest(req.id, "reject")}
                              className="p-1.5 rounded-md text-muted hover:text-red-400 transition-colors cursor-pointer"
                              title="驳回并回滚"
                            >
                              <XCircle size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pendingRequests.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-amber-400/5 border border-amber-400/20 text-sm text-amber-400">
              有 {pendingRequests.length} 个待审核的改名请求
            </div>
          )}
        </AnimatedSection>
      )}

      {/* Article Management */}
      {activeTab === "posts" && (
        <AnimatedSection delay={0.1} className="mt-6">
          {posts.length === 0 ? (
            <div className="text-center py-12 text-muted">暂无用户发布的文章</div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-xl border border-border bg-surface p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-medium truncate ${
                          post.isPublished ? "text-foreground" : "text-muted"
                        }`}>
                          {post.title}
                        </h3>
                        {!post.isPublished && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
                            已下架
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted">
                        <span>作者: {post.authorName || "已注销"}</span>
                        <span>❤ {post.likesCount}</span>
                        <span>👁 {post.viewsCount}</span>
                        <span>{new Date(post.createdAt).toLocaleDateString("zh-CN")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/posts/${post.slug}`}
                        className="p-1.5 rounded-md text-muted hover:text-neon-cyan transition-colors"
                        title="查看文章"
                      >
                        <ExternalLink size={16} />
                      </Link>
                      <button
                        onClick={() => togglePostPublish(post.id, post.isPublished)}
                        className="p-1.5 rounded-md text-muted hover:text-neon-cyan transition-colors cursor-pointer"
                        title={post.isPublished ? "下架文章" : "上架文章"}
                      >
                        {post.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => deletePost(post.id, post.title)}
                        className="p-1.5 rounded-md text-muted hover:text-red-400 transition-colors cursor-pointer"
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
      )}
    </div>
  );
}
