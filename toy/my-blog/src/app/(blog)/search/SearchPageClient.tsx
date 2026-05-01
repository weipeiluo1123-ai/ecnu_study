"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, User, FileText, Crown, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import Fuse from "fuse.js";
import type { PostMeta } from "@/lib/posts";
import { PostCard } from "@/components/ui/PostCard";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Props {
  initialPosts: PostMeta[];
}

interface SiteUser {
  id: number;
  username: string;
  role: string;
  bio: string | null;
}

function SearchContent({ initialPosts }: { initialPosts: PostMeta[] }) {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [tab, setTab] = useState<"posts" | "users">("posts");
  const [users, setUsers] = useState<SiteUser[]>([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [postPage, setPostPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const pageSize = 10;

  // Fetch all users for searching
  useEffect(() => {
    fetch("/api/users")
      .then(r => r.json())
      .then(data => {
        if (data.users) setUsers(data.users);
      })
      .catch(() => {})
      .finally(() => setUsersLoaded(true));
  }, []);

  // Post search with Fuse.js
  const fuse = useMemo(
    () =>
      new Fuse(initialPosts, {
        keys: [
          { name: "title", weight: 2 },
          { name: "description", weight: 1 },
          { name: "tags", weight: 1.5 },
          { name: "category", weight: 1 },
        ],
        threshold: 0.4,
        includeScore: true,
      }),
    [initialPosts]
  );

  // Reset page when query or tab changes
  useEffect(() => { setPostPage(1); }, [query, tab]);
  useEffect(() => { setUserPage(1); }, [query, tab]);

  const postResults = useMemo(() => {
    if (!query.trim() || tab !== "posts") return [];
    return fuse.search(query.trim()).map((r) => r.item);
  }, [query, fuse, tab]);

  const userResults = useMemo(() => {
    if (!query.trim() || tab !== "users") return [];
    const q = query.trim().toLowerCase();
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        (u.bio && u.bio.toLowerCase().includes(q))
    );
  }, [query, users, tab]);

  // Paginate results
  const paginatedPosts = useMemo(() => {
    const start = (postPage - 1) * pageSize;
    return postResults.slice(start, start + pageSize);
  }, [postResults, postPage]);

  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * pageSize;
    return userResults.slice(start, start + pageSize);
  }, [userResults, userPage]);

  const postTotalPages = Math.max(1, Math.ceil(postResults.length / pageSize));
  const userTotalPages = Math.max(1, Math.ceil(userResults.length / pageSize));

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <AnimatedSection>
        <h1 className="text-3xl font-bold text-foreground">搜索</h1>

        {/* Search input */}
        <div className="mt-6 relative max-w-xl">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tab === "posts" ? "输入关键词搜索文章..." : "输入用户名、邮箱搜索用户..."}
            className="w-full bg-surface border border-border rounded-xl pl-12 pr-10 py-3 text-foreground outline-none placeholder:text-muted focus:border-neon-cyan/50 transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 p-1 rounded-lg bg-surface-alt border border-border w-fit">
          <button
            onClick={() => setTab("posts")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              tab === "posts" ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            <FileText size={16} />
            文章
            {query.trim() && tab === "posts" && (
              <span className="text-xs text-muted ml-1">{postResults.length}</span>
            )}
          </button>
          <button
            onClick={() => setTab("users")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              tab === "users" ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            <User size={16} />
            用户
            {query.trim() && tab === "users" && (
              <span className="text-xs text-muted ml-1">{userResults.length}</span>
            )}
          </button>
        </div>

        {query.trim() && (
          <p className="mt-3 text-sm text-muted">
            {tab === "posts"
              ? `找到 ${postResults.length} 篇匹配文章`
              : `找到 ${userResults.length} 个匹配用户`}
          </p>
        )}
        {!query.trim() && (
          <p className="mt-3 text-sm text-muted">
            {tab === "posts" ? `共 ${initialPosts.length} 篇文章` : `共 ${users.length} 个注册用户`}
          </p>
        )}
      </AnimatedSection>

      {/* Posts results */}
      {tab === "posts" && (
        <AnimatedSection delay={0.1} className="mt-8">
          {query.trim() ? (
            paginatedPosts.length > 0 ? (
              <div className="space-y-4">
                {paginatedPosts.map((post, i) => (
                  <PostCard key={post.slug} post={post} index={i} />
                ))}
                {postTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 mt-8">
                    <button onClick={() => setPostPage(p => Math.max(1, p-1))} disabled={postPage <= 1}
                      className={cn("flex items-center justify-center w-9 h-9 rounded-lg border border-border text-muted hover:text-foreground hover:border-accent transition-colors cursor-pointer", postPage <= 1 && "opacity-40")}>
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: postTotalPages }, (_, i) => i+1).map(p => (
                      <button key={p} onClick={() => setPostPage(p)}
                        className={cn("flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium border transition-colors cursor-pointer",
                          p === postPage ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan" : "border-border text-muted hover:text-foreground hover:border-accent")}>
                        {p}
                      </button>
                    ))}
                    <button onClick={() => setPostPage(p => Math.min(postTotalPages, p+1))} disabled={postPage >= postTotalPages}
                      className={cn("flex items-center justify-center w-9 h-9 rounded-lg border border-border text-muted hover:text-foreground hover:border-accent transition-colors cursor-pointer", postPage >= postTotalPages && "opacity-40")}>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20">
                <FileText size={48} className="mx-auto text-muted/30 mb-4" />
                <p className="text-muted">未找到匹配的文章</p>
                <p className="text-sm text-muted mt-1">试试其他关键词</p>
              </div>
            )
          ) : (
            <div className="mt-8 space-y-4">
              {initialPosts.slice(0, 5).map((post, i) => (
                <PostCard key={post.slug} post={post} index={i} />
              ))}
            </div>
          )}
        </AnimatedSection>
      )}

      {/* Users results */}
      {tab === "users" && (
        <AnimatedSection delay={0.1} className="mt-8">
          {query.trim() && userResults.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedUsers.map((u) => (
                <Link
                  key={u.id}
                  href={`/users/${u.id}`}
                  className="rounded-xl border border-border bg-surface p-4 hover:border-neon-cyan/30 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
                      u.role === "super_admin"
                        ? "bg-gradient-to-br from-amber-400 to-orange-600 text-white shadow-[0_0_12px_rgba(251,191,36,0.4)]"
                        : "bg-neon-cyan/20 text-neon-cyan"
                    }`}>
                      {u.role === "super_admin" ? <Crown size={20} /> : u.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground group-hover:text-neon-cyan transition-colors truncate">
                          {u.username}
                        </span>
                        {u.role === "super_admin" && (
                          <span className="shrink-0 text-xs px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">超级</span>
                        )}
                        {u.role === "admin" && (
                          <span className="shrink-0 text-xs px-1.5 py-0.5 rounded-full bg-neon-purple/10 text-neon-purple border border-neon-purple/20">
                            <Shield size={10} className="inline" /> 管理
                          </span>
                        )}
                      </div>
                      {u.bio && (
                        <p className="text-xs text-muted mt-0.5 line-clamp-1">{u.bio}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              </div>
              {userTotalPages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-8">
                  <button onClick={() => setUserPage(p => Math.max(1, p-1))} disabled={userPage <= 1}
                    className={cn("flex items-center justify-center w-9 h-9 rounded-lg border border-border text-muted hover:text-foreground hover:border-accent transition-colors cursor-pointer", userPage <= 1 && "opacity-40")}>
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: userTotalPages }, (_, i) => i+1).map(p => (
                    <button key={p} onClick={() => setUserPage(p)}
                      className={cn("flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium border transition-colors cursor-pointer",
                        p === userPage ? "border-neon-cyan bg-neon-cyan/10 text-neon-cyan" : "border-border text-muted hover:text-foreground hover:border-accent")}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setUserPage(p => Math.min(userTotalPages, p+1))} disabled={userPage >= userTotalPages}
                    className={cn("flex items-center justify-center w-9 h-9 rounded-lg border border-border text-muted hover:text-foreground hover:border-accent transition-colors cursor-pointer", userPage >= userTotalPages && "opacity-40")}>
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          ) : query.trim() ? (
            <div className="text-center py-20">
              <User size={48} className="mx-auto text-muted/30 mb-4" />
              <p className="text-muted">未找到匹配的用户</p>
              <p className="text-sm text-muted mt-1">试试其他关键词</p>
            </div>
          ) : (
            <div className="mt-8">
              {usersLoaded && users.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {users.slice(0, 6).map((u) => (
                    <Link
                      key={u.id}
                      href={`/users/${u.id}`}
                      className="rounded-xl border border-border bg-surface p-4 hover:border-neon-cyan/30 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shrink-0 ${
                          u.role === "super_admin"
                            ? "bg-gradient-to-br from-amber-400 to-orange-600 text-white"
                            : "bg-neon-cyan/20 text-neon-cyan"
                        }`}>
                          {u.role === "super_admin" ? <Crown size={16} /> : u.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-sm font-medium text-foreground group-hover:text-neon-cyan transition-colors truncate">
                            {u.username}
                          </span>
                          {u.bio && <p className="text-xs text-muted truncate">{u.bio}</p>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <User size={32} className="mx-auto text-muted/30 mb-2" />
                  <p className="text-sm text-muted">输入关键词搜索用户</p>
                </div>
              )}
            </div>
          )}
        </AnimatedSection>
      )}
    </div>
  );
}

export function SearchPageClient({ initialPosts }: Props) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="skeleton h-8 w-32 rounded-lg" />
          <div className="skeleton h-12 w-full max-w-xl mt-6 rounded-xl" />
        </div>
      }
    >
      <SearchContent initialPosts={initialPosts} />
    </Suspense>
  );
}
